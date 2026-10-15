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
	{ status: "success", label: "Finished", icon: "fa-flag-checkered" }
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

function formatTrackLength(length, videoType) {
	if (length == null || length === '')
		return 'Unknown duration';

	let seconds = Number(length);

	if (!Number.isFinite(seconds))
		return 'Unknown duration';

	if (videoType === 'Music')
		seconds = Math.round(seconds / 1000);

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remaining = Math.floor(seconds % 60);

	return hours
		? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
		: `${minutes}:${String(remaining).padStart(2, '0')}`;
}