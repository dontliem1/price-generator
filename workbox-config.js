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
		handler: "CacheFirst",
		options: {
		  cacheName: "html",
		},
	  },
	  {
		urlPattern: /\.(?:js)$/,
		handler: "CacheFirst",
		options: {
		  cacheName: "scripts",
		},
	  },
	],
};