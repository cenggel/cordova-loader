var fs = Npm.require('fs'),
      path = Npm.require('path'),
      async = Npm.require('async'),
      UglifyJS = Npm.require('uglify-js'),
      watch = Npm.require('watch'),
      appPath = path.resolve('../../../../../'),
      cordovaProjectPath = Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.path || null,
      platforms = Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.platforms || [],
      logging = Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.logging || false,
      cordovaFiles = {
        core: {},
        plugin: {}
      };

CordovaCompiler = {

  /*
    Set up the package and determine if the assets need compiled
  */
  init: function () {
    _this = this;

    Logger.addLogType('cordova', 'yellow');

    if (!logging) {
      Logger.disableLog('cordova');
    }

    Logger.log('cordova', 'Starting Cordova Asset Compiler...');
    Logger.log('cordova', 'Enabled Platforms: ', platforms.join(', '));
    
    if (cordovaProjectPath && platforms.length) {

      alreadyBuilt = true;

      platforms.forEach(function (platform) {
        cordovaFiles.plugin[platform] = [];
        cordovaFiles.core[platform] = [];
        if (!fs.existsSync(appPath + '/public/cordova/' + platform + '.js')) {
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

        _this.watch();

      }
    }
  },

  /*
    Watch the cordova plugins directory for changes and trigger a recompile
  */
  watch: function () {
    watch.watchTree(cordovaProjectPath + '/plugins', {ignoreDotFiles: true}, function (f, curr, prev) {
      if (typeof f == "object" && prev === null && curr === null) {
        // Finished walking the tree
      } else {
        if (fs.existsSync(appPath + '/public/cordova/' + platforms[0] + '.js')) {
          fs.unlink(appPath + '/public/cordova/' + platforms[0] + '.js' ,function(e){
            if(!e || (e && e.code === 'EEXIST')){

            } else {
              console.log(e);
            }
          });
        }             
      }
    });

    Logger.log('cordova', 'Watching cordova project plugin directory for changes..');
  },

  /*
    Concat and minify the blatform specific bundles
  */
  packFiles: function (callback) {
    // console.log(cordovaFiles);

    platforms.forEach(function (platform) {
      var pack = [],
            concatFile = '';

      pack = pack.concat(cordovaFiles.core[platform]);
      pack = pack.concat(cordovaFiles.plugin[platform]);

      fs.mkdir(appPath + '/public/cordova',function(e){
        if(!e || (e && e.code === 'EEXIST')){
            
        } else {
            console.log(e);
        }
      });

      var minifiedFile = UglifyJS.minify(pack, {
          outSourceMap: 'cordova/' + platform + '.js.map'
      });

      fs.writeFile(appPath + '/public/cordova/' + platform + '.js', minifiedFile.code, function(err) {
          if(err) {
              console.log(err);
          } else {
              Logger.log('cordova', 'Added compiled asset to meteor project', '/public/cordova/' + platform + '.js');
          }
      }); 

      fs.writeFile(appPath + '/public/cordova/' + platform + '.js.map', minifiedFile.map, function(err) {
          if(err) {
              console.log(err);
          } else {
              Logger.log('cordova', 'Added compiled asset to meteor project', '/public/cordova/' + platform + '.js.map');
          }
      }); 

    });

    callback(null, 'done');
  },


  /*
    Add the platform's core cordova files to the list to be packed
  */
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

  /*
    Add the platform's plugin cordova files to the list to be packed
  */
  addPluginFiles: function (callback) {

    async.each(platforms, function (platform, callback) {

      fs.readFile(cordovaProjectPath + '/platforms/' + platform + '/www/cordova_plugins.js', 'utf8', function (err, data) {
        plugins = data.substring(data.indexOf('module.exports'), data.indexOf('module.exports.meta')).replace('module.exports = ', '').replace(';', '');
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