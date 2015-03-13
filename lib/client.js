function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function isCordovaApp() {
  if (getParameterByName('cordova')){
    return true;
  }
  else if (isMeteorApp() && Session.get('cordovaAppVersion')){
    return true;
  }
  return false;
}

if (isCordovaApp()) {
  var script = document.createElement('script');
  window.cordovaAppVersion = getParameterByName('cordova');
  
  if (isMeteorApp() && 
      window.cordovaAppVersion != null) {
    Session.set('cordovaAppVersion', window.cordovaAppVersion);
  } 
  else if (isMeteorApp() && 
              window.cordovaAppVersion == null &&
              Session.get('cordovaAppVersion')){
    window.cordovaAppVersion = Session.get('cordovaAppVersion');
  }

  script.src = '/cordova.js?version=' + window.cordovaAppVersion;
  document.head.appendChild(script);
}
