import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  canonicalSubmissionEvidence,
  hostnameMatchesRule,
  onRequest,
  onRequestPost,
  scoreSubmission,
  validateSubmission,
} from "../functions/api/qualification.js";

const attioEnv = {
  ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS: "true",
  ATTIO_API_KEY: "server-only-test-key",
  ATTIO_WEBSITE_INBOUND_LIST_ID: "website-inbound-list",
  ATTIO_WEBSITE_INTAKE_RECORD_ID: "internal-intake-record",
};

describe("qualification route methods", () => {
  it.each(["GET", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])(
    "returns JSON 405 for %s requests",
    async (method) => {
    const response = await onRequest({
      request: new Request("https://aetherisstudio.com/api/qualification", { method }),
      env: {},
      fetch: vi.fn(),
    });

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    expect(response.headers.get("cache-control")).toContain("no-store");
    if (method === "HEAD") {
      expect(await response.text()).toBe("");
    } else {
      await expect(response.json()).resolves.toMatchObject({ error: "method_not_allowed" });
    }
    },
  );
});

describe("hostnameMatchesRule", () => {
  it("accepts exact canonical hosts and explicit Pages preview subdomains only", () => {
    expect(hostnameMatchesRule("aetherisstudio.com", "aetherisstudio.com")).toBe(true);
    expect(hostnameMatchesRule("feature.aetheris-studio.pages.dev", "*.aetheris-studio.pages.dev")).toBe(true);
    expect(hostnameMatchesRule("aetheris-studio.pages.dev", "*.aetheris-studio.pages.dev")).toBe(false);
    expect(hostnameMatchesRule("aetheris-studio.pages.dev.evil.example", "*.aetheris-studio.pages.dev")).toBe(false);
  });
});

const highFitPayload = {
  submissionId: "website_01JABCDEF0123456789",
  name: "Ada Lovelace",
  workEmail: "ada@example-brand.com",
  role: "Ecommerce Director",
  company: "Example Brand",
  storeUrl: "https://shop.example-brand.com/it",
  platform: "shopify-plus",
  annualRevenue: "1m-5m",
  monthlyAdSpend: "20k-50k",
  primaryMarket: "European Union",
  workstreams: ["cro", "tracking", "cro"],
  problem: "Conversion has stalled while paid traffic keeps growing.",
  trigger: "growth-stalled",
  timeline: "this-quarter",
  projectBudget: "15k-30k",
  ownerReadiness: "decision-maker",
  constraint: "Attribution and ownership are fragmented across vendors.",
  privacyAccepted: true,
  privacyVersion: "2026-07-23",
  privacyAcceptedAt: "2026-07-22T09:00:00.000Z",
  marketingConsent: false,
  marketingConsentAt: "",
  marketingConsentVersion: "2026-07-23",
  marketingConsentSource: "website_qualification",
  analyticsConsent: true,
  analyticsConsentAt: "2026-07-22T08:55:00.000Z",
  analyticsConsentVersion: "1",
  analyticsConsentSource: "banner",
  attribution: {
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "commerce-growth",
    gclid: "test-click-id",
    landingUrl: "https://aetherisstudio.com/?utm_source=google",
    referrer: "https://www.google.com/",
  },
  turnstileToken: "test-token",
  website: "",
};

function request(payload = highFitPayload, headers = {}) {
  return new Request("http://localhost/api/qualification", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

describe("validateSubmission", () => {
  it("normalizes the public form contract without retaining the honeypot", () => {
    const result = validateSubmission(highFitPayload);
    expect(result.valid).toBe(true);
    expect(result.value.workEmail).toBe("ada@example-brand.com");
    expect(result.value.storeUrl).toBe("https://shop.example-brand.com/it");
    expect(result.value.workstreams).toEqual(["cro", "tracking"]);
    expect(result.value.attribution.landingUrl).toBe("https://aetherisstudio.com/");
    expect(result.value.attribution.referrer).toBe("https://www.google.com/");
    expect(result.value).not.toHaveProperty("website");
  });

  it("returns field names, never submitted values, for invalid input", () => {
    const result = validateSubmission({ ...highFitPayload, workEmail: "not-an-email", privacyAccepted: false });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.objectContaining({ workEmail: "invalid", privacyAccepted: "required" }));
    expect(JSON.stringify(result.errors)).not.toContain("not-an-email");
  });

  it("rejects a crafted marketing opt-in because this build does not offer one", () => {
    const result = validateSubmission({
      ...highFitPayload,
      marketingConsent: true,
      marketingConsentAt: "2026-07-22T09:00:00.000Z",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.objectContaining({ marketingConsent: "unsupported" }));
  });

  it("discards crafted attribution unless analytics consent evidence is present", () => {
    const result = validateSubmission({
      ...highFitPayload,
      analyticsConsent: false,
      analyticsConsentAt: "",
      analyticsConsentVersion: "",
      analyticsConsentSource: "",
      attribution: {
        landingUrl: "https://aetherisstudio.com/?email=private@example.com#brief",
        utmSource: "crafted",
      },
    });

    expect(result.valid).toBe(true);
    expect(result.value.analyticsConsent).toBe(false);
    expect(result.value.attribution).toBeNull();
  });

  it("requires complete analytics evidence before retaining sanitized attribution", () => {
    const invalid = validateSubmission({
      ...highFitPayload,
      analyticsConsentAt: "",
      analyticsConsentVersion: "",
      analyticsConsentSource: "forged",
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toEqual(expect.objectContaining({
      analyticsConsentAt: "invalid",
      analyticsConsentVersion: "invalid",
      analyticsConsentSource: "invalid",
    }));
  });

  it("builds versioned canonical source evidence without token, server time or derived scoring", () => {
    const validated = validateSubmission(highFitPayload);
    expect(validated.valid).toBe(true);
    const evidence = canonicalSubmissionEvidence(validated.value);

    expect(evidence).toEqual(expect.objectContaining({
      contractVersion: 1,
      source: "website_qualification",
      submissionId: highFitPayload.submissionId,
      qualificationInputs: expect.objectContaining({ annualRevenue: "1m-5m" }),
    }));
    expect(evidence).not.toHaveProperty("receivedAt");
    expect(evidence).not.toHaveProperty("qualification");
    expect(JSON.stringify(evidence)).not.toContain("test-token");
  });
});

describe("scoreSubmission", () => {
  it("qualifies a scaled European commerce mandate with budget, timing and ownership", () => {
    const validated = validateSubmission(highFitPayload);
    expect(validated.valid).toBe(true);
    expect(scoreSubmission(validated.value)).toEqual(expect.objectContaining({ fit: "high", priority: "P1 (High)" }));
  });

  it("recognises European markets beyond the initial core-country list", () => {
    const validated = validateSubmission({ ...highFitPayload, primaryMarket: "Poland" });
    expect(validated.valid).toBe(true);
    expect(scoreSubmission(validated.value)).toEqual(expect.objectContaining({ fit: "high" }));
  });

  it("routes research-only or sub-EUR-5k demand to manual review", () => {
    const validated = validateSubmission({
      ...highFitPayload,
      timeline: "research",
      projectBudget: "under-5k",
      ownerReadiness: "exploring",
    });
    expect(validated.valid).toBe(true);
    expect(scoreSubmission(validated.value)).toEqual(expect.objectContaining({
      fit: "low",
      priority: "P3 (Low)",
      safeguards: {
        ruleSetVersion: "2026-07-23.1",
        automatedEffect: "queue_priority_only",
        automatedRejection: false,
        automatedContractDecision: false,
        automatedPricing: false,
        humanReviewRequired: true,
      },
    }));
  });
});

describe("onRequestPost", () => {
  it("rejects a cross-origin browser submission before verification or CRM calls", async () => {
    const fetchMock = vi.fn();
    const req = request(highFitPayload, { origin: "https://malicious.example" });
    const response = await onRequestPost({ request: req, env: {}, fetch: fetchMock });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "review", error: { code: "origin_denied" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks public Pages preview submissions unless a review owner explicitly enables them", async () => {
    const fetchMock = vi.fn();
    const previewOrigin = "https://legal-pass.aetheris-studio.pages.dev";
    const response = await onRequestPost({
      request: new Request(`${previewOrigin}/api/qualification`, {
        method: "POST",
        headers: {
          origin: previewOrigin,
          "content-type": "application/json",
        },
        body: JSON.stringify(highFitPayload),
      }),
      env: attioEnv,
      fetch: fetchMock,
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      status: "review",
      error: { code: "preview_submissions_disabled" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks a Pages preview before origin validation or external verification", async () => {
    const fetchMock = vi.fn();
    const response = await onRequestPost({
      request: new Request("https://legal-pass.aetheris-studio.pages.dev/api/qualification", {
        method: "POST",
        headers: {
          origin: "https://malicious.example",
          "content-type": "application/json",
        },
        body: JSON.stringify(highFitPayload),
      }),
      env: attioEnv,
      fetch: fetchMock,
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      status: "review",
      error: { code: "preview_submissions_disabled" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("silently absorbs a filled honeypot without touching Turnstile or Attio", async () => {
    const fetchMock = vi.fn();
    const response = await onRequestPost({
      request: request({ ...highFitPayload, website: "spam.example" }),
      env: {},
      fetch: fetchMock,
    });
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "review" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops reading an undeclared oversized payload before Turnstile or Attio", async () => {
    const fetchMock = vi.fn();
    const oversized = request({
      ...highFitPayload,
      constraint: "x".repeat(40 * 1024),
    });
    expect(oversized.headers.has("content-length")).toBe(false);

    const response = await onRequestPost({
      request: oversized,
      env: {},
      fetch: fetchMock,
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      status: "review",
      error: { code: "payload_too_large" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when Turnstile is not configured", async () => {
    const response = await onRequestPost({ request: request(), env: {}, fetch: vi.fn() });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "review", error: { code: "verification_failed" } });
  });

  it("fails closed before Attio when the fixed intake record is not configured", async () => {
    const fetchMock = vi.fn();
    const response = await onRequestPost({
      request: request(),
      env: {
        ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS: "true",
        ATTIO_API_KEY: "server-only-test-key",
        ATTIO_WEBSITE_INBOUND_LIST_ID: "website-inbound-list",
      },
      fetch: fetchMock,
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "review", error: { code: "temporarily_unavailable" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates one append-only entry on the fixed intake record without querying or writing lead records", async () => {
    const calls = [];
    const fetchMock = vi.fn(async (url, init = {}) => {
      calls.push({ url: String(url), init });
      if (String(url).includes("lists/website-inbound-list/entries/query")) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      if (String(url).endsWith("lists/website-inbound-list/entries")) {
        const body = JSON.parse(init.body);
        return new Response(JSON.stringify({
          data: {
            id: { entry_id: "entry-1" },
            parent_record_id: body.data.parent_record_id,
            entry_values: body.data.entry_values,
          },
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "unexpected test request" }), { status: 500 });
    });

    const response = await onRequestPost({
      request: request(),
      env: attioEnv,
      fetch: fetchMock,
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ status: "qualified" });
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toContain("lists/website-inbound-list/entries/query");
    expect(calls[1].url).toMatch(/lists\/website-inbound-list\/entries$/);
    expect(calls.every(({ url }) => !url.includes("objects/"))).toBe(true);
    expect(calls.every(({ init }) => !["PUT", "PATCH"].includes(init.method))).toBe(true);
    expect(calls.every(({ url }) => !url.toLowerCase().includes("outbound"))).toBe(true);

    const entryBody = JSON.parse(calls[1].init.body);
    expect(entryBody.data.parent_record_id).toBe("internal-intake-record");
    expect(entryBody.data.parent_object).toBe("people");
    expect(entryBody.data.entry_values.website_submission_id).toBe("website_01JABCDEF0123456789");
    const validated = validateSubmission(highFitPayload);
    expect(validated.valid).toBe(true);
    const expectedHash = createHash("sha256")
      .update(JSON.stringify(canonicalSubmissionEvidence(validated.value)))
      .digest("hex");
    expect(entryBody.data.entry_values.website_payload_sha256).toBe(expectedHash);
    expect(entryBody.data.entry_values).toEqual(expect.objectContaining({
      website_contact_name: "Ada Lovelace",
      website_work_email: "ada@example-brand.com",
      website_role: "Ecommerce Director",
      website_company: "Example Brand",
      website_store_url: "https://shop.example-brand.com/it",
    }));
    const ledger = JSON.parse(entryBody.data.entry_values.website_ledger_json);
    expect(ledger).toEqual(expect.objectContaining({
      submissionId: "website_01JABCDEF0123456789",
      identity: expect.objectContaining({ emailVerified: false, identityAssurance: "turnstile-only" }),
      security: { turnstileVerified: true },
    }));
    expect(ledger.qualification.safeguards).toEqual({
      ruleSetVersion: "2026-07-23.1",
      automatedEffect: "queue_priority_and_optional_booking_shortcut",
      automatedRejection: false,
      automatedContractDecision: false,
      automatedPricing: false,
      humanReviewRequired: true,
    });
    expect(ledger.consent.marketing.activationPermitted).toBe(false);
    expect(JSON.stringify(ledger)).not.toContain("test-token");
  });

  it("keeps all submitted identity claims entry-scoped when analytics consent is denied", async () => {
    const calls = [];
    const fetchMock = vi.fn(async (url, init = {}) => {
      calls.push({ url: String(url), init });
      if (String(url).includes("lists/website-inbound-list/entries/query")) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      if (String(url).endsWith("lists/website-inbound-list/entries")) {
        return new Response(JSON.stringify({ data: { id: { entry_id: "entry-existing" } } }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "unexpected test request" }), { status: 500 });
    });

    const response = await onRequestPost({
      request: request({
        ...highFitPayload,
        analyticsConsent: false,
        analyticsConsentAt: "",
        analyticsConsentVersion: "",
        analyticsConsentSource: "",
      }),
      env: attioEnv,
      fetch: fetchMock,
    });

    expect(response.status).toBe(201);
    expect(calls).toHaveLength(2);
    expect(calls.every(({ url }) => !url.includes("objects/"))).toBe(true);
    expect(calls.every(({ init }) => !["PUT", "PATCH"].includes(init.method))).toBe(true);
    const entryBody = JSON.parse(calls[1].init.body);
    expect(entryBody.data.parent_record_id).toBe("internal-intake-record");
    expect(entryBody.data.entry_values.website_work_email).toBe("ada@example-brand.com");
    const ledger = JSON.parse(entryBody.data.entry_values.website_ledger_json);
    expect(ledger.attribution).toBeNull();
    expect(ledger.consent.analytics.granted).toBe(false);
  });

  it("stores a low-fit brief for human review without an automated rejection", async () => {
    const calls = [];
    const fetchMock = vi.fn(async (url, init = {}) => {
      calls.push({ url: String(url), init });
      if (String(url).includes("lists/website-inbound-list/entries/query")) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      if (String(url).endsWith("lists/website-inbound-list/entries")) {
        return new Response(JSON.stringify({ data: { id: { entry_id: "entry-low-fit" } } }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "unexpected test request" }), { status: 500 });
    });
    const lowFitPayload = {
      ...highFitPayload,
      timeline: "research",
      projectBudget: "under-5k",
      ownerReadiness: "exploring",
    };

    const response = await onRequestPost({
      request: request(lowFitPayload),
      env: attioEnv,
      fetch: fetchMock,
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ status: "review" });
    const entryBody = JSON.parse(calls[1].init.body);
    const ledger = JSON.parse(entryBody.data.entry_values.website_ledger_json);
    expect(ledger.qualification.fit).toBe("low");
    expect(ledger.qualification.safeguards).toEqual(expect.objectContaining({
      automatedEffect: "queue_priority_only",
      automatedRejection: false,
      automatedContractDecision: false,
      automatedPricing: false,
      humanReviewRequired: true,
    }));
  });

  it("treats a repeated submission ID with the same deterministic hash as an idempotent success", async () => {
    let storedEntry = null;
    const fetchMock = vi.fn(async (url, init = {}) => {
      const target = String(url);
      if (target.includes("lists/website-inbound-list/entries/query")) {
        return new Response(JSON.stringify({ data: storedEntry ? [storedEntry] : [] }), { status: 200 });
      }
      if (target.endsWith("lists/website-inbound-list/entries")) {
        const body = JSON.parse(init.body);
        storedEntry = {
          id: { entry_id: "entry-idempotent" },
          parent_record_id: body.data.parent_record_id,
          entry_values: Object.fromEntries(
            Object.entries(body.data.entry_values).map(([key, value]) => [key, [{ value }]]),
          ),
        };
        return new Response(JSON.stringify({ data: storedEntry }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "unexpected test request" }), { status: 500 });
    });
    const context = {
      env: attioEnv,
      fetch: fetchMock,
    };

    const first = await onRequestPost({ ...context, request: request() });
    const second = await onRequestPost({ ...context, request: request() });
    const conflictingReuse = await onRequestPost({
      ...context,
      request: request({ ...highFitPayload, company: "Different payload, same ID" }),
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(conflictingReuse.status).toBe(502);
    expect(await conflictingReuse.json()).toEqual({ status: "review", error: { code: "temporarily_unavailable" } });
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("lists/website-inbound-list/entries"))).toHaveLength(1);
    expect(fetchMock.mock.calls.every(([url]) => !String(url).includes("objects/"))).toBe(true);
  });

  it("returns the stored route when an idempotent retry resolves an earlier ledger", async () => {
    const validated = validateSubmission(highFitPayload);
    expect(validated.valid).toBe(true);
    const existingHash = createHash("sha256")
      .update(JSON.stringify(canonicalSubmissionEvidence(validated.value)))
      .digest("hex");
    const existingEntry = {
      id: { entry_id: "entry-prior-ruleset" },
      entry_values: {
        website_payload_sha256: [{ value: existingHash }],
        website_fit: [{ value: "low" }],
      },
    };
    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes("lists/website-inbound-list/entries/query")) {
        return new Response(JSON.stringify({ data: [existingEntry] }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "unexpected write" }), { status: 500 });
    });

    const response = await onRequestPost({
      request: request(highFitPayload),
      env: attioEnv,
      fetch: fetchMock,
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ status: "review" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
