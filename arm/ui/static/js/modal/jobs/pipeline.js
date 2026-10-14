ARM.modal.jobs = ARM.modal.jobs || {};

ARM.modal.jobs.pipeline = {
	modal: "#jobs-pipeline-modal",
	job_id: null,
	log_viewer: null,
	last_status: null,

	open(options = {}) {
		const _modal = ARM.modal.jobs.pipeline;
		const job_id = options.jobId ?? null;

		if (!job_id)
			return;
		
		const job = getActiveJob(job_id);

		if (!job)
			return;

		_modal.job_id = job_id;
		_modal.log_viewer = startLogViewer("tail", job.logfile);

		$("#job-pipeline-modal-title").text(`
			${job.title} (${job.year})
		`);

		ARM.modal.show(_modal.modal);
	},

	close() {
		const _modal = ARM.modal.jobs.pipeline;

		_modal.job_id = null;

		if (_modal.log_viewer && typeof _modal.log_viewer === 'function') {
			_modal.log_viewer();
		}
		_modal.log_viewer = null;
	},

	update()
	{
		const _modal = ARM.modal.jobs.pipeline;

		if (!_modal.job_id)
			return

		const job = getActiveJob(_modal.job_id);

		if (!job) {
			ARM.modal.hide(_modal.modal);
			return;
		}

		console.log(job);

		if (job.status !== _modal.last_status) {
			$(`${_modal.modal} .arm-modal-body #pipeline`).html(renderJobStatus(job));
    		_modal.last_status = job.status;
		}
		$(`${_modal.modal} .arm-modal-body #progress`).html(renderProgress(job));
	}
};

$(function() {
	const _modal = ARM.modal.jobs.pipeline;

	$(document).on("click", "[data-modal='jobs_pipeline']", function () {
		_modal.open({
			jobId: $(this).attr("data-jobid")
		});

		_modal.update();
	});

	$(document).on(`arm:modal-close_${_modal.modal}`, function () {
		_modal.close();
	});

	$(document).on(`arm:modal-update_${_modal.modal}`, function () {
		_modal.update();
	});
});