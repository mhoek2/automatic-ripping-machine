$(function () {
    function sendSettings(formToSend, sendTo) {
        $.ajax({
            type: 'POST',
            url: sendTo,
            data: formToSend.serialize()
        }).done(function (data) {
            if (data.success === true) {
                console.log(data)
                //var dt = new Date();
                //var time = `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`;
                //addNotification("Saved Successfully", `Saved ${data.form} settings at ${time}`, toastCount);
                //toastCount++;
                //alert("Setting saved");
            }
        });
    }

    $("#uiSettings").submit(function (e) {
        e.preventDefault();
        sendSettings($("#uiSettings"), "/save_ui_settings");
    });
    $("#ripperSettings").submit(function (e) {
        e.preventDefault();
        sendSettings($("#ripperSettings"), "/save_settings");
    });
    $("#abcdeSettings").submit(function (e) {
        e.preventDefault();
        sendSettings($("#abcdeSettings"), "/save_abcde_settings");
    });
    $("#appriseCfg").submit(function (e) {
        e.preventDefault();
        sendSettings($("#appriseCfg"), "/save_apprise_cfg");
    });
    $("#updateArm").submit(function (e) {
        e.preventDefault();
        sendSettings($("#updateArm"), "/update_arm")
    })

    $(".settings-tab").on("click", function()
    {
        const tab = $(this).data("tab");

        $(".settings-tab")
            .removeClass("active")
            .attr("aria-selected", "false");

        $(this)
            .addClass("active")
            .attr("aria-selected", "true");

        $(".settings-tab-pane")
            .removeClass("active");

        $("#" + tab)
            .addClass("active");
    });
});