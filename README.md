# typescript-boilerplate

Slightly opinionated typescript boilerplate for use in node AND the browser.  
You can build small webapps, libraries or servers. :)

### usage

command | description
--- | ---
`npm run watch-web` | **Webapp mode**: build the project, watch all files in *./src* and rebuild as needed, starts a server with livereloading enabled
`npm run build-web` | **Webapp mode**: build the project into the folder *./dist*
`npm run watch` | build the project, watch all files in *./src* and rebuild as needed
`npm run build` | build the project into the folder *./dist*

### folders

folder | description
--- | ---
*./src* | typescript sourcecode files - your code goes here! the app is bundled from *./src/index.ts*
*./static* | **Webapp mode**: static files that are copied into the *./dist/static* in the build step - images, stylesheets and so on go here
*./dist* | build output folder

### rollup plugins

see [here](https://github.com/rollup/rollup/wiki/Plugins)

### TODO

* better tslint rules
* NODE_ENV support or similar, for code dropping in production builds
