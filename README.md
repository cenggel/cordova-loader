Cordova Asset Compiler & Loader
================

## Introduction

Cordova Loader's goal is to make using Meteor with Cordova as easy as using Meteor itself. The compiler interprets the provided Cordova project directory and compiles the assets into minified, platform-specific JavaScript files that are placed in the Meteor `/public` directory. When the client loads, it automatically pulls in the platform-specific file for that device. The Cordova API can be used from Meteor the same as it is from vanilla JS apps. Enjoy!

![demo](http://cl.ly/image/1o1G0g2o0735/Image%202014-06-30%20at%2012.25.15%20AM.png)

This package aims to solve the shortcomings of the other meteor + cordova packages. 

*Note: Currently only tested with iOS. Will test the other platforms asap.*

================

###### Comparison with methods described [here](http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/)

* Lazy Loading (cordova-phonegap): Hard to manage all of the Cordova dependencies / Unfinished / Outdated
* Hijack (meteor-rider): Slow initial load / Can't use appcache / Issues with plugins.
* iFrame (meteor-cordova): iFrames generally are a pain including slow performance in native apps, glitchy scrolling, and having to wrap Cordova
* Cordova Loader: 
  * Manages assets for you
  * Fast loading
  * Compatible with appcache
  * Compatible with Cordova plugins
  * No need for wrapper around Cordova
  * Minifies platform specific bundles
  * Automatically lazy loads platform specific bundles in client
  * Watches Cordova project plugin directory for changes

================

## Installation / Setup

##### Requirements
* Xcode: 5.1.1
* Cordova: 3.5

================

##### Package Installation
````
mrt add cordova-loader
````
*Note: I would also suggest adding the appcache package. It will cache the cordova/platform file after it is loaded once as well.*

================

##### Meteor settings file (settings.json)
````
{
  "cordova":{
    "path": "/directory-example/cordova-project",
    "platforms": ["ios"],
    "logging": true
  }
}
````
###### Options
* path: Path to your Cordova project directory.
* platforms: Array of platforms you are using.
* logging: This is optional. Just trying to give some transpency into the package.

*Note: the compiler will only run once due to live reload loop. If you want to rerun the compiler after adding a plugin just delete any of the public/cordova/ files.*

================

##### iOS Cordova Project Setup
Set up your project how you normally would and add whatever plugins you want. For this method nothing in the `/www` directory will get loaded. 

In your Xcode project, edit CDVViewController.m line: 185 to point to your Meteor app:
````
self.wwwFolderName = @"http://192.168.1.6:3000";
````
 *MeteorPhonegapApp > CordovaLib.xcodeproj > Classes > Cleaver > CDVViewController.m*

###### Other iOS Suggestions

Add the follwing Cordova plugins:
* org.apache.cordova.splashscreen

Add the following settings to your cordova-project/config.xml
````xml
<feature name="SplashScreen">
    <param name="ios-package" value="CDVSplashScreen"/>
    <param name="onload" value="true" />
</feature>
<preference name="webviewbounce" value="false" />
<preference name="DisableDoubleTapToFocus" value="false"/>
<preference name="DisallowOverscroll" value="true"/>
<preference name="UIWebViewBounce" value="false"/>
<preference name="AutoHideSplashScreen" value="false" />
````
*Note: I'll create an example iOS app soon. Also, I'm going to create a seperate Cordova package for handling connection drops, overscroll styling issue, and native oAuth.. Stay tuned!*

================

##### Running your app with settings
````
mrt --settings settings.json
````
================

If you want more features than this provides, file an issue. Feature requests/contributions are welcome.
