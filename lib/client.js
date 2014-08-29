
function haveMeteor() {
  return typeof Meteor !== "undefined" && Meteor !== null;
}

function haveMeteorSessions() {
  return (typeof Meteor !== "undefined" && Meteor !== null) && (typeof Sessions !== "undefined" && Sessions !== null);
}


function getParameterByName(name) {
  if (!haveMeteorSessions() || Session.get("cordovaAppVersion") === null) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  } else if (haveMeteorSessions()) {
    return Session.get("cordovaAppVersion") === null ? "" : Session.get("cordovaAppVersion");
  } else {
    return "";
  }
}

if (getParameterByName('cordova')) {
  var script = document.createElement('script');
  window.cordovaAppVersion = getParameterByName('cordova');
  
  if (haveMeteorSessions()) {
    Session.set("cordovaAppVersion", cordovaAppVersion);
  }

  script.src = '/cordova.js?version=' + cordovaAppVersion;
  document.head.appendChild(script);
}

