const ARM = {
    storage: {
        get(key) {
            return localStorage.getItem(key) === "true";
        },

        set(key, value) {
            localStorage.setItem(key, String(value));
        }
    },

	modal: {
		active: null,
		lastFocus: null,

        // modals
        confirm: {},
        database: {},

        // global handlers
        show(selector) {
            const modal = $(selector);

            if (!modal.length) {
                console.warn(`Modal not found: ${selector}`);
                return;
            }

            if (this.active && this.active !== selector) {
                this.hide(this.active, false);
            } else if (!this.active) {
                this.lastFocus = document.activeElement;
            }

            this.active = selector;

            modal
                .addClass("open")
                .attr("aria-hidden", "false");

            $("body").addClass("modal-open");

            modal.find(".arm-modal-dialog").trigger("focus");
        },

		hide(selector = this.active, restoreFocus = true) {
			if (!selector) {
				return;
			}

			$(selector)
				.removeClass("open")
				.attr("aria-hidden", "true");

			if (this.active !== selector) {
				return;
			}

			this.active = null;
			$("body").removeClass("modal-open");

			if (restoreFocus && this.lastFocus) {
				$(this.lastFocus).trigger("focus");
			}

			this.lastFocus = null;
		}
	}
};

$(function() {
	$(document).on("click", "[data-modal-close]", function() {
		const modal = $(this).closest(".arm-modal");

		if (modal.length) {
			ARM.modal.hide(`#${modal.attr("id")}`);
		}
	});

	$(document).on("keydown", function(e) {
		if (e.key === "Escape" && ARM.modal.active) {
			ARM.modal.hide();
		}
	});
});