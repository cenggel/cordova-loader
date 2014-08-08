/**
 * Cordova Loader
 *
 * Cordova asset compiler and loader which manages platforms and versions for you. 
 */

/**
* NPM Dependencies
*/
if (typeof Meteor === 'undefined') {

  var 
  fs = require('node-fs'),
  path = require('path'),
  url = require('url'),
  async = require('async'),
  UglifyJS = require('uglify-js'),
  watch = require('watch');

} else {

  var 
  fs = Npm.require('node-fs'),
  path = Npm.require('path'),
  url = Npm.require('url'),
  async = Npm.require('async'),
  UglifyJS = Npm.require('uglify-js'),
  watch = Npm.require('watch');

}

/**
 * Creates an instance of CordovaLoader.
 *
 * @constructor
 * @this {CordovaLoader}
 * @param {object} options: Check documentation for options
 */      
function cl (options) {

  // CordovaLoader options
  this._options = {
    appPath: process.env.PWD,
    platforms: [],
    logging: false,
    mode: 'development',
    version: null
  };

  _.extend(this._options, options);

  // Cordova Project Path
  this._options.cordovaProjectPath = this._options.cordovaPath && path.resolve(process.env.PWD, options.cordovaPath) || null;

  // Development Save Path
  this._options.savePath = this._options.savePath && path.resolve(process.env.PWD, options.savePath) || path.join(process.env.PWD, 'private', 'cordova');

  // Production Load Path
  this._options.loadPath = this._options.loadPath && path.resolve(process.env.PWD, options.loadPath) || path.join(process.env.PWD, 'assets', 'app', 'cordova');

  // Cordova files list placeholder 
  this._cordovaFiles = {
    core: {},
    plugin: {}
  };

  // Compiled files cache placeholder
  this._compiledFiles = {};

  // List of uncompiled platforms for the current version placeholder
  this._platformsToCompile = [];

  // Init the plugin
  this._init();
}

cl.prototype.constructor = cl;

/**
* Set up the package and determine if the assets need compiled
*/
cl.prototype._init = function () {
  var self = this;

  Logger.addLogType('cordova', 'yellow');
  Logger.log('cordova', '===========================================');
  Logger.log('cordova', 'Cordova Loader started in ' + this._options.mode + ' mode.');

  if (this._options.mode == 'development') {

    Logger.log('cordova', '');
    Logger.log('cordova', 'Options:');

    // Check for version
    if (!this._options.platforms.length) {
      Logger.log('error', 'No version specified. Please refer to the settings options in the documentation.');
      return;
    } else {
      Logger.log('cordova', 'App Version', this._options.version);
    }

    // Check for Cordova project path
    if (this._options.cordovaProjectPath == null) {
      Logger.log('error', 'No Cordova project path provided. Please refer to the settings options in the documentation.');
      return;
    } else {
      Logger.log('cordova', 'Cordova Project Path:', this._options.cordovaProjectPath);
    }

    // Check for enabled platforms
    if (!this._options.platforms.length) {
      Logger.log('error', 'No platforms enabled. Please refer to the settings options in the documentation.');
      return;
    } else {
      Logger.log('cordova', 'Enabled Platforms', this._options.platforms.join(', '));
    }

    Logger.log('cordova', '');
    Logger.log('cordova', '-------------------------------------------');
    Logger.log('cordova', '');
    Logger.log('cordova', 'Checking compiled files...');

    async.each(this._options.platforms, function( platform, callback) {
      var filePath = path.join(self._options.savePath, self._options.version, platform + '.js');
             
      if (fs.existsSync(filePath)) {
        Logger.log('cordova', 'Compiled file found, remove it to recompile or bump the version number to release a new version.', filePath);
      } else {
        self._platformsToCompile.push(platform);
      }
      callback();
    }, function(err){
     if (self._platformsToCompile.length > 0) {

        Logger.log('cordova', '');
        Logger.log('cordova', '-------------------------------------------');
        Logger.log('cordova', '');
        Logger.log('cordova', 'Compiling files...');

        self._compiledFiles[self._options.version] = {};

        self._options.platforms.forEach(function (platform) {
          self._cordovaFiles.plugin[platform] = [];
          self._cordovaFiles.core[platform] = [];
        });

        async.series([
          self._addCoreFiles.bind(self),
          self._addPluginFiles.bind(self),
          self._compileFiles.bind(self)
        ]);

      } else {

        async.series([
          self._loadCompiledFiles.bind(self),
          self._serve.bind(self),
        ]);

      }
    });

  } else if (this._options.mode == 'production') {

     async.series([
      this._loadCompiledFiles.bind(this),
      this._serve.bind(this),
    ]);

  }
}

/**
 * Add the platform's core cordova files to the list to be compiled
 *
 * @param {function} callback 
 */
cl.prototype._addCoreFiles = function (callback) {
  var self = this; 

  this._platformsToCompile.forEach(function (platform) {
    var wwwPath = '',
           location;

    if (platform == 'ios') {
      wwwPath = 'www';
    } else if (platform == 'android') {
      wwwPath = 'assets/www'
    }

    location = path.join(self._options.cordovaProjectPath, 'platforms', platform, wwwPath, 'cordova.js');
    self._cordovaFiles.core[platform].push(location);
    Logger.log('cordova', 'Adding ' + platform + ' Corodva file');

    location = path.join(self._options.cordovaProjectPath, 'platforms', platform, wwwPath, 'cordova_plugins.js');
    self._cordovaFiles.core[platform].push(location);
    Logger.log('cordova', 'Adding ' + platform + ' Corodva plugin file');

  });

  callback(null, 'done');
}

/**
 * Add the platform's plugin cordova files to the list to be compiled
 *
 * @param {function} callback 
 */
cl.prototype._addPluginFiles = function (callback) {
  var self = this;

  async.each(this._platformsToCompile, function (platform, callback) {
    var wwwPath = '',
           location;

    if (platform == 'ios') {
      wwwPath = 'www';
    } else if (platform == 'android') {
      wwwPath = 'assets/www'
    }

    var pluginJsFilePath = path.join(self._options.cordovaProjectPath, 'platforms', platform, wwwPath, 'cordova_plugins.js');     

    fs.readFile(pluginJsFilePath, 'utf8', function (err, data) {
      if (err)
        Logger.log('error', 'error while reading file '+pluginJsFilePath);
      plugins = data.substring(data.indexOf('module.exports'), data.indexOf('module.exports.meta')).replace('module.exports = ', '').replace(';', '');
      plugins = JSON.parse(plugins);

      plugins.forEach(function (plugin) {
        location = path.join(self._options.cordovaProjectPath, 'platforms', platform, wwwPath, plugin.file);

        self._cordovaFiles.plugin[platform].push(location);
        Logger.log('cordova', 'Adding ' + platform + ' plugin', plugin.id);
      });

      callback(null, 'done');
    });

  }, function () {
    callback(null, 'done');
  });
};

/**
 * Concat and minify the platform specific bundles.
 *
 * @param {function} callback 
 */
cl.prototype._compileFiles = function (callback) {
  var self = this;

  Logger.log('cordova', '');
  Logger.log('cordova', '-------------------------------------------');
  Logger.log('cordova', '');
  Logger.log('cordova', 'Saving files...');

  this._platformsToCompile.forEach(function (platform) {
    var files = [],
           versionPath = path.join(self._options.savePath, self._options.version),
           savePath = path.join(versionPath, platform + '.js');

    files = files.concat(self._cordovaFiles.core[platform]).concat(self._cordovaFiles.plugin[platform]);

    self._compiledFiles[self._options.version][platform] = UglifyJS.minify(files, {}).code;

    fs.mkdir(versionPath,function(err){
      if (err && err.code != 'EEXIST') {
        Logger.log('error', err);
      }
    });

    fs.exists(savePath, function(exists) {
      if (exists) {
        Logger.log('cordova', 'File already exists, remove it to recompile or bump the version number', savePath);
      } else {
        fs.writeFile(savePath, self._compiledFiles[self._options.version][platform], function(err) {
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
};

/**
 * Load the previous version of the compiled cordova files.
 *
 * @param {function} callback 
 */
cl.prototype._loadCompiledFiles = function (callback) {
  var self = this, 
        versions = []
        filePath, stat;

  Logger.log('cordova', '');
  Logger.log('cordova', '-------------------------------------------');
  Logger.log('cordova', '');
  Logger.log('cordova', 'Loading compiled files...');

  if (this._options.mode == 'development') {
    var versionsPath = this._options.savePath;
  } else if (this._options.mode == 'production') {
    var
      appPath = path.dirname(path.resolve(process.argv[2])),
      versionsPath = this._options.loadPath;
  }

  var files = fs.readdirSync(path.join(versionsPath));

  _.each(files, function(file) {
    if (file[0] !== '.') {
      filePath = path.join(versionsPath, file);
      stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        versions.push(file);
        self._compiledFiles[file] = {};
      }
    }
  });

  Logger.log('cordova', 'Compiled versions detected', versions.join(', '));

  this._options.platforms.forEach(function (platform) {      
    _.each(versions, function(version) {

      var filePath = path.join(versionsPath, version, platform + '.js');      

      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err)
          Logger.log('error', 'error while reading file', filePath);
        else {
          Logger.log('cordova', 'Loaded compiled file into memory', 'version: ' +version + ', platform: ' + platform);
          self._compiledFiles[version][platform] = data;
        }
      });      
    });
  });

  callback(null, 'done');
};

/**
 * Serve the compiled files on /cordova.js.
 */
cl.prototype._serve = function () {
  var self = this;

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

    if (_.indexOf(self._options.platforms, platform) == -1) {
      response = '// Browser not supported';
    } else {

      version = query && query.version

      if (!version) {
        Logger.log('error', 'Client requested cordova.js without specifying a version.');
        return;
      }

      if (!self._compiledFiles[version]) {
        Logger.log('error', 'Client requested a version of Cordova which cannot be found', 'version: ' +version + ', platform: ' + platform);
        return;
      }

      response = self._compiledFiles[version][platform];

      Logger.log('cordova', 'Serving the Cordova file', 'version: ' +version + ', platform: ' + platform);
    }

    res.statusCode = 200;
    res.setHeader('Content-Length', Buffer.byteLength(response, 'utf8'));
    res.setHeader('Content-Type', 'text/javascript');
    res.write(response);
    res.end();
  });
};

/**
 * Watch the cordova plugins directory for changes and trigger a recompile.
 */
cl.prototype._watch = function () {
  var self = this;

  watch.watchTree(this._options.cordovaProjectPath + '/plugins', {ignoreDotFiles: true}, function (f, curr, prev) {
    if (typeof f == 'object' && prev === null && curr === null) {
      // Finished walking the tree
    } else {
      if (self._compiledFiles[self._options.platforms[0]]) {
        console.log('recompile');
      }             
    }
  });

  Logger.log('cordova', 'Watching Cordova project plugin directory for changes..');
}

// Export 
if (typeof Meteor === 'undefined') {
   CordovaLoader = exports = module.exports = cl;
}

CordovaLoader = cl;