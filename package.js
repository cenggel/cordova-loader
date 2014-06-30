Package.describe({
    summary: "Cordova native APIs packaged for meteor"
});

Npm.depends({
  "walk": "2.3.3",
  "xml2js": "0.4.4",
  "async": "0.9.0"
});


Package.on_use(function (api) {
    api.use('underscore');
    api.use('log');

    api.add_files('loader.js', ['server']);
});