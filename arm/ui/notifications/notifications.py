"""
ARM route blueprint for notifications pages
Covers
- arm_nav_notify [GET]
- arm_notification [GET]
- arm_notification_close [GET}
"""

from flask_login import login_required  # noqa: F401
from flask import render_template, Blueprint, redirect, flash, session, request, jsonify
from datetime import datetime

import arm.ui.utils as ui_utils
from arm.ui import app
from arm.models.notifications import Notifications

route_notifications = Blueprint('route_notifications', __name__,
                                template_folder='templates',
                                static_folder='../static')


@app.context_processor
def arm_nav_notify():
    """
    inject the unread notification count to all pages for the navbar count
    """
    try:
        notify_count = Notifications.query.filter_by(cleared='0').count()
        app.logger.debug(notify_count)

    except Exception:
        notify_count = None

    return dict(notify_count=notify_count)


@route_notifications.route('/notifications')
@login_required
def arm_notification():
    """
    function to display all current notifications
    """
    notifications_new = Notifications.query.filter_by(cleared='0').order_by(Notifications.id.desc()).all()

    if len(notifications_new) != 0:

        # get the current time for each notification and then save back into notification
        for notification in notifications_new:
            notification.diff_time = datetime.now().replace(microsecond=0) - notification.trigger_time
    else:
        notifications_new = None

    session["page_title"] = "Notifications"

    return render_template('notifications.html',
        authenticated        = ui_utils.authenticated_state(),
        notifications_new    = notifications_new
    )


@route_notifications.route('/notification_clearall')
@login_required
def arm_notification_close():
    """
    function to close all open notifications
    """
    notifications = Notifications.query.filter_by(cleared='0').all()

    if len(notifications) != 0:
        # get the current time for each notification and then save back into notification
        for notification in notifications:
            args = {
                'cleared': True,
                'cleared_time': datetime.now()
            }
            ui_utils.database_updater(args, notification)

        flash(f'Cleared {len(notifications)} Notifications', 'success')
    else:
        flash('No notifications to clear', 'error')

    return redirect("/notifications")

@route_notifications.route('/notificationdismiss')
@login_required
def arm_notification_dismiss():
	"""
	Dismiss a single notification and return JSON.
	"""
	notification_id = request.args.get('id', type=int)
    
	if notification_id is None:
		return jsonify(success=False, error='Invalid notification ID'), 400

	notification = Notifications.query.filter_by(
		id=notification_id,
		cleared='0'
	).first()

	if not notification:
		return jsonify(success=False, error='Notification not found or already dismissed'), 404

	args = {
		'cleared': True,
		'cleared_time': datetime.now()
	}
	ui_utils.database_updater(args, notification)

	return jsonify(success=True, id=notification_id)