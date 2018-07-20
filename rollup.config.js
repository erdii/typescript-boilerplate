import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";
import htmlTemplate from "rollup-plugin-generate-html-template";
import browsersync from "rollup-plugin-browsersync";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

const packageJSON = require("./package.json");

const licenseText = `/**
 * Copyright 2018 erdii <erdiicodes@gmail.com>
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 */`;

const options = {
	outputFolder: "dist",
	bundlePath: `dist/${packageJSON.name}.js`,
	minifiedBundlePath: `dist/${packageJSON.name}.min.js`,
	htmlTemplate: "src/template.html",
	exportedEnvPrefix: "WEBAPP_ENV_",
	webapp: process.env.WEBAPP === "true",
	IS_WATCH_MODE: process.env.ROLLUP_WATCH === "true",
};

const defaultPlugins = [
	nodeResolve({
		jsnext: true,
		main: true
	}),
	commonjs({
		// non-CommonJS modules will be ignored, but you can also
		// specifically include/exclude files
		include: 'node_modules/**',  // Default: undefined
		exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
		// these values can also be regular expressions
		// include: /node_modules/

		// search for files other than .js files (must already
		// be transpiled by a previous plugin!)
		extensions: [ '.js' ],  // Default: [ '.js' ]

		// if true then uses of `global` won't be dealt with by this plugin
		ignoreGlobal: false,  // Default: false

		// if false then skip sourceMap generation for CommonJS modules
		sourceMap: false,  // Default: true

		// explicitly specify unresolvable named exports
		// (see below for more details)
		// namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined

		// sometimes you have to leave require statements
		// unconverted. Pass an array containing the IDs
		// or a `id => boolean` function. Only use this
		// option if you know what you're doing!
		// ignore: [ 'conditional-runtime-dependency' ]
	}),

	typescript({
		typescript: require("typescript"),
	}),
];

function createBundleConfig(dest, { output, plugins }) {
	return {
		input: "./src/index.ts",
		output: {
			file: dest,
			format: "umd",
			name: packageJSON.bundleName,
			...output,
		},

		plugins,
	}
}

function getWebappEnvConfig() {
	const envVarNames = Object.keys(process.env)
		.filter(name => name.startsWith(options.exportedEnvPrefix) && name.length > options.exportedEnvPrefix.length)

	return envVarNames.reduce((map, name) => {
		map[`process.env.${name}`] = JSON.stringify(process.env[name]);
		return map;
	}, {});
}

let rollupConfig = [];

if (!options.webapp) {
	// add full bundle configuration only when we don't build a webapp
	rollupConfig.push(createBundleConfig(options.bundlePath, {
		output: {
			banner: licenseText,
		},
		plugins: defaultPlugins
	}));
}

// add minified bundle configuration
rollupConfig.push(createBundleConfig(options.minifiedBundlePath, {
	output: {
		banner: licenseText,
	},
	plugins: [
		...defaultPlugins,
		uglify(),
	],
}));

// webapp specific configuration for minified bundle
if (options.webapp) {
	const minifiedBundleConfig = rollupConfig.find(cfg => cfg.output.file === options.minifiedBundlePath);

	console.log(getWebappEnvConfig());
	minifiedBundleConfig.plugins.push(
		// inject process.env.NODE_ENV
		replace({
			...getWebappEnvConfig(),
			"process.env.NODE_ENV": options.IS_WATCH_MODE
				? JSON.stringify( "development" )
				: JSON.stringify( "production" )

		}),
		// generate a index.html file
		htmlTemplate({
			template: options.htmlTemplate,
			target: "index.html",
		}),
	);

	// if we are in watch mode
	if (options.IS_WATCH_MODE) {
		minifiedBundleConfig.plugins.push(
			// enable browsersync
			browsersync({
				server: options.outputFolder,
				serveStatic: [{
					route: ["/static"],
					dir: "static",
				}],
			}),
		)
	}
}

export default rollupConfig;
