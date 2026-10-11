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


def make_job(movie, status=JobState.SUCCESS.value):
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
    job.logfile = "/home/arm/log/mock-bluray.log"
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

    drive = make_drive()
    db.session.add(drive)
    db.session.flush()

    job = make_job(movie, status)
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