var fs = Npm.require('fs'),
      path = Npm.require('path'),
      async = Npm.require('async'),
      UglifyJS = Npm.require('uglify-js'),
      watch = Npm.require('watch'),
      url = Npm.require('url'),
      

CordovaLoader = {

  /*
    Meteor Settings
  */
  options: {
    appPath: path.resolve('../../../../../'),
    cordovaProjectPath: Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.path && path.resolve(path.resolve('../../../../../'), Meteor.settings.cordova.path) || null,
    platforms: Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.platforms || [],
    logging: Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.logging || false,
    mode: Meteor.settings && Meteor.settings.cordova && Meteor.settings.cordova.mode || 'development',
    version: Meteor.settings && Meteor.settings.cordova && Meteor.settings.version || null
  },

  /*
    Temp Data
  */
  cordovaFiles: {
    core: {},
    plugin: {}
  },
  compiledFiles: {},
  platformsToCompile: [],

  /*
    Set up the package and determine if the assets need compiled
  */
  init: function () {
    var _this = this;

    Logger.addLogType('cordova', 'yellow');
    Logger.log('cordova', '===========================================');
    Logger.log('cordova', 'Cordova Loader started in ' + this.options.mode + ' mode.');

    if (this.options.mode == 'development') {

      Logger.log('cordova', '');
      Logger.log('cordova', 'Options:');

      // Check for version
      if (!this.options.platforms.length) {
        Logger.log('error', 'No version specified. Please refer to the settings options in the documentation.');
        return;
      } else {
        Logger.log('cordova', 'App Version', this.options.version);
      }

      // Check for Cordova project path
      if (this.options.cordovaProjectPath == null) {
        Logger.log('error', 'No Cordova project path provided. Please refer to the settings options in the documentation.');
        return;
      } else {
        Logger.log('cordova', 'Cordova Project Path:', this.options.cordovaProjectPath);
      }

      // Check for enabled platforms
      if (!this.options.platforms.length) {
        Logger.log('error', 'No platforms enabled. Please refer to the settings options in the documentation.');
        return;
      } else {
        Logger.log('cordova', 'Enabled Platforms', this.options.platforms.join(', '));
      }

      Logger.log('cordova', '');
      Logger.log('cordova', '-------------------------------------------');
      Logger.log('cordova', '');
      Logger.log('cordova', 'Checking compiled files...');

      async.each(this.options.platforms, function( platform, callback) {
        var pack = [],
               concatFile = '',
               savePath = _this.options.appPath + '/private/cordova/' + _this.options.version + '/' + platform + '.js';
               
        if (fs.existsSync(savePath)) {
          Logger.log('cordova', 'Compiled file found, remove it to overwrite or bump the version number', savePath);
        } else {
          _this.platformsToCompile.push(platform);
        }
        callback();
      }, function(err){
       if (_this.platformsToCompile.length > 0) {

          Logger.log('cordova', '');
          Logger.log('cordova', '-------------------------------------------');
          Logger.log('cordova', '');
          Logger.log('cordova', 'Compiling files...');

          _this.compiledFiles[_this.options.version] = {};

          _this.options.platforms.forEach(function (platform) {
            _this.cordovaFiles.plugin[platform] = [];
            _this.cordovaFiles.core[platform] = [];
          });

          async.series([
            _this.addCoreFiles.bind(_this),
            _this.addPluginFiles.bind(_this),
            _this.compileFiles.bind(_this),
            _this.serve.bind(_this)
          ]);

        } else {

          async.series([
            _this.loadCompiledFiles.bind(_this),
            _this.serve.bind(_this),
          ]);
    
        }
      });

    } else if (this.options.mode == 'production') {

       async.series([
        this.loadCompiledFiles.bind(this),
        this.serve.bind(this),
      ]);

    }
  },

  /*
    Watch the cordova plugins directory for changes and trigger a recompile
  */
  watch: function () {
    var _this = this;

    watch.watchTree(this.options.cordovaProjectPath + '/plugins', {ignoreDotFiles: true}, function (f, curr, prev) {
      if (typeof f == 'object' && prev === null && curr === null) {
        // Finished walking the tree
      } else {
        if (_this.compiledFiles[_this.options.platforms[0]]) {
          console.log('recompile');
        }             
      }
    });

    Logger.log('cordova', 'Watching Cordova project plugin directory for changes..');
  },

  /*
    Serve the compiled files on /cordova.js
  */
  serve: function () {
    var _this = this;

    WebApp.connectHandlers.use(function(req, res, next) {
      var url_parts = url.parse(req.url, true),
             query = url_parts.query,
             platform, response, version;

      if (req.url.split('/')[1].indexOf('cordova.js') == -1 || req.method !== 'GET') {
        next();
        return;
      }

      if (/iPhone|iPad|iPod/i.test(req.headers['user-agent'])) {
        platform = 'ios';
      } else if (/Android/i.test(req.headers['user-agent'])){
        platform = 'android';
      } else if (/BlackBerry/i.test(req.headers['user-agent'])){
        platform = 'blackberry';
      } else if (/IEMobile/i.test(req.headers['user-agent'])){
        platform = 'windows';
      }

      if (_.indexOf(_this.options.platforms, platform) == -1) {
        response = '// Browser not supported';
      } else {

        version = query && query.cordova

        console.log(query);

        if (!version) {

        }

        if (!_this.compiledFiles[version]) {
          Logger.log('error', 'Client requested a version of Cordova which cannot be found', 'version: ' +version + ', platform: ' + platform);
          return;
        }

        response = _this.compiledFiles[version][platform];

        Logger.log('cordova', 'Serving the Cordova file', 'version: ' +version + ', platform: ' + platform);
      }

      res.statusCode = 200;
      res.setHeader('Content-Length', Buffer.byteLength(response, 'utf8'));
      res.setHeader('Content-Type', 'text/javascript');
      res.write(response);
      res.end();
    });
  },

  /*
    Concat and minify the platform specific bundles
  */
  compileFiles: function (callback) {
    var _this = this;

    Logger.log('cordova', '');
    Logger.log('cordova', '-------------------------------------------');
    Logger.log('cordova', '');
    Logger.log('cordova', 'Saving files...');

    this.platformsToCompile.forEach(function (platform) {
      var pack = [],
             concatFile = '',
             savePath = _this.options.appPath + '/private/cordova/' + _this.options.version + '/' + platform + '.js';

      pack = pack.concat(_this.cordovaFiles.core[platform]);
      pack = pack.concat(_this.cordovaFiles.plugin[platform]);

      _this.compiledFiles[_this.options.version][platform] = UglifyJS.minify(pack, {}).code;

      fs.mkdir(_this.options.appPath + '/private',function(err){
        if(!err || (err && err.code === 'EEXIST')){
            
        } else {
          Logger.log('error', err);
        }
      });

      fs.mkdir(_this.options.appPath + '/private/cordova',function(err){
        if(!err || (err && err.code === 'EEXIST')){
            
        } else {
          Logger.log('error', err);
        }
      });

      fs.mkdir(_this.options.appPath + '/private/cordova/' + _this.options.version,function(err){
        if(!err || (err && err.code === 'EEXIST')){
            
        } else {
          Logger.log('error', err);
        }
      });

      fs.exists(savePath, function(exists) {
        if (exists) {
          Logger.log('cordova', 'File already exists, remove it to overwrite or bump the version number', savePath);
        } else {
          fs.writeFile(savePath, _this.compiledFiles[_this.options.version][platform], function(err) {
            if(err) {
              Logger.log('error', err);
            } else {
              Logger.log('cordova', 'Saved compiled Cordova file for production use.', savePath);
            }
          }); 
        }
      });

    });

    callback(null, 'done');
  },


  /*
    Add the platform's core cordova files to the list to be compiled
  */
  addCoreFiles: function (callback) {
    var _this = this; 

    this.platformsToCompile.forEach(function (platform) {
      var wwwPath = '',
             location;

      if (platform == 'ios') {
        wwwPath = 'www';
      } else if (platform == 'android') {
        wwwPath = 'assets/www'
      }

      location = path.join(_this.options.cordovaProjectPath, 'platforms', platform, wwwPath, 'cordova.js');
      _this.cordovaFiles.core[platform].push(location);
      Logger.log('cordova', 'Adding ' + platform + ' Corodva file');

      location = path.join(_this.options.cordovaProjectPath, 'platforms', platform, wwwPath, 'cordova_plugins.js');
      _this.cordovaFiles.core[platform].push(location);
      Logger.log('cordova', 'Adding ' + platform + ' Corodva plugin file');

    });

    callback(null, 'done');
  },

  /*
    Add the platform's plugin cordova files to the list to be compiled
  */
  addPluginFiles: function (callback) {
    var _this = this;

    async.each(this.platformsToCompile, function (platform, callback) {
      var wwwPath = '',
             location;

      if (platform == 'ios') {
        wwwPath = 'www';
      } else if (platform == 'android') {
        wwwPath = 'assets/www'
      }

      var pluginJsFilePath = path.join(_this.options.cordovaProjectPath, 'platforms', platform, wwwPath, 'cordova_plugins.js');     

      fs.readFile(pluginJsFilePath, 'utf8', function (err, data) {
        if (err)
          Logger.log('error', 'error while reading file '+pluginJsFilePath);
        plugins = data.substring(data.indexOf('module.exports'), data.indexOf('module.exports.meta')).replace('module.exports = ', '').replace(';', '');
        plugins = JSON.parse(plugins);

        plugins.forEach(function (plugin) {
          location = path.join(_this.options.cordovaProjectPath, 'platforms', platform, wwwPath, plugin.file);

          _this.cordovaFiles.plugin[platform].push(location);
          Logger.log('cordova', 'Adding ' + platform + ' plugin', plugin.id);
        });

        callback(null, 'done');
      });

    }, function () {
      callback(null, 'done');
    });

  },

  /*
    Load the previous version of the compiled cordova files
  */
  loadCompiledFiles: function (callback) {
    var _this = this, 
          versions = []
          filePath, stat;

    Logger.log('cordova', '');
    Logger.log('cordova', '-------------------------------------------');
    Logger.log('cordova', '');
    Logger.log('cordova', 'Loading compiled files...');

    if (this.options.mode == 'development') {
      var versionsPath = path.join(this.options.appPath,'private', 'cordova');
    } else if (this.options.mode == 'production') {
      var
        appPath = path.resolve(process.argv[2]),
        versionsPath = path.join(path.dirname(appPath), 'assets', 'app', 'cordova');
    }

    var files = fs.readdirSync(path.join(versionsPath));

    _.each(files, function(file) {
      if (file[0] !== '.') {
        filePath = path.join(versionsPath, file);
        stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          versions.push(file);
          _this.compiledFiles[file] = {};
        }
      }
    });

    Logger.log('cordova', 'Compiled versions detected', versions.join(', '));

    this.options.platforms.forEach(function (platform) {      
      _.each(versions, function(version) {

        var filePath = path.join(versionsPath, version, platform + '.js');      

        fs.readFile(filePath, 'utf8', function (err, data) {
          if (err)
            Logger.log('error', 'error while reading file', filePath);
          else {
            Logger.log('cordova', 'Loaded compiled file into memory', 'version: ' +version + ', platform: ' + platform);
            _this.compiledFiles[version][platform] = data;
          }
        });      
      });

    });

    callback(null, 'done');
  },

}

CordovaLoader.init();