var fs = Npm.require('fs'),
      xml2js = Npm.require('xml2js'),
      path = Npm.require('path'),
      async = Npm.require('async'),
      cordovaFiles = {
        core: {},
        plugin: {all: []}
      },
      cordovaProjectPath = '/tower/tower-cordova',
      appPath = path.resolve('../../../../../'),
      packagePath = path.resolve('../../../../../packages/cordova'),
      platforms = ['ios', 'android'],
      parser = new xml2js.Parser();

function getExtension (filename) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

CordovaLoader = {

  init: function () {
    _this = this;

    Logger.addLogType('cordova', 'yellow');
    Logger.log('cordova', 'Loading Cordova...');
    Logger.log('cordova', 'Enabled Platforms: ', platforms.join(', '));
    Logger.enableLog('debug');

    platforms.forEach(function (platform) {
      cordovaFiles.plugin[platform] = [];
    });

    async.series([
      _this.addCoreFiles,
      _this.addPluginFiles,
      _this.packFiles
    ]);
  },

  packFiles: function (callback) {
    //console.log(cordovaFiles);

    platforms.forEach(function (platform) {
      var pack = [],
            concatFile = "";

      pack = pack.concat(cordovaFiles.plugin.all);
      pack = pack.concat(cordovaFiles.plugin[platform]);
      pack.push(cordovaFiles.core[platform]);

      fs.mkdir(appPath + "/public/cordova",function(e){
        if(!e || (e && e.code === 'EEXIST')){
            
        } else {
            //debug
            console.log(e);
        }
      });

      async.series([
        function (callback) {
          async.eachSeries(pack, function (file, callback) {
            fs.readFile(file, "utf8", function (err, data) {
              //console.log(data);
              concatFile += data;
              callback(null, 'done');
            })
          }, 
          function () { 
            callback(null, 'done'); 
          })
        },
        function (callback) {
          // fs.writeFile(appPath + "/public/cordova/" + platform + ".js", concatFile, function(err) {
          //     if(err) {
          //         console.log(err);
          //     } else {
          //         console.log("The file was saved!");
          //     }
          // }); 
          callback(null, 'done');
        }
      ]);

      //console.log(pack);
    });

    callback(null, 'done');
  },

  addCoreFiles: function (callback) {
    var jsLocations = {
      ios: "CordovaLib/cordova.js",
      android: "framework/assets/www/cordova.js"
    }

    platforms.forEach(function (platform) {
      location = packagePath + '/cordova-' + platform + '/' + jsLocations[platform];

      cordovaFiles.core[platform] = location;

      Logger.log('cordova', 'Adding ' + platform + ' corova file', location);
    });

    callback(null, 'done');
  },


  addPluginFiles: function (callback) {
    _this = this;
    fs.readdir(cordovaProjectPath + "/plugins", function (err, files) {
      if (err) throw err;

      async.each(files, function (file, callback) {

        if (getExtension(file) != ".json" && file != ".DS_Store") {

          Logger.log('cordova', 'Loading plugin', file);

          fs.readFile(cordovaProjectPath + "/plugins/" + file + "/plugin.xml", 'utf-8', function (err, data) {
            if (err) throw err;

            parser.parseString(data, function (err, result) {

              if (result.plugin['js-module']) {
                result.plugin['js-module'].forEach(function (jsModule) {
                  jsModule = cordovaProjectPath + '/plugins/' + file + '/' + jsModule['$'].src;
                  cordovaFiles.plugin.all.push(jsModule);
                  Logger.log('cordova', 'Adding cross-platform plugin file', jsModule);
                });
              }

              result.plugin.platform.forEach(function (platform) {
                if (_.contains(platforms, platform['$'].name)) {

                  if (platform['js-module']) {
                    platform['js-module'].forEach(function (jsModule) {
                      jsModule = cordovaProjectPath + '/plugins/' + file + '/' + jsModule['$'].src;
                      cordovaFiles.plugin[platform['$'].name].push(jsModule);
                      Logger.log('cordova', 'Adding ' + platform['$'].name + ' plugin file', jsModule);
                    });
                  }
                }
              });

              callback(null, 'done');
            });
          });
        } else {
          callback(null, 'done');
        }
      }, 
      function () {
        callback(null, 'done');
      });
    });
  }
}

CordovaLoader.init();