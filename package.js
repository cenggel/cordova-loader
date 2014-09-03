Package.describe({
    summary: 'Cordova asset compiler and loader'
});

Npm.depends({
  'async': '0.9.0',
  'uglify-js': '2.4.14',
  'watch': '0.10.0',
  'node-fs': '0.1.7'
});

Package.on_use(function (api) {
    api.use([
      'log',
      'webapp',
      'underscore'
    ], 'server');
    
    api.use([
      'session'
    ], 'client');

    api.add_files('lib/server.js', 'server');
    api.add_files('lib/client.js', 'client');
    api.export('CordovaLoader');
});
