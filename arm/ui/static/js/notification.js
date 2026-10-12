function addNotification(title, body, notificationId, timestamp = null) {
	const timeout = Number.parseInt(getNotifyTimeout(), 10);
	const delay = Number.isFinite(timeout) ? Math.max(0, timeout) : 15000;

    const notification = $(`
        <div class="notification" role="status">
            <div class="notification-header">
                <span class="notification-icon">
                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                </span>
                <strong class="notification-title"></strong>
                <small class="notification-time">-</small>
            </div>
            <button type="button" class="notification-close"
                aria-label="Dismiss notification">&times;</button>
            <div class="notification-body"></div>
        </div>
    `);

    notification.attr("id", `notification${notificationId}`);
    notification.find(".notification-title").text(title);
    notification.find(".notification-body").text(body);

    if (!timestamp) {
        notification.find(".notification-time").text(
            "just now"
        );
    }
    else{
        const milliseconds = formatTimeToMilisecconds( timestamp )
        notification.find(".notification-time").text(
            formatRelativeTime(milliseconds)
        );
    }


    $("#notification_container").append(notification);

	let dismissed = false;
	let timer;

	function dismiss() {
		if (dismissed) return;
		dismissed = true;
		clearTimeout(timer);

		notification.addClass("notification-hiding");
		notification.one("transitionend", function() {
			notification.remove();
		});

		// Fallback for reduced motion or missing transition events.
		setTimeout(() => notification.remove(), 250);

		pingReadNotify(notificationId);
	}

	notification.find(".notification-close").on("click", dismiss);

	if (delay > 0) {
		timer = setTimeout(dismiss, delay);
	}
}

function pingReadNotify(notificationId) {
    // this does not check child server ..
    $.ajax({
        url: "/json?mode=read_notification&notify_id=" + notificationId,
        type: "get",
        timeout: 2000,
        success: function (data) {
            console.log(data)
        }
    });
}

// Get the notifaction timeout settings from UI Settings via JSON
function getNotifyTimeout() {
    // this does not check child server ..
    let notify = 6500;

    $.ajax({
        url: "/json?mode=notify_timeout",
        type: "get",
        timeout: 2000,
        success: function (data) {
            console.log("UI timeout: " + data.notify_timeout);
            notify = data.notify_timeout;
        }
    });

    return notify;
}

function parseNotifications(data) {
    $.each(data.notes, function (notifyIndex, note) {
        if ($(`#notification${note.id}`).length)    // exists
            return null

        addNotification(note.title, note.message, note.id, note.trigger_time);
    });
}

function getNotifications() {
    $.each(activeServers, function (serverIndex, serverUrl) {
        $.getJSON(serverUrl + "/get_notications")
            .done(function (data) {
                parseNotifications(data);
            });
    });
}