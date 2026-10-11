function addNotification(title, body, notificationId) {
	const timeout = Number.parseInt(getNotifyTimeout(), 10);
	const delay = Number.isFinite(timeout) ? Math.max(0, timeout) : 15000;

    const notification = $(`
        <div class="notification" role="status">
            <div class="notification-header">
                <span class="notification-icon">
                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                </span>
                <strong class="notification-title"></strong>
                <small class="notification-time">just now</small>
            </div>
            <button type="button" class="notification-close"
                aria-label="Dismiss notification">&times;</button>
            <div class="notification-body"></div>
        </div>
    `);

    notification.attr("id", `notification${notificationId}`);
    notification.find(".notification-title").text(title);
    notification.find(".notification-body").text(body);

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

        addNotification(note.title, note.message, note.id);
    });
}

function getNotifications() {
    let i = activeServers.length;

    $.each(activeServers, function (serverIndex, serverUrl) {
        $.ajax({
            url: serverUrl + "/get_notications",
            type: "get",
            timeout: 2000,
            error: function () {
                --i;
            },
            success: function (data) {
                // I doubt thsi is correct atm..
                console.log(`servercount before: ${i}`);
                i -= Array.isArray(data.results) ? data.results.length : 0;
                console.log(`servercount after: ${i}`);
            },
            complete: function (data) {
                if (typeof data !== 'undefined' && data.responseJSON)
                    parseNotifications(data.responseJSON);
            }
        });
    });
}