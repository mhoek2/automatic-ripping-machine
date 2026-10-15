"""
Basic json api for access to A.R.M UI
Also used to connect to both omdb and tmdb
"""
import os
import subprocess
import re
import html
from collections import deque
from pathlib import Path
import datetime
import psutil
from flask import request, jsonify
from time import time, strftime, gmtime

import arm.config.config as cfg
from arm.models.config import Config
from arm.models.job import Job, JobState, JOB_STATUS_FINISHED
from arm.models.notifications import Notifications
from arm.models.track import Track
from arm.models.ui_settings import UISettings
from arm.ui import app, db
from arm.ui.forms import ChangeParamsForm
from arm.ui.utils import job_id_validator, database_updater, authenticated_state
from arm.ui.settings import DriveUtils as drive_utils # noqa E402


def get_unseen_notifications():
    """Get all current notifications"""
    all_notification = Notifications.query.filter_by(seen=False)
    notification = [a.get_d() for a in all_notification]
    return notification


def serialize_job_results(jobs):
    """Serialize jobs using the same format as the existing JSON API."""
    job_results = {}

    for i, job in enumerate(jobs):
        result = {}
        job_log = os.path.join(cfg.arm_config['LOGPATH'], str(job.logfile))
        process_logfile(job_log, job, result)

        tracks = job.tracks.all()
        
        result['tracks'] = [
			{
				'track_id': track.track_id,
				'track_number': track.track_number,
				'filename': track.filename,
				'length': track.length,
				'fps': track.fps,
				'aspect_ratio': track.aspect_ratio,
				'main_feature': track.main_feature,
				'ripped': track.ripped,
				'process': track.process,
			}
			for track in tracks
		]
        
        result['manual_edit'] = (
            job.manual_mode
            and job.status == JobState.MANUAL_WAIT_STARTED.value
            and not job.manual_start
        )

        try:
            result['config'] = job.config.get_d()
        except AttributeError:
            result['config'] = {}
            app.logger.debug("couldn't get config")

        for key, value in job.get_d().items():
            if key != "config":
                result[str(key)] = str(value)

        job_results[i] = result

    return job_results

def get_x_jobs(job_status):
    """Get successful, failed, or active jobs."""
    if job_status == "joblist":
        cutoff = datetime.datetime.now() - datetime.timedelta(hours=3)
        
        jobs = Job.query.filter(
            db.or_(
                ~Job.finished,
                Job.start_time >= cutoff,
            )
        ).all()
    elif JobState(job_status) in JOB_STATUS_FINISHED:
        jobs = Job.query.filter_by(status=job_status).all()
    else:
        raise ValueError(f"{job_status} is not a valid option")

    job_results = serialize_job_results(jobs)

    return {
        "success"       : bool(jobs),
        "mode"          : job_status,
        "results"       : job_results,
        "arm_name"      : cfg.arm_config['ARM_NAME'],
        "authenticated" : authenticated_state()
    }

def get_jobs_infinite( limit, before ):
    """Get jobs using infinite scroller"""
    query = Job.query

    if before is not None:
        query = query.filter(Job.job_id < before)

    jobs = query.order_by(db.desc(Job.job_id)).limit(limit + 1).all()

    has_more = len(jobs) > limit
    jobs = jobs[:limit]

    return jsonify(
        success         = True,
        results         = serialize_job_results(jobs),
        has_more        = has_more,
        next_cursor     = jobs[-1].job_id if jobs else None,
        authenticated   = authenticated_state()
    )

def process_logfile(logfile, job, job_results):
    """
        Decide if we need to process HandBrake or MakeMKV
        :param logfile: the logfile for parsing
        :param job: the Job class
        :param job_results: the {} of
        :return: should be dict for the json api
    """
    app.logger.debug(f"Disc Type: {job.disctype}, Status: {job.status}")

    if job.disctype in {"dvd", "bluray"}:
        if job.status == JobState.VIDEO_RIPPING.value:
            app.logger.debug("using mkv - " + logfile)
            return process_makemkv_logfile(job, job_results)
        
        if job.status == JobState.TRANSCODE_ACTIVE.value:
            app.logger.debug("using handbrake")
            return process_handbrake_logfile(logfile, job, job_results)
        
    if job.disctype == "music" and job.status == JobState.AUDIO_RIPPING.value:
        app.logger.debug("using audio disc")
        return process_audio_logfile(job.logfile, job, job_results)
    
    return job_results


def percentage(part, whole):
    """percent calculator"""
    percent = 100 * float(part) / float(whole)
    return percent


def find_last_regex_match(pattern, iterable):
    """
    Find the last matching regex pattern in a given iterable
    """
    regex = re.compile(pattern)
    if isinstance(iterable, (list, tuple, str)):
        reversed_iterable = reversed(iterable)
    else:
        reversed_iterable = reversed(list(iterable))
    for item in reversed_iterable:
        retval = regex.search(item)
        if retval:
            return retval
    return None


def process_makemkv_logfile(job, job_results):
    """
    Process the logfile and find current status and job progress percent\n
    :return: job_results dict
    """
    job_progress_status = None
    job_stage_index = None
    batch_log_path = os.path.join(cfg.arm_config['LOGPATH'], 'progress', str(job.job_id)) + '.log.batchinfo'
    lines = read_log_line(os.path.join(cfg.arm_config['LOGPATH'], 'progress', str(job.job_id)) + '.log')
    batch_index = read_log_line(batch_log_path)
    # Correctly get last entry for progress bar

    job_progress_status = find_last_regex_match(r"PRGV:(\d{3,}),(\d+),(\d{3,})", lines)
    job_stage_index = find_last_regex_match(r"PRGC:(\d+),(\d+),\"([\w -]{2,})\"", lines)
    job_batch_info = find_last_regex_match(r"BINF:(\d{10}),(\d+),(\d+),(\d+)", batch_index)

    if job_progress_status is not None:
        app.logger.debug(f"job_progress_status: {job_progress_status}")
        job.progress = job_results['progress'] = \
            f"{percentage(job_progress_status.group(1), job_progress_status.group(3)):.2f}"
        job.progress_round = percentage(job_progress_status.group(1),
                                        job_progress_status.group(3))
        # The ETA calc needs the batch-info (BINF) file, but that file is only
        # written further down, in the `job_stage_index` block. On the first
        # poll for a job it does not exist yet, so `job_batch_info` is None and
        # `job_batch_info.group(1)` raises
        # "'NoneType' object has no attribute 'group'", which 500s the whole
        # /json endpoint and leaves the Active Rips card blank. Because the
        # crash happens *before* the code that creates the BINF file, it never
        # bootstraps and stays broken for the entire rip. Guard it (and the
        # divide-by-zero when progress is still 0) and report an Unknown ETA
        # until the batch info is available.
        if job_batch_info is not None and float(job.progress) > 0:
            job_start_time = int(job_batch_info.group(1))
            current_time = int(time())
            elapsed_time = current_time - job_start_time
            total_time = int((elapsed_time * 100) / float(job.progress))
            time_remaining = total_time - elapsed_time
            app.logger.debug(f"ETA values for job {job.job_id}: Elapsed seconds: {elapsed_time}, "
                             f"Percent: {job.progress}, "
                             f"Projected time: {total_time}, "
                             f"Time remaining: {time_remaining}"
                             )
            job.eta = strftime("%Hh%Mm%Ss", gmtime(time_remaining))
        else:
            job.eta = "Unknown"
    else:
        app.logger.debug(f"Job [{job.job_id}] MakeMKV status not defined - setting progress to 0%")
        job.progress = job.progress_round = job_results['progress'] = 0
        job.eta = "Unknown"

    if job_stage_index is not None:
        try:
            if job_batch_info.group(4) != job_stage_index.group(1):
                app.logger.debug(f"Appending new batch position info for job {job.job_id}: "
                                 f"BINF:{int(time())},"
                                 f"{job_batch_info.group(2)},"
                                 f"{job_batch_info.group(3)},"
                                 f"{job_stage_index.group(1)}"
                                 )
                with open(batch_log_path, 'a') as f:
                    f.write(f"\nBINF:{int(time())},"
                            f"{job_batch_info.group(2)},"
                            f"{job_batch_info.group(3)},"
                            f"{job_stage_index.group(1)}"
                            )
            app.logger.debug(f"job_stage_index: {job_stage_index}")
            current_index = f"Track {job_batch_info.group(2)}/{job_batch_info.group(3)}<br>{job_stage_index.group(3)}"
            job.stage = job_results['stage'] = current_index
            db.session.commit()
        except Exception as error:
            job.stage = f"Unknown -  {error}"

    return job_results


def process_handbrake_logfile(logfile, job, job_results):
    """
    process a logfile looking for HandBrake or FFMPEG progress
    :param logfile: the logfile for parsing
    :param job: the Job class
    :param job_results: the {} of
    :return: should be dict for the json api
    """
    job_status = None
    job_status_index = None
    ffmpeg_job_status = None
    lines = read_log_line(logfile)
    for line in lines:
        # This correctly get the very last ETA and % for HandBrake
        hb_search = re.search(r"Encoding: task (\d of \d), (\d{1,3}\.\d{2}) %.*?"
                              r"\((\d+\.\d+) fps, avg (\d+\.\d+) fps, ETA ([\dhms]*?)\)(?!\\rEncod)", str(line))
        if hb_search:
            job_status = hb_search

        hb_index_search = re.search(r"Processing track #(\d{1,2}) of (\d{1,2})"
                                    r"(?!.*Processing track #)", str(line))
        if hb_index_search:
            job_status_index = hb_index_search

        # Check for FFMPEG status
        ffmpeg_search = re.search(r"ARM: .* - (\d{1,3}\.\d{2})%", str(line))
        if ffmpeg_search:
            ffmpeg_job_status = ffmpeg_search

    # Check ARM can read the Handbrake library and get a status
    if job_status is not None:
        app.logger.debug(job_status.group())
        job.stage = job_status.group(1)
        job.progress = job_status.group(2)
        job.cur_fps = job_status.group(3)
        job.avg_fps = job_status.group(4)
        job.eta = job_status.group(5)
        job.progress_round = int(float(job.progress))
    elif ffmpeg_job_status is not None:
        job.stage = "Transcoding"
        job.progress = ffmpeg_job_status.group(1)
        job.eta = "Unknown"
        job.progress_round = int(float(job.progress))
    else:
        app.logger.debug(f"Job [{job.job_id}] handbrake/ffmpeg status not defined - setting progress to 0%")
        job.stage = "Unknown"
        job.progress = job.progress_round = 0
        job.eta = "Unknown"

    job_results['stage'] = job.stage
    job_results['progress'] = job.progress
    job_results['eta'] = job.eta
    job_results['cur_fps'] = getattr(job, 'cur_fps', 0)
    job_results['avg_fps'] = getattr(job, 'avg_fps', 0)
    job_results['progress_round'] = int(float(job_results['progress']))

    if job_status_index:
        try:
            current_index = int(job_status_index.group(1))
            job.stage = job_results['stage'] = f"{job.stage} - {current_index}/{job.no_of_titles}"
        except Exception as error:
            app.logger.debug(f"Problem finding the current track {error}")
            job.stage = f"{job.stage} - %0%/%0%"
    else:
        app.logger.debug("Cant find index")

    return job_results


def process_audio_logfile(logfile, job, job_results):
    """
    Process audio disc logs to show current ripping tracks
    :param logfile: will come in as only the bare logfile, no path
    :param job: current job, so we can update the stage
    :param job_results:
    :return:
    """
    # \((track[^[]+)(?!track)
    line = read_all_log_lines(os.path.join(cfg.arm_config["LOGPATH"], logfile))
    for one_line in line:
        job_stage_index = re.search(r"\(track([^[]+)", str(one_line))
        if job_stage_index:
            try:
                current_index = f"Track: {job_stage_index.group(1)}/{job.no_of_titles}"
                job.stage = job_results['stage'] = current_index
                job.eta = calc_process_time(job.start_time, job_stage_index.group(1), job.no_of_titles)
                job.progress = round(percentage(job_stage_index.group(1), job.no_of_titles + 1))
                job.progress_round = round(job.progress)
            except Exception as error:
                app.logger.debug("Error processing abcde logfile. Error dump"
                                 f"-  {error}", exc_info=True)
                job.stage = "Unknown"
                job.eta = "Unknown"
                job.progress = job.progress_round = 0
    return job_results


def calc_process_time(starttime, cur_iter, max_iter):
    """Modified from stackoverflow
    Get a rough estimate of ETA, return formatted String"""
    try:
        time_elapsed = datetime.datetime.now() - starttime
        time_estimated = (time_elapsed.seconds / int(cur_iter)) * int(max_iter)
        finish_time = (starttime + datetime.timedelta(seconds=int(time_estimated)))
        test = finish_time - datetime.datetime.now()
    except TypeError:
        app.logger.error("Failed to calculate processing time - Resetting to now, time wont be accurate!")
        test = time_estimated = time_elapsed = finish_time = datetime.datetime.now()
    return f"{str(test).split('.', maxsplit=1)[0]} - @{finish_time.strftime('%H:%M:%S')}"


def read_log_line(log_file: os.PathLike):
    """
    :param log_file: path to log file
    :return: the last 20 lines of the file at ``log_file``
    """
    try:
        with open(log_file, encoding="utf8", errors="ignore") as read_log_file:
            lines = deque(read_log_file, maxlen=100)
    except OSError:
        app.logger.debug(f"Error while reading {log_file}, unable to calculate ETA")
        lines = ["", ""]
    return lines


def read_all_log_lines(log_file):
    """Try to catch if the logfile gets delete before the job is finished"""
    try:
        with open(log_file, encoding="utf8", errors='ignore') as read_log_file:
            line = read_log_file.readlines()
    except FileNotFoundError:
        line = ""
    return line


def search(search_query):
    """ Queries ARMui db for the movie/show matching the query"""
    safe_search = re.sub(r'[^a-zA-Z\d]', '', search_query)
    safe_search = f"%{safe_search}%"
    app.logger.debug('-' * 30)

    posts = db.session.query(Job).filter(Job.title.like(safe_search)).all()
    search_results = {}
    i = 0
    for job in posts:
        search_results[i] = {}
        try:
            search_results[i]['config'] = job.config.get_d()
        except AttributeError:
            search_results[i]['config'] = "config not found"
            app.logger.debug("couldn't get config")

        for key, value in iter(job.get_d().items()):
            if key != "config":
                search_results[i][str(key)] = str(value)
        i += 1

    return {
        'success'       : True, 
        'mode'          : 'search', 
        'results'       : search_results,
        'authenticated' : authenticated_state()
    }


def delete_job(job_id, mode):
    """Delete a job and its related database records."""
    try:
        app.logger.debug(f"job_id={job_id}")

        if mode != 'delete' or job_id is None:
            return {'success': False, 'error': 'Invalid request', 'mode': mode}

        if job_id == 'all':
            app.logger.warning("Delete-all requested; no jobs were deleted")
            return {'success': True, 'job': job_id, 'mode': mode}

        if job_id == 'title':
            app.logger.warning("Delete-by-title requested; no jobs were deleted")
            return {'success': True, 'job': job_id, 'mode': mode}

        try:
            post_value = int(job_id)
        except (ValueError, TypeError):
            return {'success': False, 'job': 'invalid', 'mode': mode, 'error': 'Not a valid job ID'}

        job = Job.query.filter_by(job_id=post_value).first()

        if job is None:
            app.logger.warning(f"Cannot delete job {post_value}: job not found")
            return {'success': False, 'job': post_value, 'mode': mode, 'error': 'Job not found'}

        app.logger.info(f"Deleting job {post_value}")

        drive_utils.job_cleanup(post_value)
        Track.query.filter_by(job_id=post_value).delete()
        Config.query.filter_by(job_id=post_value).delete()
        db.session.delete(job)

        notification = Notifications(
            f"Job: {post_value} was Deleted!",
            f"Job with id: {post_value} was successfully deleted from the database"
        )
        db.session.add(notification)
        db.session.commit()

        app.logger.info(f"Job {post_value} was successfully deleted")
        return {'success': True, 'job': post_value, 'mode': mode}

    except Exception as err:
        db.session.rollback()
        app.logger.exception(f"Error deleting job {job_id}: {err}")
        return {'success': False, 'job': job_id, 'mode': mode, 'error': 'Failed to delete job'}



def generate_log(logpath, job_id):
    """
    Generate log for json api and return it in a valid form\n
    :param str logpath:
    :param str job_id:
    :return:
    """
    try:
        job = Job.query.get(int(job_id))
    except Exception:
        app.logger.debug(f"Cant find job {job_id} ")
        job = None

    app.logger.debug("in logging")
    if job is None or job.logfile is None or job.logfile == "":
        app.logger.debug(f"Cant find the job {job_id}")
        return {'success': False, 'job': job_id, 'log': 'Not found'}
    # Assemble full path
    fullpath = os.path.join(logpath, job.logfile)
    # Check if the logfile exists
    my_file = Path(fullpath)
    if not my_file.is_file():
        # logfile doesnt exist throw out error template
        app.logger.debug("Couldn't find the logfile requested, Possibly deleted/moved")
        return {'success': False, 'job': job_id, 'log': 'File not found'}
    try:
        with open(fullpath) as full_log:
            read_log = full_log.read()
    except Exception:
        try:
            with open(fullpath, encoding="utf8", errors='ignore') as full_log:
                read_log = full_log.read()
        except Exception:
            app.logger.debug("Cant read logfile. Possibly encoding issue")
            return {'success': False, 'job': job_id, 'log': 'Cant read logfile'}
    html_escaped_log = html.escape(read_log)
    title_year = str(job.title) + " (" + str(job.year) + ") - file: " + str(job.logfile)
    return {'success': True, 'job': job_id, 'mode': 'logfile', 'log': html_escaped_log,
            'escaped': True, 'job_title': title_year}


def abandon_job(job_id):
    """
    json api abandon job\n
    :param str job_id: the job id
    :return: json/dict
    """
    json_return = {
        'success': False,
        'job': job_id,
        'mode': 'abandon'
    }
    job = None
    if not job_id_validator(job_id):
        notification = Notifications(f"Job: {job_id} isn't a valid job!",
                                     f'Job with id: {job_id} doesnt match anything in the database')
        db.session.add(notification)
        db.session.commit()
        return json_return

    # Kill the process id
    job = Job.query.get(int(job_id))
    job.status = JobState.FAILURE.value
    try:
        terminate_process(job.pid)
    except Exception as err:
        db.session.rollback()
        json_return["Error"] = str(err)
        json_return['success'] = False
        title = f"Job ERROR: {job.pid} couldn't be abandoned."
        message = json_return['Error']
        app.logger.debug(f"{title} - Reverting db changes - {message}")
        notification = Notifications(title, message)
    else:
        job.eject()  # only release/eject the job if the process got killed.
        json_return['success'] = True
        title = f"Job: {job.pid} was Abandoned!"
        message = f'Job with id: {job.pid} was successfully abandoned. No files were deleted!'
        notification = Notifications(title, message)
    db.session.add(notification)
    db.session.commit()
    return json_return


def terminate_process(pid):
    """
    Terminates the process associated with a given pid.
    :param pid: Process ID (int)
    :raises: ValueError if access is denied
    """
    if pid is None:
        message = "PID not found for job."
        app.logger.warning(message)
        return
    try:
        job_process = psutil.Process(pid)
        job_process.terminate()  # or job_process.kill()
    except psutil.NoSuchProcess:
        message = f"Process id {pid} was not found. Job has already been terminated."
        app.logger.warning(message)
        # No raise here. No process is a terminated process.
    except psutil.AccessDenied as err:
        message = f"Access denied abandoning job: {pid}!"
        app.logger.error(message)
        raise ValueError(message) from err
    else:
        app.logger.debug(f"Job with PID {pid} was terminated.")


def change_job_params(config_id):
    """Update values for job"""
    job = Job.query.get(config_id)
    config = job.config
    form = ChangeParamsForm(request.args, meta={'csrf': False})
    app.logger.debug("Before valid")
    if form.validate():
        app.logger.debug("Valid")
        job.disctype = format(form.DISCTYPE.data)
        cfg.arm_config["MINLENGTH"] = config.MINLENGTH = format(form.MINLENGTH.data)
        cfg.arm_config["MAXLENGTH"] = config.MAXLENGTH = format(form.MAXLENGTH.data)
        cfg.arm_config["RIPMETHOD"] = config.RIPMETHOD = format(form.RIPMETHOD.data)
        # must be 1 for True 0 for False
        cfg.arm_config["MAINFEATURE"] = config.MAINFEATURE = 1 if format(form.MAINFEATURE.data).lower() == "true" else 0
        args = {'disctype': job.disctype}
        message = f'Parameters changed. Rip Method={config.RIPMETHOD}, Main Feature={config.MAINFEATURE},' \
                  f'Minimum Length={config.MINLENGTH}, Maximum Length={config.MAXLENGTH}, Disctype={job.disctype}'
        # We don't need to set the config as they are set with job commit
        notification = Notifications(f"Job: {job.job_id} Config updated!", message)
        db.session.add(notification)
        database_updater(args, job)

        return {'message': message, 'form': 'change_job_params', "success": True}
    return {'return': '', 'success': False}


def read_notification(notify_id):
    """Read notification, disable it from being show"""
    return_json = {'success': False, 'mode': 'read_notification', 'message': ""}
    notification = Notifications.query.filter_by(id=notify_id, seen=0).first()
    if notification:
        database_updater({'seen': 1, 'dismiss_time': datetime.datetime.now()}, notification)
        return_json['success'] = True
    else:
        return_json['message'] = "Notification already read or not found!"
    return return_json


def get_notify_timeout(notify_timeout):
    """Return the notification timeout UI setting"""

    return_json = {'success': True,
                   'mode': 'notify_timeout',
                   'notify_timeout': ''}

    armui_cfg = UISettings.query.first()

    if armui_cfg:
        return_json['notify_timeout'] = armui_cfg.notify_refresh
    else:
        return_json['notify_timeout'] = '6500'

    return return_json


def restart_ui():
    app.logger.debug("Arm ui shutdown....")
    shutdown_code = subprocess.check_output(
        "pkill python3",
        shell=True
    ).decode("utf-8")
    # Nothing should work past here as the ui will die after running code above
    app.logger.debug(f"Arm ui shutdown ran into a problem... exit code: {shutdown_code}")
    return_json = {'success': False, 'error': f"Shutting down A.R.M UI....exit code: {shutdown_code}"}
    return return_json
