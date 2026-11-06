import { TrackState, JobState, JobStateGroup, JOB_PIPELINE_STAGES, safe_bool } from '../common.js';
import { formatTimestamp, getWaitTimeRemaining, formatTrackLength, SECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND } from '../time.js';
import { job_refresh } from './state.js';

export function getJobIds(job) {
	const id                = String(job.job_id);
	const [serverId, jobId] = id.split('_');

	return {
		serverId    : jobId === undefined ? '0' : serverId,
		jobId       : jobId ?? id,
		local       : jobId === undefined || serverId === '0'
	};
}

export function getManualTrackSelectTimeRemaining(job) {
    return getWaitTimeRemaining(job, 30 * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND);
}

export function getManualMetaWaitTimeRemaining(job) {
    return getWaitTimeRemaining(job, parseInt(job.config.MANUAL_WAIT_TIME ?? SECONDS_PER_MINUTE) * MILLISECONDS_PER_SECOND);
}

export function getActiveJob(job_id) {
    return job_refresh.activeJobs.find(
        job => String(job.job_id) === String(job_id)
    ) ?? null;
}

export function getJobTitle(job) {
    return `${job.title_manual !== 'None' ? job.title_manual : job.title} (${job.year})`;
}

export function getRipperName(job, ids) {
    return job.ripper || (ids.local ? 'Local' : '');
}

export function posterCheck(job) {
    if (typeof job.poster_url === 'undefined')
        return '';

    const image = job.poster_url !== 'None' && job.poster_url !== 'N/A'
        ? job.poster_url
        : `/static/img/${job.video_type === 'Music' ? 'music.png' : 'none.png'}`;
    return `<img class="job-poster" src="${image}" alt="${getJobTitle(job)}">`;
}

export function jobHasProgress(job) {
    let status = false;
    // HandBrake has the disc/files and should be outputting stage and eta
    if (job.status === 'transcoding') {
        status = true;
    }
    // MakeMKV has the disc and should be outputting stage and eta
    if (job.status === 'ripping' && job.stage) {
        status = true;
    }
    // abcde is ripping the audio disc and is outputting stage and eta
    if (job.disctype === 'music' && job.stage) {
        status = true;
    }

    return status;
}

export function getStatusClass(job) {
    let status = `status-${job.status.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`

    if (!safe_bool(job.manual_trackselect_enabled) && job.status.toLowerCase() === JobState.MANUAL_WAIT_STARTED)
        status = ' status-manual-meta-wait';

    // track selection wait
    if (safe_bool(job.manual_trackselect_enabled) && !safe_bool(job.manual_start))
        status += ' status-manual-trackselect-wait';

    // post track selection wait. ARM to pickup/continue the job (max 1 minute)
    if (safe_bool(job.manual_start) && job.status.toLowerCase() === JobState.VIDEO_WAITING)
        status += ' status-manual-trackselect-done';

    return status;
}

export function renderJobStatusBadge(job) {
    const statusClass = getStatusClass(job);

    let manual_info = '';

    // metadata wait
    if (!safe_bool(job.manual_trackselect_enabled) && job.status.toLowerCase() === JobState.MANUAL_WAIT_STARTED)
        manual_info = getManualMetaWaitTimeRemaining(job).relative;

    // track selection wait
    if (safe_bool(job.manual_trackselect_enabled) && !safe_bool(job.manual_start)) {
        manual_info = getManualTrackSelectTimeRemaining(job).relative;
    }

    // post track selection wait. ARM to pickup/continue the job (max 1 minute)
    if (safe_bool(job.manual_start) && job.status.toLowerCase() === JobState.VIDEO_WAITING)
        manual_info = 'Starting soon';

    return `
        <span class="job-status ${statusClass}" 
                data-manual-info='${manual_info}'
                data-modal='jobs_pipeline' 
                data-jobid="${job.job_id}">
            <span class="status-dot"></span>
            <span class="status-text">${job.status}</span>
        </span>
    `;
}

export function renderTracks(job, root) {
    const modal = $(root);
    const tracks = job.tracks || [];
    const container = modal.find('#tracks .tracks-list').empty();
    const actions = modal.find('#tracks .tracks-actions').empty();

    const manual_trackselect_time_remaining = getManualTrackSelectTimeRemaining(job);
    const manual_trackselect_enabled = job.manual_trackselect_enabled && !manual_trackselect_time_remaining.expired && (__is_authenticated_simple());

    if (!tracks.length) {
        container.append($('<p>').addClass('tracks-empty').text('No tracks found.'));
        return;
    }

    let num_tracks_to_process = 0;

    $.each(tracks, function (_, track) {
        const title = track.filename || `Track ${track.track_number}`;
        const row = $('<div>').addClass('track-row');
        const info = $('<div>').addClass('track-info');
        const heading = $('<div>').addClass('track-heading');
        const tags = $('<div>').addClass('track-tags');

        heading.append($('<span>').addClass('track-number').text(String(track.track_number).padStart(2, '0')));
        heading.append($('<strong>').addClass('track-title').text(title));

        const addTag = (label, value, className = '') => {
            if (value === null || value === '') return;
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
        if (!manual_trackselect_enabled && !track.process)
            row.addClass('skip-track');

        if (track.process)
            num_tracks_to_process++;

        if (manual_trackselect_enabled) {
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

    if (manual_trackselect_time_remaining.expired && job.manual_trackselect_enabled)
        $('<div>', {
            class   : 'flash-alert flash-danger',
            html    : '<i class="fa-solid fa-triangle-exclamation"></i> Waiting for manual input expired!'
        }).appendTo(container);

    else if (manual_trackselect_enabled) {
        $('<button>', {
            type        : 'button',
            class       : 'arm-button arm-button-primary track-start',
            disabled    : num_tracks_to_process <= 0,
            html        : '<i class="fa-solid fa-play" aria-hidden="true"></i> Start ripping'
        }).on('click', function () {
            const local_job_id = getJobIds(job).jobId;

            if (num_tracks_to_process <= 0) {
                console.log('no tracks selected');
                return;
            }

            $.ajax({
                url         : '/jobdetail_ready',
                method      : 'POST',
                contentType : 'application/json',
                headers     : {
                    'X-CSRFToken': $('meta[name="csrf-token"]').attr('content')
                },
                data        : JSON.stringify({
                    job_id: local_job_id,
                })
            }).fail(() => {
                alert();
            });
        }).appendTo(actions);
    }
}

export function renderJobPipeline(job) {
    const status        = job.status;
    const finished      = JobStateGroup.FINISHED.has(status);
    const failed        = status === JobState.FAILURE;
    const successful    = status === JobState.SUCCESS;

    const skipTranscode = safe_bool(job.config?.SKIP_TRANSCODE);

    const currentIndex = finished
        ? JOB_PIPELINE_STAGES.length - 1
        : JOB_PIPELINE_STAGES.findIndex(stage => stage.status === status);

    const steps = JOB_PIPELINE_STAGES.map((stage, index) => {
        const step_disabled
            = skipTranscode && ['waiting_transcode', 'transcoding'].includes(stage.status);

        let state = 'pipeline-pending';
        let icon = stage.icon;

        if (step_disabled) {
            state   = 'step-disabled';
        } else if (finished && successful && index <= currentIndex) {
            state   = 'pipeline-done';
            icon    = 'fa-check';
        } else if (finished && failed && index === currentIndex) {
            state   = 'pipeline-failed';
            icon    = 'fa-xmark';
        } else if (!finished && currentIndex !== -1 && index < currentIndex) {
            state   = 'pipeline-done';
            icon    = 'fa-check';
        } else if (!finished && index === currentIndex) {
            state   = 'pipeline-current';
        }

        return `
            <div class="job-pipeline-step ${state}">
                <span class="job-pipeline-icon">
                    <i class="fa-solid ${icon}" aria-hidden="true"></i>
                </span>
                <span class="job-pipeline-label">${stage.label}</span>
            </div>`;
    }).join('');

    return `
        <div class="job-status-pipeline" data-status="${status}" aria-label="Job status pipeline">
            ${steps}
        </div>
    `;
}

export function renderProgress(job) {
    if (!jobHasProgress(job)) return '';

    return `
        <div class="job-progress" data-job-status="${job.status}">
            <div class="job-progress-header">
                <span id="job_stage">${job.stage}</span>
                <span id="job_percent">${job.progress}%</span>
            </div>
            <div class="progress-track">
                <div id="job_progress_bar" class="progress-value" style="width:${job.progress_round}%"></div>
            </div>
            <div class="job-progress-meta">
                <span id="_eta">ETA ${job.eta || 'Unknown'}</span>
                ${job.status === 'transcoding' ? `
                    <span id="job_cur_fps">${job.cur_fps || 0} FPS</span>
                    <span id="job_avg_fps">AVG ${job.avg_fps || 0} FPS</span>
                ` : ''}
            </div>
        </div>`;
}

export function renderJobMeta(job, ids) {
	const fields = [
		['Type',    'video_type',   job.video_type],
		['Year',    'year',         job.year],
		['Device',  'devpath',      job.devpath],
		['Ripper',  'ripper',       getRipperName(job, ids)],
		['Method',  'ripmethod',    job.config.RIPMETHOD],
		['Feature', 'mainfeature',  job.config.MAINFEATURE],
		['Length',  'length',       `${job.config.MINLENGTH} – ${job.config.MAXLENGTH}`]
	];

	return `
        <div class="job-meta-item">
            <span class="job-meta-label">Ripping Mode</span>
            <span data-field="mode" class="job-mode-badge ${safe_bool(job.manual_mode) ? 'job-mode-manual' : 'job-mode-auto'}">
                ${safe_bool(job.manual_mode) ? 'Manual' : 'Auto'}
            </span>
        </div>
        ${fields.map(([label, field, value]) => `
            <div class="job-meta-item">
                <span class="job-meta-label">${label}</span>
                <span data-field="${field}">${value ?? ''}</span>
            </div>
        `).join('')}
	`;
}

export function renderJobActions(job, ids, authenticated) {
	if (!authenticated) return '';

	const hidden = !ids.local ? ' hidden' : '';

    let actions= '';

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
				<i class="fa-solid fa-terminal"></i>
			</a>
    `;

    // title actions
	if (!JobStateGroup.POSTPROCESSING.has(job.status)
        && !JobStateGroup.FINISHED.has(job.status) && job.video_type !== 'Music')
    {
		actions += `
			<a class="icon-button"
				href="titlesearch?job_id=${ids.jobId}"
				data-tooltip="Title Search">
				<i class="fa-solid fa-magnifying-glass"></i>
			</a>

			<a class="icon-button"
				href="customTitle?job_id=${ids.jobId}"
				data-tooltip="Custom Title">
				<i class="fa-regular fa-pen-to-square"></i>
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

export function renderJob(job, authenticated, placeholder=false) {
    const ids       = getJobIds(job);
    const dateInfo  = formatTimestamp(job.start_time);

    return `
        <article class="job-card" ${placeholder ? 'data-placeholder' : ''} id="jobId${job.job_id}">
            <a href="#" class="job-poster-link" data-modal="jobs_details" data-jobid="${job.job_id}">
                ${posterCheck(job)}
            </a>

            <div class="job-content">
                <header class="job-header">
                    <div>
                        <h2 id="job_title" data-modal="jobs_details" data-jobid="${job.job_id}">${getJobTitle(job)}</h2>
                        <span class="job-id">${job.job_id}</span>
                    </div>

                    <div id="job_status_badge_wrapper">
                        ${renderJobStatusBadge(job)}
                    </div>
                </header>

                <div class="job-meta">
                    ${renderJobMeta(job, ids)}
                </div>

                <div id="job_progress_section">${renderProgress(job)}</div>

                <div class="job-footer">
                    <div class="job-time">
                        <span title="${dateInfo.title}">
                            <i class="fa-regular fa-clock"></i> 
                            <span id="job_start_time">${dateInfo.relative}</span>
                        </span>
                        <span>
                            <i class="fa-solid fa-stopwatch"></i>
                            ${(job.job_length && job.job_length !== 'None') ? job.job_length : 'Ongoing'}
                        </span>
                    </div>
                    <div id="job_actions">
                        ${renderJobActions(job, ids, authenticated)}
                    </div>
                </div>
            </div>
        </article>`;
}

export function updateJobItem(job, authenticated) {
    const _card = $(`#jobId${job.job_id}`);
    if (!_card.length) return;

    const ids           = getJobIds(job);
    const dateInfo      = formatTimestamp(job.start_time);
    const jobTitle      = getJobTitle(job);

    const title         = _card.find('#job_title');
    const poster        = _card.find('.job-poster');
    const status        = _card.find('#job_status_badge_wrapper');
    const start_time    = _card.find('#job_start_time');
    const meta          = _card.find('.job-meta');
    const progress      = _card.find('#job_progress_section');
    const actions       = _card.find('#job_actions');

    if (title.length && title.text() !== jobTitle)
        title.text(jobTitle);

    if (start_time.length && start_time.text() !== dateInfo.relative)
        start_time.text(dateInfo.relative);

    if (poster.length && job.poster_url !== 'None' && job.poster_url !== 'N/A' && poster.attr('src') !== job.poster_url)
        poster.attr('src', job.poster_url);

    if (progress.length)
        progress.html(renderProgress(job));

    if (status.length)
        status.html(renderJobStatusBadge(job));

    if (actions.length)
        actions.html(renderJobActions(job, ids, authenticated));

    if (meta.length)
        meta.html(renderJobMeta(job, ids));
}

export function removeJobItem(job) {
    $('#jobId' + job.job_id).remove();
}

export function addJobItem(job, authenticated) {
    return renderJob(job, authenticated);
}