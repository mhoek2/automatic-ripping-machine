ARM.modal.jobs = ARM.modal.jobs || {};

ARM.modal.jobs.pipeline = {
	modal: "#jobs-pipeline-modal",
	job_id: null,

	open(options = {}) {
		const jobId = options.jobId ?? null;
		if (!jobId)
			return;

		const pipeline = ARM.modal.jobs.pipeline;
		pipeline.job_id = jobId;

		ARM.modal.show(pipeline.modal);
	},

	close() {
		ARM.modal.jobs.pipeline.job_id = null;
	},

	renderJobStatus(job) {
		const status = job.status;
		const finished = JOB_STATUS_FINISHED.has(status);
		const failed = status === JobState.FAILURE;
		const successful = status === JobState.SUCCESS;

		const skipTranscode = [true, "true"].includes(String(job.config?.SKIP_TRANSCODE).toLowerCase());


		const currentIndex = finished
			? JOB_PIPELINE_STAGES.length - 1
			: JOB_PIPELINE_STAGES.findIndex(stage => stage.status === status);

		const steps = JOB_PIPELINE_STAGES.map((stage, index) => {
			const disabled = skipTranscode && ["waiting_transcode", "transcoding"].includes(stage.status);

			let state = disabled ? "step-disabled" : "pipeline-pending";
			let icon = stage.icon;

			if (!disabled) {
				if (finished && successful && index < currentIndex) {
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
			<div class="job-status-pipeline" aria-label="Job status pipeline">
				${steps}
			</div>
		`;
	},

	update()
	{
		const pipeline = ARM.modal.jobs.pipeline;

		if (!pipeline.job_id)
			return

		const job_index = job_refresh.activeJobs.findIndex( e => e.job_id === pipeline.job_id );
		const job = job_refresh.activeJobs[job_index] ;

		if (!job) {
			ARM.modal.hide(pipeline.modal);
			return;
		}

		console.log(job);

		const body = $(`${pipeline.modal} .arm-modal-body`);
		body.html(pipeline.renderJobStatus(job));
	}
};

$(function() {
	const pipeline = ARM.modal.jobs.pipeline;

	$(document).on("click", "[data-modal='jobs_pipeline']", function() 
	{
		const button = $(this);
		const jobId = button.attr("data-jobid");

		ARM.modal.jobs.pipeline.open({
			jobId
		});

		ARM.modal.jobs.pipeline.update();
	});

	$(document).on(`arm:modal-close_${pipeline.modal}`, function(e, state) {
		ARM.modal.jobs.pipeline.close();
	});

	$(document).on(`arm:modal-update_${pipeline.modal}`, function(e, state) {
		ARM.modal.jobs.pipeline.update();
	});
});