import os
import shlex
import shutil
import subprocess
import tempfile
import shutil
import re

import arm.config.config as cfg

def check_directory(path):
    result = {"path": path, "exists": False, "readable": False, "writable": False}
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

def fetch():
    config = cfg.arm_config
    
    makemkvcon_path = shutil.which("makemkvcon")
    print(makemkvcon_path)
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
        },
    }