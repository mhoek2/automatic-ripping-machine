import os
import shlex
import shutil
import subprocess
import tempfile
import psutil
import re
from flask import flash

from arm.ui import app
import arm.config.config as cfg
from arm.ui.settings.ServerUtil import ServerUtil
from arm.models.system_info import SystemInfo
from arm.ripper.ProcessHandler import arm_subprocess

def get_disk_space(path):
    result = {
        "total": 0,
        "used": 0,
        "free": 0,
        "percent": 0,
    }

    try:
        usage = psutil.disk_usage(path)

        result["total"] = round(usage.total / 1073741824, 1)
        result["used"] = round(usage.used / 1073741824, 1)
        result["free"] = round(usage.free / 1073741824, 1)
        result["percent"] = usage.percent

    except (FileNotFoundError, OSError):
        app.logger.debug("ARM folders not found: %s", path)
        flash(
            f"There was a problem accessing the ARM folder: "
            f"'{path}'. Please make sure you have setup ARM",
            "danger",
        )

    return result

def check_directory(path):
    disk = get_disk_space(path)
    
    result = {
        "path": path, 
        "exists": False, 
        "readable": False, 
        "writable": False,
        **disk,
    }
    
    if not path:
        return result
    
    result["exists"] = os.path.isdir(path)
    if not result["exists"]:
        return result

    try:
        with os.scandir(path):
            result["readable"] = True
    except OSError:
        pass

    try:
        with tempfile.NamedTemporaryFile(dir=path, prefix=".arm-health-", delete=True):
            result["writable"] = True
    except OSError:
        pass

    return result

def check_file(path, writable=False):
    result = {"path": path, "exists": False, "readable": False}
    if writable:
        result["writable"] = False
    if not path:
        return result
    result["exists"] = os.path.isfile(path)
    if not result["exists"]:
        return result
    result["readable"] = os.access(path, os.R_OK)
    if writable:
        result["writable"] = os.access(path, os.W_OK)
    return result

def check_handbrake(config):
    command = config.get("HANDBRAKE_CLI")
    
    result = {
        "command": command, 
        "available": False, 
        "version": None, 
        "error": None
    }
              
    if not command:
        result["error"] = "Not configured"
        return result
    
    try:
        args        = shlex.split(command)
        resolved    = shutil.which(args[0])

        if not resolved:
            result["error"] = "Executable not found"
            return result
        
        result["command"]   = resolved
        process             = subprocess.run([resolved, *args[1:], "--version"], capture_output=True, text=True, timeout=10, check=False)
        output              = (process.stdout + "\n" + process.stderr).strip()
        match               = re.search(r"HandBrake (\d+(?:\.\d+)+)", output)
        result["available"] = process.returncode == 0
        result["version"]   = match.group(1) if match else None
        
        if process.returncode != 0:
            result["error"] = f"Exited with code {process.returncode}"

    except (OSError, subprocess.TimeoutExpired) as exc:
        result["error"]     = str(exc)

    return result

def check_makemkv(config):
    command = f"makemkvcon"
    
    result = {
         "command": command, 
         "available": False, 
         "version": None, 
         "error": None
        }

    if not command:
        result["error"] = "Not configured"
        return result

    try:
        resolved = shutil.which(command)
        if not resolved:
            result["error"] = "Executable not found"
            return result
        
        result["command"]   = resolved
        process             = subprocess.run([resolved, "info"], capture_output=True, text=True, timeout=10, check=False)
        output              = (process.stdout + "\n" + process.stderr).strip()
        match               = re.search(r"MakeMKV v([\d.]+)", output)
        result["available"] = match is not None
        result["version"]   = match.group(1) if match else None
        
        if not result["available"]:
            result["error"] = f"No MakeMKV version detected (exit code {process.returncode})"
 
    except subprocess.TimeoutExpired:
        result["error"] = "Timed out"
        
    except OSError as exc:
        result["error"] = str(exc)

    return result


def check_hw_transcode_support():
    hw_support_status = {
        "nvidia"    : False,
        "intel"     : False,
        "amd"       : False
    }
    
    cmd = f"nice {cfg.arm_config['HANDBRAKE_CLI']}"
    app.logger.debug(f"Sending command: {cmd}")
    try:
        hand_brake_output = arm_subprocess(f"{cmd}", shell=True, check=True)

        # NVENC
        if re.search(r'nvenc: version ([0-9\\.]+) is available', str(hand_brake_output)):
            app.logger.info("NVENC supported!")
            hw_support_status["nvidia"] = True
 
       # Intel QuickSync
        if re.search(r'qsv:\sis(.*?)available\son', str(hand_brake_output)):
            app.logger.info("Intel QuickSync supported!")
            hw_support_status["intel"] = True

        # AMD VCN
        if re.search(r'vcn:\sis(.*?)available\son', str(hand_brake_output)):
            app.logger.info("AMD VCN supported!")
            hw_support_status["amd"] = True


        app.logger.info("Handbrake call successful")
        app.logger.debug(hand_brake_output)
    
    except subprocess.CalledProcessError:
        pass

    return hw_support_status

def fetch(isInited=False):
    config = cfg.arm_config
    
    serverutil  = ServerUtil()
    server      = SystemInfo.query.filter_by(id="1").first()
    
    return {
        "directories": {
            "raw":          check_directory(config.get("RAW_PATH")),
            "transcode":    check_directory(config.get("TRANSCODE_PATH")),
            "completed":    check_directory(config.get("COMPLETED_PATH")),
            "logs":         check_directory(config.get("LOGPATH")),
        },
        "files": {
            "database":     check_file(config.get("DBFILE"), writable=True),
            "abcde_config": check_file(config.get("ABCDE_CONFIG_FILE")),
        },
        "tools": {
            "handbrake":    check_handbrake(config),
            "makemkv":      check_makemkv(config),
            'transcode':    check_hw_transcode_support()
        } if not isInited else -1,
        'server': {
            'name':             server.name,
            'cpu':              server.cpu,
            'description':      server.description,

            'cpu_util':         serverutil.cpu_util,
            'cpu_temp':         serverutil.cpu_temp,
            'memory_free':      serverutil.memory_free,
            'memory_used':      serverutil.memory_used,
            'memory_percent':   serverutil.memory_percent,
        },
    }