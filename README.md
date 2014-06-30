Cordova Asset Compiler & Loader
================

This package aims to solve the short comings of the other meteor + cordova packages. 

[Previus method comparison](http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/)

![demo](http://cl.ly/image/1o1G0g2o0735/Image%202014-06-30%20at%2012.25.15%20AM.png)

This package takes a cordova project directory and compiles the assets into platform specific javascript files in the meteor public directory (public/cordova/{platform}.js). When the client loads it lazy loads the platform specific bundle. Cordova is used just as the cordova docs describe and there is no need for any wrappers.

*Note: Currently only tested with iOS. Will test the other platforms asap.*

###### Requirements: 
* xcode: 5.1.1
* cordova: 3.5

------------------------
### Installation / Setup

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
###### Options: 
* path: Path to your cordova project directory.
* platforms: Array of platforms you are using.
* logging: This is optional. Just trying to give some transpency into the package.

*Note: the compiler will only run once due to live reload loop. If you want to rerun the compiler after adding a plugin just delete any of the public/cordova/ files.*

================


##### iOS Corvoa Project Setup
Set up your project how you normally would and add whatever plugins you want. For this method nothing in the www directory will get loaded. 

In your xcode project edit CDVViewController.m line: 185 to point to your meteor app:
````
self.wwwFolderName = @"http://192.168.1.6:3000";
````
 *MeteorPhonegapApp > CordovaLib.xcodeproj > Classes > Cleaver > CDVViewController.m*

================


##### Running your app with settings
````
mrt --settings settings.json
````