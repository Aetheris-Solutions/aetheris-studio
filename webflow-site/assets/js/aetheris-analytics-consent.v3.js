(function () {
  "use strict";

  var googleTagManagerId = "GTM-5553RFJZ";
  var storageKey = "aetheris.analyticsConsent.v2";
  // Advertising measurement is only offered on the campaign pages, which share this storage.
  var adsStorageKey = "aetheris.adsConsent.v1";
  // GA4 keeps Google Ads click data in _gac_ cookies, so withdrawing either choice clears them.
  var analyticsCookies = /^(_ga($|_)|_gac_|_gid$|_gat|_clck$|_clsk$)/;
  var adsCookies = /^(_gcl_|_gac_)/;
  // The choice in force on this page: made here, or read from storage when the page loaded.
  var sessionChoice = null;
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });
  function currentChoice() {
    try {
      var value = sessionChoice || window.localStorage.getItem(storageKey);
      return value === "granted" || value === "denied" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function adsGranted() {
    try {
      return window.localStorage.getItem(adsStorageKey) === "granted";
    } catch (error) {
      return false;
    }
  }

  function remember(choice) {
    sessionChoice = choice;
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // Consent still applies for the current page view.
    }
    if (choice !== "denied") return;
    // This banner never grants advertising measurement, but its Reject also withdraws it.
    try {
      window.localStorage.setItem(adsStorageKey, "denied");
    } catch (error) {
      // The advertising cookies are still cleared.
    }
  }

  function loadTagManager() {
    if (loaded || document.querySelector('script[data-aetheris-analytics="gtm"]')) return;
    loaded = true;
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });
    var script = document.createElement("script");
    script.async = true;
    script.dataset.aetherisAnalytics = "gtm";
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(googleTagManagerId);
    document.head.appendChild(script);
  }

  function setConsent(granted) {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: granted ? "granted" : "denied"
    });
    if (granted || window.clarity) {
      window.clarity = window.clarity || function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
      window.clarity("consentv2", {
        analytics_Storage: granted ? "granted" : "denied",
        ad_Storage: "denied"
      });
      if (!granted) window.clarity("stop");
    }
    window.dispatchEvent(new CustomEvent("aetheris:consent", {
      detail: { analytics: granted, ads: false }
    }));
  }

  window.aetherisTrack = function (eventName, params) {
    if (currentChoice() !== "granted") return;
    loadTagManager();
    window.gtag("event", eventName, params || {});
  };

  function removeBanner() {
    var banner = document.querySelector(".aetheris-cookie-banner");
    if (banner) banner.remove();
  }

  function renderPreferencesButton() {
    if (document.querySelector(".aetheris-cookie-preferences")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "aetheris-cookie-preferences";
    button.textContent = "Cookie preferences";
    button.addEventListener("click", function () {
      renderBanner(true);
    });
    document.body.appendChild(button);
  }

  function clearCookies(pattern) {
    document.cookie.split(";").forEach(function (part) {
      var name = part.split("=")[0].trim();
      if (!pattern.test(name)) return;
      var suffix = "; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = name + "=" + suffix;
      var labels = window.location.hostname.split(".");
      while (labels.length > 1) {
        document.cookie = name + "=" + suffix + "; domain=" + labels.join(".");
        labels.shift();
      }
    });
  }

  function clearAdsStorage() {
    clearCookies(adsCookies);
    try {
      // The Conversion Linker also keeps the ad click in local storage.
      window.localStorage.removeItem("_gcl_ls");
    } catch (error) {
      // Nothing else to clear.
    }
  }

  function applyChoice(choice) {
    remember(choice);
    setConsent(choice === "granted");
    removeBanner();
    renderPreferencesButton();
    if (choice === "granted") {
      loadTagManager();
    } else {
      clearCookies(analyticsCookies);
      clearAdsStorage();
      // Unload already-running analytics, including requests still being initialized.
      if (loaded) window.location.reload();
    }
  }

  function renderBanner(force) {
    if (!force && currentChoice()) return;
    removeBanner();

    var banner = document.createElement("section");
    banner.className = "aetheris-cookie-banner";
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML =
      '<p>With your permission, we use Google Analytics and Microsoft Clarity to measure visits, create heatmaps and replay website interactions. Form contents are masked. <a style="color:inherit;text-decoration:underline" href="/privacy-policy/">Privacy Policy</a> and <a style="color:inherit;text-decoration:underline" href="/cookies-policy/">Cookie Policy</a>.</p>' +
      '<div class="aetheris-cookie-actions">' +
      '<button type="button" class="aetheris-cookie-reject">Reject</button>' +
      '<button type="button" class="aetheris-cookie-accept">Accept</button>' +
      '</div>';

    banner.querySelector(".aetheris-cookie-reject").addEventListener("click", function () {
      applyChoice("denied");
    });
    banner.querySelector(".aetheris-cookie-accept").addEventListener("click", function () {
      applyChoice("granted");
    });
    document.body.appendChild(banner);
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || !window.aetherisTrack) return;
    var href = link.href || "";
    if (href.indexOf("cal.com/aetherisstudio") !== -1) {
      window.aetherisTrack("book_consultation_click", {
        link_url: href,
        link_text: link.textContent.trim().slice(0, 80)
      });
    }
  });

  // A page restored from the back/forward cache, or left open in another tab, keeps the choice
  // it loaded with. Re-read storage so a choice made on another page applies here too.
  function syncStoredChoice() {
    var stored;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch (error) {
      // Without storage, the page keeps the choice made on it.
      return;
    }
    if (!adsGranted()) clearAdsStorage();
    if (stored !== "granted" && stored !== "denied") stored = null;
    if (stored === sessionChoice) return;
    if (sessionChoice === "granted" && loaded) {
      // Tags that already ran under the withdrawn choice are only unloaded by a reload.
      window.location.reload();
      return;
    }
    // Cleared storage asks again on the next page load.
    if (!stored) return;
    sessionChoice = stored;
    setConsent(stored === "granted");
    removeBanner();
    renderPreferencesButton();
    if (stored === "granted") loadTagManager();
    else clearCookies(analyticsCookies);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var choice = currentChoice();
    sessionChoice = choice;
    // Keep a campaign page's advertising grant intact; without one, no ad click is kept.
    if (!adsGranted()) clearAdsStorage();
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) syncStoredChoice();
    });
    window.addEventListener("storage", function (event) {
      if (event.key === null || event.key === storageKey || event.key === adsStorageKey) syncStoredChoice();
    });
    if (choice) {
      setConsent(choice === "granted");
      renderPreferencesButton();
      if (choice === "granted") loadTagManager();
      else clearCookies(analyticsCookies);
      return;
    }
    clearCookies(analyticsCookies);
    renderBanner(false);
  });
})();