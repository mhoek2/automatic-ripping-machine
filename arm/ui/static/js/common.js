/*jshint multistr: true */
/*jshint esversion: 6 */
/*global $:false, jQuery:false */
/* jshint node: true */
/* jshint strict: false */

// Rework this
let activeServers = [];

const MODEL_ID = "#exampleModal";
const MSG_1_ID = "#message1 .alert-heading";
const SEARCH_BOX_ID = "#searchquery";
const MODAL_TITLE = ".modal-title";
const CARD_DECK = "#joblist";
const SUCCESS_CLASS = "alert-success";
const MODAL_FOOTER = ".modal-footer";

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
	TRANSCODE_WAITING: "waiting_transcode"
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