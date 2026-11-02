// Rework this
export const activeServers = [];

export const JOB_LIST_CONTAINER = '#joblist';

// arm/models/track.py
export const TrackState = Object.freeze({
    TRACK_SUCCESS	: 'success',
    TRACK_FAILURE	: 'fail',
    TRACK_WAITING	: 'waiting',
    TRACK_RIPPING	: 'ripping',
    TRACK_RIPPED 	: 'ripped',
    TRACK_SKIPPED	: 'skipped'
})

// arm/models/job.py
export const JobState = Object.freeze({
	// Job Finished States
	SUCCESS					: 'success',
	FAILURE					: 'fail',

	// Manual wait
	MANUAL_WAIT_STARTED		: 'waiting',

	// Job Initialized or Pending
	IDLE					: 'active',

	// Video Ripping States
	VIDEO_RIPPING			: 'ripping',
	VIDEO_WAITING			: 'waiting',
	VIDEO_INFO				: 'info',

	// Audio Ripping States
	AUDIO_RIPPING			: 'ripping',

	// Transcoding States
	TRANSCODE_ACTIVE		: 'transcoding',
	TRANSCODE_WAITING		: 'waiting_transcode',

	// Postprocessing states
	POSTPROCESSING_MOVING	: 'moving'
});

export const JobStateGroup = Object.freeze({
    FINISHED: new Set([
        JobState.SUCCESS,
        JobState.FAILURE,
    ]),

    RIPPING: new Set([
        JobState.AUDIO_RIPPING,
        JobState.VIDEO_RIPPING,
        JobState.MANUAL_WAIT_STARTED,
        JobState.VIDEO_WAITING,
        JobState.VIDEO_INFO,
    ]),

    TRANSCODING: new Set([
        JobState.TRANSCODE_ACTIVE,
        JobState.TRANSCODE_WAITING,
    ]),

    POSTPROCESSING: new Set([
        JobState.POSTPROCESSING_MOVING,
    ]),
});

export const JOB_PIPELINE_STAGES = [
	{ status: 'active',             label: 'Active',                icon: 'fa-circle-play'      },
	{ status: 'waiting',            label: 'Waiting',               icon: 'fa-clock'            },
	{ status: 'info',               label: 'Disc Info',             icon: 'fa-compact-disc'     },
	{ status: 'ripping',            label: 'Ripping',               icon: 'fa-download'         },
	{ status: 'waiting_transcode',  label: 'Waiting to transcode',  icon: 'fa-hourglass-half'   },
	{ status: 'transcoding',        label: 'Transcoding',           icon: 'fa-film'             },
	{ status: 'moving',             label: 'Moving',                icon: 'fa-upload'           },
	{ status: 'success',            label: 'Finished',              icon: 'fa-flag-checkered'   }
];

/**
 * Function to collect all child servers from arm.yaml config into links on the homepage
 */
export function collectChildServers() {
    activeServers.push(location.origin);

    // riiiiight ..
    const childs = $('#children');
    const children = childs.text().trim();
    if (children) {
        const childLinks = [];
        const childrenArr = children.split(',');
        $.each(childrenArr, function (_index, value) {
            activeServers.push(value);
            childLinks.push(`<a target="_blank" href="${value}">${value}</a>`);
        });
        childs.html(`Children: <br />${childLinks.join('<br />')}`);
    }
}

export function safe_bool(state)
{
    if (typeof state === 'undefined')
        return false

    if (typeof state === 'string')
        return state.trim().toLowerCase() === 'true';

    if (typeof state === 'boolean')
        return state;

    return false;
}

export function activeTab(tab) {
    $('.sidebar [id^="nav"]').removeClass('active');
    $('.sidebar #nav' + tab).addClass('active');
}