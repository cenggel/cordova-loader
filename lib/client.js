function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function isMeteorApp() {
  if (typeof Meteor == undefined || typeof Session == undefined) {
    return false;
  }
  return true
}

function isCordovaApp() {
  if (getParameterByName('cordova')){
    return true;
  }

  if (isMeteorApp() && Session.get('cordovaAppVersion')){
    return true;
  }

  return false;
}

if (isCordovaApp()) {
  var script = document.createElement('script');
  window.cordovaAppVersion = getParameterByName('cordova');
  
  if (isMeteorApp()) {
    Session.set('cordovaAppVersion', cordovaAppVersion);
  }

  alert('/cordova.js?version=' + cordovaAppVersion);
  script.src = '/cordova.js?version=' + cordovaAppVersion;
  document.head.appendChild(script);
}
