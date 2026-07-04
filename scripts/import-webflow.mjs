import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputRoot = path.join(root, "webflow-site");
const sourceOrigin = "https://aetheris-studio-stg.webflow.io";
const productionOrigin = "https://aetherisstudio.com";

const pages = [
  { route: "/", output: "index.html" },
  { route: "/services", output: "services/index.html" },
  { route: "/portfolio", output: "portfolio/index.html" },
  { route: "/contact", output: "contact/index.html" },
  { route: "/privacy-policy", output: "privacy-policy/index.html" },
  { route: "/cookies-policy", output: "cookies-policy/index.html" },
];

function canonicalPath(route) {
  return route === "/" ? "/" : `${route}/`;
}

function rewriteInternalLinks(html) {
  for (const { route } of pages) {
    if (route === "/") continue;
    html = html.replaceAll(`href="${route}"`, `href="${canonicalPath(route)}"`);
  }
  return html;
}

const downloadableHosts = new Set([
  "cdn.prod.website-files.com",
  "d3e54v103j8qbb.cloudfront.net",
  "ajax.googleapis.com",
]);

const pageHtml = new Map();
const resources = new Set();

function absoluteUrl(raw, base = sourceOrigin) {
  if (!raw || raw.startsWith("#") || raw.startsWith("data:")) return null;
  try {
    return new URL(raw, base).href;
  } catch {
    return null;
  }
}

function collectHtmlResources(html) {
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const url = absoluteUrl(match[1]);
    const parsed = url ? new URL(url) : null;
    if (
      parsed &&
      parsed.pathname !== "/" &&
      downloadableHosts.has(parsed.hostname)
    ) {
      resources.add(url);
    }
  }

  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      const url = absoluteUrl(candidate.trim().split(/\s+/)[0]);
      if (url && downloadableHosts.has(new URL(url).hostname)) {
        resources.add(url);
      }
    }
  }
}

function collectCssResources(css, stylesheetUrl) {
  for (const match of css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
    const url = absoluteUrl(match[1], stylesheetUrl);
    if (url && downloadableHosts.has(new URL(url).hostname)) {
      resources.add(url);
    }
  }
}

function extensionFromType(contentType) {
  if (contentType.includes("text/css")) return ".css";
  if (contentType.includes("javascript")) return ".js";
  if (contentType.includes("image/svg")) return ".svg";
  if (contentType.includes("image/png")) return ".png";
  if (contentType.includes("image/jpeg")) return ".jpg";
  if (contentType.includes("image/webp")) return ".webp";
  if (contentType.includes("font/ttf")) return ".ttf";
  if (contentType.includes("font/woff2")) return ".woff2";
  if (contentType.includes("font/woff")) return ".woff";
  return "";
}

function resourceFolder(extension) {
  if (extension === ".css") return "css";
  if (extension === ".js") return "js";
  if ([".ttf", ".otf", ".woff", ".woff2"].includes(extension)) return "fonts";
  return "images";
}

function safeFilename(url, contentType) {
  const parsed = new URL(url);
  let basename = decodeURIComponent(path.basename(parsed.pathname))
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let extension = path.extname(basename).toLowerCase();

  if (!extension) {
    extension = extensionFromType(contentType);
    basename = `${basename || "asset"}${extension}`;
  }

  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
  return {
    folder: resourceFolder(extension),
    filename: `${hash}-${basename}`,
  };
}

async function fetchResource(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Aetheris Studio migration/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  }
  return response;
}

const GOOGLE_TAG_MANAGER_ID = "GTM-NP3QDXFS";
const GOOGLE_TAG_MANAGER_HEAD = `<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');</script><!-- End Google Tag Manager -->`;
const GOOGLE_TAG_MANAGER_BODY = `<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->`;

function rewriteAnalytics(html) {
  html = html
    .replace(
      /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[^"]+"><\/script><script type="text\/javascript">window\.dataLayer[\s\S]*?gtag\('config', 'G-[^']+'\);<\/script>/g,
      "",
    )
    .replace(
      /<script>\(function\(w,i,g\)[\s\S]*?<\/script><script async="" src="\/0oar[^"]+"><\/script>/g,
      "",
    );

  if (!html.includes(GOOGLE_TAG_MANAGER_ID)) {
    html = html
      .replace("<head>", `<head>${GOOGLE_TAG_MANAGER_HEAD}`)
      .replace(/(<body[^>]*>)/, `$1${GOOGLE_TAG_MANAGER_BODY}`);
  }

  return html;
}

function rewriteContactForm(html) {
  html = html.replace(
    /<form id="email-form"[^>]*>/,
    '<form id="email-form" name="email-form" data-name="Email Form" action="/api/contact" method="post" class="form">',
  );
  html = html.replace('name="Email"', 'name="email"');
  html = html.replace('name="field"', 'name="message"');
  html = html.replace(
    /<div><div data-sitekey="[^"]+" class="w-form-formrecaptcha[^"]*"><\/div><\/div>/,
    '<input type="text" name="website" tabindex="-1" autocomplete="off" class="contact-honeypot" aria-hidden="true"/><p class="recaptcha-notice">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.</p>',
  );
  return html.replace(
    "</body>",
    '<script src="/assets/js/contact.js" type="text/javascript" defer></script></body>',
  );
}

function rewritePage(html, route, assetMap) {
  for (const [remote, local] of assetMap) {
    html = html.replaceAll(remote, local);
  }

  html = rewriteAnalytics(html)
    .replace(
      /^<!DOCTYPE html><!-- This site was created in Webflow\.[\s\S]*?--><!-- Last Published:[\s\S]*?-->/,
      "<!DOCTYPE html>",
    )
    .replace(
      '<script src="https://www.google.com/recaptcha/api.js" type="text/javascript"></script>',
      "",
    )
    .replace(
      /<link href="https:\/\/cdn\.prod\.website-files\.com" rel="preconnect"[^>]*\/>/,
      "",
    )
    .replace('<meta content="Webflow" name="generator"/>', "")
    .replace('data-wf-domain="aetheris-studio-stg.webflow.io"', 'data-wf-domain="aetherisstudio.com"')
    .replace(' data-wf-status="1"', "")
    .replace("<html ", '<html lang="en" ')
    .replaceAll('href="#" class="contact-button', 'href="/contact/" class="contact-button')
    .replace(/\s+integrity="[^"]*"/g, "")
    .replace(/\s+crossorigin="anonymous"/g, "");

  html = rewriteInternalLinks(html);

  const canonical = canonicalPath(route);
  html = html.replace(
    "</head>",
    `<link rel="canonical" href="${productionOrigin}${canonical}"/></head>`,
  );

  if (route === "/contact") {
    html = rewriteContactForm(html);
  }

  return html;
}

async function main() {
  await mkdir(outputRoot, { recursive: true });

  for (const page of pages) {
    const response = await fetchResource(`${sourceOrigin}${page.route}`);
    const html = await response.text();
    pageHtml.set(page.route, html);
    collectHtmlResources(html);
  }

  const stylesheetUrls = [...resources].filter((url) =>
    new URL(url).pathname.endsWith(".css"),
  );
  const stylesheets = new Map();

  for (const stylesheetUrl of stylesheetUrls) {
    const response = await fetchResource(stylesheetUrl);
    const css = await response.text();
    stylesheets.set(stylesheetUrl, css);
    collectCssResources(css, stylesheetUrl);
  }

  const assetMap = new Map();
  const downloaded = new Map();

  for (const url of [...resources].sort()) {
    if (stylesheetUrls.includes(url)) continue;
    const response = await fetchResource(url);
    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());
    const { folder, filename } = safeFilename(url, contentType);
    const relative = `/assets/${folder}/${filename}`;
    const destination = path.join(outputRoot, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, buffer);
    assetMap.set(url, relative);
    downloaded.set(relative, buffer.length);
  }

  for (const [stylesheetUrl, originalCss] of stylesheets) {
    let css = originalCss;
    for (const [remote, local] of assetMap) {
      css = css.replaceAll(remote, local);
    }
    css += `

/* Aetheris migration additions */
.contact-honeypot {
  position: absolute !important;
  left: -10000px !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
}

.recaptcha-notice {
  max-width: 42rem;
  margin: 1rem 0;
  color: #666;
  font-size: 0.75rem;
  line-height: 1.45;
}

.recaptcha-notice a {
  color: inherit;
  text-decoration: underline;
}
`;
    const local = "/assets/css/site.css";
    const destination = path.join(outputRoot, local);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, css);
    assetMap.set(stylesheetUrl, local);
    downloaded.set(local, Buffer.byteLength(css));
  }

  for (const page of pages) {
    const output = path.join(outputRoot, page.output);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(
      output,
      rewritePage(pageHtml.get(page.route), page.route, assetMap),
    );
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    ({ route }) =>
      `  <url><loc>${productionOrigin}${canonicalPath(route)}</loc></url>`,
  )
  .join("\n")}
</urlset>
`;

  await writeFile(
    path.join(outputRoot, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${productionOrigin}/sitemap.xml\n`,
  );
  await writeFile(path.join(outputRoot, "sitemap.xml"), sitemap);
  await writeFile(
    path.join(outputRoot, "_headers"),
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`,
  );

  console.log(
    `Imported ${pages.length} pages and ${downloaded.size} local assets into ${outputRoot}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
