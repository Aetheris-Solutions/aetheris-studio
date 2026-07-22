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
});
