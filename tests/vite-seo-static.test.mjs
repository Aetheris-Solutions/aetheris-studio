import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(".");
const origin = "https://aetherisstudio.com";

const pages = [
  {
    file: "index.html",
    lang: "en",
    canonical: `${origin}/`,
    english: `${origin}/`,
    italian: `${origin}/it/`,
    xDefault: `${origin}/`,
  },
  {
    file: "it/index.html",
    lang: "it",
    canonical: `${origin}/it/`,
    english: `${origin}/`,
    italian: `${origin}/it/`,
    xDefault: `${origin}/`,
  },
  {
    file: "public/privacy-policy/index.html",
    lang: "en",
    canonical: `${origin}/privacy-policy/`,
    english: `${origin}/privacy-policy/`,
    italian: `${origin}/it/privacy-policy/`,
    xDefault: `${origin}/privacy-policy/`,
  },
  {
    file: "public/it/privacy-policy/index.html",
    lang: "it",
    canonical: `${origin}/it/privacy-policy/`,
    english: `${origin}/privacy-policy/`,
    italian: `${origin}/it/privacy-policy/`,
    xDefault: `${origin}/privacy-policy/`,
  },
  {
    file: "public/cookies-policy/index.html",
    lang: "en",
    canonical: `${origin}/cookies-policy/`,
    english: `${origin}/cookies-policy/`,
    italian: `${origin}/it/cookies-policy/`,
    xDefault: `${origin}/cookies-policy/`,
  },
  {
    file: "public/it/cookies-policy/index.html",
    lang: "it",
    canonical: `${origin}/it/cookies-policy/`,
    english: `${origin}/cookies-policy/`,
    italian: `${origin}/it/cookies-policy/`,
    xDefault: `${origin}/cookies-policy/`,
  },
];

function count(html, pattern) {
  return html.match(pattern)?.length ?? 0;
}

test("Vite EN/IT entry points and legal pages expose reciprocal SEO metadata", async () => {
  for (const page of pages) {
    const html = await readFile(path.join(root, page.file), "utf8");

    assert.match(html, new RegExp(`<html\\s+lang="${page.lang}"`), `${page.file} language`);
    assert.equal(count(html, /<title>/g), 1, `${page.file} title count`);
    assert.equal(count(html, /<meta\s+name="description"/g), 1, `${page.file} description count`);
    assert.equal(count(html, /<link\s+rel="canonical"/g), 1, `${page.file} canonical count`);
    assert.ok(
      html.includes(`<link rel="canonical" href="${page.canonical}" />`),
      `${page.file} canonical`,
    );
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="en" href="${page.english}" />`),
      `${page.file} English alternate`,
    );
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="it" href="${page.italian}" />`),
      `${page.file} Italian alternate`,
    );
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="x-default" href="${page.xDefault}" />`),
      `${page.file} default alternate`,
    );
    assert.ok(
      html.includes(`<meta property="og:url" content="${page.canonical}" />`),
      `${page.file} Open Graph URL`,
    );
  }
});

test("the Vite sitemap contains the complete EN/IT canonical set", async () => {
  const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
  const expected = pages.map((page) => page.canonical).sort();

  assert.deepEqual(actual, expected);
});

test("both localized home documents are Vite build inputs", async () => {
  const config = await readFile(path.join(root, "vite.config.ts"), "utf8");

  assert.match(config, /main:\s*['"]index\.html['"]/);
  assert.match(config, /it:\s*['"]it\/index\.html['"]/);
});

test("Cloudflare Pages receives a top-level noindex 404 fallback for missing files", async () => {
  const html = await readFile(path.join(root, "public/404.html"), "utf8");

  assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow"/);
  assert.match(html, /Page not found/);
  assert.match(html, /href="\/"/);
});
