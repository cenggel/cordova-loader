function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if (getParameterByName('cordova')) {
  var script = document.createElement('script');
  window.cordovaAppVersion = getParameterByName('cordova');
  script.src = '/cordova.js?version=' + cordovaAppVersion;
  document.head.appendChild(script);
}