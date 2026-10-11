ARM.modal.confirm = {
	modal: "#confirm-modal",
	state: {
		href: "",
		activeJob: null,
		actionType: null,
	},

	_ACTION: {
		dbedit: {
			title: "Enable database editing?",
			message: "This can be dangerous if you don't know what you're doing. You could delete all your database entries if you're not careful. Are you sure you want to continue?",
			confirm: "I understand, continue",
			buttonClass: "arm-button-danger",
			storageKey: "acknowledge_db_edits"
		},
		abandon: {
			title: "Abandon this job?",
			message: "This job will be abandoned. Are you sure you want to continue?",
			confirm: "Abandon job",
			buttonClass: "arm-button-danger",
			href: jobId => `json?mode=abandon&job=${encodeURIComponent(jobId)}`,
			loading: "Abandoning job...",
			success: "Job was successfully abandoned",
			error: "Failed to abandon the job. Please try again.",
			removeJob: true,
			expectedMode: "abandon"
		},
		delete: {
			title: "Delete this job?",
			message: "This job and its associated database records will be deleted. This action cannot be undone. Are you sure you want to continue?",
			confirm: "Delete job",
			buttonClass: "arm-button-danger",
			href: jobId => `json?mode=delete&job=${encodeURIComponent(jobId)}`,
			loading: "Deleting job...",
			success: "Job was successfully deleted",
			error: "Failed to delete the job. Please try again.",
			removeJob: true,
			expectedMode: "delete"
		},
		fixperms: {
			title: "Fix this job's folder permissions?",
			message: "This will try to set the chmod values from your arm.yaml. It won't always work; you may need to do this manually.",
			confirm: "Fix Permissions",
			buttonClass: "arm-button-primary",
			href: jobId => `json?mode=fixperms&job=${encodeURIComponent(jobId)}`,
			loading: "Fixing folder permissions...",
			success: "Job folder permissions were successfully fixed",
			error: "Failed to fix folder permissions. Please try again.",
			expectedMode: "fixperms"
		}
	},

	open(options = {}) {
		const type = options.type;
		const action = ARM.modal.confirm._ACTION[type];

		if (!action) {
			console.warn(`Unknown modal action: ${type}`);
			return;
		}

		ARM.modal.confirm.state.href = options.href || "";
		ARM.modal.confirm.state.activeJob = options.jobId ?? null;
		ARM.modal.confirm.state.actionType = type;

		$("#confirm-modal-title").text(action.title);
		$("#m-body").text(action.message);

		$("#save-yes")
			.text(action.confirm)
			.removeClass("arm-button-danger arm-button-primary")
			.addClass("arm-button " + action.buttonClass)
			.prop("disabled", false);

		$("#m-body .arm-modal-loading, #m-body .arm-modal-error").remove();

		ARM.modal.show(ARM.modal.confirm.modal);
	}
};

$(function() {
	$(document).on("click", "[data-modal='confirm']", function() {
		const button = $(this);
		const type = button.attr("data-type");
		const jobId = button.attr("data-jobid");
		const action = ARM.modal.confirm._ACTION[type];

		if (!action) {
			console.warn(`Unknown modal action: ${type}`);
			return;
		}

		ARM.modal.confirm.open({
			type,
			jobId,
			href: action.href ? action.href(jobId) : ""
		});
	});

	$(document).on("click", `${ARM.modal.confirm.modal} #save-yes`, function() {
		const state = ARM.modal.confirm.state;
		const action = ARM.modal.confirm._ACTION[state.actionType];

		if (action?.storageKey) {
			ARM.storage.set(action.storageKey, true);
			ARM.modal.hide(ARM.modal.confirm.modal);
			return;
		}

		$(document).trigger("arm:modal-confirm", [state]);
	});

	$(document).on("arm:modal-confirm", function(e, state) {
		const action = ARM.modal.confirm._ACTION[state.actionType];

		if (!action || !state.href) {
			return;
		}

		const body = $("#m-body");
		const confirmButton = $("#save-yes");

		body.find(".arm-modal-loading, .arm-modal-error").remove();

		body.append(
			$("<div>", { class: "arm-modal-loading" }).append(
				$("<i>", {
					class: "fa-solid fa-spinner fa-spin",
					"aria-hidden": "true"
				}),
				$("<span>").text(action.loading || "Processing...")
			)
		);

		confirmButton.prop("disabled", true);

		$.get(state.href)
			.done(function(data) {
				if (!data.success || (action.expectedMode && data.mode !== action.expectedMode)) {
					body.append(
						$("<p>", {
							class: "arm-modal-error",
							role: "alert"
						}).text(action.error || "The action failed. Please try again.")
					);
					return;
				}

				if (action.removeJob && state.activeJob != null) {
					$(`#jobId${state.activeJob}`).remove();
				}

				ARM.modal.hide(ARM.modal.confirm.modal);

				$("#message1 .alert-heading").text(
					action.success || "Action completed successfully"
				);

				$("#message1").removeClass("d-none");

				setTimeout(function() {
					$("#message1").addClass("d-none");
				}, 5000);
			})
			.fail(function() {
				body.append(
					$("<p>", {
						class: "arm-modal-error",
						role: "alert"
					}).text(action.error || "The request failed. Please try again.")
				);
			})
			.always(function() {
				confirmButton.prop("disabled", false);
				body.find(".arm-modal-loading").remove();
			});
	});
});