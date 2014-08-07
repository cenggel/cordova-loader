Cordova Asset Compiler & Loader
================

## Introduction

Cordova Loader's goal is to make using Meteor with Cordova as easy as using Meteor itself. The compiler interprets the provided Cordova project directory and compiles the assets into minified, platform-specific JavaScript which is stored in memory. When the client loads, it automatically pulls in the platform-specific Cordova code for that device. The Cordova API can be used from Meteor the same as it is from vanilla JS apps. Enjoy!

![demo](http://cl.ly/image/29231q3f0N46/Image%202014-06-30%20at%2010.40.07%20AM.png)

*Note: Currently tested this package with iOS and Android*


## Installation / Setup

##### Requirements
* Xcode: 5.1.1
* [Cordova: 3.5](http://cordova.apache.org/)

================

##### Package Installation
````
mrt add cordova-loader
````
*Note: I would also suggest adding the [appcache-extra](http://github.com/andrewreedy/meteor-appcache-extra) package. It will cache the Cordova/platform file after it is loaded once and gives you a way to handle appcache reloads with better UX.*

================

##### Development
Meteor settings file:
````
{
  "app_name": "Sample App",
  "version": "0.0.1",
  "cordova":{
    "path": "../cordova-project",
    "platforms": ["ios", "android"],
    "logging": true
  }
}
````
*How to run:*
````
mrt --settings settings.json
````

##### Production
Meteor settings file:
````
{
  "app_name": "Sample App",
  "version": "0.0.1",
  "cordova":{
    "mode": "production",
    "logging": true
  }
}
````
*How to run: (assuming you ran `mrt bundle --directory ../build/bundle`*
```
METEOR_SETTINGS=$(cat config/production.json) 
ROOT_URL=localhost:3000 
PORT=3000 
node ../build/bundle/main.js
```

###### Options
* app_name: Optional application name used by the logger
* version: Version of the Cordova application. This is used to sync the Cordova client with the loaded Cordova files (required in development mode).
* mode: Either production or development (default: development)
* path: Path to your Cordova project directory (required in development mode).
* platforms: Array of platforms you are using  (required in development mode).
* logging: This is optional. Just trying to give some transpency into the package. (default: true)

*Note: If you want to manually rerun the compiler just delete the private/cordova/[version]/[platform].js file you want to recompile.*

##### Cordova Project Setup
The basic Cordova project setup is easy. Modify the `config.xml` file in the root of your Cordova project. Change `<content src="index.html" />` to `<content src="http://your-url-here?cordova=0.0.1" />`. Then run `cordova prepare` in the Cordova project directory. The `cordova` get variable is important to let Cordova Loader know that this is a request from a Cordova app and the version is also important in letting Cordova Loader know which version of the Cordova client to serve.

================

##### Versioning
The compiled Cordova files are saved in `private/cordova/[version]` directories. As you release new versions of your app some of the older versions of the client may still be installed on devices. Cordova Loader sends the version as a get variable in the request from the client. Cordova Loader uses this version to load the correct version of the compiled assets. Inside the Meteor app handling graceful versioning is up to you. The global variable `window.cordovaAppVersion` is avaialble to determine which version of the Cordova app the client is running and which features you can enable. It is important for you to bump the version as you release changes to the Cordova project to the app stores / production so that you have support for the older versions of your application. It would be a good idea to use an analytics platform to keep track of the version distribution and then in the client alert the users of really old apps to upgrade so that you don't have to maintain really old versions of the application.

##### Offline Support
As this package is just for compiling and loading Cordova assets, I will release an actual Cordova plugin which handles the graceful fallback and transition to offline mode with options. I'm already using it in my apps, but I need to clean it up a bit for release.

================

#### Comparison of Meteor + Cordova methods/packages
* [Meteor + Cordova Methods](https://github.com/andrewreedy/meteor-cordova-loader/wiki/Meteor---Cordova-Methods) - Pros / Cons to the different packages / ways of combining meteor with Cordova.

#### Facebook Native SDK
* [accounts-facebook-cordova](https://github.com/andrewreedy/meteor-accounts-facebook-cordova) - Works with the cordova plugin to use facebook single sign on when it exists otherwise use standar oauth package.

#### Famo.us Integration
* [celestial](https://github.com/andrewreedy/meteor-celestial) - Package to make using Famo.us with Meteor easier.

#### Example Apps
* [Meteor Cordova Todo](https://github.com/andrewreedy/meteor-cordova-todo) - Just started working on this. This will eventually be a working app as an example.

## Final Notes

##### Running your app with settings
````
mrt --settings settings.json
````
================

If you want more features than this provides, file an issue. Feature requests/contributions are welcome.
