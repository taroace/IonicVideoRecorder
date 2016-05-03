function onDeviceReady() {
   angular.element(document).ready(function () {
       var domElement = document.querySelector('body');
       angular.bootstrap(domElement, ["starter"]);
   });
    console.log("Device Ready fired!");
}

function isWebView() {
  return !(!window.cordova && !window.PhoneGap && !window.phonegap);
};

if (isWebView()) {
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
   angular.element(document.body).ready(function () {
       onDeviceReady();
  });
}