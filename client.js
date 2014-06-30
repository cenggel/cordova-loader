var isMobile = {
  Android: function () {
    return /Android/i.test(navigator.userAgent);
  },
  BlackBerry: function () {
    return /BlackBerry/i.test(navigator.userAgent);
  },
  iOS: function () {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },
  Windows: function () {
    return /IEMobile/i.test(navigator.userAgent);
  }
};

var injectScript = function (url) {
  var script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
}

if (isMobile.Android()) {
  injectScript('/cordova/android.js');
} else if (isMobile.iOS()) {
  injectScript('/cordova/ios.js');
} else if (isMobile.BlackBerry()) {
  injectScript('/cordova/blackberry.js');
} else if (isMobile.Windows()) {
  injectScript('/cordova/windows.js');
}