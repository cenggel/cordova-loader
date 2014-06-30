Package.describe({
    summary: 'Cordova asset compiler and loader'
});

Npm.depends({
  'async': '0.9.0',
  'uglify-js': '2.4.14',
  'chokidar': '0.8.2'
});

Package.on_use(function (api) {
    api.use('log', 'server');

    api.add_files('compiler.js', ['server']);
    api.add_files('client.js', ['client']);
});