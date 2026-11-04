"""
Class definition
 ARM system information and version numbers
"""
import os
import subprocess
import sys
import re
import getpass  # noqa E402
import logging  # noqa: E402
import sqlite3
from alembic.script import ScriptDirectory
from alembic.config import Config

from arm.ripper import ProcessHandler
import arm.config.config as cfg

class ARMInfo:
    arm_version = 0
    python_version = 0
    git_branch = ""
    git_commit = ""
    user = ""
    userenv = ""
    install_path = ""
    db_version = ""
    head_version = ""
    git_hash = ""

    def __init__(self, install_path, db_file):
        self.install_path = install_path
        self.db_file = db_file
        self.get_git_commit()
        self.get_git_revision_hash()
        self.get_arm_version()
        self.get_python_version()
        self.get_user_details()
        self.get_db_head_version()
        self.get_db_version()

    def get_values(self):
        logging.info(f"ARM version: {self.arm_version}")
        logging.info(f"Python version: {self.python_version}")
        logging.info(f"User is: {self.user}")
        logging.info(f"Alembic head is: {self.head_version}")
        logging.info(f"Database version is: {self.db_version}")

    def get_git_commit(self):
        """
        Function to get the current arm git version
        """
        branch_len = 10
        cmd = f"cd {self.install_path} && git branch && git log -1"
        git_output = ProcessHandler.arm_subprocess(cmd, True)
        git_regex = r"\*\s(\S+)\n(?:\s*\S*\n){1,10}(?:commit )([a-z\d]{5,7})"
        git_match = re.search(git_regex, git_output)

        if git_match:
            (self.git_branch, self.git_commit) = git_match.groups()
            if len(self.git_branch) > branch_len:
                self.git_branch = self.git_branch[0:branch_len] + "..."
        else:
            self.git_branch = "unknown"
            self.git_commit = "unknown"

    def get_git_revision_hash(self):
        """Get full hash of current git commit"""
        try:
            self.git_hash = subprocess.check_output(['git', 'rev-parse', 'HEAD'],
                                            cwd=cfg.arm_config['INSTALLPATH']).decode('ascii').strip()
            # Trunkate to seven characters (aligns with the github commit values reported)
            self.git_hash = self.git_hash[:7]  
        except subprocess.CalledProcessError as e:
            self.git_hash = "unknown"

    def get_arm_version(self):
        version_file = os.path.join(self.install_path, 'VERSION')
        try:
            with open(version_file, encoding='utf-8') as f:
                self.arm_version = f.read().strip() or "unknown"
        except FileNotFoundError:
            self.arm_version = "local-build"
        except OSError as e:
            logging.info(f"ARM Version error: {e}")
            self.arm_version = "unknown"

    def get_python_version(self):
        version = sys.version
        if version:
            self.python_version = version
        else:
            self.python_version = "unknown"

    def get_user_details(self):
        """
        Get the user ARM is running
        getuser reports the process/efective user
        """
        user = getpass.getuser()
        if user:
            self.user = user
        else:
            self.user = "unknown"

    def get_db_head_version(self):
        """
        Get the ARM database version from Alembic
        """
        try:
            mig_dir = os.path.join(self.install_path, "arm/migrations")
            config = Config()
            config.set_main_option("script_location", mig_dir)
            script = ScriptDirectory.from_config(config)
            self.head_version = script.get_current_head()
        except Exception as e:
            logging.info(f"DB Head error: {e}")
            self.head_version = "unknown"

    def get_db_version(self):
        """
        Get the ARM database version from the database file
        """
        if os.path.isfile(self.db_file):
            conn = sqlite3.connect(self.db_file)
            db_c = conn.cursor()
            db_c.execute("SELECT version_num FROM alembic_version")
            self.db_version = db_c.fetchone()[0]
        else:
            self.db_version = "unknown"

    def git_check_version(self):
        """
        Check the installed ARM version against the latest stable GitHub release.

        :return:
            tuple: (local_version, remote_version)
        """
        install_path = cfg.arm_config['INSTALLPATH']
        local_version = self.arm_version

        try:
            tags = subprocess.check_output(
                ['git', 'ls-remote', '--tags', '--refs', 'origin'],
                cwd=install_path,
                stderr=subprocess.DEVNULL
            ).decode('ascii').splitlines()

            versions = [
                tag.split('refs/tags/v', 1)[1]
                for tag in tags
                if 'refs/tags/v' in tag
                and re.fullmatch(r'v\d+\.\d+\.\d+', tag.split('refs/tags/', 1)[1])
            ]

            remote_version = max(
                versions,
                key=lambda v: tuple(map(int, v.split('.')))
            ) if versions else "unknown"

        except (subprocess.CalledProcessError, OSError) as e:
            logging.info(f"ARM remote version error: {e}")
            remote_version = "unknown"

        return local_version, remote_version