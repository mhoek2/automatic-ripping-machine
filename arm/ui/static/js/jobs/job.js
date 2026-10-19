function getJobIds(job) {
	const id = String(job.job_id);
	const [serverId, jobId] = id.split("_");

	return {
		serverId: jobId === undefined ? "0" : serverId,
		jobId: jobId ?? id,
		local: jobId === undefined || serverId === "0"
	};
}

function getActiveJob(job_id) {
    return job_refresh.activeJobs.find(
        job => String(job.job_id) === String(job_id)
    ) ?? null;
}

function getJobTitle(job) {
    return `${job.title_manual !== "None" ? job.title_manual : job.title} (${job.year})`;
}

function getRipperName(job, ids) {
    return job.ripper || (ids.local ? "Local" : "");
}

function posterCheck(job) {
    const image = job.poster_url !== "None" && job.poster_url !== "N/A"
        ? job.poster_url
        : `/static/img/${job.video_type === "Music" ? "music.png" : "none.png"}`;
    return `<img class="job-poster" src="${image}" alt="${getJobTitle(job)}">`;
}

function getStatusClass(status) {
    return `status-${status.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`;
}

function renderTracks(job, root) {
    const modal = $(root);
    const tracks = job.tracks || [];
    const container = modal.find('#tracks .tracks-list').empty();
    const actions = modal.find('#tracks .tracks-actions').empty();
    
    const manual_edit = (__is_authenticated_simple() && job.manual_edit);

    if (!tracks.length) {
        container.append($('<p>').addClass('tracks-empty').text('No tracks found.'));
        return;
    }

    $.each(tracks, function (_, track) {
        const title = track.filename || `Track ${track.track_number}`;
        const row = $('<div>').addClass('track-row');
        const info = $('<div>').addClass('track-info');
        const heading = $('<div>').addClass('track-heading');
        const tags = $('<div>').addClass('track-tags');

        heading.append($('<span>').addClass('track-number').text(String(track.track_number).padStart(2, '0')));
        heading.append($('<strong>').addClass('track-title').text(title));

        const addTag = (label, value, className = '') => {
            if (value == null || value === '') return;
            tags.append($('<span>').addClass(`track-tag ${className}`).text(label ? `${label}: ${value}` : value));
        };

        console.log(track);
        addTag('', formatTrackLength(track.length, job.video_type), 'track-tag-duration');
        addTag('', track.fps ? `${track.fps} FPS` : null);
        addTag('', track.aspect_ratio);
        if (track.main_feature) addTag('', 'Main feature', 'track-tag-feature');

        info.append(heading, tags);

        // rip status
        const rip_status = $('<span>')
            .addClass(`track-tag track-tag-rip-status ${track.ripped ? 'is-ripped' : 'is-pending'}`)
            .append($('<i>').addClass(`fa-solid ${track.ripped ? 'fa-check' : 'fa-circle-dot'}`).attr('aria-hidden', 'true'))
            .append(document.createTextNode(track.ripped ? 'Ripped' : 'Not ripped'));
        info.find('.track-tags').append(rip_status);

        // track status
        const track_status = track.status || TrackState.TRACK_WAITING;
        const status_label = $('<span>')
            .addClass(`track-status track-tag-status-${track_status.replace(/[^a-z0-9-]/gi, '').toLowerCase()}`)
            .text(track_status);
        row.append(info, status_label);

        // skip
        if (!manual_edit && !track.process)
            row.addClass("skip-track");

        if (manual_edit) {
            const checkbox = $('<input>', {
                type: 'checkbox',
                class: 'track-checkbox',
                checked: Boolean(track.process),
                'aria-label': `Process ${title}`
            }).on('change', function () {
                const input = this;
                const local_job_id = getJobIds(job).jobId;

                $.ajax({
                    url: '/jobdetail_track',
                    method: 'POST',
                    contentType: 'application/json',
                    headers: {
                        'X-CSRFToken': $('meta[name="csrf-token"]').attr('content')
                    },
                    data: JSON.stringify({
                        job_id: local_job_id,
                        track_id: track.track_id,
                        process: input.checked
                    })
                }).fail(() => {
                    input.checked = !input.checked;
                });
            });

            const label = $('<label>')
                .addClass('arm-checkbox track-select')
                .append(checkbox, $('<span>'));

            row.prepend(label);
        }

        container.append(row);
    });

    if (manual_edit) {
        $('<button>', {
            type: 'button',
            class: 'arm-button arm-button-primary track-start',
            html: '<i class="fa-solid fa-play" aria-hidden="true"></i> Start ripping'
        }).on('click', function () {
            const local_job_id = getJobIds(job).jobId;

            $.ajax({
                url: '/jobdetail_ready',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    'X-CSRFToken': $('meta[name="csrf-token"]').attr('content')
                },
                data: JSON.stringify({
                    job_id: local_job_id,
                })
            }).fail(() => {
                alert();
            });
        }).appendTo(actions);
    }
}

function renderJobPipeline(job) {
    const status        = job.status;
    const finished      = JobStateGroup.FINISHED.has(status);
    const failed        = status === JobState.FAILURE;
    const successful    = status === JobState.SUCCESS;

    const skipTranscode = [true, "true"].includes(String(job.config?.SKIP_TRANSCODE).toLowerCase());

    const currentIndex = finished
        ? JOB_PIPELINE_STAGES.length - 1
        : JOB_PIPELINE_STAGES.findIndex(stage => stage.status === status);

    const steps = JOB_PIPELINE_STAGES.map((stage, index) => {
        const step_disabled = skipTranscode && ["waiting_transcode", "transcoding"].includes(stage.status);

        let state = "pipeline-pending";
        let icon = stage.icon;

        if (step_disabled) {
            state = "step-disabled";
        } else if (finished && successful && index <= currentIndex) {
            state = "pipeline-done";
            icon = "fa-check";
        } else if (finished && failed && index === currentIndex) {
            state = "pipeline-failed";
            icon = "fa-xmark";
        } else if (!finished && currentIndex !== -1 && index < currentIndex) {
            state = "pipeline-done";
            icon = "fa-check";
        } else if (!finished && index === currentIndex) {
            state = "pipeline-current";
        }

        return `
            <div class="job-pipeline-step ${state}">
                <span class="job-pipeline-icon">
                    <i class="fa-solid ${icon}" aria-hidden="true"></i>
                </span>
                <span class="job-pipeline-label">${stage.label}</span>
            </div>`;
    }).join("");

    return `
        <div class="job-status-pipeline" data-status="${status}" aria-label="Job status pipeline">
            ${steps}
        </div>
    `;
}

function renderProgress(job) {
    if (!hasProgress(job)) return "";

    return `
        <div class="job-progress" data-job-status="${job.status}">
            <div class="job-progress-header">
                <span id="jobId${job.job_id}_stage">${job.stage}</span>
                <span id="jobId${job.job_id}_percent">${job.progress}%</span>
            </div>
            <div class="progress-track">
                <div id="jobId${job.job_id}_progress_bar" class="progress-value" style="width:${job.progress_round}%"></div>
            </div>
            <div class="job-progress-meta">
                <span id="jobId${job.job_id}_eta">ETA ${job.eta || "Unknown"}</span>
                ${job.status === "transcoding" ? `
                    <span id="jobId${job.job_id}_cur_fps">${job.cur_fps || 0} FPS</span>
                    <span id="jobId${job.job_id}_avg_fps">AVG ${job.avg_fps || 0} FPS</span>
                ` : ""}
            </div>
        </div>`;
}

function renderJobMeta(job, ids) {
    return `
        <div class="job-meta">
            <div class="job-meta-item">
                <span class="job-meta-label">Ripping Mode</span>
                <span data-field="mode" class="job-mode-badge ${job.manual_mode === "True" ? "job-mode-manual" : "job-mode-auto"}">
                    ${job.manual_mode === "True" ? "Manual" : "Auto"}
                </span>
            </div>
            <div class="job-meta-item"><span class="job-meta-label">Type</span><span data-field="video_type">${job.video_type}</span></div>
            <div class="job-meta-item"><span class="job-meta-label">Year</span><span data-field="year">${job.year}</span></div>
            <div class="job-meta-item"><span class="job-meta-label">Device</span><span data-field="devpath">${job.devpath}</span></div>
            <div class="job-meta-item"><span class="job-meta-label">Ripper</span><span data-field="ripper">${getRipperName(job, ids)}</span></div>
            <div class="job-meta-item"><span class="job-meta-label">Method</span><span data-field="ripmethod">${job.config.RIPMETHOD}</span></div>
            <div class="job-meta-item"><span class="job-meta-label">Feature</span><span data-field="mainfeature">${job.config.MAINFEATURE}</span></div>
            <div class="job-meta-item"><span class="job-meta-label">Length</span><span data-field="length">${job.config.MINLENGTH} – ${job.config.MAXLENGTH}</span></div>
        </div>`;
}

function renderJobActions(job, ids, authenticated) {
	if (!authenticated) return "";

	const hidden = !ids.local ? " hidden" : "";

    let actions= "";

    // job has finished, failed or succesfull
    if (JobStateGroup.FINISHED.has(job.status)) {
        actions += `
            <button class="icon-button danger" type="button"
                data-modal="confirm"
                data-type="delete"
                data-jobid="${job.job_id}"
                data-href="json?job=${ids.jobId}&mode=delete"
                data-tooltip="Delete Job">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
    }

    // job is running
    else {
        actions += `
            <div class="job-actions${hidden}">
                <button class="icon-button danger" type="button"
                    data-modal="confirm"
                    data-type="abandon"
                    data-jobid="${job.job_id}"
                    data-href="json?job=${ids.jobId}&mode=abandon"
                    data-tooltip="Abandon Job">
                    <i class="fa-solid fa-ban"></i>
                </button>
        `;
    }

    // view log
    actions += `
			<a class="icon-button"
                target="_blank",
				href="logs?logfile=${job.logfile}&mode=tail"
				data-tooltip="View Log">
				<i class="fa-solid fa-file-lines"></i>
			</a>
    `;

    // title actions
	if (!JobStateGroup.POSTPROCESSING.has(job.status) && !JobStateGroup.FINISHED.has(job.status) && job.video_type !== "Music") {
		actions += `
			<a class="icon-button"
				href="titlesearch?job_id=${ids.jobId}"
				data-tooltip="Title Search">
				<i class="fa-solid fa-magnifying-glass"></i>
			</a>

			<a class="icon-button"
				href="customTitle?job_id=${ids.jobId}"
				data-tooltip="Custom Title">
				<i class="fa-solid fa-pen"></i>
			</a>`;
	}

    // settings and misc
	actions += `
			<details class="job-actions-menu">
				<summary class="icon-button"
					aria-label="More actions"
					title="More actions">
					<i class="fa-solid fa-ellipsis"></i>
				</summary>

				<div class="job-actions-menu-content">
					<a href="changeparams?config_id=${ids.jobId}">
						<i class="fa-solid fa-sliders"></i>
						<span>Edit Settings</span>
					</a>

					<button type="button"
						data-modal="confirm"
						data-type="fixperms"
						data-jobid="${job.job_id}"
						data-href="json?mode=fixperms&job=${ids.jobId}">
						<i class="fa-solid fa-wrench"></i>
						<span>Fix Permissions</span>
					</button>
				</div>
			</details>
		</div>`;

	return actions;
}

function renderJob(job, authenticated) {
    const ids = getJobIds(job);
    const statusClass = getStatusClass(job.status);

    const detailUrl = ids.local
        ? `/jobdetail?job_id=${ids.jobId}`
        : `${job.server_url}/jobdetail?job_id=${ids.jobId}`;

    const dateInfo = formatTimestamp(job.start_time);

    return `
        <article class="job-card" id="jobId${job.job_id}">
            <a href="#" class="job-poster-link" data-modal="jobs_details" data-jobid="${job.job_id}">
                ${posterCheck(job)}
            </a>

            <div class="job-content">
                <header class="job-header">
                    <div>
                        <h2 id="jobId${job.job_id}_title" data-modal="jobs_details" data-jobid="${job.job_id}">${getJobTitle(job)}</h2>
                        <span class="job-id">${job.job_id}</span>
                    </div>

                    <span class="job-status ${statusClass}" id="jobId${job.job_id}_status" data-modal='jobs_pipeline' data-jobid="${job.job_id}">
                        <span class="status-dot"></span>
                        <span class="status-text">${job.status}</span>
                    </span>
                </header>

                ${renderJobMeta(job, ids)}

                <div id="jobId${job.job_id}_progress_section">${renderProgress(job)}</div>

                <div class="job-footer">
                    <div class="job-time">
                        <span title="${dateInfo.title}"><i class="fa-regular fa-clock"></i> ${dateInfo.relative}</span>
                        <span><i class="fa-solid fa-stopwatch"></i> ${job.job_length || "Ongoing"}</span>
                    </div>
                    ${renderJobActions(job, ids, authenticated)}
                </div>
            </div>
        </article>`;
}

function addJobItem(job, authenticated) {
    return renderJob(job, authenticated);
}