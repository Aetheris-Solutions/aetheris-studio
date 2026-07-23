import assert from "node:assert/strict";
import test from "node:test";

import { onRequest } from "../functions/_middleware.js";

test("redirects www host to apex while preserving path and query", async () => {
  const response = await onRequest({
    request: new Request("https://www.aetherisstudio.com/services/?utm=test"),
    next() {
      throw new Error("next should not be called for www redirects");
    },
  });

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "https://aetherisstudio.com/services/?utm=test",
  );
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
});

test("passes canonical host requests through", async () => {
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/"),
    next() {
      return new Response("ok", { headers: { "Content-Type": "text/html" } });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "ok");
  assert.match(response.headers.get("content-security-policy"), /challenges\.cloudflare\.com/);
  assert.equal(response.headers.get("cache-control"), "no-cache");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
});

test("redirects legacy indexed routes to their new homepage sections", async () => {
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/portfolio/?utm=test"),
    next() {
      throw new Error("next should not be called for legacy redirects");
    },
  });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://aetherisstudio.com/?utm=test#work");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
});

test("preserves the Italian locale when redirecting legacy routes", async () => {
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/it/contact/?utm=test"),
    next() {
      throw new Error("next should not be called for legacy redirects");
    },
  });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://aetherisstudio.com/it/?utm=test#qualification");
});

test("returns a real noindex 404 for unknown document routes", async () => {
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/does-not-exist"),
    next() {
      throw new Error("next should not be called for unknown document routes");
    },
  });

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.match(await response.text(), /Page not found/);
});

test("returns a localized noindex 404 for unknown Italian document routes", async () => {
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/it/non-esiste"),
    next() {
      throw new Error("next should not be called for unknown document routes");
    },
  });

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  const body = await response.text();
  assert.match(body, /<html lang="it">/);
  assert.match(body, /Pagina non trovata/);
  assert.match(body, /href="\/it\/"/);
});

test("returns a JSON 404 for unknown API routes without invoking another handler", async () => {
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/api/not-real"),
    next() {
      throw new Error("next should not be called for unknown API routes");
    },
  });

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: false, error: "not_found" });
});

test("passes the known qualification API route to its route handler", async () => {
  let nextCalls = 0;
  const response = await onRequest({
    request: new Request("https://aetherisstudio.com/api/qualification"),
    next() {
      nextCalls += 1;
      return new Response(
        JSON.stringify({ ok: false, error: "method_not_allowed" }),
        {
          status: 405,
          headers: {
            "Allow": "POST",
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    },
  });

  assert.equal(nextCalls, 1);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await response.json(), { ok: false, error: "method_not_allowed" });
});

test("blocks preview crawling at robots.txt before serving static content", async () => {
  const response = await onRequest({
    request: new Request("https://codex-new-site-preview-20260722.aetheris-studio.pages.dev/robots.txt"),
    next() {
      throw new Error("next should not be called for preview robots");
    },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "User-agent: *\nDisallow: /\n");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
});
