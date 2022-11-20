module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{css,png,js,ico,html,webmanifest}'
	],
	swDest: 'sw.js',
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
	  {
		urlPattern: /\.(?:css)$/,
		handler: "CacheFirst",
		options: {
		  cacheName: "styles",
		},
	  },
	],
};