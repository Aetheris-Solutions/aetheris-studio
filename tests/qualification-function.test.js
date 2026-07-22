import { describe, expect, it, vi } from "vitest";
import {
  appendHookLog,
  hostnameMatchesRule,
  onRequestPost,
  scoreSubmission,
  validateSubmission,
} from "../functions/api/qualification.js";

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
  privacyVersion: "2026-07-22",
  privacyAcceptedAt: "2026-07-22T09:00:00.000Z",
  marketingConsent: false,
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
    expect(result.value).not.toHaveProperty("website");
  });

  it("returns field names, never submitted values, for invalid input", () => {
    const result = validateSubmission({ ...highFitPayload, workEmail: "not-an-email", privacyAccepted: false });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.objectContaining({ workEmail: "invalid", privacyAccepted: "required" }));
    expect(JSON.stringify(result.errors)).not.toContain("not-an-email");
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
    expect(scoreSubmission(validated.value)).toEqual(expect.objectContaining({ fit: "low", priority: "P3 (Low)" }));
  });
});

describe("appendHookLog", () => {
  it("preserves history and appends a submission exactly once", () => {
    const first = appendHookLog("2026-07-01 - Existing CRM history", "Website inbound {}", "abc_123456789");
    const retry = appendHookLog(first, "Website inbound {\"retry\":true}", "abc_123456789");
    expect(first).toContain("Existing CRM history");
    expect(first).toContain("[website:abc_123456789]");
    expect(retry).toBe(first);
  });

  it("never drops existing CRM history when the hook attribute is nearly full", () => {
    const history = `oldest-entry:${"x".repeat(90)}`;
    const result = appendHookLog(history, `Website inbound ${"y".repeat(200)}`, "new_123456789", 140);
    expect(result.startsWith(history)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(140);
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

  it("fails closed when Turnstile is not configured", async () => {
    const response = await onRequestPost({ request: request(), env: {}, fetch: vi.fn() });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "review", error: { code: "verification_failed" } });
  });

  it("upserts only the dedicated website CRM path and returns no PII", async () => {
    const calls = [];
    const fetchMock = vi.fn(async (url, init = {}) => {
      calls.push({ url: String(url), init });
      if (String(url).includes("objects/people/records?matching_attribute=email_addresses")) {
        return new Response(JSON.stringify({ data: { id: { record_id: "person-record-1" } } }), { status: 200 });
      }
      if (init.method === "GET" && String(url).includes("objects/people/records/person-record-1")) {
        return new Response(
          JSON.stringify({ data: { values: { aetheris_hook_log: [{ value: "2026-07-01 - Existing note" }] } } }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ data: {} }), { status: 200 });
    });

    const response = await onRequestPost({
      request: request(),
      env: {
        ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS: "true",
        ATTIO_API_KEY: "server-only-test-key",
        ATTIO_WEBSITE_INBOUND_LIST_ID: "website-inbound-list",
      },
      fetch: fetchMock,
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ status: "qualified" });
    expect(calls).toHaveLength(5);
    expect(calls[0].url).toContain("objects/companies/records?matching_attribute=domains");
    expect(calls[1].url).toContain("objects/people/records?matching_attribute=email_addresses");
    expect(calls[4].url).toContain("lists/website-inbound-list/entries");
    expect(calls.every(({ url }) => !url.toLowerCase().includes("outbound"))).toBe(true);

    const patchCall = calls.find(({ init }) => init.method === "PATCH");
    const patchBody = JSON.parse(patchCall.init.body);
    expect(patchBody.data.values).toEqual(
      expect.objectContaining({
        aetheris_business_unit: "Studio",
        aetheris_priority: "P1 (High)",
      }),
    );
    expect(patchBody.data.values.aetheris_hook_log).toContain("Existing note");
    expect(patchBody.data.values.aetheris_hook_log).toContain("[website:website_01JABCDEF0123456789]");
    expect(patchBody.data.values.aetheris_hook_log).toContain('"privacyVersion":"2026-07-22"');
    expect(patchBody.data.values).not.toHaveProperty("aetheris_outreach_status");
    expect(patchBody.data.values).not.toHaveProperty("aetheris_track");
  });
});
