Cordova Asset Compiler & Loader
================

## Introduction

Cordova Loader's goal is to make using Meteor with Cordova as easy as using Meteor itself. The compiler interprets the provided Cordova project directory and compiles the assets into minified, platform-specific JavaScript which is stored in memory. When the client loads, it automatically pulls in the platform-specific cordova code for that device. The Cordova API can be used from Meteor the same as it is from vanilla JS apps. Enjoy!

![demo](http://cl.ly/image/29231q3f0N46/Image%202014-06-30%20at%2010.40.07%20AM.png)

This package aims to solve the shortcomings of the other meteor + cordova packages. 

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
*Note: I would also suggest adding the [appcache-extra](http://github.com/andrewreedy/meteor-appcache-extra) package. It will cache the cordova/platform file after it is loaded once and gives you a way to handle appcache reloads with better UX.*

================

##### Meteor settings file (development)
````
{
  "cordova":{
    "path": "/directory-example/cordova-project",
    "platforms": ["ios", "android"],
    "logging": true
  }
}
````
##### Meteor settings file (production)
````
{
  "cordova":{
    "mode": "production",
    "logging": true
  }
}
````

###### Options
* mode: Either production or development (default: production)
* path: Path to your Cordova project directory (required in development mode).
* platforms: Array of platforms you are using  (required in development mode).
* logging: This is optional. Just trying to give some transpency into the package. (default: true)

*Note: the compiler will only run once due to live reload loop. If you want to rerun the compiler after adding a plugin just delete any of the private/cordova/version files.*

###### Setup
The basic Cordova project setup is easy. Modify the `config.xml` file in the root of your Cordova project. Change `<content src="index.html" />` to `<content src="http://your-url-here?cordova=3.5.0" />`. The `cordova` get variable is important to let Cordova Loader know that this is a request from a cordova app and the version is also important in letting Cordova Loader know which version to serve.

###### Versioning
The compiled cordova files are saved in `private/cordova/[version]` directories. As new versions of Cordova come out some of the older versions of the client may still exist on phones Cordova Loader sends the version as a get variable in the request from the client. Cordova Loaders uses this version to load the correct version of the compiled assets.

================

#### Comparison of Meteor + Cordova methods/packages
* [Meteor + Cordova Methods](https://github.com/andrewreedy/meteor-cordova-loader/wiki/Meteor---Cordova-Methods) - Pros / Cons to the different packages / ways of combining meteor with Cordova.

#### Cordova Setup Guide
* [Cordova Setup Guide](https://github.com/andrewreedy/meteor-cordova-loader/wiki/Cordova-Setup) - Instructions on how to setup the basic Cordova project needed to get started. (coming soon).

#### Recommended Cordova Plugins
* [Cordova Plugin Guide](https://github.com/andrewreedy/meteor-cordova-loader/wiki/Cordova-Plugins) - Plugins necessary to make the Meteor app feel native. Also, an overview of optional plugins like setting up push notificaitons and geolocation.

#### Platform Setup Guides
* [iOS Setup Guide](https://github.com/andrewreedy/meteor-cordova-loader/wiki/iOS-Setup) - Detailed walkthrough of steps to setup the iOS Cordova project.
* [Android Setup Guide](https://github.com/andrewreedy/meteor-cordova-loader/wiki/Anroid-Setup) - Detailed walkthrough of steps to setup Android Cordova project. (coming soon).

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
