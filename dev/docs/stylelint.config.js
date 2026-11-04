
module.exports = {
	extends: 'stylelint-config-standard',
	ignoreFiles: [
		'arm/ui/static/css/fontawesome.1.7.1.all.min.css',
	],
	rules: {
		"color-no-invalid-hex": true,
		"no-empty-source": null,
		"rule-empty-line-before": null,
        "declaration-block-no-redundant-longhand-properties": null,
		"selector-class-pattern": [
			"^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",
			{
				"message": "[%s] class should use hyphen delimiter: -"
			}
		], // Kebab case for classes
		"selector-id-pattern": [
			"^([a-z][a-z0-9]*)(_[a-z0-9]+)*$",
			{
				"message": "[%s] id should use underscore delimiter: _"
			}
		], // Snake case for IDs
		"property-no-unknown": true,
	}
};
