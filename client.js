function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if (/Android|BlackBerry|iPhone|iPad|iPodIEMobile/i.test(navigator.userAgent) || true) {
  var script = document.createElement('script');
  window.cordovaAppVersion = getParameterByName('cordova');
  script.src = '/cordova.js?version=' + cordovaAppVersion;
  document.head.appendChild(script);
}