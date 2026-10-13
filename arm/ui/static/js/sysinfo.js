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

                if (data.server && typeof data.server === "object")
                    this.updateServerInfo(data);

                this.updateServerUtil(data.serverutil);
                this.updateServerStats(data);
                this.updateMemory(data.serverutil);
                this.updateStorageHealth(data.health);
                this.updateServerHealth(data.health);
                this.updateHardwareSupport(data.hw_support);
                this.updateServerVersion(data);
            })
            .fail((xhr, status, error) => {
                console.error("Failed to load server stats:", status, error);
            });
    },

    updateServerInfo(data)
    {
        $('[data-server="name"]').text(data.server.name ?? "");
        $('[data-server="description"]').text(data.server.description ?? "");
        $('[data-server="cpu"]').text(data.server.cpu ?? "");
    },

    updateServerUtil(util)
    {
        if (!util || typeof util !== "object")
            return;

        // CPU temperature
        const $cpuTemp = $('[data-serverutil="cpu_temp"]');
        const $cpuTempProgress = $('[data-progress="cpu_temp"]');

        if (util.cpu_temp !== null && util.cpu_temp !== undefined)
        {
            $cpuTemp.text(`${util.cpu_temp}°C`);

            $cpuTempProgress
                .show()
                .css("width", this.clamp(util.cpu_temp) + "%")
                .removeClass("warning danger");

            if (util.cpu_temp > 70)
                $cpuTempProgress.addClass("danger");
            else if (util.cpu_temp > 55)
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
            util.cpu_util,
            { warning: 70, danger: 80 }
        );

        // Memory usage percentage
        if (util.memory_percent !== null && util.memory_percent !== undefined)
        {
            $('[data-serverutil="memory_percent"]')
                .text(`${util.memory_percent}%`);
        }

        // Transcode storage
        this.updateStorage(
            "storage_transcode",
            util.storage_transcode_percent,
            util.storage_transcode_free
        );

        // Completed storage
        this.updateStorage(
            "storage_completed",
            util.storage_completed_percent,
            util.storage_completed_free
        );
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


    updateStorage(prefix, percentage, free) {
        this.updateProgress(`${prefix}_percent`, percentage, {
            warning: 70,
            danger: 80
        });

        const freeValue = this.toNumber(free);

        if (freeValue === null) return;

        $(`[data-serverutil="${prefix}_free"]`).text(freeValue.toFixed(1));

        this.updateStorageLegend(
            prefix.replace("storage_", ""),
            percentage,
            freeValue
        );
    },

    updateStorageLegend(prefix, percentage, free) {
        const percent = this.toNumber(percentage);

        if (percent === null || percent >= 100 || percent < 0) {
            // Free space is still known, even if total cannot be calculated.
            $(`[data-storage="${prefix}_free"]`).text(
                `${free.toFixed(1)} GB`
            );
            return;
        }

        // Percentage represents the proportion of storage used.
        const total = free / (1 - percent / 100);
        const used = total - free;

        $(`[data-storage="${prefix}_total"]`).text(
            `${total.toFixed(1)} GB`
        );

        $(`[data-storage="${prefix}_used"]`).text(
            `${used.toFixed(1)} GB`
        );

        $(`[data-storage="${prefix}_free"]`).text(
            `${free.toFixed(1)} GB`
        );
    },


    updateMemory(util)
    {
        if (!util || typeof util !== "object")
            return;

        const used = this.toNumber(util.memory_used);
        const free = this.toNumber(util.memory_free);
        const reportedTotal = this.toNumber(util.memory_total);

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

        let usedPercent = this.toNumber(util.memory_percent);

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

    updateStorageHealth(health)
    {
        // Preserve the existing UI while initialization is in progress.
        if (health === -1 || !health || typeof health !== "object")
            return;

        this.renderHealthRows(
            "[data-health-directories]",
            health.directories,
            "directory"
        );
    },

    updateServerHealth(health)
    {
        // Preserve the existing UI while initialization is in progress.
        if (health === -1 || !health || typeof health !== "object")
            return;

        const checks = [];

        $.each(health.directories || {}, (_, item) => {
            checks.push(
                Boolean(item.exists && item.readable && item.writable)
            );
        });

        $.each(health.tools || {}, (_, item) => {
            checks.push(Boolean(item.available));
        });

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

        this.renderHealthRows(
            "[data-health-tools]",
            health.tools,
            "tool"
        );
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
                raw: "Raw",
                transcode: "Transcode",
                completed: "Completed",
                logs: "Logs",
                handbrake: "HandBrake",
                makemkv: "MakeMKV"
            };

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

            if (type === "directory")
            {
                [
                    ["exists", "Exists"],
                    ["readable", "Read"],
                    ["writable", "Write"]
                ].forEach(([key, text]) => {
                    const ok = Boolean(item[key]);

                    const $check = $("<span>")
                        .addClass(ok ? "ok" : "fail");

                    $check
                        .append(this.icon(ok ? "fa-circle-check" : "fa-circle-xmark"))
                        .append(" " + text);

                    $status.append($check);
                });
            }
            else if (type === "tool")
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

    updateHardwareSupport(hw)
    {
        if (!hw || hw === -1 || typeof hw !== "object")
            return;

        const hardware = {
            intel: "Intel Quick Sync",
            nvidia: "NVIDIA NVENC",
            amd: "AMD VCN"
        };

        Object.keys(hardware).forEach(type => {
            const $row = $(`[data-hw-support="${type}"]`);

            if (!$row.length || hw[type] === undefined || hw[type] === null)
                return;

            const supported = Boolean(hw[type]);
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
        if (data.updated === -1 ||
            data.updated === undefined ||
            data.updated === null)
        {
            return;
        }

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
