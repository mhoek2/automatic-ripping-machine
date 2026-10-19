const job_refresh = {
	activeJobs: []
};

/**
 * Function to update the current progress
 * @param    {Class} job    current job
 */
function updateProgress(job) {
    const section = $(`#jobId${job.job_id}_progress_section`);
    if (!section.length) return;

    if (!hasProgress(job)) {
        section.empty();
        return;
    }

    if (!section.find(".job-progress").length) {
        section.html(renderProgress(job));
        return;
    }

    section.find(`#jobId${job.job_id}_stage`).text(job.stage);
    section.find(`#jobId${job.job_id}_percent`).text(`${job.progress}%`);
    section.find(`#jobId${job.job_id}_progress_bar`).css("width", `${job.progress_round}%`);
    section.find(`#jobId${job.job_id}_eta`).text(`ETA ${job.eta}`);
    section.find(`#jobId${job.job_id}_cur_fps`).text(`${job.cur_fps} FPS`);
    section.find(`#jobId${job.job_id}_avg_fps`).text(`AVG ${job.avg_fps} FPS`);
}

/**
 * Checks if current job needs a stage/progress bar added
 * This is enabled for music discs to enable current ripping track in job.stage
 * @param job current job object
 * @returns {boolean} True if job is transcoding or disc is an audio disc
 */
function hasProgress(job) {
    let status = false;
    // HandBrake has the disc/files and should be outputting stage and eta
    if (job.status === "transcoding") {
        status = true;
    }
    // MakeMKV has the disc and should be outputting stage and eta
    if (job.status === "ripping" && job.stage) {
        status = true;
    }
    // abcde is ripping the audio disc and is outputting stage and eta
    if (job.disctype === "music" && job.stage) {
        status = true;
    }

    return status;
}

/**
 * Function to check and update the job values
 * @param {jQuery} item    Dom item to update
 * @param {Class} _job    Current job
 * @param {String} keyString    String that pairs with config item for display purposes
 * @param itemContents    item of job class to update
 */
function updateContents(item, _job, keyString, itemContents) {
    if (item[0] === undefined) {
        console.log(item)
        return false;
    }
    if (item[0].innerText.includes(itemContents)) {
        //console.log("nothing to do - values are current")
    } else {
        item[0].innerHTML = `<b> ${keyString}: </b>${itemContents}`;
        console.log(`${item[0].innerText} - <b>${keyString}: </b>${itemContents}`)
        console.log(item[0].innerText.includes(itemContents))
    }
    return true;
}

/**
 * Function that goes through the whole job card and updates outdated values
 * @param {Class} oldJob    Old job used to compare against fresh job from api
 * @param {Class} job     Fresh job pulled from api
 */
function updateJobItem(job) {
    const card = $(`#jobId${job.job_id}`);
    if (!card.length) return;

    const title = card.find("[data-field='title'], #jobId" + job.job_id + "_title");
    const poster = card.find(".job-poster");
    const status = card.find(`#jobId${job.job_id}_status`);

    const jobTitle = getJobTitle(job);
    if (title.length && title.text() !== jobTitle) {
        title.text(jobTitle);
    }

    if (poster.length && job.poster_url !== "None" && job.poster_url !== "N/A" && poster.attr("src") !== job.poster_url) {
        poster.attr("src", job.poster_url);
    }

    if (status.length) {
        status.attr("class", `job-status ${getStatusClass(job.status)}`);
        status.find(".status-text").text(job.status);
    }
/*
    if (status.length) {
        const newClass = `job-status ${getStatusClass(job.status)}`;
        status.attr("class", newClass);
        status.find(".status-dot").after(document.createTextNode(` ${job.status}`));
        status.contents().filter(function () { return this.nodeType === 3; }).remove();
        status.append(` ${job.status}`);
    }
*/
    card.find("[data-field='year']").text(job.year);
    card.find("[data-field='video_type']").text(job.video_type);
    card.find("[data-field='devpath']").text(job.devpath);
    card.find("[data-field='ripper']").text(getRipperName(job, getJobIds(job)));
    card.find("[data-field='ripmethod']").text(job.config.RIPMETHOD);
    card.find("[data-field='mainfeature']").text(job.config.MAINFEATURE);
    card.find("[data-field='length']").text(`${job.config.MINLENGTH} – ${job.config.MAXLENGTH}`);

    updateProgress(job);
}

/**
 * Removes a job from the card deck
 * @param {Class} job
 */
function removeJobItem(job) {
    $("#jobId" + job.job_id).remove();
}

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
            updateJobItem(job);
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
            });
    });
}