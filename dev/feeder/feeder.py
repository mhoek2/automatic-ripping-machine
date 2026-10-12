#!/usr/bin/env python3
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import class_mapper

from arm.ui import app, db
from arm.models.job import Job, JobState
from arm.models.track import Track
from arm.models.system_drives import SystemDrives, CDS
from arm.models.config import Config

import re
from time import strftime

FEEDER_SCENARIOS = {
	"clear": None,
	"completed": JobState.SUCCESS.value,
	"success": JobState.SUCCESS.value,
	"fail": JobState.FAILURE.value,
	"active": JobState.IDLE.value,
	"waiting": JobState.MANUAL_WAIT_STARTED.value,
	"ripping": JobState.VIDEO_RIPPING.value,
	"info": JobState.VIDEO_INFO.value,
	"transcoding": JobState.TRANSCODE_ACTIVE.value,
	"waiting_transcode": JobState.TRANSCODE_WAITING.value,
	"moving": JobState.POSTPROCESSING_MOVING.value,
}

MOVIES = [
    {
        "title": "Interstellar",
        "year": "2014",
        "imdb_id": "tt0816692",
        "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "runtime": 10140,
    },
    {
        "title": "Inception",
        "year": "2010",
        "imdb_id": "tt1375666",
        "poster_url": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        "runtime": 8880,
    },
    {
        "title": "The Matrix",
        "year": "1999",
        "imdb_id": "tt0133093",
        "poster_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "runtime": 8160,
    },
    {
        "title": "Blade Runner 2049",
        "year": "2017",
        "imdb_id": "tt1856101",
        "poster_url": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        "runtime": 9840,
    },
    {
        "title": "The Lord of the Rings: The Fellowship of the Ring",
        "year": "2001",
        "imdb_id": "tt0120737",
        "poster_url": "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkblwGmQ.jpg",
        "runtime": 10620,
    },
    {
        "title": "The Dark Knight",
        "year": "2008",
        "imdb_id": "tt0468569",
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "runtime": 9120,
    },
    {
        "title": "Dune: Part Two",
        "year": "2024",
        "imdb_id": "tt15239678",
        "poster_url": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        "runtime": 9960,
    },
    {
        "title": "Alien",
        "year": "1979",
        "imdb_id": "tt0078748",
        "poster_url": "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
        "runtime": 6960,
    },
]

def make_logfile(movie, status):
    log_dir = Path("/home/arm/logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    # Remove filesystem-invalid characters and replace spaces with underscores.
    safe_title = re.sub(r'[<>:"/\\|?*]', "", movie["title"])
    safe_title = re.sub(r"\s+", "_", safe_title).strip(" .")

    log_path = log_dir / f"{safe_title}.log"
    now = datetime.now()

    entries = [
        (0, "INFO", "ARM: Starting Automatic Ripping Machine"),
        (1, "INFO", f"ARM: Job initialized for {movie['title']} ({movie['year']})"),
        (2, "INFO", "ARM: Detected virtual Blu-ray drive at /dev/sr1"),
        (3, "INFO", "ARM: Disc type: Blu-ray"),
        (4, "INFO", "ARM: Reading disc information"),
        (5, "INFO", f"ARM: Detected title: {movie['title']}"),
        (6, "INFO", f"ARM: IMDb ID: {movie['imdb_id']}"),
        (7, "INFO", "ARM: Found 3 titles on disc"),
        (8, "INFO", "ARM: Selecting main feature"),
        (10, "INFO", "ARM: Starting title identification"),
        (12, "INFO", "ARM: Title identification completed"),
        (14, "INFO", "ARM: Preparing output directory"),
        (16, "INFO", "ARM: Starting disc rip"),
        (20, "INFO", "HandBrake: Reading source"),
        (25, "INFO", "HandBrake: Encoding title 1 of 3"),
        (30, "INFO", "HandBrake: Encoding: 12.5%"),
        (35, "INFO", "HandBrake: Encoding: 37.5%"),
        (40, "INFO", "HandBrake: Encoding: 62.5%"),
        (45, "INFO", "HandBrake: Encoding: 100%"),
        (47, "INFO", "ARM: Main feature rip completed"),
        (49, "INFO", "ARM: Processing bonus features"),
        (51, "INFO", "ARM: Bonus features completed"),
    ]

    if status == JobState.FAILURE.value:
        entries.extend([
            (53, "ERROR", "ARM: Failed to complete disc processing"),
            (54, "ERROR", "ARM: Mock ripping error"),
            (55, "ERROR", "ARM: Job failed"),
        ])
    elif status == JobState.SUCCESS.value:
        entries.extend([
            (53, "INFO", "ARM: Moving completed files"),
            (55, "INFO", "ARM: Output files verified"),
            (57, "INFO", "ARM: Ejecting disc"),
            (59, "INFO", "ARM: Job completed successfully"),
        ])
    else:
        entries.extend([
            (53, "INFO", f"ARM: Current job status: {status}"),
            (54, "INFO", "ARM: Waiting for next processing stage"),
        ])

    with log_path.open("w", encoding="utf-8") as log_file:
        for seconds, level, message in entries:
            timestamp = (now + timedelta(seconds=seconds)).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            log_file.write(f"{timestamp} [{level}] {message}\n")

    return str(log_path)

def make_drive():
    drive = SystemDrives()
    drive.serial_id = "MOCK-MATSHITA-SR1"
    drive.maker = "Mock"
    drive.model = "Virtual Blu-ray Drive"
    drive.serial = "SR1-0001"
    drive.connection = "ata"
    drive.read_cd = True
    drive.read_dvd = True
    drive.read_bd = True
    drive.mount = "/dev/sr1"
    drive.firmware = "1.00"
    drive.location = "Mock Drive 1"
    drive.stale = False
    drive.mdisc = 1
    drive.tray = CDS.DISC_OK
    drive.name = "Mock Blu-ray Drive"
    drive.description = "ARM development virtual drive"
    drive.drive_mode = "auto"
    return drive


def make_config(job_id):
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
    return Config(values, job_id)


def make_job(movie, status=JobState.SUCCESS.value, logfile=None):
    # Bypass ARM's Job.__init__() because it probes real hardware.
    # class_manager.new_instance() still creates a properly
    # SQLAlchemy-instrumented instance.
    job = class_mapper(Job).class_manager.new_instance()

    now = datetime.now()
    finished = status in (
        JobState.SUCCESS.value,
        JobState.FAILURE.value,
    )

    job.arm_version = "dev"
    job.crc_id = f"MOCK-{movie['imdb_id']}"
    job.logfile = logfile
    job.start_time = now - timedelta(minutes=42)
    job.stop_time = now if finished else None
    job.job_length = "00:42:00"

    job.status = status
    job.stage = "Mock development job"

    job.no_of_titles = 3
    job.title = movie["title"]
    job.title_auto = movie["title"]
    job.title_manual = None

    job.year = movie["year"]
    job.year_auto = movie["year"]
    job.year_manual = None

    job.video_type = "bluray"
    job.video_type_auto = "bluray"
    job.video_type_manual = None

    job.imdb_id = movie["imdb_id"]
    job.imdb_id_auto = movie["imdb_id"]
    job.imdb_id_manual = None

    job.poster_url = movie["poster_url"]
    job.poster_url_auto = movie["poster_url"]
    job.poster_url_manual = None

    job.devpath = "/dev/sr1"
    job.mountpoint = "/mnt/dev/sr1"

    job.hasnicetitle = True
    job.errors = "Mock ripping error" if status == JobState.FAILURE.value else None
    job.disctype = "bluray"
    job.label = "MOCK_BLURAY"
    job.path = f"/home/arm/media/completed/{movie['title']}"

    job.ejected = status == JobState.SUCCESS.value
    job.updated = False
    job.pid = 1
    job.pid_hash = 1
    job.is_iso = False
    job.manual_start = False
    job.manual_mode = False

    return job


def make_tracks(job, movie):
    tracks = [
        Track(
            job.job_id,
            "1",
            movie["runtime"],
            "16:9",
            23.976,
            True,
            "bluray",
            movie["title"],
            f"{movie['title'].replace(' ', '.')}.mkv",
            chapters=18,
            filesize=12_500_000_000,
        ),
        Track(
            job.job_id,
            "2",
            3420,
            "16:9",
            23.976,
            False,
            "bluray",
            "Bonus Feature",
            "Bonus.Feature.mkv",
            chapters=8,
            filesize=4_200_000_000,
        ),
        Track(
            job.job_id,
            "3",
            180,
            "16:9",
            23.976,
            False,
            "bluray",
            "Trailer",
            "Trailer.mkv",
            chapters=1,
            filesize=250_000_000,
        ),
    ]

    filenames = [
        ("Mock.Blu-ray.Movie.mkv", "Mock.Blu-ray.Movie.mkv"),
        ("Bonus.Feature.mkv", "Bonus.Feature.mkv"),
        ("Trailer.mkv", "Trailer.mkv"),
    ]

    for track, (orig_filename, new_filename) in zip(tracks, filenames):
        track.status = "success"
        track.ripped = True
        track.process = False
        track.orig_filename = orig_filename
        track.new_filename = new_filename
        track.error = None

    return tracks


def clear():
    db.session.query(Track).delete()
    db.session.query(Config).delete()
    db.session.query(Job).delete()
    db.session.query(SystemDrives).delete()
    db.session.commit()


def populate(status):
    movie = random.choice(MOVIES)

    logfile = make_logfile(movie, status)

    drive = make_drive()
    db.session.add(drive)
    db.session.flush()

    job = make_job(movie, status, logfile)
    db.session.add(job)
    db.session.flush()

    config = make_config(job.job_id)
    db.session.add(config)

    tracks = make_tracks(job, movie)
    db.session.add_all(tracks)

    finished = status in (
        JobState.SUCCESS.value,
        JobState.FAILURE.value,
    )

    if finished:
        drive.job_id_previous = job.job_id
        drive.job_id_current = None
    else:
        drive.job_id_previous = None
        drive.job_id_current = job.job_id

    db.session.commit()

    print(f"Created job {job.job_id}: {movie['title']} [{job.status}]")
    print(f"IMDb: {movie['imdb_id']}")
    print(f"Created drive: {drive.mount}")
    print(f"Drive tray: {drive.tray.name}")
    print(f"Created {len(tracks)} tracks")
    print(f"Created logfile: {logfile}")


def main():
	command = sys.argv[1] if len(sys.argv) > 1 else "completed"

	with app.app_context():
		if command not in FEEDER_SCENARIOS:
			raise SystemExit(
				f"Unknown scenario: {command}\n"
				f"Use: {', '.join(FEEDER_SCENARIOS)}"
			)

		if command == "clear":
			clear()
			print("Database cleared.")
		else:
			populate(FEEDER_SCENARIOS[command])

if __name__ == "__main__":
    main()