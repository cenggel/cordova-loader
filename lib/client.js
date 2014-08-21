function getParameterByName(name) {
    if (Session.get("cordovaAppVersion") == null) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    } else {
      return Session.get("cordovaAppVersion")
    }
}

if (getParameterByName('cordova')) {
  var script = document.createElement('script');
  window.cordovaAppVersion = getParameterByName('cordova');
  Session.set("cordovaAppVersion", cordovaAppVersion);
  console.log("get Cordova File", cordovaAppVersion);
  script.src = '/cordova.js?version=' + cordovaAppVersion;
  document.head.appendChild(script);
}