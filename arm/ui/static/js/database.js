import { JOB_LIST_CONTAINER, JobStateGroup } from './common.js';
import { job_refresh } from './jobs/state.js';
import { addJobItem } from './jobs/job.js';

let databaseCursor = null;
let databaseLoading = false;
let databaseHasMore = true;

let databaseInfiniteScrollEnabled = false;

export function setDatbaseInfitiniseScrollState(state){
    databaseInfiniteScrollEnabled = state;
}

function _addJobs(data) {
	if (!data.results)
		return;

	const size = Object.keys(data.results).length;

	if (size <= 0)
		return;

	$.each(data.results, function (_index, job) {
		job.job_id = `0_${job.job_id}`;	// force local server

        if (!JobStateGroup.FINISHED.has(job.status))
		    job_refresh?.activeJobs?.push(job);

		$(JOB_LIST_CONTAINER).append(
			addJobItem(job, data.authenticated)
		);
	});
}

export function switchSearch(data) {
    $(JOB_LIST_CONTAINER).html('');

    _addJobs(data);
}

/**
 * Function to get jobs (success/fail buttons) from the arm api
 * @param getJobsHREF link to the json api
 */
export function fetchJobs(href) {
    $.get(href, function (data) {
        if (data.success === true) {
            $(JOB_LIST_CONTAINER).html('');

            _addJobs(data);
        }
    }, 'json');
}

export async function fetchAllJobs(reset = false) {
    if (databaseLoading) return;

    if (reset) {
        databaseCursor = null;
        databaseHasMore = true;
        $(JOB_LIST_CONTAINER).empty();
    }

    if (!databaseHasMore) return;

    databaseLoading = true;
    setDatbaseInfitiniseScrollState(true);
    $('#database-load-status').text('Loading jobs...');

    const params = {};

    if (databaseCursor !== null) {
        params.before = databaseCursor;
    }

    try {
        const data = await $.getJSON('/database/jobs', params);

        if (!data.success) {
            databaseHasMore = false;
            $('#database-load-status').text(data.error || 'Failed to load jobs.');
            return;
        }

        _addJobs(data);

        databaseCursor = data.next_cursor;
        databaseHasMore = data.has_more;

        if (!Object.keys(data.results ?? {}).length) {
            $('#database-load-status').text('No jobs found.');
        } else if (!databaseHasMore) {
            $('#database-load-status').text('All jobs loaded.');
        } else {
            $('#database-load-status').text('');
        }
    } catch (error) {
        databaseHasMore = false;
        $('#database-load-status').text('Failed to load jobs.');
        console.error(error);
    } finally {
        databaseLoading = false;

        if (databaseInfiniteScrollEnabled && databaseHasMore) {
            checkDatabaseScroll();
        }
    }
}

export function checkDatabaseScroll() {
	const container = $('.base_content')[0];

	if (!container || !databaseInfiniteScrollEnabled || databaseLoading || !databaseHasMore)
		return;

    const maxDistanceFromBottom = 400;
	const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

	if (distanceFromBottom <= maxDistanceFromBottom) {
		fetchAllJobs();
	}
}