(function () {
  "use strict";

  var googleTagManagerId = "GTM-5553RFJZ";
  var storageKey = "aetheris.analyticsConsent.v2";
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

  function remember(choice) {
    sessionChoice = choice;
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // Consent still applies for the current page view.
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
      detail: { analytics: granted }
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

  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (part) {
      var name = part.split("=")[0].trim();
      if (!/^(_ga($|_)|_gid$|_gat|_clck$|_clsk$)/.test(name)) return;
      var suffix = "; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = name + "=" + suffix;
      var labels = window.location.hostname.split(".");
      while (labels.length > 1) {
        document.cookie = name + "=" + suffix + "; domain=" + labels.join(".");
        labels.shift();
      }
    });
  }

  function applyChoice(choice) {
    remember(choice);
    setConsent(choice === "granted");
    removeBanner();
    renderPreferencesButton();
    if (choice === "granted") {
      loadTagManager();
    } else {
      clearAnalyticsCookies();
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
      '<p>With your permission, we use Google Analytics and Microsoft Clarity to measure visits, create heatmaps and replay website interactions. Form contents are masked. <a href="/privacy-policy/">Privacy Policy</a> and <a href="/cookies-policy/">Cookie Policy</a>.</p>' +
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

  document.addEventListener("DOMContentLoaded", function () {
    var choice = currentChoice();
    if (choice) {
      setConsent(choice === "granted");
      renderPreferencesButton();
      if (choice === "granted") loadTagManager();
      else clearAnalyticsCookies();
      return;
    }
    clearAnalyticsCookies();
    renderBanner(false);
  });
})();