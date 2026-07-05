import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const GOOGLE_TAG_MANAGER_ID = "GTM-NP3QDXFS";
const LASTMOD = "2026-07-05";
const OG_IMAGE = "/assets/images/244ad641-67122c0e2d36c11d0806b837_Ser-Altar_Background.jpg";
const LOGO = "/assets/images/9ab8314c-66426e5584a7001b62e145b5_Agency-Logo_Extended-Small_White.svg";
const CONSENT_SCRIPT = "aetheris-analytics-consent.v1.js";
const CONSENT_SCRIPT_SRC = `/assets/js/${CONSENT_SCRIPT}?v=ec8de1e`;
const GOAFFPRO_SCRIPT =
  "e029bcdc-66412d12cd05d437c465a049-65cb7898cbbe85d801f67382-68fcd1a97ec621129fc82785-goaffpro-1.0.0.js";

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
    `<script src="${CONSENT_SCRIPT_SRC}" type="text/javascript" defer></script>`,
  ].join("");
}

function stripManagedHead(html) {
  let next = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  for (const selector of managedMetaSelectors) {
    next = next.replace(new RegExp(`<meta\\b(?=[^>]*${selector})[^>]*>`, "gi"), "");
  }
  next = next
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
      /<script src="\/assets\/js\/(?:analytics-consent|aetheris-analytics-consent\.v1)\.js(?:\?v=[^"]+)?" type="text\/javascript" defer><\/script>/gi,
      "",
    )
    .replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/gi, "")
    .replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/gi, "");
  return next;
}

function injectHead(html, origin, page) {
  const stripped = stripManagedHead(html);
  return stripped.replace(
    /(<meta charset="utf-8"\/?>)/i,
    `$1${managedHead(origin, page)}`,
  );
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

function updateCookiePolicy(html, route) {
  if (route !== "/cookies-policy") return html;
  const replacement =
    "$1<br/>- <strong>Cookie Preferences:</strong> You can use the Cookie preferences control on this website to accept or reject Google Analytics and similar non-essential measurement scripts.<br/><br/>Please note";
  return html.replace(
    /(- <strong>Opt-out Tools:<\/strong> Some third-party services provide tools to opt-out of data collection, such as Google Analytics[^<]+ opt-out browser add-on or Facebook[^<]+ ad preferences settings\.)<br\/><br\/>Please note/,
    replacement,
  );
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

  var tagManagerId = "${GOOGLE_TAG_MANAGER_ID}";
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
    if (loaded || document.querySelector('script[data-aetheris-analytics="gtm"]')) return;
    loaded = true;
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });
    var script = document.createElement("script");
    script.async = true;
    script.dataset.aetherisAnalytics = "gtm";
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(tagManagerId);
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
    if (granted) loadAnalytics();
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
      return;
    }
    renderBanner(false);
  });
})();`;
}

function goaffproConsentScript() {
  return `(function () {
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
  border: 1px solid rgba(244, 201, 93, 0.65);
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
  border: 1px solid #f4c95d;
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
  background: #f4c95d;
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

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

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

function headers() {
  return `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://api.goaffpro.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.goaffpro.com https://www.google.com/recaptcha/; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; base-uri 'self'; form-action 'self'; upgrade-insecure-requests

/assets/*
  Cache-Control: public, max-age=31536000, immutable
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
  await writeFile(
    path.join(outputRoot, "assets/js", GOAFFPRO_SCRIPT),
    goaffproConsentScript(),
    "utf8",
  );
  await upsertConsentCss(outputRoot);
  await writeFile(path.join(outputRoot, "sitemap.xml"), sitemap(productionOrigin), "utf8");
  await writeFile(path.join(outputRoot, "robots.txt"), robots(productionOrigin), "utf8");
  await writeFile(path.join(outputRoot, "llms.txt"), llms(productionOrigin), "utf8");
  await writeFile(path.join(outputRoot, "_headers"), headers(), "utf8");

  return { pages: pages.length, tagManagerId: GOOGLE_TAG_MANAGER_ID };
}

export { pages };
