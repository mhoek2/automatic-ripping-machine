ARM.modal.database = ARM.modal.database || {};

ARM.modal.database.search = {
	modal: "#search-modal",

	get form() {
		return $(this.modal).find("#search-modal-form");
	},

	get input() {
		return $(this.modal).find("#searchquery");
	},

	get error() {
		return $(this.modal).find("#search-modal-error");
	},

	open() {
		const search = ARM.modal.database.search;

		ARM.modal.show(search.modal);
		search.input.trigger("focus");
	}
};

$(function() {
	const search = ARM.modal.database.search;

	$(document).on("click", "[data-modal='search']", function() 
	{
		ARM.modal.database.search.open();
	});

	search.form.on("submit", function(e) 
	{
		e.preventDefault();

		const query = search.input.val().trim();

		if (query.length < 3) {
			search.input.attr("aria-invalid", "true");
			search.error.prop("hidden", false);
			search.input.trigger("focus");
			return;
		}

		search.input.attr("aria-invalid", "false");
		search.error.prop("hidden", true);

		$(document).trigger("arm:database-search", [query]);
	});

	search.input.on("input", function() {
		if (search.input.val().trim().length >= 3) {
			search.input.attr("aria-invalid", "false");
			search.error.prop("hidden", true);
		}
	});

	$(document).on("arm:database-search", function(e, query) {
		const href = "json?mode=search&q=" + encodeURIComponent(query);

		$.getJSON(href, function(data) {
			switchSearch.call(this, data);

			ARM.modal.hide( search.modal );
		});
	});
});