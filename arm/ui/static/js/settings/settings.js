$(function () {
    function sendSettings(formToSend, sendTo) {
        const data = formToSend.serializeArray();

        formToSend.find('input[type="checkbox"]').each(function () {
            data.push({
                name: this.name,
                value: this.checked ? 'True' : 'False'
            });
        });

        $.ajax({
            type: 'POST',
            url: sendTo,
            data: $.param(data)
        }).done(function (data) {
            if (data.success === true) {
                console.log(data);
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