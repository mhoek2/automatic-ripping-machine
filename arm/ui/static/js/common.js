/*jshint multistr: true */
/*jshint esversion: 6 */
/*global $:false, jQuery:false */
/* jshint node: true */
/* jshint strict: false */

const MODEL_ID = "#exampleModal";
const DB_SUCCESS_BTN_ID = "#save-get-success";
const DB_FAIL_BTN_ID = "#save-get-failed";
const MSG_1_ID = "#message1 .alert-heading";
const SEARCH_BOX_ID = "#searchquery";
const MODAL_TITLE = ".modal-title";
const CARD_DECK = ".card-deck";
const SUCCESS_CLASS = "alert-success";
const MODAL_FOOTER = ".modal-footer";


function getJobIds(job) {
    const [serverId, jobId] = job.job_id.split("_");
    return { serverId, jobId: jobId || job.job_id, local: serverId === "0" };
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
    if (!checkTranscodeStatus(job)) return "";

    return `
        <div class="job-progress">
            <div class="job-progress-header">
                <span id="jobId${job.job_id}_stage">${job.stage}</span>
                <span id="jobId${job.job_id}_percent">${job.progress}%</span>
            </div>
            <div class="progress-track">
                <div id="jobId${job.job_id}_progress_bar" class="progress-value" style="width:${job.progress_round}%"></div>
            </div>
            <div class="job-progress-meta">
                <span id="jobId${job.job_id}_eta">ETA ${job.eta}</span>
                <span id="jobId${job.job_id}_cur_fps">${job.cur_fps} FPS</span>
                <span id="jobId${job.job_id}_avg_fps">AVG ${job.avg_fps} FPS</span>
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

    let actions = `
        <div class="job-actions${hidden}">
            <button class="icon-button danger"
                    type="button"
                    data-toggle="modal"
                    data-target="#exampleModal"
                    data-type="abandon"
                    data-jobid="${ids.jobId}"
                    data-href="json?job=${ids.jobId}&mode=abandon"
                    data-tooltip="Abandon Job">
                <i class="fa-solid fa-ban"></i>
            </button>

            <a class="icon-button"
               href="logs?logfile=${job.logfile}&mode=full"
               data-tooltip="View Log">
                <i class="fa-solid fa-file-lines"></i>
            </a>`;

    if (job.video_type !== "Music") {
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
            </a>
            <a class="icon-button"
               href="changeparams?config_id=${ids.jobId}"
               data-tooltip="Edit Settings">
                <i class="fa-solid fa-sliders"></i>
            </a>`;
    }

    actions += `
            <button class="icon-button"
                    type="button"
                    data-toggle="modal"
                    data-target="#exampleModal"
                    data-type="fixperms"
                    data-jobid="${ids.jobId}"
                    data-href="json?mode=fixperms&job=${ids.jobId}"
                    data-tooltip="Fix Permissions">
                <i class="fa-solid fa-wrench"></i>
            </button>
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

                    <span class="job-status ${statusClass}" id="jobId${job.job_id}_status">
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

//
// job common above
//


function updateModal(modal, modalTitle = "", modalBody = "") {
    switch (actionType) {
        case "abandon":
            modalTitle = "Abandon This Job ?";
            modalBody = "This item will be set to abandoned. You cannot set it back to active! Are you sure?";
            break;
        case "delete":
            modalTitle = "Delete this job forever ?";
            modalBody = "This item will be permanently deleted and cannot be recovered. Are you sure?";
            break;
        case "fixperms":
            modalTitle = "Try to fix this jobs folder permissions ?";
            modalBody = "This will try to set the chmod values from your arm.yaml. It wont always work, you may need to do this manually";
            break;
        case "search":
            modalTitle = "Search the database";
            modalBody = `<div class="input-group mb-3"><div class="input-group-prepend"><span class="input-group-text" id="searchlabel">Search </span></div>
                       <input type="text" class="form-control" id="searchquery" aria-label="searchquery" name="searchquery" placeholder="Search...."
                       value="" aria-describedby="searchlabel"><div id="validationServer03Feedback" class="invalid-feedback">Search string too short.</div></div>`;
            break;
        default:
            modalTitle = "Do you want to leave this page ?";
            modalBody = "To view the log file you need to leave this page. Would you like to leave ?";
    }
    modal.find(".modal-title").text(modalTitle);
    modal.find(".modal-body").html(modalBody);
}


function hideModal() {
    $('#exampleModal').modal('hide');
    $('#message1').removeClass('d-none');
    $('#message2').addClass('d-none');
    $('#message3').addClass('d-none');
}

function pingReadNotify(toastId) {
    $.ajax({
        url: "/json?mode=read_notification&notify_id=" + toastId,
        type: "get",
        timeout: 2000,
        success: function (data) {
            console.log(data)
        }
    });
}

function addToast(title, body, toastId) {
    // Get the toast timeout from UISettings
    const toast_timeout = getNotifyTimeout();
    console.log("Notification timeout: " + toast_timeout);

    const toast = `<div id="toast${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="true" data-animation="true" data-delay="${parseInt(toast_timeout)}" style="z-index:1000">
        <div class="toast-header">
            <img src="static/img/success.png" class="rounded mr-2" alt="arm message" height="20px" width="20px">
                <strong class="mr-auto">${title}</strong>
                <small class="text-muted">just now</small>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
        </div>
        <div class="toast-body">
            ${body}
        </div>
    </div>`;
    $("#toastHolder").append(toast);
    const newToast = $(`#toast${toastId}`);
    newToast.toast('show');
    newToast.on('hidden.bs.toast', function () {
        // do something...
        pingReadNotify(toastId)
    })
}

// Get the toast timeout settings from UI Settings via JSON
function getNotifyTimeout() {
    // initilise notify and set a default of 6.5 seconds
    let notify = 6500;

    $.ajax({
        url: "/json?mode=notify_timeout",
        type: "get",
        timeout: 2000,
        success: function (data) {
            console.log("UI timeout: " + data.notify_timeout);
            notify = data.notify_timeout;
        }
    });

    return notify;
}