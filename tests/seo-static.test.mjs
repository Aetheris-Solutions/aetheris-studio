import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve("webflow-site");
const origin = "https://aetherisstudio.com";
const landing = "/ecommerce-growth-audit";

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
  const consentScript = await readFile(path.join(root, "assets/js/aetheris-analytics-consent.v3.js"));
  const consentVersion = createHash("sha256").update(consentScript).digest("hex").slice(0, 10);

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
    // The cache-busting token must follow the script content (assets are served immutable).
    assert.ok(
      html.includes(
        `<script src="/assets/js/aetheris-analytics-consent.v3.js?v=${consentVersion}" type="text/javascript" defer></script>`,
      ),
      `${page.file} consent script version`,
    );
    assert.equal(count(html, /googletagmanager\.com\/gtag\/js\?id=/g), 0, `${page.file} raw GA loader`);
    assert.equal(count(html, /googletagmanager\.com\/gtm\.js\?id=/g), 0, `${page.file} raw GTM loader`);
    assert.equal(count(html, /googletagmanager\.com\/ns\.html\?id=/g), 0, `${page.file} raw GTM noscript`);
    assert.equal(html.includes(landing.slice(1)), false, `${page.file} mentions the campaign landing`);

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
  const consent = await readFile(path.join(root, "assets/js/aetheris-analytics-consent.v3.js"), "utf8");
  const siteCss = await readFile(path.join(root, "assets/css/site.css"), "utf8");

  for (const page of pages) {
    assert.ok(sitemap.includes(`<loc>${canonical(page.route)}</loc>`), `sitemap ${page.route}`);
  }
  assert.equal(count(sitemap, /<loc>/g), pages.length, "sitemap lists only the site pages");
  assert.equal(sitemap.includes(landing), false, "campaign landing stays out of the sitemap");

  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok(robots.includes("Disallow: /api/"));
  // Crawler-specific groups would make those bots ignore the Disallow rules above.
  assert.equal(count(robots, /^User-agent:/gm), 1, "robots.txt has a single user-agent group");
  assert.equal(robots.includes(landing), false, "robots.txt must not block the noindex landing");
  assert.ok(llms.includes("Name: Aetheris Studio"));
  assert.equal(llms.includes(landing), false);
  assert.ok(headers.includes("Content-Security-Policy:"));
  assert.ok(headers.includes("https://*.googletagmanager.com"));
  assert.ok(headers.includes("https://*.google-analytics.com"));
  assert.equal(headers.includes("goaffpro"), false);
  assert.ok(headers.includes(`${landing}\n  X-Robots-Tag: noindex, nofollow`));
  assert.ok(headers.includes(`${landing}/*\n  X-Robots-Tag: noindex, nofollow`));

  assert.ok(consent.includes('var googleTagManagerId = "GTM-5553RFJZ";'));
  assert.ok(consent.includes('analytics_storage: "denied"'));
  assert.ok(consent.includes("https://www.googletagmanager.com/gtm.js?id="));
  assert.equal(consent.includes("https://www.googletagmanager.com/gtag/js?id="), false);
  assert.equal(consent.includes('window.gtag("config"'), false);
  assert.ok(consent.includes('window.gtag("event", eventName'));
  assert.ok(consent.includes("loadTagManager();"));
  assert.equal(consent.includes("affiliate"), false);
  assert.equal(consent.includes(landing.slice(1)), false);
  assert.equal(siteCss.includes(landing.slice(1)), false);

  await assert.rejects(
    access(
      path.join(
        root,
        "assets/js/e029bcdc-66412d12cd05d437c465a049-65cb7898cbbe85d801f67382-68fcd1a97ec621129fc82785-goaffpro-1.0.0.js",
      ),
    ),
    "retired GoAffPro script is deleted",
  );
});

test("no GoAffPro code or files remain in the published site", async () => {
  const hits = [];
  for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath ?? entry.path, entry.name);
    const relative = path.relative(root, file);
    if (/goaffpro/i.test(relative)) {
      hits.push(relative);
      continue;
    }
    if (!/\.(html|js|mjs|css|txt|xml|json|svg)$|^_headers$|^_redirects$/.test(entry.name)) continue;
    if (/goaffpro/i.test(await readFile(file, "utf8"))) hits.push(relative);
  }
  assert.deepEqual(hits, []);
});

test("campaign landing is a standalone noindex page", async () => {
  const html = await readFile(path.join(root, "ecommerce-growth-audit/index.html"), "utf8");
  const vercel = JSON.parse(await readFile(path.resolve("vercel.json"), "utf8"));

  assert.equal(count(html, /<meta name="robots" content="noindex, nofollow"/g), 1);
  assert.equal(count(html, /<link rel="canonical"/g), 1);
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${landing}/" />`));

  const sameSiteLinks = [...html.matchAll(/<a\b[^>]*href="(\/[^"]*)"[^>]*>/g)];
  assert.ok(sameSiteLinks.length > 0);
  for (const [tag, href] of sameSiteLinks) {
    assert.ok(["/privacy-policy/", "/cookies-policy/"].includes(href), `unexpected site link ${href}`);
    assert.ok(tag.includes('target="_blank"'), `${href} opens in a new tab`);
  }
  assert.equal(
    /<a\b[^>]*href="https?:\/\/(www\.)?aetherisstudio\.com/.test(html),
    false,
    "no absolute links to the main site",
  );
  assert.equal(/Get the checklist|Download the ecommerce growth leak checklist/.test(html), false);
  // Keyword checked by the Better Stack landing monitor.
  assert.ok(html.includes("Ecommerce Growth Leak Audit"));

  for (const source of [landing, `${landing}/(.*)`]) {
    const rule = vercel.headers.find((entry) => entry.source === source);
    assert.ok(rule, `vercel.json header rule for ${source}`);
    assert.deepEqual(rule.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]);
  }
});

test("unknown URLs get a noindex 404 page instead of the homepage", async () => {
  const html = await readFile(path.join(root, "404.html"), "utf8");

  assert.ok(html.includes('<meta name="robots" content="noindex, nofollow"/>'));
  assert.equal(count(html, /<h1\b/g), 1);
  assert.ok(html.includes('<a href="/">Home</a>'));
  assert.equal(html.includes(landing), false);
  assert.equal(/<script\b/i.test(html), false, "404 page loads no scripts");
});
