var fs = Npm.require('fs'),
      path = Npm.require('path'),
      async = Npm.require('async'),
      appPath = path.resolve('../../../../../'),
      cordovaProjectPath = Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.path || null,
      platforms = Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.platforms || [],
      logging = Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.logging || false,
      cordovaFiles = {
        core: {},
        plugin: {}
      };

CordovaCompiler = {

  init: function () {
    _this = this;

    Logger.addLogType('cordova', 'yellow');

    if (!logging) {
      Logger.disableLog('cordova');
    }

    Logger.log('cordova', 'Loading Cordova...');
    Logger.log('cordova', 'Enabled Platforms: ', platforms.join(', '));
    
    if (cordovaProjectPath && platforms.length) {

      alreadyBuilt = true;

      platforms.forEach(function (platform) {
        cordovaFiles.plugin[platform] = [];
        cordovaFiles.core[platform] = [];
        if (!fs.existsSync(appPath + "/public/cordova/" + platform + ".js")) {
          alreadyBuilt = false;
        }
      });

      if (!alreadyBuilt) {
        async.series([
          _this.addCoreFiles,
          _this.addPluginFiles,
          _this.packFiles
        ]);
      } else {
        Logger.log('cordova', 'Cordova files already compiled!');
      }
    }
  },

  packFiles: function (callback) {
    // console.log(cordovaFiles);

    platforms.forEach(function (platform) {
      var pack = [],
            concatFile = "";

      pack = pack.concat(cordovaFiles.core[platform]);
      pack = pack.concat(cordovaFiles.plugin[platform]);

      fs.mkdir(appPath + "/public/cordova",function(e){
        if(!e || (e && e.code === 'EEXIST')){
            
        } else {
            console.log(e);
        }
      });

      async.series([
        function (callback) {
          async.eachSeries(pack, function (file, callback) {
            fs.readFile(file, "utf8", function (err, data) {
              concatFile += data;
              callback(null, 'done');
            });
          }, 
          function () { 
            callback(null, 'done'); 
          })
        },
        function (callback) {
          fs.writeFile(appPath + "/public/cordova/" + platform + ".js", concatFile, function(err) {
              if(err) {
                  console.log(err);
              } else {
                  Logger.log('cordova', 'Cordova files compiled!');
              }
          }); 
          callback(null, 'done');
        }
      ]);

    });

    callback(null, 'done');
  },

  addCoreFiles: function (callback) {
    platforms.forEach(function (platform) {
      location = cordovaProjectPath + '/platforms/' + platform + '/www/cordova.js';
      cordovaFiles.core[platform].push(location);
      Logger.log('cordova', 'Adding ' + platform + ' corova file', location);

      location = cordovaProjectPath + '/platforms/' + platform + '/www/cordova_plugins.js';
      cordovaFiles.core[platform].push(location);
      Logger.log('cordova', 'Adding ' + platform + ' corova file', location);
    });

    callback(null, 'done');
  },

  addPluginFiles: function (callback) {

    async.each(platforms, function (platform, callback) {

      fs.readFile(cordovaProjectPath + '/platforms/' + platform + '/www/cordova_plugins.js', "utf8", function (err, data) {
        plugins = data.substring(data.indexOf("module.exports"), data.indexOf('module.exports.meta')).replace('module.exports = ', '').replace(';', '');
        plugins = JSON.parse(plugins);

        plugins.forEach(function (plugin) {
          location = cordovaProjectPath + '/platforms/' + platform + '/www/' + plugin.file;

          cordovaFiles.plugin[platform].push(location);
          Logger.log('cordova', 'Adding ' + platform + ' plugin file', location);
        });

        callback(null, 'done');

      });

    }, function () {
      callback(null, 'done');
    });

  }
}

CordovaCompiler.init();