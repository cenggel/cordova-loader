if (/Android|BlackBerry|iPhone|iPad|iPodIEMobile/i.test(navigator.userAgent)) {
  var script = document.createElement('script');
  script.src = '/cordova.js';
  document.head.appendChild(script);
}