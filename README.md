Cordova Loader
================

This package aims to solve the short comings of the other meteor + cordova packages. 
Previous methods: [a comparison of approaches](http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/)

This package takes a cordova project directory and compiles the assets into platform specific javascript files in the meteor public directory. Then on the client it loads the file that corresponds to the platorm. Cordova is used just as the docs describe.

*Currently only tested with iOS. Will test the other platforms asap.*

------------------------
### Installation / Setup

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
path: Path to your cordova project directory.
platforms: Array of platforms you are using.
logging: This is optional. Just trying to give some transpency into the package.

================


##### Package Installation
````
mrt add cordova-loader
````
*I would also suggest adding the appcache package. It will cache the platform file after its loaded once as well.*

================


##### iOS Corvoa Project Setup
Set up your project how you normally would and add whatever plugins you want. For this method nothing in the www directory will get loaded. 

In your xcode project edit CDVViewController.m line: 185 to point to your meteor app:
````
self.wwwFolderName = @"http://192.168.1.6:3000";
````
 *MeteorPhonegapApp > CordovaLib.xcodeproj > Classes > Cleaver > CDVViewController.m*

================


###### Running your app with settings
````
mrt --settings settings.json
````