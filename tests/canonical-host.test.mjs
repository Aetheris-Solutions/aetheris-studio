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
    request: new Request("https://aetherisstudio.com/services/"),
    next() {
      return new Response("ok");
    },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "ok");
});
