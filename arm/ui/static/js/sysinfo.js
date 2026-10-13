const sysinfo = {
    refreshInterval: 5000,
    timer: null,

    start() {
        this.fetch(false);

        if (this.timer !== null)
            return;

        this.timer = window.setInterval(() => {
            this.fetch(true);
        }, this.refreshInterval);
    },

    stop() {
        if (this.timer === null)
            return;

        window.clearInterval(this.timer);
        this.timer = null;
    },

    fetch(isInited) {
        $.getJSON(`/serverstats?is_inited=${isInited}`)
            .done((response) => {
                const data = response?.data;

                if (!data)
                    return;

                this.updateServerInfo(data.health?.server);
                this.updateServerUtil(data.health?.server);
                this.updateServerStats(data);
                this.updateMemory(data.health?.server);
                this.updateStorageHealth(data.health);
                this.updateServerHealth(data.health);
                this.updateHardwareSupport(data.health?.tools);
                this.updateServerVersion(data);
            })
            .fail((xhr, status, error) => {
                console.error("Failed to load server stats:", status, error);
            });
    },

    updateServerInfo(server)
    {
        if (!server || typeof server !== "object")
            return;

        $('[data-server="name"]').text(server.name ?? "");
        $('[data-server="description"]').text(server.description ?? "");
        $('[data-server="cpu"]').text(server.cpu ?? "");
    },

    updateServerUtil(server)
    {
        if (!server || typeof server !== "object")
            return;

        // CPU temperature
        const $cpuTemp = $('[data-serverutil="cpu_temp"]');
        const $cpuTempProgress = $('[data-progress="cpu_temp"]');

        if (server.cpu_temp !== null && server.cpu_temp !== undefined)
        {
            $cpuTemp.text(`${server.cpu_temp}°C`);

            $cpuTempProgress
                .show()
                .css("width", this.clamp(server.cpu_temp) + "%")
                .removeClass("warning danger");

            if (server.cpu_temp > 70)
                $cpuTempProgress.addClass("danger");
            else if (server.cpu_temp > 55)
                $cpuTempProgress.addClass("warning");
        }
        else
        {
            $cpuTemp.text("Not reported");
            $cpuTempProgress.hide();
        }

        // CPU usage
        this.updateProgress(
            "cpu_util",
            server.cpu_util,
            { warning: 70, danger: 80 }
        );

        // Memory usage percentage
        if (server.memory_percent !== null && server.memory_percent !== undefined)
        {
            $('[data-serverutil="memory_percent"]')
                .text(`${server.memory_percent}%`);
        }
    },

    updateProgress(key, value, thresholds = {})
    {
        if (value === null || value === undefined || !Number.isFinite(Number(value)))
            return;

        const percentage = Number(value);
        const $progress = $(`[data-progress="${key}"]`);

        $progress
            .css("width", this.clamp(percentage) + "%")
            .removeClass("warning danger");

        if (thresholds.danger !== undefined && percentage > thresholds.danger)
            $progress.addClass("danger");
        else if (thresholds.warning !== undefined && percentage > thresholds.warning)
            $progress.addClass("warning");

        $(`[data-serverutil="${key}"]`).text(`${percentage}%`);
    },

    updateStorageHealth(health) {
        this.renderStorageDirectories(health.directories);
    },

    renderStorageDirectories(directories) {
        const $container = $("[data-health-directories]").empty();

        if (!directories || typeof directories !== "object" ||
            Object.keys(directories).length === 0) {
            $container.append(
                $("<div>")
                    .addClass("sysinfo-empty-state")
                    .text("No directories available")
            );
            return;
        }

        const labels = {
            raw: "Raw",
            transcode: "Transcode",
            completed: "Completed",
            logs: "Logs"
        };

        Object.entries(directories).forEach(([name, directory]) => {
            const $row = $("<div>").addClass("sysinfo-storage-row");
            const $header = $("<div>").addClass("sysinfo-storage-header");
            const $info = $("<div>").addClass("sysinfo-storage-info");

            $("<div>")
                .addClass("sysinfo-storage-name")
                .text(labels[name] || name)
                .appendTo($info);

            const $checks = $("<div>").addClass("sysinfo-storage-checks");

            [
                ["exists", "Exists"],
                ["readable", "Read"],
                ["writable", "Write"]
            ].forEach(([key, label]) => {
                const ok = directory[key] === true;

                const $badge = $("<span>")
                    .addClass("server-check-status")
                    .addClass(ok ? "ok" : "fail")
                    .append(this.icon(
                        ok ? "fa-circle-check" : "fa-circle-xmark"
                    ))
                    .append($("<span>").text(label));

                $checks.append($badge);
            });

            $header.append($info, $checks);
            $row.append($header);

            const used = this.toNumber(directory.used);
            const free = this.toNumber(directory.free);
            const total = this.toNumber(directory.total);
            const percentage = this.toNumber(directory.percent);

            if (
                used !== null &&
                free !== null &&
                total !== null &&
                percentage !== null
            ) {
                const $label = $("<div>").addClass("sysinfo-label");

                $("<span>")
                    .text(directory.path || "")
                    .appendTo($label);

                $("<span>")
                    .text(`${percentage}%`)
                    .appendTo($label);

                const $progress = $("<div>").addClass("sysinfo-progress");
                const $bar = $("<div>")
                    .addClass("sysinfo-progress-bar")
                    .css("width", this.clamp(percentage) + "%");

                if (percentage > 80)
                    $bar.addClass("danger");
                else if (percentage > 70)
                    $bar.addClass("warning");

                $progress.append($bar);

                const $legend = $("<div>").addClass("sysinfo-memory-legend");

                [
                    ["Total", total],
                    ["Used", used],
                    ["Free", free]
                ].forEach(([label, value]) => {
                    const $item = $("<div>")
                        .addClass("sysinfo-memory-legend-item");

                    $("<span>")
                        .addClass("sysinfo-memory-dot")
                        .addClass(label.toLowerCase())
                        .appendTo($item);

                    $("<span>")
                        .addClass("sysinfo-memory-legend-label")
                        .text(label)
                        .appendTo($item);

                    $("<strong>")
                        .text(this.formatGb(value))
                        .appendTo($item);

                    $legend.append($item);
                });

                $row.append($label, $progress, $legend);
            }

            $container.append($row);
        });
    },


    updateMemory(server)
    {
        if (!server || typeof server !== "object")
            return;

        const used = this.toNumber(server.memory_used);
        const free = this.toNumber(server.memory_free);
        const reportedTotal = this.toNumber(server.memory_total);

        // Derive total if the API does not explicitly report it.
        const total = reportedTotal !== null
            ? reportedTotal
            : (used !== null && free !== null ? used + free : null);

        if (total !== null)
            $('[data-memory="total"]').text(this.formatGb(total));

        if (used !== null)
            $('[data-memory="used"]').text(this.formatGb(used));

        if (free !== null)
            $('[data-memory="free"]').text(this.formatGb(free));

        let usedPercent = this.toNumber(server.memory_percent);

        if (usedPercent === null && total > 0 && used !== null)
            usedPercent = (used / total) * 100;

        if (usedPercent === null)
            return;

        usedPercent = this.clamp(usedPercent);

        $('[data-memory-segment="used"]')
            .css("width", usedPercent + "%");

        $('[data-memory-segment="free"]')
            .css("width", (100 - usedPercent) + "%");
    },

    updateServerStats(data)
    {
        if (!data || typeof data !== "object")
            return;

        $("[data-serverstat]").each((_, element) => {
            const $element = $(element);
            const key = $element.data("serverstat");
            const value = data[key];

            // -1 indicates that this value has not been refreshed.
            if (value === undefined || value === null || value === -1)
                return;

            $element.text(value);
        });
    },

    updateServerHealth(health)
    {
        // Preserve the existing UI while initialization is in progress.
        if ( !health || typeof health !== "object")
            return;

        const checks = [];
        const validTools = (health.tools !== -1 && health.tools && typeof health.tools === "object");

        $.each(health.directories || {}, (_, item) => {
            checks.push(
                Boolean(item.exists && item.readable && item.writable)
            );
        });

        if (validTools) {
            $.each(health.tools || {}, (_, item) => {
                checks.push(Boolean(item.available));
            });
        }

        const failed = checks.filter(ok => !ok).length;
        const $summary = $("[data-health-summary]");

        $summary.removeClass("ok fail warning").empty();

        if (checks.length === 0)
        {
            $summary
                .addClass("warning")
                .append(this.icon("fa-triangle-exclamation"))
                .append(" No checks");
        }
        else if (failed > 0)
        {
            $summary
                .addClass("fail")
                .append(this.icon("fa-circle-xmark"))
                .append(` ${failed} check${failed === 1 ? "" : "s"} failed`);
        }
        else
        {
            $summary
                .addClass("ok")
                .append(this.icon("fa-circle-check"))
                .append(" All checks passed");
        }

        if (validTools) {
            this.renderHealthRows(
                "[data-health-tools]",
                health.tools,
                "tool"
            );
        }
    },

    renderHealthRows(selector, items, type)
    {
        const $container = $(selector).empty();

        if (!items || typeof items !== "object" || Object.keys(items).length === 0)
        {
            $container.append(
                $("<div>")
                    .addClass("sysinfo-empty-state")
                    .text("No checks available")
            );
            return;
        }

        $.each(items, (name, item) => {
            const $row = $("<div>").addClass("server-check-row");
            const $info = $("<div>").addClass("server-check-info");

            const labels = {
                handbrake: "HandBrake",
                makemkv: "MakeMKV"
            };

            // Transcoding hardware support, currently has its own section
            // Only render objects that have labels
            if (!labels[name])
                return 1;

            const label = labels[name] ||
                name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

            $("<div>")
                .addClass("server-check-name")
                .text(label)
                .appendTo($info);

            if (item.path)
            {
                $("<div>")
                    .addClass("server-check-detail")
                    .text(item.path)
                    .appendTo($info);
            }

            const $status = $("<div>").addClass("server-check-meta");

            if (type === "tool")
            {
                const ok = Boolean(item.available);
                const statusText = ok
                    ? (item.version ? `v${item.version}` : "Available")
                    : (item.error || "Unavailable");

                $status.append(this.healthStatus(ok, statusText));

                if (item.command)
                {
                    $("<div>")
                        .addClass("server-check-detail")
                        .text(item.command)
                        .appendTo($info);
                }
            }

            $row.append($info, $status);
            $container.append($row);
        });
    },

    updateHardwareSupport(tools)
    {
        if (tools === -1 || !tools || typeof tools !== "object")
            return;

        const hardware = {
            intel   : "Intel Quick Sync",
            nvidia  : "NVIDIA NVENC",
            amd     : "AMD VCN"
        };

        Object.keys(hardware).forEach(type => {
            const $row = $(`[data-hw-support="${type}"]`);

            if (!$row.length || tools.transcode[type] === undefined || tools.transcode[type] === null)
                return;

            const supported = Boolean(tools.transcode[type]);
            const label = supported ? "Supported" : "Unavailable";

            $row.find(".server-check-status").remove();

            $row.append(
                this.healthStatus(supported, label)
            );
        });
    },

    updateServerVersion(data)
    {
        const $update = $("[data-serverstat-update]");

        if (!$update.length || !data)
            return;

        // Do not hide or overwrite the existing UI while pending.
        if (data.updated === -1 || data.updated === undefined || data.updated === null)
            return;

        if (data.updated)
        {
            $update.hide();
            return;
        }

        $update.show();

        const version = data.arm_version_remote;

        if (version !== undefined && version !== null && version !== -1)
        {
            $update
                .find('[data-serverstat="arm_version_remote"]')
                .text(version);
        }
    },

    healthStatus(ok, label)
    {
        const $status = $("<span>")
            .addClass("server-check-status")
            .addClass(ok ? "ok" : "fail");

        $status
            .append(this.icon(ok ? "fa-circle-check" : "fa-circle-xmark"))
            .append($("<span>").text(label));

        return $status;
    },

    icon(name)
    {
        return $("<i>").addClass("fa-solid").addClass(name);
    },


    toNumber(value)
    {
        if (value === null || value === undefined || value === "")
            return null;

        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    },


    formatGb(value)
    {
        return `${Number(value).toFixed(1)} GB`;
    },


    clamp(value)
    {
        return Math.max(0, Math.min(Number(value) || 0, 100));
    },
}
