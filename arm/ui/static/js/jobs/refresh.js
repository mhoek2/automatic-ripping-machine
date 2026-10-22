const job_refresh = {
	activeJobs: []
};

/**
 * Function to check for active jobs from the return from api
 * *** This doesn't work as it should when arm has child links
 * @param data returned data from ajax
 * @param serverIndex current server index count (added to the front of job id's)
 */
function checkActiveJobs(data, serverIndex) {
	const results = Object.values(data.results || {});

	job_refresh.activeJobs.forEach(function (activeJob) {
		const matchingJob = results.find(function (job) {
			return String(activeJob.job_id) ===
				`${serverIndex}_${job.job_id}`;
		});

		activeJob.active = matchingJob
			? !JobStateGroup.FINISHED.has(matchingJob.status) // only mark unfinshed jobs active
			: false;
	});
}

/**
 * Function that is run when data is received back from json api
 * @param data all data returned from the ajax request
 * @param serverIndex
 * @param serverUrl the url of the server the job is running on
 * @param serverCount
 * @returns {*}
 */
function refreshJobsSuccess(data, serverIndex, serverUrl, serverCount) {
    checkActiveJobs(data, serverIndex);

    $.each(data.results, function (_index, job) {
        job.job_id      = `${serverIndex}_${job.job_id}`;
        job.ripper      = (data.arm_name ? data.arm_name : "");
        job.server_url  = serverUrl;
        job.active      = !JobStateGroup.FINISHED.has(job.status);

        const job_index = job_refresh.activeJobs.findIndex( e => e.job_id === job.job_id );

        // exists
        if (job_index !== -1) {
            job_refresh.activeJobs[job_index] = job;
            updateJobItem(job, data.authenticated);
        } 

        // add to list
        else {
            job_refresh.activeJobs.push(job);

            // only add unfinished jobs
            if (!JobStateGroup.FINISHED.has(job.status)) {
                $(JOB_LIST_CONTAINER).append(
                    addJobItem(job, data.authenticated)
                );
            }
        }

        serverCount--;
    });

    return serverCount;
}

function removeInactiveJobs(update_only = false) {
	$.each(job_refresh.activeJobs, function (index, job) {
		if (job && !job.active) {
            if (!update_only)
                setTimeout(() => removeJobItem(job), 200);

			job_refresh.activeJobs.splice(index, 1);
		}
	});
}

function sortJobs(update_only = false) {
    if (update_only)
        return;

	$(`${JOB_LIST_CONTAINER} .job-card`).sort(function (a, b) {
		return a.id.localeCompare(b.id);
	}).appendTo(JOB_LIST_CONTAINER);
}

function createPlaceholderJob() {
    return {
        job_id: "placeholder",
        status: "waiting",
        active: true,
        manual_mode: "False",
        start_time: Date.now(),
        job_length: "Ongoing",
        title: "Waiting for job...",
        year: "",
        video_type: "",
        devpath: "",
        imdb_id: "",
        config: {
            RIPMETHOD: "",
            MAINFEATURE: "",
            MINLENGTH: "",
            MAXLENGTH: ""
        },
        tracks: []
    };
}
job_placeholder = null
function addJobPlaceholder( update_only ) {
    if (update_only) 
        return;

    numActiveJobs = 0;

    $.each(job_refresh.activeJobs, function (index, job) {
        if (job && job.active)
            numActiveJobs++;
    });

    if (numActiveJobs <= 0) {
        if (!job_placeholder || !job_placeholder.length) {
            authenticated = false;

            $("#joblist").append(
                renderJob(createPlaceholderJob(), authenticated, true)
            );

            job_placeholder = $("#joblist .job-card[data-placeholder]");
        }
    } else if (job_placeholder && job_placeholder.length) {
        job_placeholder.remove();
        job_placeholder = null;
    }
}

/**
 * Function set as an interval to update all jobs from api
 */
function refreshJobs( update_only = false ) {
    let i = activeServers.length;

    $.each(activeServers, function (serverIndex, serverUrl) {
        $.getJSON(serverUrl + "/json?mode=joblist")
            .done(function (data) {
                i = refreshJobsSuccess(data, serverIndex, serverUrl, i);
            })
            .fail(function () {
                --i;
            })
            .always(function () {
                // Update job pipeline modal.
                $(document).trigger(
                    `arm:modal-update_${ARM.modal.jobs.pipeline.modal}`,
                    {}
                );

                // Update job details modal.
                $(document).trigger(
                    `arm:modal-update_${ARM.modal.jobs.details.modal}`,
                    {}
                );

                // Sort jobs after updates are processed
                sortJobs(update_only);
                removeInactiveJobs(update_only);
                addJobPlaceholder(update_only);
            });
    });
}