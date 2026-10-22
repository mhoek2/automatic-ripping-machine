function formatDateTitle(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    return `${date.toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })} at ${date.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })}`;
}

function formatTimeToMilisecconds(timestamp) {
    if (typeof timestamp === "number") return timestamp;
    if (typeof timestamp !== "string") return NaN;

    const date = new Date(
        timestamp.replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1")
    );

    return date.getTime();
}

function formatRelativeTime(timestamp) {
    const seconds = Math.round((Number(timestamp) - Date.now()) / 1000);
    const absSeconds = Math.abs(seconds);

    let value;
    let unit;

    if (absSeconds < 60) {
        value = seconds;
        unit = "second";
    } else if (absSeconds < 3600) {
        value = Math.round(seconds / 60);
        unit = "minute";
    } else if (absSeconds < 86400) {
        value = Math.round(seconds / 3600);
        unit = "hour";
    } else if (absSeconds < 2592000) {
        value = Math.round(seconds / 86400);
        unit = "day";
    } else if (absSeconds < 31536000) {
        value = Math.round(seconds / 2592000);
        unit = "month";
    } else {
        value = Math.round(seconds / 31536000);
        unit = "year";
    }

    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(value, unit);
}

function formatTimestamp(timestamp) {
    const milliseconds = formatTimeToMilisecconds(timestamp);
    if (Number.isNaN(milliseconds)) return { relative: "", title: "" };

    return {
        relative    : formatRelativeTime(milliseconds),
        title       : formatDateTitle(milliseconds)
    };
}

function formatCountdown(milliseconds) {
    const remaining = Math.max(0, Math.ceil((milliseconds - Date.now()) / 1000));
    const hours     = Math.floor(remaining / 3600);
    const minutes   = Math.floor((remaining % 3600) / 60);
    const seconds   = remaining % 60;

    return {
        relative    : formatRelativeTime(milliseconds),
        title       : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
        expired     : milliseconds <= Date.now()
    };
}
