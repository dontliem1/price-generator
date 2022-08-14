module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{js,html,ico}'
	],
	swDest: './sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	runtimeCaching: [
	  {
		urlPattern: /\.(?:html)$/,
		handler: "NetworkFirst",
		options: {
		  cacheName: "html",
		},
	  },
	  {
		urlPattern: /\.(?:js)$/,
		handler: "NetworkFirst",
		options: {
		  cacheName: "scripts",
		},
	  },
	],
};