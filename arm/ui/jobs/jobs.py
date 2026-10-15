"""
ARM route blueprint for jobs pages
Covers
- jobdetail_api [GET]
- jobdetail_track [POST]
- jobdetail_ready [POST]
- titlesearch [GET]
- custometitle [GET]
- gettitle / customtitle [GET]
- updatetitle [GET]
- activerips [GET]
- changeparams [GET]
- list_titles [GET]
- json [JSON GET]
"""

import json
from flask_login import LoginManager, login_required, current_user  # noqa: F401
from flask import render_template, request, Blueprint, flash, redirect, url_for
from werkzeug.routing import ValidationError

import arm.ui.utils as ui_utils
from arm.ui import app, db, constants, json_api
from arm.models.job import Job, JobState
from arm.models.notifications import Notifications
import arm.config.config as cfg
from arm.ui.forms import TitleSearchForm, ChangeParamsForm, TrackFormDynamic

route_jobs = Blueprint('route_jobs', __name__,
                       template_folder='templates',
                       static_folder='../static')


from datetime import date, datetime

from flask import jsonify, request


@route_jobs.route('/jobdetail_api', methods=['GET'])
# @login_required
def jobdetail_api():
	"""
	Return job details, tracks, and technical fields as JSON.
	"""
	job_id = request.args.get('job_id', type=int)

	if job_id is None:
		return jsonify(success=False, error='Invalid job ID'), 400

	job = db.session.get(Job, job_id)

	if job is None:
		return jsonify(success=False, error='Job not found'), 404

	def serialize_value(value):
		if isinstance(value, (datetime, date)):
			return value.isoformat()
		return value

	def serialize_columns(model):
		return {
			column.key: serialize_value(getattr(model, column.key))
			for column in model.__table__.columns
		}

	job_info = json_api.serialize_job_results([job])
	if len(job_info) is not 1:
		return jsonify(success=False, error='Invalid job info'), 404
    
	job_info = job_info[0]

    # this should be stored in the database once, and updated when changing title manually ..
	meta = ui_utils.metadata_selector("get_details", job.title, job.year, job.imdb_id)
 	 
	if meta and 'Error' not in meta:
		plot = meta['Plot'] if 'Plot' in meta else "There was a problem getting the plot"
		background = meta['background_url'] if 'background_url' in meta else None
	
	#plot = " is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into el"
	#background = ""

	authenticated = ui_utils.authenticated_state()

	return jsonify(
        authenticated=authenticated,
		success=True,
		job={
            **job_info,
			'plot': plot,
			'background': background,
		},
		technical={
			'job': serialize_columns(job),
		} if authenticated else -1,
	)

@route_jobs.route('/jobdetail_track', methods=['POST'])
@login_required
def jobdetail_track():
	data = request.get_json(silent=True) or {}

	job_id = data.get('job_id')
	track_id = data.get('track_id')
	process = data.get('process')

	if job_id is None or track_id is None or not isinstance(process, bool):
		return jsonify(success=False, error='Invalid request'), 400

	job = db.session.get(Job, job_id)

	if job is None:
		return jsonify(success=False, error='Job not found'), 404

	manual_edit = (
		job.manual_mode
		and job.status == JobState.MANUAL_WAIT_STARTED.value
		and not job.manual_start
	)

	if not manual_edit:
		return jsonify(success=False, error='Track selection is locked'), 409

	track = job.tracks.filter_by(track_id=track_id).first()

	if track is None:
		return jsonify(success=False, error='Track not found'), 404

	try:
		track.process = process
		db.session.commit()
	except Exception:
		db.session.rollback()
		app.logger.exception('Failed to update track selection')
		return jsonify(success=False, error='Failed to update track'), 500

	return jsonify(success=True, track_id=track_id, process=process)


@route_jobs.route('/jobdetail_ready', methods=['POST'])
@login_required
def jobdetail_ready():
	data = request.get_json(silent=True) or {}

	job_id = data.get('job_id')

	if job_id is None:
		return jsonify(success=False, error='Invalid request'), 400

	job = db.session.get(Job, job_id)

	if job is None:
		return jsonify(success=False, error='Job not found'), 404

    # Set job to ready
	try:
		job.manual_start = True
		db.session.commit()
		app.logger.debug(f"Setting [{job.job_id}] to [{job.manual_start}], lets get ripping")
	except Exception:
		db.session.rollback()
		app.logger.exception('Failed to set job ready')
		return jsonify(success=False, error='Failed to set job ready'), 500

	return jsonify(success=True)

@route_jobs.route('/titlesearch')
@login_required
def title_search():
    """
    The initial search page
    """
    job_id = request.args.get('job_id')
    job = Job.query.get(job_id)
    form = TitleSearchForm(request.args)
    if form.validate():
        flash(f'Search for {request.args.get("title")}, year={request.args.get("year")}', 'success')
        return redirect(url_for('route_jobs.list_titles', title=request.args.get("title"),
                                year=request.args.get("year"), job_id=job_id))
    
    return render_template('titlesearch.html', 
        authenticated    = ui_utils.authenticated_state(),
        title            = 'Update Title', 
        form             = form, 
        job              = job
    )


@route_jobs.route('/customTitle')
@login_required
def customtitle():
    """
    For setting custom title for series with multiple discs
    """
    job_id = request.args.get('job_id')
    ui_utils.job_id_validator(job_id)
    job = Job.query.get(job_id)
    form = TitleSearchForm(obj=job)
    if request.args.get("title"):
        args = {
            'title': request.args.get("title"),
            'title_manual': request.args.get("title"),
            'year': request.args.get("year")
        }
        notification = Notifications(f"Job: {job.job_id} was updated",
                                     f'Title: {job.title} ({job.year}) was updated to '
                                     f'{request.args.get("title")} ({request.args.get("year")})')
        db.session.add(notification)
        ui_utils.database_updater(args, job)

        return redirect(url_for('home'))

    return render_template('customTitle.html', 
        authenticated    = ui_utils.authenticated_state(),
        title            = 'Change Title', 
        form             = form, 
        job              = job
    )


@route_jobs.route('/gettitle')
@route_jobs.route('/select_title')
@login_required
def gettitle():
    """
    Used to display plot info from the search result page when the user clicks the title
    and to forward the user to save the selected details

    This was also used previously for the getdetails page but it no longer needed there
    """
    imdb_id = request.args.get('imdbID').strip() if request.args.get('imdbID') else None
    job_id = request.args.get('job_id').strip() if request.args.get('job_id') else None
    if imdb_id == "" or imdb_id is None:
        app.logger.debug("gettitle - no imdb supplied")
        flash("No imdb supplied", "danger")
        raise ValidationError("No imdb supplied")
    if job_id == "" or job_id is None:
        app.logger.debug("gettitle - no job supplied")
        flash(constants.NO_JOB, "danger")
        raise ValidationError(constants.NO_JOB)
    dvd_info = ui_utils.metadata_selector("get_details", None, None, imdb_id)
    
    return render_template('showtitle.html', 
        authenticated   = ui_utils.authenticated_state(),           
        results         = dvd_info, 
        job_id          = job_id
    )


@route_jobs.route('/updatetitle')
@login_required
def updatetitle():
    """
    used to save the details from the search
    Example URL
    updatetitle?title=Home&amp;year=2015&amp;imdbID=tt2224026&amp;type=movie&amp;
    poster=http://image.tmdb.org/t/p/original/usFenYnk6mr8C62dB1MoAfSWMGR.jpg&amp;job_id=109

    args
    title - new movie title
    year - new movie year
    imdbID - new movie IMDB reference
    type - new movie type
    poster - new movie poster URL
    job_id - job to update
    """
    #

    job_id = request.args.get('job_id')
    job = Job.query.get(job_id)
    old_title = job.title
    old_year = job.year
    app.logger.debug(f"Old Title and Year: {old_title}, {old_year}")

    app.logger.debug(f"New Title: {request.args.get('title')}")
    new_title = ui_utils.clean_for_filename(request.args.get('title'))
    app.logger.debug(f"Cleaned New Title: {new_title}")
    job.title = job.title_manual = new_title

    app.logger.debug(f"New Year: {request.args.get('year')}")
    app.logger.debug(f"New Type: {request.args.get('type')}")
    app.logger.debug(f"New IMDB: {request.args.get('imdbID')}")
    app.logger.debug(f"New Poster: {request.args.get('poster')}")

    job.year = job.year_manual = request.args.get('year')
    job.video_type = job.video_type_manual = request.args.get('type')
    job.imdb_id = job.imdb_id_manual = request.args.get('imdbID')
    job.poster_url = job.poster_url_manual = request.args.get('poster')

    job.hasnicetitle = True
    notification = Notifications(f"Job: {job.job_id} was updated",
                                 f'Title: {old_title} ({old_year}) was updated to '
                                 f'{request.args.get("title")} ({request.args.get("year")})')
    db.session.add(notification)
    db.session.commit()

    return redirect("/")

@route_jobs.route('/changeparams')
@login_required
def changeparams():
    """
    For updating Config params or changing/correcting job.disctype manually
    """
    config_id = request.args.get('config_id')
    job = Job.query.get(config_id)
    config = job.config
    form = ChangeParamsForm(obj=config)

    return render_template('changeparams.html', 
        authenticated    = ui_utils.authenticated_state(),
        title            = 'Change Parameters', 
        form             = form, 
        config           = config
    )


@route_jobs.route('/list_titles')
@login_required
def list_titles():
    """
    The search results page

    This will display the returned search results from OMDB or TMDB from the users input search
    """
    title = request.args.get('title').strip() if request.args.get('title') else ''
    year = request.args.get('year').strip() if request.args.get('year') else ''
    job_id = request.args.get('job_id').strip() if request.args.get('job_id') else ''
    if job_id == "":
        app.logger.debug("list_titles - no job supplied")
        flash(constants.NO_JOB, "danger")
        raise ValidationError
    job = Job.query.get(job_id)
    form = TitleSearchForm(obj=job)
    search_results = ui_utils.metadata_selector("search", title, year)
    if search_results is None or 'Error' in search_results or (
            'Search' in search_results and len(search_results['Search']) < 1):
        app.logger.debug("No results found. Trying without year")
        flash(f"No search results found for {title} ({year})<br/> Trying without year", 'danger')
        search_results = ui_utils.metadata_selector("search", title, "")

    if search_results is None or 'Error' in search_results or (
            'Search' in search_results and len(search_results['Search']) < 1):
        flash(f"No search results found for {title}", 'danger')

    return render_template('list_titles.html', 
        authenticated    = ui_utils.authenticated_state(),
        results          = search_results, 
        job_id           = job_id,
        form             = form, 
        title            = title, 
        year             = year
    )


@route_jobs.route('/json', methods=['GET'])
def feed_json():
    """
    json mini API
    This is used for all api/ajax calls this makes thing easier to read/code for
    Adding a new function to the api is as simple as adding a new elif where GET[mode]
    is your call
    You can then add a function inside utils to deal with the request
    """
    # Check if users is authenticated
    # Return data when authenticated, but allow basic job info when not
    authenticated = ui_utils.authenticated_state()
    mode = str(request.args.get('mode'))
    return_json = {'mode': mode, 'success': False}

    if authenticated:
        # Hold valid data (post/get data) we might receive from pages - not in here ? it's going to throw a key error
        valid_data = {
            'j_id': request.args.get('job'),
            'searchq': request.args.get('q'),
            'logpath': cfg.arm_config['LOGPATH'],
            'fail': 'fail',
            'success': 'success',
            'joblist': 'joblist',
            'mode': mode,
            'config_id': request.args.get('config_id'),
            'notify_id': request.args.get('notify_id'),
            'notify_timeout': {'funct': json_api.get_notify_timeout, 'args': ('notify_timeout',)},
            'restart': {'funct': json_api.restart_ui, 'args': ()},
        }
        # Valid modes that should trigger functions
        valid_modes = {
            'delete': {'funct': json_api.delete_job, 'args': ('j_id', 'mode')},
            'abandon': {'funct': json_api.abandon_job, 'args': ('j_id',)},
            'full': {'funct': json_api.generate_log, 'args': ('logpath', 'j_id')},
            'search': {'funct': json_api.search, 'args': ('searchq',)},
            'getfailed': {
                'funct': json_api.get_x_jobs,
                'args': (JobState.FAILURE.value,),
            },
            'getsuccessful': {
                'funct': json_api.get_x_jobs,
                'args': (JobState.SUCCESS.value,),
            },
            'getalljobs': {
                'funct': json_api.get_x_jobs,
                'args': ("all",),
            },

            'fixperms': {'funct': ui_utils.fix_permissions, 'args': ('j_id',)},
            'joblist': {'funct': json_api.get_x_jobs, 'args': ('joblist',)},
            'send_item': {'funct': ui_utils.send_to_remote_db, 'args': ('j_id',)},
            'change_job_params': {'funct': json_api.change_job_params, 'args': ('config_id',)},
            'read_notification': {'funct': json_api.read_notification, 'args': ('notify_id',)},
            'notify_timeout': {'funct': json_api.get_notify_timeout, 'args': ('notify_timeout',)}
        }
    else:
        valid_data = {
            'joblist': 'joblist',
        }
        valid_modes = {
            'joblist': {'funct': json_api.get_x_jobs, 'args': ('joblist',)},
        }
    
    # prepare JSON data
    if mode in valid_modes:
        args = [valid_data[x] for x in valid_modes[mode]['args']]
        return_json = valid_modes[mode]['funct'](*args)

    # add notifcations to all reponses?
    return_json['notes'] = json_api.get_unseen_notifications()

    # return JSON data
    return app.response_class(
        response    = json.dumps(
                            return_json, 
                            indent          = 4, 
                            sort_keys       = True
                      ),
        status      = 200,
        mimetype    = constants.JSON_TYPE
    )