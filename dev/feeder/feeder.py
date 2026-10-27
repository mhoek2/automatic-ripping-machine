#!/usr/bin/env python3
import random
import sys
import time
import json
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import class_mapper

import arm.config.config as cfg
from arm.ui import app, db, constants
from arm.models.job import Job, JobState, JobStateGroup
from arm.models.track import Track, TrackState
from arm.models.system_drives import SystemDrives, CDS
from arm.models.config import Config
from arm.ripper.makemkv import manual_wait
from arm.ripper import utils

import re
from time import strftime

from movies import MOVIES

class Feeder:
    SIMULATION_STAGES = [
        {"state": JobState.IDLE.value,                  "name": "Initializing / Identifying", "weight": 0.1,  "function": "stage_initializing"},
        {"state": JobState.MANUAL_WAIT_STARTED.value,   "name": "Waiting / Manual Pause",     "weight": 0.1,  "function": "stage_manual_wait"},
        {"state": JobState.VIDEO_INFO.value,            "name": "Reading Disc Info",          "weight": 0.2,  "function": "stage_reading_disc_info"},
        {"state": JobState.VIDEO_RIPPING.value,         "name": "Ripping with MakeMKV",       "weight": 0.35, "function": "stage_ripping"},
        {"state": JobState.TRANSCODE_WAITING.value,     "name": "Waiting for Transcoding",    "weight": 0.05, "function": "stage_transcode_waiting"},
        {"state": JobState.TRANSCODE_ACTIVE.value,      "name": "Transcoding with HandBrake", "weight": 0.2,  "function": "stage_transcoding"},
        {"state": JobState.POSTPROCESSING_MOVING.value, "name": "Moving Files & Finishing",   "weight": 0.1,  "function": "stage_postprocessing"},
    ]

    FEEDER_SCENARIOS = {
        "clear"             : None,
        "simulate"          : None,
        "completed"         : JobState.SUCCESS.value,
        "success"           : JobState.SUCCESS.value,
        "fail"              : JobState.FAILURE.value,
        "active"            : JobState.IDLE.value,
        "waiting"           : JobState.MANUAL_WAIT_STARTED.value,
        "ripping"           : JobState.VIDEO_RIPPING.value,
        "info"              : JobState.VIDEO_INFO.value,
        "transcoding"       : JobState.TRANSCODE_ACTIVE.value,
        "waiting_transcode" : JobState.TRANSCODE_WAITING.value,
        "moving"            : JobState.POSTPROCESSING_MOVING.value,
    }

    def __init__( self ) -> None:
        self.data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        
        self.command        = self.data.get("action", "completed")
        self.drive_mount    = self.data.get("drive", -1)
        self.drive_mode     = self.data.get("drive_mode", False)

        if self.command not in self.FEEDER_SCENARIOS:
            raise SystemExit(f"Unknown scenario: {self.command}\nUse: {', '.join(self.FEEDER_SCENARIOS)}")
        
        if self.command == "simulate" and self.drive_mount == -1:
            raise SystemExit(f"Invalid drive: {self.drive_mount} - command: {self.command}")
  
        self.run()  

    def _job_notificaton(self, job, message):
        utils.notify(job, constants.NOTIFY_TITLE, message)

    def __make_tracks(self):
        tracks = []
        
        for index, item in enumerate(self.movie["tracks"], start=1):
            filename = f"{item['title'].replace(' ', '.')}.mkv"
            track = Track(
                self.job.job_id,
                str(index),
                item["runtime"],
                "16:9",
                23.976,
                item["main_feature"],
                "bluray",
                item["title"],
                filename,
                chapters=item["chapters"],
                filesize=item["filesize"],
            )
            track.orig_filename = filename
            track.new_filename = filename
            track.error = None
            tracks.append(track)
            
        return tracks

    def __make_progress_log(self, job):
        progress_dir = Path("/home/arm/logs") / "progress"  
        progress_dir.mkdir(parents=True, exist_ok=True)
        
        progress_path = progress_dir / f"{job.job_id}.log"
        progress_path.write_text("", encoding="utf-8")
        
        return str(progress_path)

    def __append_makemkv_progress(self, current, total=1000, maximum=1000):
        with open(self.progress_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"PRGV:{current},{total},{maximum}\n")

    def __make_logfile(self):
        log_dir = Path("/home/arm/logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        safe_title = re.sub(r'[<>:"/\\|?*]', "", self.movie["title"])
        safe_title = re.sub(r"\s+", "_", safe_title).strip(" .")
        log_path = log_dir / f"{safe_title}.log"
        now = datetime.now()
        
        with log_path.open("w", encoding="utf-8") as log_file:
            log_file.write(f"{now.strftime('%Y-%m-%d %H:%M:%S')} [INFO] ARM: Starting Automatic Ripping Machine\n")
            log_file.write(f"{now.strftime('%Y-%m-%d %H:%M:%S')} [INFO] ARM: Job initialized for {self.movie['title']} ({self.movie['year']})\n")
            log_file.write(f"{now.strftime('%Y-%m-%d %H:%M:%S')} [INFO] ARM: Detected virtual Blu-ray drive at {self.drive.mount}\n")
            log_file.write(f"{now.strftime('%Y-%m-%d %H:%M:%S')} [INFO] ARM: Initial status: {self.status}\n")
            
        return str(log_path)

    def __append_jobfile(self, level, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        with Path(self.log_path).open("a", encoding="utf-8") as log_file:
            log_file.write(f"{timestamp} [{level}] {message}\n")

    # stages
    def stage_initializing(self, duration : float ):
        self.__append_jobfile("INFO", "ARM: Starting title identification")
        self.__append_jobfile("INFO", "ARM: Title identification completed")
        
        time.sleep(duration)

    def stage_manual_wait(self, duration : float ):
        self.__append_jobfile("INFO", "ARM: Waiting for manual intervention")

        time.sleep(duration)

    def stage_reading_disc_info(self, duration : float ):
        time.sleep(3.0)
        
        self.tracks : list[Track] = self.__make_tracks()
        db.session.add_all(self.tracks)
        db.session.commit()
        
        self.__append_jobfile("INFO", "ARM: Reading disc information")
        self.__append_jobfile("INFO", "ARM: Found 3 titles on disc")

        time.sleep(duration)

    def __process_tracks(self, duration : float ):
        self.__append_jobfile("INFO", "MakeMKV: Starting disc rip")
        self.__append_makemkv_progress(0)
        self.__append_jobfile("INFO", "MakeMKV: Ripping main feature")

        for track in self.tracks:
            # auto-mode marks all tracks to process first.
            if not self.job.manual_mode:
                track.process = True

            if not track.process:
                track.status = TrackState.TRACK_SKIPPED    
        db.session.commit()

        track_duration = duration / len(self.tracks) 

        for track in self.tracks:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Start rip for track: #{track.track_number} - {track.basename}")

            if not track.process:
                continue

            track.status = TrackState.TRACK_RIPPING
            db.session.commit()
            
            for progress in (100, 250, 400, 600, 800, 1000):
                time.sleep(track_duration)
                self.__append_makemkv_progress(progress)
                self.__append_jobfile("INFO", f"MakeMKV: Ripping progress {progress / 10:.1f}%")
                self.__append_jobfile("INFO", "MakeMKV: rip completed")

            track.ripped = True
            track.status = TrackState.TRACK_RIPPED
            db.session.commit()

        if self.config.NOTIFY_RIP:
            self._job_notificaton(self.job, f"{self.job.title} {constants.RIPPING_COMPLETE}")

    def stage_ripping(self, duration : float ):
        # mimics: arm.ripper.makemkv.process_manual_tracks()
        if self.job.manual_mode:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Use manual mode")
            
            # Stop/hold job and set status to waiting
            self.job.status = JobState.VIDEO_WAITING.value
            self.job.stop_time = datetime.now()
            db.session.commit()

            # Process Tracks
            # Notify user: tracks are ready and wait for 30 minutes
            if manual_wait(self.job): 
                # Response from user provided, process requested tracks
                self.job.status = JobState.VIDEO_RIPPING.value
                self.job.stop_time = None # reset
                db.session.commit()

                self.__process_tracks(duration)
            else:
                title = "ARM is Sad - Job Abandoned"
                message = "You left me alone in the cold and dark, I forgot who I was. Your job has been abandoned."
                utils.notify(self.job, title, message)
        
        # auto mode
        else:
            self.__process_tracks(duration)

    def stage_transcode_waiting(self, duration : float ):
        self.__append_jobfile("INFO", "ARM: Waiting for transcoding slot")

        time.sleep(duration)

    def stage_transcoding(self, duration : float ):
        self.__append_jobfile("INFO", "HandBrake: Reading source")
        for progress in (12.5, 37.5, 62.5, 100):
            self.__append_jobfile("INFO", f"HandBrake: Encoding: {progress}%")
            time.sleep(1.5)

        if self.config.NOTIFY_TRANSCODE:
            self._job_notificaton(self.job, f"{self.job.title} {constants.TRANSCODE_COMPLETE}")
        
        self.job.status = JobState.IDLE.value # why ??
        db.session.commit()

        time.sleep(duration)

    def stage_postprocessing(self, duration : float ):
        self.__append_jobfile("INFO", "ARM: Moving completed files")
        self.__append_jobfile("INFO", "ARM: Output files verified")
        self.__append_jobfile("INFO", "ARM: Job completed successfully")

        time.sleep(duration)

    def __finish_job(self, final_outcome):
        if final_outcome == JobState.SUCCESS.value:
            self.job.status = JobState.SUCCESS.value
            self.job.stage = "Job completed successfully"
            self.job.ejected = True
            self.drive.tray = CDS.DISC_OK

            # time - logic: arm/ripper/main.py
            self.job.stop_time = datetime.now()
            if self.job.start_time:
                job_length = self.job.stop_time - self.job.start_time
                minutes, seconds = divmod(job_length.seconds + job_length.days * 86400, 60)
                hours, minutes = divmod(minutes, 60)
                self.job.job_length = f'{hours:d}:{minutes:02d}:{seconds:02d}'
            else:
                self.job.job_length = "0:00:00"

            self._job_notificaton(self.job, f"{self.job.title} {constants.PROCESS_COMPLETE}")

        # failure
        else:
            self.job.status = JobState.FAILURE.value
            self.job.stage = "Job failed"
            self.job.errors = "Mock simulation failure"
            self.drive.tray = CDS.DISC_ERROR
            self._job_notificaton(self.job,
                            f" {self.job.title} processing completed with errors. "
                            f"Title(s) {self.job.errors} failed to complete. "
                )
            
        self.drive.job_id_previous = self.job.job_id
        self.drive.job_id_current = None
        db.session.commit()

    def make_drive(self, drive_mount_id):
        drive = SystemDrives()
        drive.serial_id = f"MOCK-MATSHITA-SR{drive_mount_id}"
        drive.maker = "Mock"
        drive.model = "Virtual Blu-ray Drive"
        drive.serial = f"SR{drive_mount_id}-0001"
        drive.connection = "ata"
        drive.read_cd = True
        drive.read_dvd = True
        drive.read_bd = True
        drive.mount = f"/dev/sr{drive_mount_id}"
        drive.firmware = "1.00"
        drive.location = f"Mock Drive {{drive_mount_id}}"
        drive.stale = False
        drive.mdisc = 1
        drive.tray = CDS.DISC_OK
        drive.name = "Mock Blu-ray Drive"
        drive.description = "ARM development virtual drive"
        drive.drive_mode = self.drive_mode
        return drive

    def make_config(self, job):
        values = {
            "VIDEOTYPE": "bluray",
            "MINLENGTH": "600",
            "MAXLENGTH": "0",
            "RIPMETHOD": "mkv",
            "RAW_PATH": "/home/arm/raw",
            "TRANSCODE_PATH": "/home/arm/transcode",
            "COMPLETED_PATH": "/home/arm/completed",
            "SKIP_TRANSCODE": True,
            "GET_VIDEO_TITLE": False,
            "MAINFEATURE": True,
            "DEST_EXT": ".mkv",
        }
        
        # custom config
        #return Config(values, self.job.job_id)

        # dev/config/arm.yaml
        return Config(cfg.arm_config, job.job_id)

    def make_job(self):
        # Bypass ARM's Job.__init__() because it probes real hardware.
        # class_manager.new_instance() still creates a properly
        # SQLAlchemy-instrumented instance.
        job = class_mapper(Job).class_manager.new_instance()

        now = datetime.now()
        finished = self.status in (
            JobState.SUCCESS.value,
            JobState.FAILURE.value,
        )

        job.arm_version = "dev"
        job.crc_id = f"MOCK-{self.movie['imdb_id']}"
        job.logfile = self.log_path
        job.start_time = now# - timedelta(minutes=42)
        #job.stop_time = now if finished else None
        #job.job_length = "00:42:00"

        job.status = self.status
        job.stage = "Mock development job"

        job.no_of_titles = 3
        job.title = self.movie["title"]
        job.title_auto = self.movie["title"]
        job.title_manual = None

        job.year = self.movie["year"]
        job.year_auto = self.movie["year"]
        job.year_manual = None

        job.video_type = "bluray"
        job.video_type_auto = "bluray"
        job.video_type_manual = None

        job.imdb_id = self.movie["imdb_id"]
        job.imdb_id_auto = self.movie["imdb_id"]
        job.imdb_id_manual = None

        job.poster_url = self.movie["poster_url"]
        job.poster_url_auto = self.movie["poster_url"]
        job.poster_url_manual = None

        job.devpath = self.drive.mount
        job.mountpoint = f"/mnt/{self.drive.mount}"

        job.hasnicetitle = True
        job.errors = "Mock ripping error" if self.status == JobState.FAILURE.value else None
        job.disctype = "bluray"
        job.label = "MOCK_BLURAY"
        job.path = f"/home/arm/media/completed/{self.movie['title']}"

        job.ejected = self.status == JobState.SUCCESS.value
        job.updated = False
        job.pid = 1
        job.pid_hash = 1
        job.is_iso = False
        job.manual_start = False
        job.manual_mode = False if self.drive.drive_mode == "auto" else True

        return job

    def clear(self):
        db.session.query(Track).delete()
        db.session.query(Config).delete()
        db.session.query(Job).delete()
        db.session.query(SystemDrives).delete()
        db.session.commit()

    def populate(self) -> str:
        self.movie = random.choice(MOVIES)
        
        self.drive = self.make_drive(random.randint(100, 10000))
        self.drive.job_id_previous = None
        self.drive_mount = self.drive.mount
        db.session.add(self.drive)
        db.session.flush()

        self.log_path = self.__make_logfile()
        job = self.make_job()
        db.session.add(job)
        db.session.flush()

        self.drive.job_id_current = job.job_id

        self.config = self.make_config( job )
        db.session.add(self.config)
        db.session.commit()

        self.progress_path = self.__make_progress_log(job)
        
        print(f"Created job {job.job_id}: {self.movie['title']} [{job.status}]")
        print(f"IMDb: {self.movie['imdb_id']}")
        print(f"Drive: {self.drive.mount} (tray: {self.drive.tray.name})")
        print(f"Logfile: {self.log_path}")

    def run_simulation(self, total_duration_seconds: int, final_outcome: str = JobState.SUCCESS.value, target_state: str = None):
        drive = SystemDrives.query.filter_by(
            mount=self.drive_mount
        ).first()

        if not drive or not drive.job_id_current:
            print("No active job found in the mock drive. Run your feeder populate script first!")
            return

        # fetch job from drive
        self.drive = drive
        self.job = db.session.get(Job, self.drive.job_id_current)
    
        if not self.job:
            print(f"Job ID {self.drive.job_id_current} not found.")
            return
        
        self.config = Config.query.filter_by(job_id=self.job.job_id).first()


        print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting simulation for: {self.job.title} [{total_duration_seconds}s total duration]")
        
        for stage in self.SIMULATION_STAGES:
            if self.config.SKIP_TRANSCODE and JobState(stage["state"]) in JobStateGroup.TRANSCODING:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Transcoding is disabled, skipping transcode")
                continue
                
            self.job.status = stage["state"]
            self.job.stage = stage["name"]
            
            db.session.commit()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] State -> {stage['name']}")

            duration = total_duration_seconds * stage["weight"]
            # call stage function
            getattr(self, stage["function"])(duration)
            
            if target_state == stage["state"]:
                print(f"Simulation stopped at requested state: {stage['state']}")
                return
        
        finished_time = datetime.now()
        self.job.stop_time = finished_time
        self.job.job_length = str(finished_time - self.job.start_time)
        
        self.__finish_job(final_outcome)

        print(f"[{datetime.now().strftime('%H:%M:%S')}] Simulation finished with status: {self.job.status}")

    def run( self ):
          with app.app_context():
            if self.command == "clear":
                self.clear()
                print("Database cleared.")
                return

            # simulate existing job till finished state
            if self.command == "simulate":
                self.drive_mount = self.data.get("drive")
                self.run_simulation( 30, JobState.SUCCESS.value)
                return

            # simulate till requested state
            target_state            = self.FEEDER_SCENARIOS[self.command]
            self.status             = JobState.IDLE.value
            self.populate()
            
            final_outcome           = JobState.FAILURE.value if self.command == "fail" else JobState.SUCCESS.value
            stop_state              = None if self.command in ("success", "completed", "fail") else target_state

            self.run_simulation(30, final_outcome, stop_state)   

if __name__ == "__main__":
    Feeder()
