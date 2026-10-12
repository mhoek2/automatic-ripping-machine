function startLogViewer(mode, logfile, interval = 3000, element_id = "#log_file_content") {
    const log_element = $(element_id);

    if (!log_element.length)
        return;

    const element = log_element[0];
    const threshold = 5;

    let lastText = "";
    let initialized = false;
    let loading = false;
    let followBottom = true;

    function updateFollowBottom() {
        followBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
    }

    element.addEventListener("scroll", updateFollowBottom);

    function scrollToBottom() {
        if (followBottom)
            element.scrollTop = element.scrollHeight;
    }

    function fetchLog() {
        if (loading)
            return;

        loading = true;

        $.get("/logreader", {
            logfile: logfile,
            mode: mode
        })
        .done(function (data) {
            const text = data.content;
            let update = false;

            if (!initialized) {
                log_element.text(text);
                lastText = text;
                initialized = true;
                update = text.length > 0;
            } else if (text.startsWith(lastText) && text.length > lastText.length) {
                log_element.append(document.createTextNode(
                    text.substring(lastText.length)
                ));
                lastText = text;
                update = true;
            } else if (text !== lastText) {
                log_element.text(text);
                lastText = text;
                update = true;
            }

            if (update)
                scrollToBottom();
        })
        .fail(function (xhr, status, error) {
            console.error("Failed to refresh logfile:", status, error);
        })
        .always(function () {
            loading = false;
        });
    }

    fetchLog();

    const timer = window.setInterval(fetchLog, interval);

    // Return a cleanup function to stop polling and remove the listener.
    return function stopLogViewer() {
        window.clearInterval(timer);
        element.removeEventListener("scroll", updateFollowBottom);
    };
}