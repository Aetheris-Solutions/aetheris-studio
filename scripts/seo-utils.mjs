import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const GOOGLE_TAG_MANAGER_ID = "GTM-5553RFJZ";
const LASTMOD = "2026-07-05";
const OG_IMAGE = "/assets/images/244ad641-67122c0e2d36c11d0806b837_Ser-Altar_Background.jpg";
const LOGO = "/assets/images/9ab8314c-66426e5584a7001b62e145b5_Agency-Logo_Extended-Small_White.svg";
const CONSENT_SCRIPT = "aetheris-analytics-consent.v3.js";
function versionedAppearanceAsset(asset) {
  const bytes = readFileSync(new URL(`../webflow-site${asset}`, import.meta.url));
  return `${asset}?v=${createHash("sha256").update(bytes).digest("hex").slice(0, 10)}`;
}
function appearanceHead() {
  return `<link data-studio-appearance rel="stylesheet" href="${versionedAppearanceAsset('/assets/css/studio-motion.css')}"/><script data-studio-appearance src="${versionedAppearanceAsset('/assets/js/studio-motion.js')}" defer></script>`;
}
// /assets/* is served immutable and Pages deploys don't purge the edge cache, so the
// query string is a hash of the script: every content change gets a never-cached URL.
// Never request a new URL on production before the deploy, or the edge caches the old file under it.
function consentScriptSrc() {
  const version = createHash("sha256").update(analyticsConsentScript()).digest("hex").slice(0, 10);
  return `/assets/js/${CONSENT_SCRIPT}?v=${version}`;
}
// The GoAffPro affiliate program is closed: its Webflow app script is stripped and deleted on every run.
const RETIRED_GOAFFPRO_SCRIPT =
  "e029bcdc-66412d12cd05d437c465a049-65cb7898cbbe85d801f67382-68fcd1a97ec621129fc82785-goaffpro-1.0.0.js";
// Standalone lead-generation landing: noindex, not in the sitemap, not linked from the site.
const CAMPAIGN_LANDING_ROUTE = "/ecommerce-growth-audit";

const pages = [
  {
    route: "/",
    output: "index.html",
    title: "eCommerce Growth Partner - Aetheris Studio",
    description:
      "Aetheris Studio helps eCommerce brands build websites, operations, logistics, marketing, analytics, and integrations that scale online growth.",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    route: "/services",
    output: "services/index.html",
    title: "eCommerce Services - Aetheris Studio",
    description:
      "Explore Aetheris Studio services for web design, digital marketing, logistics, integrations, store management, customer service, analytics, and omnichannel.",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    route: "/portfolio",
    output: "portfolio/index.html",
    title: "eCommerce Case Studies - Aetheris Studio",
    description:
      "See Aetheris Studio eCommerce work across jewelry, design, fashion, marketplaces, Shopify migrations, operations, and international growth projects.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    route: "/contact",
    output: "contact/index.html",
    title: "Contact Aetheris Studio",
    description:
      "Contact Aetheris Studio to discuss your eCommerce website, marketing, logistics, systems integration, analytics, customer service, or omnichannel project.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    route: "/privacy-policy",
    output: "privacy-policy/index.html",
    title: "Privacy Policy - Aetheris Studio",
    description:
      "Read the Aetheris Studio privacy policy covering personal data, business information, technical data, service providers, security, retention, and rights.",
    priority: "0.3",
    changefreq: "yearly",
  },
  {
    route: "/cookies-policy",
    output: "cookies-policy/index.html",
    title: "Cookies Policy - Aetheris Studio",
    description:
      "Read the Aetheris Studio cookies policy covering necessary, performance, functional, analytics, and advertising cookies plus preference management.",
    priority: "0.3",
    changefreq: "yearly",
  },
];

const managedMetaSelectors = [
  'name="description"',
  'name="keywords"',
  'name="robots"',
  'name="theme-color"',
  'property="og:title"',
  'property="og:description"',
  'property="og:type"',
  'property="og:url"',
  'property="og:image"',
  'property="og:image:width"',
  'property="og:image:height"',
  'property="og:site_name"',
  'property="og:locale"',
  'name="twitter:card"',
  'name="twitter:title"',
  'name="twitter:description"',
  'name="twitter:image"',
];

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function canonicalFor(origin, route) {
  return `${origin}${route === "/" ? "/" : `${route}/`}`;
}

function absoluteAsset(origin, assetPath) {
  return `${origin}${assetPath}`;
}

function organizationSchema(origin) {
  return {
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: "Aetheris Studio",
    legalName: "Aetheris Solutions S.r.l.",
    url: `${origin}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteAsset(origin, LOGO),
    },
    image: absoluteAsset(origin, OG_IMAGE),
    taxID: "14468170965",
    email: "info@aetherisstudio.com",
    telephone: "+39 345 215 2653",
    description:
      "Aetheris Studio is a 360-degree eCommerce agency for websites, digital marketing, logistics, systems integrations, store operations, customer service, data analytics, and omnichannel growth.",
    sameAs: [
      "https://www.linkedin.com/company/aetherisstudio",
      "https://www.instagram.com/aetherisstudio/",
      "https://cal.com/aetherisstudio",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "info@aetherisstudio.com",
      telephone: "+39 345 215 2653",
      url: `${origin}/contact/`,
    },
  };
}

function webSiteSchema(origin) {
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "Aetheris Studio",
    url: `${origin}/`,
    publisher: { "@id": `${origin}/#organization` },
    inLanguage: "en",
  };
}

function breadcrumbSchema(origin, page) {
  if (page.route === "/") return null;
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalFor(origin, page.route)}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title.replace(" - Aetheris Studio", ""),
        item: canonicalFor(origin, page.route),
      },
    ],
  };
}

function pageSchema(origin, page) {
  const canonical = canonicalFor(origin, page.route);
  const base = {
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#organization` },
    inLanguage: "en",
    dateModified: LASTMOD,
  };

  if (page.route === "/services") {
    return {
      "@type": "Service",
      ...base,
      provider: { "@id": `${origin}/#organization` },
      serviceType: "eCommerce services",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Aetheris Studio eCommerce services",
        itemListElement: [
          "Web Design & Creation",
          "Digital Marketing",
          "Logistics & Distribution",
          "Systems Integrations",
          "Store Management",
          "Customer Service",
          "Data Analytics",
          "Omnichannel",
        ].map((name) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name,
          },
        })),
      },
    };
  }

  if (page.route === "/portfolio") {
    return {
      "@type": "CollectionPage",
      ...base,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          "Cielo 1914",
          "A'mmare",
          "Bluvanilia",
          "Mr. Wonder S. Mile",
          "Appcycled",
          "Ser Altar",
          "Swlag",
        ].map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
        })),
      },
    };
  }

  if (page.route === "/contact") {
    return {
      "@type": "ContactPage",
      ...base,
      mainEntity: { "@id": `${origin}/#organization` },
    };
  }

  return {
    "@type": "WebPage",
    ...base,
  };
}

function schemaFor(origin, page) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(origin),
      webSiteSchema(origin),
      pageSchema(origin, page),
      breadcrumbSchema(origin, page),
    ].filter(Boolean),
  };
}

function managedHead(origin, page) {
  const canonical = canonicalFor(origin, page.route);
  const image = absoluteAsset(origin, OG_IMAGE);
  const jsonLd = JSON.stringify(schemaFor(origin, page)).replaceAll("<", "\\u003c");

  return [
    `<title>${escapeAttribute(page.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(page.description)}"/>`,
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>',
    '<meta name="theme-color" content="#050505"/>',
    `<link rel="canonical" href="${escapeAttribute(canonical)}"/>`,
    `<meta property="og:title" content="${escapeAttribute(page.title)}"/>`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}"/>`,
    '<meta property="og:type" content="website"/>',
    `<meta property="og:url" content="${escapeAttribute(canonical)}"/>`,
    `<meta property="og:image" content="${escapeAttribute(image)}"/>`,
    '<meta property="og:image:width" content="1080"/>',
    '<meta property="og:image:height" content="1080"/>',
    '<meta property="og:site_name" content="Aetheris Studio"/>',
    '<meta property="og:locale" content="en_US"/>',
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<meta name="twitter:title" content="${escapeAttribute(page.title)}"/>`,
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}"/>`,
    `<meta name="twitter:image" content="${escapeAttribute(image)}"/>`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    `<script src="${consentScriptSrc()}" type="text/javascript" defer></script>`,
  ].join("");
}

function stripManagedHead(html) {
  let next = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  for (const selector of managedMetaSelectors) {
    next = next.replace(new RegExp(`<meta\\b(?=[^>]*${selector})[^>]*>`, "gi"), "");
  }
  next = next
    .replace(/<link data-studio-appearance[^>]*\/>/gi, "")
    .replace(/<script data-studio-appearance[^>]*><\/script>/gi, "")
    .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi, "")
    .replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(
      /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+"><\/script>/gi,
      "",
    )
    .replace(
      /<script type="text\/javascript">window\.dataLayer = window\.dataLayer \|\| \[\];function gtag\(\)\{dataLayer\.push\(arguments\);\}[\s\S]*?<\/script>/gi,
      "",
    )
    .replace(
      /<script src="\/assets\/js\/(?:analytics-consent|aetheris-analytics-consent\.v[0-9]+)\.js(?:\?v=[^"]+)?" type="text\/javascript" defer><\/script>/gi,
      "",
    )
    .replace(/<script\b[^>]*\bsrc="[^"]*goaffpro[^"]*"[^>]*><\/script>/gi, "")
    .replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/gi, "")
    .replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/gi, "");
  return next;
}

function injectHead(html, origin, page) {
  const stripped = stripManagedHead(html);
  return stripped.replace(
    /(<meta charset="utf-8"\/?>)/i,
    `$1${managedHead(origin, page)}`,
  ).replace(/href="\/assets\/css\/site\.css(?:\?v=[^"]+)?"/g,
    `href="${versionedAppearanceAsset('/assets/css/site.css')}"`)
    .replace('</head>', `${appearanceHead()}</head>`);
}

function normalizeInternalLinks(html) {
  let next = html;
  for (const page of pages) {
    if (page.route === "/") continue;
    next = next.replaceAll(`href="${page.route}"`, `href="${page.route}/"`);
  }
  return next;
}

function normalizeHeadings(html, route) {
  let next = html;

  if (route === "/") {
    next = next.replace(
      /<div class="text-block-10">eCommerce, made easy<\/div>/,
      '<h1 class="text-block-10">eCommerce, made easy</h1>',
    );
    next = next
      .replace(/<h1 class="section-heading fancy-small">([\s\S]*?)<\/h1>/g, '<h2 class="section-heading fancy-small">$1</h2>')
      .replace(/<h1 class="heading-2">([\s\S]*?)<\/h1>/g, '<h2 class="heading-2">$1</h2>')
      .replace(/<h1 class="stage-heading">([\s\S]*?)<\/h1>/g, '<h3 class="stage-heading">$1</h3>');
  }

  if (route === "/portfolio") {
    next = next.replace(
      /<h1 class="project-name-preview">([\s\S]*?)<\/h1>/g,
      '<h2 class="project-name-preview">$1</h2>',
    );
  }

  if (route === "/contact") {
    next = next
      .replace(/<h1 class="heading-10">([\s\S]*?)<\/h1>/g, '<h2 class="heading-10">$1</h2>')
      .replace(/<h1 class="section-heading fancy-small">([\s\S]*?)<\/h1>/g, '<h2 class="section-heading fancy-small">$1</h2>');
  }

  return next;
}

// Advertising measurement exists only on the campaign pages; the copy never names them by URL.
function updateCookiePolicy(html, route) {
  if (!["/cookies-policy", "/privacy-policy"].includes(route)) return html;
  const paragraph = (margin, text) => `<p style="font-size:16px;line-height:1.6;margin:${margin}">${text}</p>`;
  const disclosure =
    '<section id="analytics-privacy-disclosure" style="margin:24px 0;padding:20px 0;border-bottom:1px solid #ccc">' +
    '<h2 style="font-size:22px;line-height:1.3;margin:0 0 12px">Optional analytics and advertising measurement</h2>' +
    paragraph(
      "0 0 12px",
      "<strong>Analytics.</strong> We load Google Analytics and Microsoft Clarity only after you allow analytics (Accept, or Accept all or the Analytics setting on our campaign pages), to understand visits and interactions, produce heatmaps and session replays, and improve this website. Form contents are masked. Analytics cookies, including Google Analytics _ga cookies and Clarity _clck and _clsk cookies, may be used after you allow analytics. When you send an enquiry from a campaign page, Google Analytics also records it as a lead, with the annual revenue range you selected.",
    ) +
    paragraph(
      "0 0 12px",
      "<strong>Advertising measurement (campaign pages only).</strong> Our campaign pages offer a separate Advertising measurement choice, which stays off unless you turn it on or select Accept all. It lets Google Ads measure whether our ads lead to audit requests. Google Ads may set cookies such as _gcl_au and _gcl_aw and keep the ad click in this browser’s local storage; when you submit an enquiry, the ad click identifier and a conversion event (a random reference and, possibly, an estimated value based on your revenue range) are shared with Google. Apart from that revenue range, nothing you enter in our forms is sent to Google. We never use your data for ad personalisation or remarketing.",
    ) +
    paragraph(
      "0",
      '<strong>Your choices.</strong> You can reject or withdraw consent at any time using Cookie preferences (Cookie settings on campaign pages). Reject or Reject all on any of our pages also withdraws advertising measurement. Withdrawing stops collection, clears these first-party cookies and the stored ad click, and reloads the page. Your choices are stored on this device. See <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and <a href="https://privacy.microsoft.com/privacystatement">Microsoft Privacy Statement</a> for provider data practices.',
    ) +
    "</section>";
  html = html.replace(/<section id="analytics-privacy-disclosure"[^>]*>[\s\S]*?<\/section>/g, "");
  html = html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, "$1" + disclosure);
  if (route !== "/cookies-policy") return html;
  const replacement =
    "$1<br/>- <strong>Cookie Preferences:</strong> You can use the Cookie preferences control on this website (Cookie settings on our campaign pages) to accept or reject optional analytics (Google Analytics and Microsoft Clarity) and, on our campaign pages, Google Ads advertising measurement. Both stay off until you accept them.<br/><br/>Please note";
  // Drop the bullet written by an earlier run so a wording change replaces it.
  html = html.replace(/<br\/>- <strong>Cookie Preferences:<\/strong>[^<]*/g, "");
  // Anchored on the Opt-out Tools bullet, whatever its wording, so the bullet is added exactly once.
  return html.replace(/(- <strong>Opt-out Tools:<\/strong>[^<]*)<br\/><br\/>Please note/, replacement);
}

function improveAltText(html) {
  return html
    .replaceAll('alt="" class="logo"', 'alt="Aetheris Studio" class="logo"')
    .replace(
      /(<img src="\/assets\/images\/27d05780-6655b3f02826f89070b4ea93_linkedin\.svg"[^>]*?) alt=""/g,
      '$1 alt="Aetheris Studio on LinkedIn"',
    )
    .replace(
      /(<img src="\/assets\/images\/4d4ca178-6655b2bcd1565fad3c4aa992_1384031\.svg"[^>]*?) alt=""/g,
      '$1 alt="Aetheris Studio on Instagram"',
    )
    .replaceAll('alt="" class="client-logo"', 'alt="Client logo" class="client-logo"');
}

function applyPageSeo(html, origin, page) {
  html = html.replace(/<form(?![^>]*data-clarity-mask)(?=[\s>])/g, '<form data-clarity-mask="true"');
  return updateCookiePolicy(
    normalizeInternalLinks(
      improveAltText(normalizeHeadings(injectHead(html, origin, page), page.route)),
    ),
    page.route,
  );
}

function analyticsConsentScript() {
  return `(function () {
  "use strict";

  var googleTagManagerId = "${GOOGLE_TAG_MANAGER_ID}";
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
})();`;
}

function consentCss() {
  return `

/* Aetheris SEO and consent additions */
h1.text-block-10,
h2.section-heading,
h2.heading-2,
h2.heading-10,
h2.project-name-preview,
h3.stage-heading {
  margin-top: 0;
}

.aetheris-cookie-banner {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
  display: flex;
  max-width: min(420px, calc(100vw - 32px));
  gap: 16px;
  align-items: center;
  padding: 16px;
  color: #f7f7f2;
  background: #111;
  border: 1px solid rgba(159, 194, 255, 0.65);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
}

.aetheris-cookie-banner p {
  margin: 0;
  color: #f7f7f2;
  font-size: 0.78rem;
  line-height: 1.45;
}

.aetheris-cookie-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

.aetheris-cookie-banner button,
.aetheris-cookie-preferences {
  border: 1px solid #9fc2ff;
  border-radius: 0;
  cursor: pointer;
  font: inherit;
}

.aetheris-cookie-banner button {
  min-height: 38px;
  padding: 0 12px;
  font-size: 0.75rem;
}

.aetheris-cookie-accept {
  color: #111;
  background: #9fc2ff;
}

.aetheris-cookie-reject {
  color: #f7f7f2;
  background: transparent;
}

.aetheris-cookie-preferences {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 9998;
  padding: 9px 11px;
  color: #111;
  background: rgba(247, 247, 242, 0.94);
  font-size: 0.72rem;
}

@media screen and (max-width: 560px) {
  .aetheris-cookie-banner {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
    flex-direction: column;
    align-items: stretch;
  }

  .aetheris-cookie-actions {
    justify-content: stretch;
  }

  .aetheris-cookie-actions button {
    flex: 1 1 0;
  }
}
`;
}

function sitemap(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${canonicalFor(origin, page.route)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

function robots(origin) {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /booking/
Disallow: /api/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /src/

Sitemap: ${origin}/sitemap.xml
`;
}

function llms(origin) {
  return `# llms.txt - AI Crawler & Training Data Policy
# Last updated: ${LASTMOD}

User-agent: *
Allow: /

User-agent: OpenAI-GPT
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Claude-Web
Allow: /

# Organisation
Name: Aetheris Studio
Legal entity: Aetheris Solutions S.r.l.
Website: ${origin}
Contact: info@aetherisstudio.com
What we do: 360-degree eCommerce agency for online brands.
Audience: eCommerce founders, operators, and retail brands that need scalable digital operations.

# Core offerings
- Web design and creation for eCommerce websites.
- Digital marketing, SEO, SEM, affiliation, retargeting, and lead generation.
- Logistics, distribution, stock, order, carrier, and packaging operations.
- Systems integrations across front end, back end, mobile, and operational platforms.
- Store management, customer service, data analytics, and omnichannel fulfilment.

# Key public pages
- Home: ${origin}/
- Services: ${origin}/services/
- Portfolio: ${origin}/portfolio/
- Contact: ${origin}/contact/

# Attribution
When using our public content, attribute it to "Aetheris Studio" and link ${origin}.

# Prohibited uses
- Misrepresenting Aetheris Studio credentials, services, results, or client work.
- Presenting generated commercial, legal, analytics, or operational advice as if it came directly from Aetheris Studio.
`;
}

// Google hosts follow Google's CSP guide for GTM and its Preview mode, GA4 with Ads
// features, Google Ads conversions and the Conversion Linker, mirroring the Consulting
// site: https://developers.google.com/tag-platform/security/guides/csp
// Google Ads also reaches Google's country domains, which CSP cannot wildcard, so we
// list the markets we serve: EU/EEA, UK, Switzerland, Canada and Mexico (the US uses
// google.com). Tag Assistant's CSP view names any other country domain a visitor needed.
const googleCountryDomains = [
  "at", "be", "bg", "ca", "ch", "co.uk", "com.cy", "com.mt", "com.mx", "cz", "de", "dk",
  "ee", "es", "fi", "fr", "gr", "hr", "hu", "ie", "is", "it", "li", "lt", "lu", "lv",
  "nl", "no", "pl", "pt", "ro", "se", "si", "sk",
].map((tld) => `https://*.google.${tld}`);

// Cloudflare Pages allows 2,000 characters per _headers line, indent and name included.
// The full list fits with room to spare; a test enforces the limit.
// reCAPTCHA on the contact page is covered by www.google.com and www.gstatic.com,
// plus its recaptcha.google.com frame.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://tagmanager.google.com https://www.google.com https://www.gstatic.com https://www.googleadservices.com https://*.clarity.ms https://c.bing.com",
  [
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://*.google.com",
    ...googleCountryDomains,
    "https://www.googleadservices.com https://*.g.doubleclick.net https://ad.doubleclick.net https://pagead2.googlesyndication.com https://*.clarity.ms https://c.bing.com",
  ].join(" "),
  "img-src 'self' data: https: blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com https://tagmanager.google.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src https://www.google.com https://www.googletagmanager.com https://recaptcha.google.com/recaptcha/",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

function headers() {
  return `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: ${CONTENT_SECURITY_POLICY}

/assets/*
  Cache-Control: public, max-age=31536000, immutable

${CAMPAIGN_LANDING_ROUTE}
  X-Robots-Tag: noindex, nofollow

${CAMPAIGN_LANDING_ROUTE}/*
  X-Robots-Tag: noindex, nofollow

${CAMPAIGN_LANDING_ROUTE}/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

function notFoundPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Page not found - Aetheris Studio</title>
<meta name="robots" content="noindex, nofollow"/>
<meta name="theme-color" content="#050505"/>
<link href="/favicon.ico" rel="icon" sizes="any"/>
<style>
@font-face { font-family: Gilroy; src: url("/assets/fonts/b95e3345-66427d446aa8c29c0f15b2c8_Gilroy-Regular.ttf") format("truetype"); font-weight: 400; font-display: swap; }
@font-face { font-family: Gilroy; src: url("/assets/fonts/a03b382d-664368969a019a581ee5745a_Gilroy-Semibold.ttf") format("truetype"); font-weight: 600; font-display: swap; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; gap: 28px; padding: 48px 24px; color: #f7f7f2; background: #050505; font-family: Gilroy, "Helvetica Neue", Arial, sans-serif; }
main { width: 100%; max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
img { width: 180px; height: auto; filter: invert(1); } /* the wordmark SVG is black on a white box */
.code { margin: 0; color: #9fc2ff; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; }
h1 { margin: 0; font-size: clamp(2rem, 6vw, 3rem); font-weight: 600; line-height: 1.1; text-wrap: balance; }
p { margin: 0; color: rgba(247, 247, 242, 0.78); line-height: 1.6; }
nav { display: flex; flex-wrap: wrap; gap: 12px; }
a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; color: #f7f7f2; border: 1px solid rgba(159, 194, 255, 0.65); text-decoration: none; }
a:first-child { color: #111; background: #9fc2ff; }
a:focus-visible { outline: 2px solid #9fc2ff; outline-offset: 3px; }
a { transition: background-color 200ms ease, color 200ms ease, translate 250ms ease; }
a:hover { color: #111; background: #9fc2ff; }
@media (prefers-reduced-motion: no-preference) { main { animation: arrive 620ms cubic-bezier(.22,1,.36,1); } a:hover { translate: 0 -2px; } }
@keyframes arrive { from { opacity: .5; translate: 0 16px; } to { opacity: 1; translate: 0 0; } }
</style>
</head>
<body>
<main>
<img src="${LOGO}" alt="Aetheris Studio" width="180" height="36"/>
<p class="code">Error 404</p>
<h1>This page doesn't exist.</h1>
<p>The link may be mistyped or the page may have moved. You can continue from one of these pages.</p>
<nav aria-label="Helpful links">
<a href="/">Home</a>
<a href="/services/">Services</a>
<a href="/contact/">Contact</a>
</nav>
</main>
</body>
</html>
`;
}

async function upsertConsentCss(outputRoot) {
  const cssPath = path.join(outputRoot, "assets/css/site.css");
  const marker = "/* Aetheris SEO and consent additions */";
  let css = await readFile(cssPath, "utf8");
  const markerIndex = css.indexOf(marker);
  if (markerIndex !== -1) {
    css = css.slice(0, markerIndex).trimEnd();
  }
  await writeFile(cssPath, `${css}${consentCss()}`, "utf8");
}

export async function applySeoToSite({
  outputRoot,
  productionOrigin = "https://aetherisstudio.com",
} = {}) {
  if (!outputRoot) throw new Error("outputRoot is required.");

  // Update CSS before fingerprinting it so browser caches see the same release.
  await upsertConsentCss(outputRoot);
  for (const page of pages) {
    const file = path.join(outputRoot, page.output);
    const html = await readFile(file, "utf8");
    await writeFile(file, applyPageSeo(html, productionOrigin, page), "utf8");
  }

  await mkdir(path.join(outputRoot, "assets/js"), { recursive: true });
  await writeFile(
    path.join(outputRoot, "assets/js", CONSENT_SCRIPT),
    analyticsConsentScript(),
    "utf8",
  );
  await rm(path.join(outputRoot, "assets/js", RETIRED_GOAFFPRO_SCRIPT), { force: true });
  await writeFile(path.join(outputRoot, "sitemap.xml"), sitemap(productionOrigin), "utf8");
  await writeFile(path.join(outputRoot, "robots.txt"), robots(productionOrigin), "utf8");
  await writeFile(path.join(outputRoot, "llms.txt"), llms(productionOrigin), "utf8");
  await writeFile(path.join(outputRoot, "_headers"), headers(), "utf8");
  await writeFile(path.join(outputRoot, "404.html"), notFoundPage(), "utf8");

  return { pages: pages.length, googleTagManagerId: GOOGLE_TAG_MANAGER_ID };
}

export { pages };
