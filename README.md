Cordova Asset Compiler & Loader
================

## Introduction
Cordova Loader is a library for using Cordova with remotely served web applications. The compiler interprets the provided Cordova project directory and compiles the assets into minified, platform-specific, versioned files which are loaded into memory and stored in versioned directories for production use / bundling. When the client loads, it automatically pulls in the platform-specific file for that device. The Cordova API can be used the same as it is in the Cordova documentation. Cordova Loader was built for use with Meteor but is now available to be used by any Javascript/Node.js applcation through NPM. Enjoy!

![demo](https://raw.githubusercontent.com/andrewreedy/cordova-loader/master/screenshot.png)

*Note: Currently tested this package with iOS and Android*

## Installation / Setup

##### Requirements
* Xcode: 5.1.1
* [Cordova: 3.5](http://cordova.apache.org/)

================

##### NPM Package Installation (Node.js / Express)
````Shell
npm install cordova-loader
````

================

##### Meteor Package Installation
````Shell
mrt add cordova-loader
````

================

##### Cordova Loader Init (server)
````Javascript
  var cordovaLoader = new CordovaLoader({
    version: '0.0.1',
    mode: 'development',
    logging: true,
    platforms: ['ios', 'android'],
    path: '../cordova'
  });
````
###### Options
* version: Version of the Cordova application. This is used to sync the Cordova client with the loaded Cordova files (required in development mode).
* mode: Either production or development (default: development)
* logging: This is optional. Just trying to give some transpency into the package. (default: true)
* platforms: Array of platforms you are using  (required in development mode).
* cordovaPath: Path to your Cordova project directory (required in development mode).
* savePath: Path to save the compiled assets (default: private/cordova).
* loadPath: Path to load the compiled assets in production (default: assets/app/cordova).

*Note: If you want to manually rerun the compiler just delete the [savePath]/[version]/[platform].js file you want to recompile.*

================

##### Cordova Project Setup
The basic Cordova project setup is easy. Modify the `config.xml` file in the root of your Cordova project. Change `<content src="index.html" />` to `<content src="http://your-url-here?cordova=0.0.1" />`. Then run `cordova prepare` in the Cordova project directory. The `cordova` get variable is important to let Cordova Loader know that this is a request from a Cordova app and the version is also important in letting Cordova Loader know which version of the Cordova client to serve.

================

##### Versioning
The compiled Cordova files are saved in `[savePath]/[version]` directories. As you release new versions of your app some of the older versions of the client may still be installed on devices. Cordova Loader sends the version as a get variable in the request from the client. Cordova Loader uses this version to load the correct version of the compiled assets. Inside your app handling graceful versioning is up to you. The global variable `window.cordovaAppVersion` is avaialble to determine which version of the Cordova app the client is running and which features you can enable. It is important for you to bump the version as you release changes to the Cordova project to the app stores / production so that you have support for the older versions of your application. It would be a good idea to use an analytics platform to keep track of the version distribution and then in the client alert the users of really old apps to upgrade so that you don't have to maintain really old versions of the application.

================

##### Offline Support
As this package is just for compiling and loading Cordova assets, I will release an actual Cordova plugin which handles the graceful fallback and transition to offline mode with options. I'm already using it in my apps, but I need to clean it up a bit for release.

================

## Meteor Companion Packages

##### Appcache Extra
* [appcache-extra](http://github.com/andrewreedy/meteor-appcache-extra) - It will cache the Cordova/platform file after it is loaded once and gives you a way to handle appcache reloads with better UX.

##### Facebook Native SDK
* [accounts-facebook-cordova](https://github.com/andrewreedy/meteor-accounts-facebook-cordova) - Works with the cordova plugin to use facebook single sign on when it exists otherwise use standar oauth package.

##### Famo.us Integration
* [celestial](https://github.com/andrewreedy/meteor-celestial) - Package to make using Famo.us with Meteor easier.

================

## Contributing

If you want more features than this provides, file an issue. Feature requests/contributions are welcome.
