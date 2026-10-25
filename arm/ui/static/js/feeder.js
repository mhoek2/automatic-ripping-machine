const FEEDER_GROUPS = {
    ripping: [
        JobState.MANUAL_WAIT_STARTED,
        JobState.IDLE,
        JobState.VIDEO_RIPPING,
        JobState.VIDEO_WAITING,
        JobState.VIDEO_INFO,
        JobState.AUDIO_RIPPING
    ],
    transcoding: [
        JobState.TRANSCODE_ACTIVE,
        JobState.TRANSCODE_WAITING
    ],
    global: [
        JobState.SUCCESS,
        JobState.FAILURE,
        JobState.POSTPROCESSING_MOVING,
        "clear",
        
    ],
    //simulate: [
    //    "simulate",
    //]
};

function renderFeederGroup(group, states) {
    const container = $(`#feeder-${group}`);

    /*if (group === "simulate")
    {
        $.each(job_refresh.activeJobs, function (index, job) {
            if (!job?.active)
                return 1;

            const ids = getJobIds(job);

            container.append(
                $("<button>", {
                    type: "button",
                    text: `${job.title} (${job.year})`,
                    "data-feeder-action": group,
                    "data-job-id": ids.jobId,
                    "data-drive": job.devpath,
                })
            );
        });

        return;
    }*/

    const uniqueStates = [...new Set(states)];
    uniqueStates.forEach(state => {
        container.append(
            $("<button>", {
                type: "button",
                text: state,
                "data-feeder-action": state
            })
        );
    });
}

function getFeederDriveMode()
{
    return localStorage.getItem("feeder-drive-mode") || "auto";
}

function setFeederDriveMode( drive_mode )
{
    localStorage.setItem("feeder-drive-mode", drive_mode );
}

function setFeederDriveModeCheckbox()
{
    const drive_mode = (getFeederDriveMode() === "manual") ? true : false;
    $("#feeder_drive_mode").prop("checked", drive_mode);
}

$(document).on('change', "#feeder_drive_mode", function(){
    setFeederDriveMode(this.checked ? "manual" : "auto");
});

$(document).on("click", "[data-feeder-action]", function() {

    const data = {
        action      : $(this).attr("data-feeder-action"),
        job_id      : $(this).attr("data-job-id") ?? -1,
        drive       : $(this).attr("data-drive") ?? -1,
        drive_mode  : getFeederDriveMode(),
    };

    $.ajax({
        url			: "/feeder",
        method		: "GET",
        data		: data,
        dataType	: "json"
    })
    .done(function(result) {
        console.log("Feeder:", result);
    })
    .fail(function(xhr) {
        console.error("Feeder failed:", xhr.responseJSON || xhr.statusText);
    });
});

$(document).ready(function () {
    setFeederDriveModeCheckbox();

    setTimeout(function(){
        Object.entries(FEEDER_GROUPS).forEach(([group, states]) => {
            renderFeederGroup(group, states);
        });
    }, 1000);
});