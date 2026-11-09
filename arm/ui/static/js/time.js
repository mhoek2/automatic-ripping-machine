export const MILLISECONDS_PER_SECOND   = 1000;
export const SECONDS_PER_MINUTE        = 60;
export const MINUTES_PER_HOUR          = 60;
export const HOURS_PER_DAY             = 24;
export const DAYS_PER_MONTH            = 30;
export const DAYS_PER_YEAR             = 365; 

export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
export const SECONDS_PER_MONTH = SECONDS_PER_DAY * DAYS_PER_MONTH;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * DAYS_PER_YEAR;

export function formatDateTitle(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime()))
        return '';

    return `${date.toLocaleDateString('en-GB', {
        weekday : 'long',
        day     : '2-digit',
        month   : 'long',
        year    : 'numeric'
    })} at ${date.toLocaleTimeString('en-GB', {
        hour    : '2-digit',
        minute  : '2-digit',
        second  : '2-digit',
        hour12  : false
    })}`;
}

export function formatTimeToMilisecconds(timestamp) {
    if (typeof timestamp === 'number')
        return timestamp;

    if (typeof timestamp !== 'string')
        return NaN;

    const date = new Date(
        timestamp.replace(' ', 'T').replace(/(\.\d{3})\d+$/, '$1')
    );

    return date.getTime();
}

export function formatRelativeTime(timestamp) {
    const seconds = Math.round((Number(timestamp) - Date.now()) / MILLISECONDS_PER_SECOND);
    const absSeconds = Math.abs(seconds);

    let value;
    let unit;

    if (absSeconds < SECONDS_PER_MINUTE) {
        value = seconds;
        unit = 'second';
    } else if (absSeconds < SECONDS_PER_HOUR) {
        value = Math.round(seconds / SECONDS_PER_MINUTE);
        unit = 'minute';
    } else if (absSeconds < SECONDS_PER_DAY) {
        value = Math.round(seconds / SECONDS_PER_HOUR);
        unit = 'hour';
    } else if (absSeconds < SECONDS_PER_MONTH) {
        value = Math.round(seconds / SECONDS_PER_DAY);
        unit = 'day';
    } else if (absSeconds < SECONDS_PER_YEAR) {
        value = Math.round(seconds / SECONDS_PER_MONTH);
        unit = 'month';
    } else {
        value = Math.round(seconds / SECONDS_PER_YEAR);
        unit = 'year';
    }

    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(value, unit);
}

export function formatTimestamp(timestamp) {
    const milliseconds = formatTimeToMilisecconds(timestamp);
    if (Number.isNaN(milliseconds)) return { relative: '', title: '' };

    return {
        relative    : formatRelativeTime(milliseconds),
        title       : formatDateTitle(milliseconds)
    };
}

export function formatCountdown(milliseconds) {
    const remaining = Math.max(0, Math.ceil((milliseconds - Date.now()) / MILLISECONDS_PER_SECOND));
    const hours     = Math.floor(remaining / SECONDS_PER_HOUR);
    const minutes   = Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const seconds   = remaining % SECONDS_PER_MINUTE;

    return {
        relative    : formatRelativeTime(milliseconds),
        title       : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        expired     : milliseconds <= Date.now()
    };
}

export function getWaitTimeRemaining(job, waitMilliseconds) {
    const milliseconds = formatTimeToMilisecconds(job.stop_time);

    if (Number.isNaN(milliseconds)) {
        return { relative: '', title: '', expired: false };
    }

    return formatCountdown(milliseconds + waitMilliseconds);
}

export function formatTrackLength(length, videoType) {
	if (length === null || length === '')
		return 'Unknown duration';

	let seconds = Number(length);

	if (!Number.isFinite(seconds))
		return 'Unknown duration';

	if (videoType === 'Music')
		seconds = Math.round(seconds / MILLISECONDS_PER_SECOND);

	const hours = Math.floor(seconds / SECONDS_PER_HOUR);
	const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
	const remaining = Math.floor(seconds % SECONDS_PER_MINUTE);

	return hours
		? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
		: `${minutes}:${String(remaining).padStart(2, '0')}`;
}