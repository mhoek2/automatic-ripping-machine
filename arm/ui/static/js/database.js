/*jshint multistr: true */
/*jshint esversion: 6 */
/*global $:false, jQuery:false */
/* jshint node: true */
/* jshint strict: false */

let databaseCursor = null;
let databaseLoading = false;
let databaseHasMore = true;
let databaseInfiniteScrollEnabled = false;



let activeJob = null;
let actionType = null;
let z = "";


function switchSearch(data) {
    $(this).find(MODAL_TITLE).text("searching....");
    $(CARD_DECK).html("");
    const size = Object.keys(data.results).length;
    console.log("length = " + size);
    if (size > 0) {
        $.each(data.results, function (_index, value) {
            z = addJobItem(value, data.authenticated);
            $(CARD_DECK).append(z);
        });
        console.log(data);
        $(MSG_1_ID).html("Here are the jobs i found matching your query");
        $("#m-body").addClass("bd-example-modal-lg");
        $("#m-body").modal("handleUpdate");
        $(MODEL_ID).modal("toggle");
        $("#message1").removeClass("d-none").removeClass("alert-danger").addClass(SUCCESS_CLASS);
        $("#message2").addClass("d-none");
        $("#message3").addClass("d-none");
    } else {
        $(MSG_1_ID).html("I couldnt find any results matching that title");
        $("#message1").removeClass("d-none").removeClass(SUCCESS_CLASS).addClass("alert-danger");
        $(MODEL_ID).modal("toggle");
    }
}

/**
 * Function to get jobs (success/fail buttons) from the arm api
 * @param getJobsHREF link to the json api
 */
function fetchJobs(getJobsHREF) {
    // Add the spinner to let them know we are loading
    $(MODEL_ID).modal("show");
    $(MODAL_TITLE).text("Loading...");
    $(".modal-body").html("<div class=\"d-flex justify-content-center\"><div class=\"spinner-border\" role=\"status\"><span class=\"sr-only\">Loading...</span></div></div>");
    $.get(getJobsHREF, function (data) {
        if (data.success === true) {
            $(CARD_DECK).html("");
            const size = Object.keys(data.results).length;
            if (size > 0) {
                $(MSG_1_ID).html("Here are all the jobs you asked for....");
                $.each(data.results, function (_index, value) {
                    $(CARD_DECK).append(addJobItem(value, data.authenticated));
                });
            } else {
                $(MSG_1_ID).html("I couldn't find any results matching that title").removeClass("d-none");
            }
            setTimeout(
                function () {
                    $("#message1").addClass("d-none");
                    },
                5000
            );
        }
    }, "json");
    $(MODAL_FOOTER).removeClass("d-none");
}

function fetchAllJobs(reset = false) {
	if (databaseLoading) {
		return;
	}

	if (reset) {
		databaseCursor = null;
		databaseHasMore = true;
		$(CARD_DECK).empty();
	}

	if (!databaseHasMore) {
		return;
	}

	databaseLoading = true;
	databaseInfiniteScrollEnabled = true;

	$("#database-load-status")
		.text("Loading jobs...")
		.removeClass("d-none");

	const params = {};

	if (databaseCursor !== null) {
		params.before = databaseCursor;
	}

	$.getJSON("/database/jobs", params)
		.done(function(data) {
			if (!data.success) {
				databaseHasMore = false;
				$("#database-load-status").text(
					data.error || "Failed to load jobs."
				);
				return;
			}

			$.each(data.results, function(_index, value) {
				$(CARD_DECK).append(addJobItem(value, data.authenticated));
			});

			databaseCursor = data.next_cursor;
			databaseHasMore = data.has_more;

			if (!data.results.length) {
				$("#database-load-status").text("No jobs found.");
			} else if (!databaseHasMore) {
				$("#database-load-status").text("All jobs loaded.");
			} else {
				$("#database-load-status").text("");
			}
		})
		.fail(function() {
			databaseHasMore = false;
			$("#database-load-status").text("Failed to load jobs.");
		})
		.always(function() {
			databaseLoading = false;

			// Fill the viewport if the first batch was too short
			// to make the user scroll.
			if (databaseInfiniteScrollEnabled && databaseHasMore) {
				checkDatabaseScroll();
			}
		});
}

function checkDatabaseScroll() {
	const container = $(".base_content")[0];

	if (!container || !databaseInfiniteScrollEnabled || databaseLoading || !databaseHasMore )
		return;

	const distanceFromBottom =
		container.scrollHeight - container.scrollTop - container.clientHeight;

	if (distanceFromBottom <= 400) {
		fetchAllJobs();
	}
}


$(document).ready(function () {

});