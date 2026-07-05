import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve("webflow-site");
const origin = "https://aetherisstudio.com";

const pages = [
  {
    route: "/",
    file: "index.html",
    title: "eCommerce Growth Partner - Aetheris Studio",
  },
  {
    route: "/services",
    file: "services/index.html",
    title: "eCommerce Services - Aetheris Studio",
  },
  {
    route: "/portfolio",
    file: "portfolio/index.html",
    title: "eCommerce Case Studies - Aetheris Studio",
  },
  {
    route: "/contact",
    file: "contact/index.html",
    title: "Contact Aetheris Studio",
  },
  {
    route: "/privacy-policy",
    file: "privacy-policy/index.html",
    title: "Privacy Policy - Aetheris Studio",
  },
  {
    route: "/cookies-policy",
    file: "cookies-policy/index.html",
    title: "Cookies Policy - Aetheris Studio",
  },
];

function canonical(route) {
  return `${origin}${route === "/" ? "/" : `${route}/`}`;
}

function count(html, pattern) {
  return html.match(pattern)?.length ?? 0;
}

test("public pages expose distinct static SEO metadata", async () => {
  const titles = new Set();
  const descriptions = new Set();

  for (const page of pages) {
    const html = await readFile(path.join(root, page.file), "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    const jsonLd = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];

    assert.equal(title, page.title, `${page.file} title`);
    assert.ok(description?.length > 80, `${page.file} description`);
    assert.equal(count(html, /<meta name="description"/g), 1, `${page.file} description count`);
    assert.equal(count(html, /<link rel="canonical"/g), 1, `${page.file} canonical count`);
    assert.equal(count(html, /<h1\b/gi), 1, `${page.file} h1 count`);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical(page.route)}"/>`));
    assert.ok(html.includes(`<meta property="og:url" content="${canonical(page.route)}"/>`));
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image"/>'));
    assert.ok(html.includes('<script src="/assets/js/analytics-consent.js" type="text/javascript" defer></script>'));
    assert.equal(count(html, /googletagmanager\.com\/gtag\/js\?id=/g), 0, `${page.file} raw GA loader`);
    assert.equal(count(html, /googletagmanager\.com\/gtm\.js\?id=/g), 0, `${page.file} raw GTM loader`);
    assert.equal(count(html, /googletagmanager\.com\/ns\.html\?id=/g), 0, `${page.file} raw GTM noscript`);

    const schema = JSON.parse(jsonLd);
    assert.equal(schema["@context"], "https://schema.org");
    assert.ok(Array.isArray(schema["@graph"]));
    assert.ok(schema["@graph"].some((entry) => entry["@type"] === "Organization"));

    titles.add(title);
    descriptions.add(description);
  }

  assert.equal(titles.size, pages.length);
  assert.equal(descriptions.size, pages.length);
});

test("crawlability files and consent scripts are present", async () => {
  const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const robots = await readFile(path.join(root, "robots.txt"), "utf8");
  const llms = await readFile(path.join(root, "llms.txt"), "utf8");
  const headers = await readFile(path.join(root, "_headers"), "utf8");
  const consent = await readFile(path.join(root, "assets/js/analytics-consent.js"), "utf8");
  const goaffpro = await readFile(
    path.join(
      root,
      "assets/js/e029bcdc-66412d12cd05d437c465a049-65cb7898cbbe85d801f67382-68fcd1a97ec621129fc82785-goaffpro-1.0.0.js",
    ),
    "utf8",
  );

  for (const page of pages) {
    assert.ok(sitemap.includes(`<loc>${canonical(page.route)}</loc>`), `sitemap ${page.route}`);
  }

  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok(robots.includes("Disallow: /api/"));
  assert.ok(llms.includes("Name: Aetheris Studio"));
  assert.ok(headers.includes("Content-Security-Policy:"));
  assert.ok(headers.includes("https://*.googletagmanager.com"));
  assert.ok(headers.includes("https://*.google-analytics.com"));
  assert.ok(headers.includes("https://api.goaffpro.com"));

  assert.ok(consent.includes('var tagManagerId = "GTM-NP3QDXFS";'));
  assert.ok(consent.includes('analytics_storage: "denied"'));
  assert.ok(consent.includes("https://www.googletagmanager.com/gtm.js?id="));
  assert.ok(goaffpro.includes('window.localStorage.getItem(storageKey) === "granted"'));
  assert.ok(goaffpro.includes("aetheris:consent"));
  assert.ok(goaffpro.includes("https://api.goaffpro.com/loader.js"));
});
