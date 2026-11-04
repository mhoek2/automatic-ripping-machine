"""
ARM route blueprint for log pages
Covers
- logs [GET]
- listlogs [GET]
- logreader [GET]
"""

import os
from pathlib import Path
from flask_login import LoginManager, login_required  # noqa: F401
from flask import render_template, request, Blueprint, send_file, session, jsonify
from werkzeug.routing import ValidationError

import arm.ui.utils as ui_utils
from arm.ui import app
import arm.config.config as cfg

route_logs = Blueprint('route_logs', __name__,
                       template_folder='templates',
                       static_folder='../static')


@route_logs.route('/logs')
@login_required
def logs():
    """
    This is the main page for viewing a logfile

    this holds the XHR request that sends to other routes for the data
    """
    mode    = request.args['mode']
    session["page_title"] = "Logs"

    return render_template('log_content.html', 
        authenticated    = ui_utils.authenticated_state(),
        file             = request.args['logfile'], 
        mode             = mode
    )


@route_logs.route('/listlogs', defaults={'path': ''})
@login_required
def listlogs(path):
    """
    The 'View logs' page - show a list of logfiles in the log folder with creation time and size
    Gives the user links to tail/arm/Full/download
    """
    base_path = cfg.arm_config['LOGPATH']
    full_path = os.path.join(base_path, path)
    session["page_title"] = "Logs"

    # Deal with bad data
    if not os.path.exists(full_path):
        raise ValidationError

    # Get all files in directory
    files = ui_utils.get_info(full_path)

    return render_template('log_list.html', 
        authenticated    = ui_utils.authenticated_state(),
        files            = files, 
        date_format      = cfg.arm_config['DATE_FORMAT']
    )


@route_logs.route('/logreader')
@login_required
def logreader():
    log_path = Path(cfg.arm_config['LOGPATH']).resolve()
    mode = request.args.get('mode')

    logfile = request.args.get('logfile')
    if not logfile:
        raise ValidationError

    requested_path = Path(logfile)

    # resolve path, allow both:
    #logfile=movie_name.log
    #logfile=/home/arm/logs/move_name.log
    if requested_path.is_absolute():
        full_path = requested_path.resolve()
    else:
        full_path = (log_path / requested_path).resolve()

    # Only allow files within LOGPATH.
    if not full_path.is_relative_to(log_path):
        raise ValidationError

    ui_utils.validate_logfile(full_path.name, mode, full_path)

    if mode == "armcat":
        content = "".join(ui_utils.generate_arm_cat(full_path))
    elif mode == "tail":
        with full_path.open(encoding="utf8", errors="ignore") as log_file:
            content = log_file.read()
    elif mode == "download":
        return send_file(full_path, as_attachment=True)
    else:
        raise ValidationError

    return jsonify({
        "mode": mode,
        "content": content
    })
