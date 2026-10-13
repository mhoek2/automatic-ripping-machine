function getJobIds(job) {
	const id = String(job.job_id);
	const [serverId, jobId] = id.split("_");

	return {
		serverId: jobId === undefined ? "0" : serverId,
		jobId: jobId ?? id,
		local: jobId === undefined || serverId === "0"
	};
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
    if (JOB_STATUS_FINISHED.has(job.status)) {
        actions += `
            <button class="icon-button danger" type="button"
                data-modal="confirm"
                data-type="delete"
                data-jobid="${ids.jobId}"
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
                    data-jobid="${ids.jobId}"
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
	if (!JOB_STATUS_POSTPROCESSING.has(job.status) && !JOB_STATUS_FINISHED.has(job.status) && job.video_type !== "Music") {
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
						data-jobid="${ids.jobId}"
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

    const date = new Date(job.start_time);
    const startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const startTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    return `
        <article class="job-card" id="jobId${job.job_id}">
            <a class="job-poster-link" href="${detailUrl}">
                ${posterCheck(job)}
            </a>

            <div class="job-content">
                <header class="job-header">
                    <div>
                        <h2 id="jobId${job.job_id}_title">${getJobTitle(job)}</h2>
                        <span class="job-id">${job.job_id}</span>
                    </div>

                    <span class="job-status ${statusClass}" id="jobId${job.job_id}_status" 
                            data-modal='jobs_pipeline'
                            data-jobid="${job.job_id}">
                        <span class="status-dot"></span>
                        <span class="status-text">${job.status}</span>
                    </span>
                </header>

                ${renderJobMeta(job, ids)}

                <div id="jobId${job.job_id}_progress_section">${renderProgress(job)}</div>

                <div class="job-footer">
                    <div class="job-time">
                        <span><i class="fa-regular fa-calendar"></i> ${startDate}</span>
                        <span><i class="fa-regular fa-clock"></i> ${startTime}</span>
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