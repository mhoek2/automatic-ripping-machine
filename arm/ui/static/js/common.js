/*jshint multistr: true */
/*jshint esversion: 6 */
/*global $:false, jQuery:false */
/* jshint node: true */
/* jshint strict: false */

// Rework this
let activeServers = [];

const JOB_LIST_CONTAINER = "#joblist";


// arm/models/job.py
const JobState = Object.freeze({
	// Job Finished States
	SUCCESS: "success",
	FAILURE: "fail",

	// Manual wait
	MANUAL_WAIT_STARTED: "waiting",

	// Job Initialized or Pending
	IDLE: "active",

	// Video Ripping States
	VIDEO_RIPPING: "ripping",
	VIDEO_WAITING: "waiting",
	VIDEO_INFO: "info",

	// Audio Ripping States
	AUDIO_RIPPING: "ripping",

	// Transcoding States
	TRANSCODE_ACTIVE: "transcoding",
	TRANSCODE_WAITING: "waiting_transcode",

	// Postprocessing states
	POSTPROCESSING_MOVING: "moving"
});

const JOB_STATUS_FINISHED = new Set([
	JobState.SUCCESS,
	JobState.FAILURE
]);

const JOB_STATUS_RIPPING = new Set([
	JobState.AUDIO_RIPPING,
	JobState.VIDEO_RIPPING,
	JobState.MANUAL_WAIT_STARTED,
	JobState.VIDEO_WAITING,
	JobState.VIDEO_INFO
]);

const JOB_STATUS_TRANSCODING = new Set([
	JobState.TRANSCODE_ACTIVE,
	JobState.TRANSCODE_WAITING
]);

const JOB_STATUS_POSTPROCESSING = new Set([
	JobState.POSTPROCESSING_MOVING,
]);

const JOB_PIPELINE_STAGES = [
	{ status: "active", label: "Active", icon: "fa-circle-play" },
	{ status: "waiting", label: "Waiting", icon: "fa-clock" },
	{ status: "info", label: "Disc Info", icon: "fa-compact-disc" },
	{ status: "ripping", label: "Ripping", icon: "fa-download" },
	{ status: "waiting_transcode", label: "Waiting to transcode", icon: "fa-hourglass-half" },
	{ status: "transcoding", label: "Transcoding", icon: "fa-film" },
	{ status: "moving", label: "Moving", icon: "fa-upload" },
	{ status: "finished", label: "Finished", icon: "fa-flag-checkered" }
];

/**
 * Function to collect all child servers from arm.yaml config into links on the homepage
 */
function collectChildServers() {
    activeServers.push( location.origin );

    // riiiiight ..
    const childs = $("#children");
    const children = childs.text().trim();
    if (children) {
        const childLinks = [];
        const childrenArr = children.split(",");
        $.each(childrenArr, function (_index, value) {
            activeServers.push(value);
            childLinks.push(`<a target="_blank" href="${value}">${value}</a>`);
        });
        childs.html(`Children: <br />${childLinks.join("<br />")}`);
    }
}

function formatTimeToMilisecconds(timestamp){
    return new Date(
        timestamp.replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1")
    ).getTime();
}

function formatRelativeTime(timestamp) {
	const now = Date.now()
    const seconds = Math.round((Number(timestamp) - now) / 1000);
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

    return new Intl.RelativeTimeFormat("en", {
        numeric: "auto"
    }).format(value, unit);
}