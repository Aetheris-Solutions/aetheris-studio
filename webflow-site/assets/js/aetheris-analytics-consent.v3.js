(function () {
  "use strict";

  var googleTagId = "G-WL5GGPH5LS";
  var storageKey = "aetheris.analyticsConsent";
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
  window.gtag("js", new Date());

  function currentChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function remember(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // Consent still applies for the current page view.
    }
  }

  function loadAnalytics() {
    if (loaded || document.querySelector('script[data-aetheris-analytics="gtag"]')) return;
    loaded = true;
    var script = document.createElement("script");
    script.async = true;
    script.dataset.aetherisAnalytics = "gtag";
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(googleTagId);
    script.addEventListener("load", function () {
      window.gtag("config", googleTagId, {
        send_page_view: true
      });
    });
    document.head.appendChild(script);
  }

  function setConsent(granted) {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: granted ? "granted" : "denied"
    });
    window.dispatchEvent(new CustomEvent("aetheris:consent", {
      detail: { analytics: granted }
    }));
  }

  window.aetherisTrack = function (eventName, params) {
    if (currentChoice() !== "granted") return;
    loadAnalytics();
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
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

  function applyChoice(choice) {
    remember(choice);
    setConsent(choice === "granted");
    removeBanner();
    renderPreferencesButton();
  }

  function renderBanner(force) {
    if (!force && currentChoice()) return;
    removeBanner();

    var banner = document.createElement("section");
    banner.className = "aetheris-cookie-banner";
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML =
      '<p>We use Google Analytics and affiliate measurement to understand site performance. Choose whether to allow non-essential cookies.</p>' +
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
      loadAnalytics();
      return;
    }
    loadAnalytics();
    renderBanner(false);
  });
})();