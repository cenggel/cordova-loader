Package.describe({
    summary: "Cordova asset compiler and loader"
});

Npm.depends({
  "async": "0.9.0"
});

Package.on_use(function (api) {
    api.use('log');

    api.add_files('compiler.js', ['server']);
    api.add_files('client.js', ['client']);
});