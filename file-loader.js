var walk = Npm.require('walk'),
      files = [],
      plugins = [],
      rootDir = '/tower/tower-cordova/plugins',
      walker = walk.walk(rootDir, { followLinks: false });

function getExtension(filename) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    

    parsedRoot = root.replace(rootDir + '/', '').split("/");

    plugins.push(parsedRoot[0]);

    if (parsedRoot[1] != "src" && getExtension(stat.name) == '.js') {
      console.log(parsedRoot[2]);
      console.log(stat.name);
      files.push(root + '/' + stat.name);
    } 


    next();
});

console.log('Loading Cordova...');

console.log(plugins);



walker.on('end', function() {
    //console.log(files);

  _.each(_.uniq(plugins), function(plugin){
    console.log('Loading ' + plugin + '...')
  });

});