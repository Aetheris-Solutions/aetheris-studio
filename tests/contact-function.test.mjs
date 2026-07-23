import assert from "node:assert/strict";
import test from "node:test";

import { onRequestPost } from "../legacy-pages-functions/api/contact.js";

const env = {
  RECAPTCHA_SECRET_KEY: "secret",
  RECAPTCHA_MIN_SCORE: "0.5",
  RECAPTCHA_ALLOWED_HOSTNAMES: "aetherisstudio.com",
  RESEND_API_KEY: "resend-key",
  RESEND_FROM_EMAIL: "Aetheris Studio <website@aetherisstudio.com>",
  CONTACT_TO_EMAIL: "info@aetherisstudio.com",
};

function contactRequest(body) {
  return new Request("https://aetherisstudio.com/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": "203.0.113.20",
    },
    body: JSON.stringify(body),
  });
}

test("accepts a valid contact and sends notification plus confirmation", async () => {
  const calls = [];
  const background = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });

    if (String(url).includes("recaptcha/api/siteverify")) {
      return Response.json({
        success: true,
        score: 0.9,
        action: "contact",
        hostname: "aetherisstudio.com",
      });
    }

    if (String(url).includes("api.resend.com")) {
      return Response.json({ id: "email-id" });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const response = await onRequestPost({
      request: contactRequest({
        name: "Test User",
        email: "test@example.com",
        message: "I would like to discuss a project.",
        website: "",
        recaptchaToken: "token",
      }),
      env,
      waitUntil(promise) {
        background.push(promise);
      },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    await Promise.all(background);
    assert.equal(calls.length, 3);

    const notification = JSON.parse(calls[1].options.body);
    const confirmation = JSON.parse(calls[2].options.body);
    assert.deepEqual(notification.to, ["info@aetherisstudio.com"]);
    assert.deepEqual(confirmation.to, ["test@example.com"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a low reCAPTCHA score before sending email", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json({
      success: true,
      score: 0.1,
      action: "contact",
      hostname: "aetherisstudio.com",
    });
  };

  try {
    const response = await onRequestPost({
      request: contactRequest({
        name: "Test User",
        email: "test@example.com",
        message: "This request should be rejected.",
        website: "",
        recaptchaToken: "token",
      }),
      env,
      waitUntil() {},
    });

    assert.equal(response.status, 403);
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects invalid form data without external requests", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    const response = await onRequestPost({
      request: contactRequest({
        name: "A",
        email: "invalid",
        message: "",
        website: "",
        recaptchaToken: "token",
      }),
      env,
      waitUntil() {},
    });

    assert.equal(response.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
