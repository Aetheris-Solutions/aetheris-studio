import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applySeoToSite } from "../scripts/seo-utils.mjs";

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

function contentSecurityPolicy(headers) {
  const lines = headers.split("\n").filter((entry) => entry.trimStart().startsWith("Content-Security-Policy:"));
  assert.equal(lines.length, 1, "one Content-Security-Policy header");
  const [line] = lines;
  const directives = line
    .slice(line.indexOf(":") + 1)
    .split(";")
    .filter((directive) => directive.trim())
    .map((directive) => {
      const [name, ...sources] = directive.trim().split(/\s+/);
      return [name.toLowerCase(), sources];
    });
  // Browsers enforce the first copy of a repeated directive and ignore the rest, while the Map
  // below keeps the last: a stray duplicate could pass these tests and still block GTM.
  const names = directives.map(([name]) => name);
  assert.deepEqual(names.filter((name, index) => names.indexOf(name) !== index), [], "duplicate CSP directives");
  return { line, policy: new Map(directives) };
}

// CSP host-source matching for https URLs: exact host or "*." wildcard, optional path prefix.
function allows(sources = [], url) {
  const { hostname, pathname } = new URL(url);
  return sources.some((source) => {
    const match = source.match(/^https:\/\/(\*\.)?([^/]+)(\/.*)?$/);
    if (!match) return false;
    const [, wildcard, host, sourcePath = "/"] = match;
    const hostMatches = wildcard ? hostname.endsWith(`.${host}`) : hostname === host;
    return hostMatches && pathname.startsWith(sourcePath);
  });
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

test("content security policy covers GTM Preview, GA4 with Ads features and Google Ads", async () => {
  const { line, policy } = contentSecurityPolicy(await readFile(path.join(root, "_headers"), "utf8"));

  // Cloudflare Pages limits each _headers line, indent and header name included.
  assert.ok(line.length <= 2000, `CSP line is ${line.length} characters`);
  assert.deepEqual(policy.get("default-src"), ["'self'"]);
  assert.deepEqual(policy.get("base-uri"), ["'self'"]);
  assert.deepEqual(policy.get("form-action"), ["'self'"]);
  assert.ok(policy.has("upgrade-insecure-requests"));
  // Host-wide, not only reCAPTCHA's path: GTM and the Google Ads user data beacon call www.google.com.
  assert.ok(policy.get("connect-src").includes("https://www.google.com"));
  assert.ok(policy.get("frame-src").includes("https://www.googletagmanager.com"));

  const required = {
    "script-src": [
      "https://www.googletagmanager.com/gtm.js",
      "https://tagmanager.google.com/debug/",
      "https://www.googleadservices.com/pagead/conversion_async.js",
      "https://www.google.com/pagead/",
      "https://www.clarity.ms/tag/",
      "https://scripts.clarity.ms/",
      "https://www.google.com/recaptcha/api.js",
      "https://www.gstatic.com/recaptcha/releases/",
    ],
    "connect-src": [
      "https://www.google.com/ccm/collect",
      "https://www.googletagmanager.com/",
      "https://region1.google-analytics.com/g/collect",
      "https://region1.analytics.google.com/g/collect",
      "https://stats.g.doubleclick.net/",
      "https://googleads.g.doubleclick.net/pagead/",
      "https://www.googleadservices.com/pagead/",
      "https://ad.doubleclick.net/",
      "https://pagead2.googlesyndication.com/",
      // Google Ads country domains for the markets served: EU/EEA, UK, Switzerland, Canada, Mexico.
      "https://www.google.it/",
      "https://www.google.co.uk/",
      "https://www.google.ch/",
      "https://www.google.ca/",
      "https://www.google.com.mx/",
      "https://x.clarity.ms/collect",
      "https://c.bing.com/c.gif",
      "https://www.google.com/recaptcha/api2/",
    ],
    "style-src": [
      "https://fonts.googleapis.com/css2",
      "https://www.googletagmanager.com/debug/",
      "https://tagmanager.google.com/debug/",
    ],
    "font-src": ["https://fonts.gstatic.com/s/"],
    "frame-src": [
      "https://www.googletagmanager.com/static/service_worker/",
      "https://www.google.com/recaptcha/api2/anchor",
      "https://recaptcha.google.com/recaptcha/api2/anchor",
    ],
  };
  for (const [directive, urls] of Object.entries(required)) {
    for (const url of urls) assert.ok(allows(policy.get(directive), url), `${directive} allows ${url}`);
  }
});

test("policy pages disclose optional analytics and campaign-only advertising measurement", async () => {
  for (const file of ["cookies-policy/index.html", "privacy-policy/index.html"]) {
    const html = await readFile(path.join(root, file), "utf8");
    const sections = html.match(/<section id="analytics-privacy-disclosure"[\s\S]*?<\/section>/g) ?? [];
    assert.equal(sections.length, 1, `${file} disclosure count`);
    for (const phrase of [
      "Google Analytics",
      "Microsoft Clarity",
      "_clck",
      "Advertising measurement",
      "_gcl_au",
      "_gcl_aw",
      "ad personalisation or remarketing",
      "https://policies.google.com/privacy",
      "https://privacy.microsoft.com/privacystatement",
    ]) {
      assert.ok(sections[0].includes(phrase), `${file} disclosure mentions ${phrase}`);
    }
  }
  const cookies = await readFile(path.join(root, "cookies-policy/index.html"), "utf8");
  assert.equal(count(cookies, /<strong>Cookie Preferences:<\/strong>/g), 1, "one Cookie Preferences bullet");
  assert.match(cookies, /<strong>Cookie Preferences:<\/strong>[^<]*advertising measurement/);
  assert.match(cookies, /<strong>d\. Advertising Measurement Cookies<br\/>/);
});

// The legacy Webflow text below the disclosure must not contradict it.
test("policy pages make no claims that contradict the consent banners", async () => {
  for (const file of ["cookies-policy/index.html", "privacy-policy/index.html"]) {
    const html = await readFile(path.join(root, file), "utf8");
    for (const phrase of [
      /Facebook/i,
      /targeted advertising/i,
      /relevant ads/i,
      /personali[sz]ed content and ads/i,
      /anonymously/i,
      /By using our services, you agree/i,
    ]) {
      assert.equal(phrase.test(html), false, `${file} matches ${phrase}`);
    }
  }
});

test("campaign pages are standalone noindex pages", async () => {
  const campaign = path.join(root, landing.slice(1));
  const vercel = JSON.parse(await readFile(path.resolve("vercel.json"), "utf8"));
  const canonicals = {
    "index.html": `${origin}${landing}/`,
    "thank-you.html": `${origin}${landing}/thank-you`,
  };
  const files = (await readdir(campaign)).filter((name) => name.endsWith(".html"));
  assert.ok(files.includes("index.html"));

  for (const file of files) {
    const html = await readFile(path.join(campaign, file), "utf8");
    assert.ok(file in canonicals, `unexpected campaign page ${file}`);
    assert.equal(count(html, /<meta name="robots" content="noindex, nofollow"/g), 1, `${file} robots meta`);
    const canonicalTags = html.match(/<link\b[^>]*rel="canonical"[^>]*>/g) ?? [];
    assert.equal(canonicalTags.length, 1, `${file} canonical count`);
    assert.equal(canonicalTags[0].match(/href="([^"]*)"/)?.[1], canonicals[file], `${file} canonical`);

    const sameSiteLinks = [...html.matchAll(/<a\b[^>]*href="(\/[^"]*)"[^>]*>/g)];
    assert.ok(sameSiteLinks.length > 0, `${file} links the legal pages`);
    for (const [tag, href] of sameSiteLinks) {
      if (href.startsWith(`${landing}/`)) continue;
      assert.ok(["/privacy-policy/", "/cookies-policy/"].includes(href), `${file}: unexpected site link ${href}`);
      assert.ok(tag.includes('target="_blank"'), `${file}: ${href} opens in a new tab`);
    }
    assert.equal(/\bhref="\.\.\//.test(html), false, `${file}: no ../ links`);
    assert.equal(
      /<a\b[^>]*href="https?:\/\/(www\.)?aetherisstudio\.com/.test(html),
      false,
      `${file}: no absolute links to the main site`,
    );
  }

  const html = await readFile(path.join(campaign, "index.html"), "utf8");
  assert.equal(/Get the checklist|Download the ecommerce growth leak checklist/.test(html), false);
  // Keyword checked by the Better Stack landing monitor.
  assert.ok(html.includes("Ecommerce Growth Leak Audit"));

  for (const source of [landing, `${landing}/(.*)`]) {
    const rule = vercel.headers.find((entry) => entry.source === source);
    assert.ok(rule, `vercel.json header rule for ${source}`);
    assert.deepEqual(rule.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]);
  }
  // The landing redirects to /thank-you, which Vercel serves from thank-you.html only with clean URLs.
  assert.equal(vercel.cleanUrls, true, "vercel.json cleanUrls");
});

// The landing build (index.html, thank-you.html, assets/) is copied from the source repo's dist/.
test("campaign thank-you page ships with the landing build", async () => {
  const campaign = path.join(root, landing.slice(1));
  await assert.doesNotReject(access(path.join(campaign, "thank-you.html")), "thank-you.html is published");
  const html = await readFile(path.join(campaign, "thank-you.html"), "utf8");
  assert.equal(count(html, /<h1\b/gi), 1, "thank-you.html h1 count");
  assert.equal(/<form\b/i.test(html), false, "thank-you.html has no form");
  assert.equal(/\bcal\.com/i.test(html), false, "thank-you.html has no booking link");

  const assets = path.join(campaign, "assets");
  const scripts = (await readdir(assets)).filter((name) => name.endsWith(".js"));
  const bundle = (await Promise.all(scripts.map((name) => readFile(path.join(assets, name), "utf8")))).join("\n");
  assert.ok(bundle.includes(`${landing}/thank-you`), "the landing redirects to the thank-you page");
  assert.ok(bundle.includes("generate_lead"), "the thank-you page reports generate_lead");
});

// A partial copy of dist/ would still deploy, then fail in visitors' browsers.
test("campaign pages load only files that ship with the build, and nothing else is left in assets/", async () => {
  const campaign = path.join(root, landing.slice(1));
  const assets = path.join(campaign, "assets");
  const prefix = `${landing}/assets/`;
  const published = (await readdir(assets, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(assets, path.join(entry.parentPath ?? entry.path, entry.name)).split(path.sep).join("/"));
  const referenced = new Set();
  const missing = [];
  const reference = (from, file) => {
    const name = file.split(/[?#]/)[0];
    referenced.add(name);
    if (!published.includes(name)) missing.push(`${from} -> ${name}`);
  };
  const campaignAssets = (text) => [...text.matchAll(new RegExp(`${prefix}([^"'\`\\s),]+)`, "g"))].map((match) => match[1]);

  for (const page of (await readdir(campaign)).filter((name) => name.endsWith(".html"))) {
    const html = await readFile(path.join(campaign, page), "utf8");
    // A build made without --base=/ecommerce-growth-audit/ would load the main site's /assets/.
    assert.equal(/\b(?:src|href)="(?:\.?\/)?assets\//.test(html), false, `${page} loads files outside ${prefix}`);
    assert.match(html, new RegExp(`<script type="module"[^>]*src="${prefix}[^"]+\\.js"`), `${page} loads its script`);
    for (const file of campaignAssets(html)) reference(page, file);
  }
  for (const file of published.filter((name) => name.endsWith(".js"))) {
    const js = await readFile(path.join(assets, file), "utf8");
    for (const [, specifier] of js.matchAll(/\b(?:from|import)\s*\(?\s*["'](\.\.?\/[^"']+)["']/g)) {
      reference(file, path.posix.join(path.posix.dirname(file), specifier));
    }
    for (const name of campaignAssets(js)) reference(file, name);
    // Vite lists the dependencies of dynamic imports relative to the base URL.
    for (const [, name] of js.matchAll(/["']assets\/([^"']+)["']/g)) reference(file, name);
  }
  for (const file of published.filter((name) => name.endsWith(".css"))) {
    const css = await readFile(path.join(assets, file), "utf8");
    // Quoted values match whole, so a url() nested in an inline data: SVG is skipped.
    for (const [, double, single, bare] of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/g)) {
      const url = double ?? single ?? bare;
      if (/^(?:[a-z][a-z0-9+.-]*:|#|%23|\/\/)/i.test(url)) continue;
      if (url.startsWith(prefix)) reference(file, url.slice(prefix.length));
      else if (url.startsWith("/")) {
        await access(path.join(root, url.split(/[?#]/)[0])).catch(() => missing.push(`${file} -> ${url}`));
      } else reference(file, path.posix.join(path.posix.dirname(file), url));
    }
  }

  assert.deepEqual(missing, [], "every file the campaign pages load is published");
  assert.deepEqual(
    published.filter((name) => !referenced.has(name)),
    [],
    "every file in assets/ is used; copy dist/ with rsync --delete so old hashed files go",
  );
});

test("unknown URLs get a noindex 404 page instead of the homepage", async () => {
  const html = await readFile(path.join(root, "404.html"), "utf8");

  assert.ok(html.includes('<meta name="robots" content="noindex, nofollow"/>'));
  assert.equal(count(html, /<h1\b/g), 1);
  assert.ok(html.includes('<a href="/">Home</a>'));
  assert.equal(html.includes(landing), false);
  assert.equal(/<script\b/i.test(html), false, "404 page loads no scripts");
});

// Committed output must match the generator, so a change to scripts/seo-utils.mjs without
// `npm run seo:apply` fails here instead of shipping stale headers or scripts.
test("generated files match a fresh seo:apply run", async (t) => {
  const copy = await mkdtemp(path.join(os.tmpdir(), "aetheris-seo-"));
  t.after(() => rm(copy, { recursive: true, force: true }));
  await cp(root, copy, { recursive: true });
  // These are written from scratch; the six pages and assets/css/site.css are updated in place.
  const outputs = ["_headers", "assets/js/aetheris-analytics-consent.v3.js", "sitemap.xml", "robots.txt", "llms.txt", "404.html"];
  await Promise.all(outputs.map((file) => rm(path.join(copy, file), { force: true })));
  await applySeoToSite({ outputRoot: copy, productionOrigin: origin });

  const files = async (dir) =>
    (await readdir(dir, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => path.relative(dir, path.join(entry.parentPath ?? entry.path, entry.name)))
      .sort();
  const generated = await files(copy);
  assert.deepEqual(generated, await files(root), "seo:apply writes the same set of files");

  const stale = [];
  for (const file of generated) {
    const [fresh, committed] = await Promise.all([readFile(path.join(copy, file)), readFile(path.join(root, file))]);
    if (!fresh.equals(committed)) stale.push(file);
  }
  assert.deepEqual(stale, [], "run npm run seo:apply and commit the result");
});
