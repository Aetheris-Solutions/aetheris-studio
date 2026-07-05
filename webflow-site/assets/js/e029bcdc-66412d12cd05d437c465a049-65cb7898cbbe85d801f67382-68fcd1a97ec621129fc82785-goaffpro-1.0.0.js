(function () {
  "use strict";

  var loaded = false;
  var storageKey = "aetheris.analyticsConsent";

  function hasConsent() {
    try {
      return window.localStorage.getItem(storageKey) === "granted";
    } catch (error) {
      return false;
    }
  }

  function loadGoAffPro() {
    if (loaded) return;
    loaded = true;
    var goaffpro = document.createElement("script");
    goaffpro.async = true;
    goaffpro.src = "https://api.goaffpro.com/loader.js?shop=66412d12cd05d437c465a049";
    document.head.appendChild(goaffpro);
  }

  if (hasConsent()) loadGoAffPro();

  window.addEventListener("aetheris:consent", function (event) {
    if (event.detail && event.detail.analytics) loadGoAffPro();
  });
})();