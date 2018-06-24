import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";
import htmlTemplate from "rollup-plugin-generate-html-template";
import browsersync from "rollup-plugin-browsersync";
import replace from "rollup-plugin-replace";

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
