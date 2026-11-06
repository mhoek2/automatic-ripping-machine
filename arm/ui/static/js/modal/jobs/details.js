import { ARM } from '../modal.js';
import { JobState, safe_bool } from '../../common.js';
import { getJobIds, getActiveJob, renderTracks, renderJobStatusBadge, renderJobPipeline, renderProgress } from '../../jobs/job.js';
import { formatTimestamp } from '../../time.js';

ARM.modal.jobs = ARM.modal.jobs || {};

ARM.modal.jobs.details = {
	modal		: '#jobs_details_modal',
	inited		: null,
	job_id		: null,
	log_viewer	: null,
	request		: null,
	data		: null,

	open(options = {}) {
		const _modal = ARM.modal.jobs.details;
		const job_id = options.jobId;

		if (job_id === null)
			return;

		_modal.job_id = job_id;
		_modal.data = null;

		ARM.modal.show(_modal.modal);
		_modal.load();
	},

	close() {
		const _modal = ARM.modal.jobs.details;

		if (_modal.request) {
			_modal.request.abort();
			_modal.request = null;
		}

		_modal.job_id = null;
		_modal.data = null;

		if (typeof _modal.log_viewer === 'function')
			_modal.log_viewer();

		_modal.log_viewer = null;
	},

	load() {
		const _modal = ARM.modal.jobs.details;

		if (_modal.job_id === null)
			return;

		if (_modal.request)
			_modal.request.abort();

		const content = $(`${_modal.modal} .arm-modal-body`);

		content.addClass('is-loading');

		_modal.request = $.getJSON('/jobdetail_api', {
			job_id: _modal.job_id
		})
			.done(function (data) {
				if (_modal.job_id === null)
					return;

				if (!data.success) {
					content.text(data.error || 'Failed to load job details');
					return;
				}

				_modal.data = data;
				_modal.render(data);
			})
			.fail(function (xhr, status) {
				if (status === 'abort')
					return;

				content.removeClass('is-loading');
				console.error('Failed to load job details', xhr);
				//_modal.close();
			})
			.always(function () {
				content.removeClass('is-loading');
				_modal.request = null;
			});
	},

	render(data) {
		const _modal = ARM.modal.jobs.details;
		const job = data.job;
		const modal = $(_modal.modal);

		console.log(job);

		modal.find('#job_details_title').text(
			`${job.title || 'Unknown title'}${job.year ? ` (${job.year})` : ''}`
		);

		modal.find('#job_details_poster')
			.attr('src', job.poster_url || '')
			.attr('alt', job.title || 'Movie poster');

		modal.find('#job_details_plot').text(job.plot || '');

		modal.find('#job_details_log')
			.attr('href', job.logfile ? `/logs?logfile=${encodeURIComponent(job.logfile)}&mode=tail` : '#')
			.toggle(!!job.logfile);


		_modal.renderStatusBadge(job);
		_modal.renderExternalMeta(job);
		_modal.renderMeta(job);
		_modal.renderJobProgressPipeline(job);

		renderTracks(job, _modal.modal);

		if (!__is_authenticated_simple())
			return;

		_modal.renderTable('#job_details_technical', data.technical?.job || {});
		_modal.renderTable('#job_details_config', job.config || {});
	},

	renderStatusBadge(job) {
		const _modal = $(ARM.modal.jobs.details.modal);
        if (!_modal.length) return;

        const status = _modal.find('#job_status_badge_wrapper');
        if (status.length)
            status.html(renderJobStatusBadge(job));
    },

	renderExternalMeta(job){
		const _modal = ARM.modal.jobs.details;
		$(`${_modal.modal} #job_external_meta`).html('');

		if (job.imdb_id && job.imdb_id !== 'None') {
			const imdbLink = $('<a>')
				.addClass('imdb-link')
				.attr('href', `https://www.imdb.com/title/${job.imdb_id}/`)
				.attr('target', '_blank')
				.attr('rel', 'noopener noreferrer')
				.attr('aria-label', 'View on IMDb')
				.text('IMDb');

			$(`${_modal.modal} #job_external_meta`).append(imdbLink);
		}
	},

	renderMetaRippingMode(job) {
		const metadata_wait = (
			job.status.toLowerCase() === JobState.MANUAL_WAIT_STARTED &&
			!safe_bool(job.manual_trackselect_enabled)
		);

		const manual_mode = safe_bool(job.manual_mode);
		const mode_item = $('<div>').addClass('job-details-meta-item');

		// label
		$('<span>').addClass('job-details-meta-label').text('Ripping mode').appendTo(mode_item);

		// action
		if (metadata_wait && __is_authenticated_simple()) {
			const toggle = $('<div>').addClass('job-mode-toggle');

			$.each(['auto', 'manual'], function (_, mode) {
				const button = $('<button>', {
					type: 'button',
					class: `job-mode-option ${manual_mode === (mode === 'manual') ? 'active' : ''}`,
					text: mode.charAt(0).toUpperCase() + mode.slice(1)
				}).on('click', function () {
					if ($(this).hasClass('active')) return;

					const selected_mode = mode;
					const local_job_id = getJobIds(job).jobId;

					toggle.find('button').prop('disabled', true);

					$.ajax({
						url			: '/jobdetail_mode',
						method		: 'POST',
						contentType	: 'application/json',
						headers		: {
							'X-CSRFToken': $('meta[name="csrf-token"]').attr('content')
						},
						data		: JSON.stringify({
							job_id		: local_job_id,
							mode		: selected_mode
						})
					}).done(function (response) {
						if (response.success) {
							toggle.find('button').removeClass('active');
							button.addClass('active');
						}
					}).fail(function () {
						console.error('Failed to update ripping mode.');
					}).always(function () {
						toggle.find('button').prop('disabled', false);
					});
				});

				toggle.append(button);
			});

			mode_item.append(toggle);
		} 

		// locked view
		else {
			$('<span>')
				.addClass('job-details-meta-value')
				.text(manual_mode ? 'Manual' : 'Auto')
				.appendTo(mode_item);
		}

		return mode_item;
	},

	renderMeta(job) {
		const _modal = ARM.modal.jobs.details;
		const meta = $(`${_modal.modal} #job_details_meta`).empty();
		const dateInfo = formatTimestamp(job.start_time);

		const fields = [
			['Disc type', 		job.disctype],
			['Video type', 		job.video_type],
			['Disc label', 		job.label],
			['Duration', 		job.job_length],
			['Started', 		dateInfo.relative]
		];

		// Ripping mode
		meta.append(_modal.renderMetaRippingMode(job));

		// other metadata
		fields.forEach(([label, value]) => {
			if (value === null || value === '' || value === 'None')
				return;

			const item = $('<div>', {
				class	: 'job-details-meta-item'
			});

			$('<span>', {
				class	: 'job-details-meta-label',
				text	: label
			}).appendTo(item);

			$('<span>', {
				class	: 'job-details-meta-value',
				text	: value
			}).appendTo(item);

			meta.append(item);
		});
	},

	renderJobProgressPipeline(job) {
		const _modal = ARM.modal.jobs.details;

		$(`${_modal.modal} .arm-modal-body #pipeline`).html(renderJobPipeline(job));
		$(`${_modal.modal} .arm-modal-body #progress`).html(renderProgress(job));
	},

	renderTable(selector, values) {
		const table = $('<table>').addClass('job-details-table');

		$.each(values, function (key, value) {
			if (value === null || value === '')
				return;

			table.append(
				$('<tr>').append(
					$('<th>').text(key),
					$('<td>').text(String(value))
				)
			);
		});

		$(selector).empty().append(table);
	},

	update() {
		const _modal = ARM.modal.jobs.details;

		if (!_modal.job_id)
			return;

		const job = getActiveJob(_modal.job_id);

		if (!job) {
			return;
		}

		console.log(job);

		_modal.renderStatusBadge(job);
		_modal.renderMeta(job);
		_modal.renderJobProgressPipeline(job);

		renderTracks(job, _modal.modal);
	}
};

$(function () {
	const _modal = ARM.modal.jobs.details;

	function __openJobDetails(job_id) {
		if (!job_id)
			return;

		_modal.open({
			jobId: job_id
		});
		_modal.update();
	}

	// open job details from the URL hash
	function __autoOpenJobDetails(){
		const params = new URLSearchParams(window.location.hash.slice(1));
		const param_job_id = params.get('detail_job_id');

		if (!param_job_id)
			return;

		__openJobDetails(String(param_job_id));
	}

	$(document).on('click', '[data-modal="jobs_details"]', function () {
		__openJobDetails($(this).attr('data-jobid'));
	});

	$(document).on(`arm:modal-close_${_modal.modal}`, function () {
		_modal.close();
	});

	$(document).on(`arm:modal-update_${_modal.modal}`, function () {
		if (!_modal.inited) {
			__autoOpenJobDetails(); // open job details from the URL hash

			_modal.inited = true;
		}

		_modal.update();
	});
});