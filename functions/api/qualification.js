const MAX_BODY_BYTES = 32 * 1024;
const ATTIO_API_BASE = "https://api.attio.com/v2";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const QUALIFICATION_NOTICE_VERSION = "2026-07-23";
export const QUALIFICATION_RULESET_VERSION = "2026-07-23.1";
const ANALYTICS_CONSENT_SCHEMA_VERSION = "1";
const WEBSITE_PAYLOAD_CONTRACT_VERSION = 1;
const TURNSTILE_TIMEOUT_MS = 8_000;
const ATTIO_TIMEOUT_MS = 10_000;
const KNOWN_INTAKE_RECORDS = new Map([
  ["ea94e071-c5a1-4255-aff3-429b033c7d39", "02ec4555-ba27-4799-a2ce-b0468d3aff0e"],
]);
const WEBSITE_ENTRY_ATTRIBUTES = Object.freeze({
  submissionId: "website_submission_id",
  receivedAt: "website_received_at",
  payloadSha256: "website_payload_sha256",
  ledgerJson: "website_ledger_json",
  fit: "website_fit",
  priority: "website_priority",
  contactName: "website_contact_name",
  workEmail: "website_work_email",
  role: "website_role",
  company: "website_company",
  storeUrl: "website_store_url",
});

const REVENUE_ALIASES = new Map([
  ["under-500k", "under-500k"],
  ["<500k", "under-500k"],
  ["500k-1m", "500k-1m"],
  ["500k–1m", "500k-1m"],
  ["1m-5m", "1m-5m"],
  ["1m–5m", "1m-5m"],
  ["5m-20m", "5m-20m"],
  ["5m–20m", "5m-20m"],
  ["20m-plus", "20m-plus"],
  ["20m+", "20m-plus"],
  ["confidential", "confidential"],
  ["not-sure", "confidential"],
]);

const AD_SPEND_ALIASES = new Map([
  ["none", "none"],
  ["no-paid-media", "none"],
  ["under-1k", "under-1k"],
  ["<1k", "under-1k"],
  ["1k-5k", "1k-5k"],
  ["1k–5k", "1k-5k"],
  ["5k-20k", "5k-20k"],
  ["5k–20k", "5k-20k"],
  ["20k-50k", "20k-50k"],
  ["20k–50k", "20k-50k"],
  ["50k-plus", "50k-plus"],
  ["50k+", "50k-plus"],
  ["confidential", "confidential"],
]);

const TIMELINE_ALIASES = new Map([
  ["now", "now"],
  ["this-month", "this-month"],
  ["month", "this-month"],
  ["this-quarter", "this-quarter"],
  ["quarter", "this-quarter"],
  ["six-months", "six-months"],
  ["6-months", "six-months"],
  ["research", "research"],
  ["research-only", "research"],
]);

const BUDGET_ALIASES = new Map([
  ["under-5k", "under-5k"],
  ["<5k", "under-5k"],
  ["5k-10k", "5k-10k"],
  ["5k–10k", "5k-10k"],
  ["10k-15k", "10k-15k"],
  ["10k–15k", "10k-15k"],
  ["10k-25k", "10k-25k"],
  ["10k–25k", "10k-25k"],
  ["15k-30k", "15k-30k"],
  ["15k–30k", "15k-30k"],
  ["25k-plus", "25k-plus"],
  ["25k+", "25k-plus"],
  ["30k-plus", "30k-plus"],
  ["30k+", "30k-plus"],
  ["unsure", "unsure"],
  ["not-sure", "unsure"],
]);

const OWNER_ALIASES = new Map([
  ["decision-maker", "decision-maker"],
  ["budget-owner", "budget-owner"],
  ["sponsor-access", "sponsor-access"],
  ["team-with-sponsor", "sponsor-access"],
  ["collaborator", "collaborator"],
  ["exploring", "exploring"],
]);

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

async function readRequestBodyWithinLimit(request, maxBytes) {
  if (!request.body) return { tooLarge: false, text: "" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const chunks = [];
  let bytesRead = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        await reader.cancel("payload_too_large").catch(() => {});
        return { tooLarge: true, text: "" };
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
    chunks.push(decoder.decode());
    return { tooLarge: false, text: chunks.join("") };
  } finally {
    reader.releaseLock();
  }
}

function resolveIntakeRecordId(env) {
  const configured = cleanString(env.ATTIO_WEBSITE_INTAKE_RECORD_ID, 100);
  if (configured) return configured;
  return KNOWN_INTAKE_RECORDS.get(cleanString(env.ATTIO_WEBSITE_INBOUND_LIST_ID, 100)) || "";
}

function canonical(value, aliases) {
  const cleaned = cleanString(value, 80).toLowerCase();
  return aliases.get(cleaned) || "";
}

function normalizeUrl(value, { required = false } = {}) {
  const cleaned = cleanString(value, 2048);
  if (!cleaned) return required ? null : "";
  const candidate = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  try {
    const url = new URL(candidate);
    if (!/^https?:$/.test(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeAttributionUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";
  const url = new URL(normalized);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function normalizeAttribution(raw) {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const landingUrl = normalizeAttributionUrl(input.landingUrl);
  const referrer = normalizeAttributionUrl(input.referrer);
  return {
    utmSource: cleanString(input.utmSource, 180),
    utmMedium: cleanString(input.utmMedium, 180),
    utmCampaign: cleanString(input.utmCampaign, 240),
    utmContent: cleanString(input.utmContent, 240),
    utmTerm: cleanString(input.utmTerm, 240),
    gclid: cleanString(input.gclid, 256),
    wbraid: cleanString(input.wbraid, 256),
    gbraid: cleanString(input.gbraid, 256),
    landingUrl: landingUrl || "",
    referrer: referrer || "",
  };
}

/**
 * Normalize and validate an untrusted website qualification payload.
 * The function is pure so the public contract can be tested without Attio.
 */
export function validateSubmission(raw) {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const errors = {};
  const submissionId = cleanString(input.submissionId, 100);
  const name = cleanString(input.name, 160);
  const workEmail = cleanString(input.workEmail, 254).toLowerCase();
  const role = cleanString(input.role, 160);
  const company = cleanString(input.company, 200);
  const storeUrl = normalizeUrl(input.storeUrl, { required: true });
  const platform = cleanString(input.platform, 80).toLowerCase();
  const annualRevenue = canonical(input.annualRevenue, REVENUE_ALIASES);
  const monthlyAdSpend = canonical(input.monthlyAdSpend, AD_SPEND_ALIASES);
  const primaryMarket = cleanString(input.primaryMarket, 100).toLowerCase();
  const problem = cleanString(input.problem, 800);
  const trigger = cleanString(input.trigger, 240).toLowerCase();
  const timeline = canonical(input.timeline, TIMELINE_ALIASES);
  const projectBudget = canonical(input.projectBudget, BUDGET_ALIASES);
  const ownerReadiness = canonical(input.ownerReadiness, OWNER_ALIASES);
  const constraint = cleanString(input.constraint, 1200);
  const privacyVersion = cleanString(input.privacyVersion, 64);
  const privacyAcceptedAt = cleanString(input.privacyAcceptedAt, 64);
  const marketingConsentRequested = input.marketingConsent === true;
  const marketingConsent = false;
  const marketingConsentAt = cleanString(input.marketingConsentAt, 64);
  const marketingConsentVersion = cleanString(input.marketingConsentVersion, 64);
  const marketingConsentSource = cleanString(input.marketingConsentSource, 64);
  const analyticsConsent = input.analyticsConsent === true;
  const analyticsConsentAt = cleanString(input.analyticsConsentAt, 64);
  const analyticsConsentVersion = cleanString(input.analyticsConsentVersion, 64);
  const analyticsConsentSource = cleanString(input.analyticsConsentSource, 64);
  const turnstileToken = cleanString(input.turnstileToken, 2048);

  const workstreams = Array.isArray(input.workstreams)
    ? [...new Set(input.workstreams.map((item) => cleanString(item, 100).toLowerCase()).filter(Boolean))].slice(0, 12).sort()
    : [];

  if (!/^[A-Za-z0-9_-]{12,100}$/.test(submissionId)) errors.submissionId = "invalid";
  if (name.length < 2) errors.name = "required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(workEmail)) errors.workEmail = "invalid";
  if (!role) errors.role = "required";
  if (!company) errors.company = "required";
  if (!storeUrl) errors.storeUrl = "invalid";
  if (!platform) errors.platform = "required";
  if (!annualRevenue) errors.annualRevenue = "invalid";
  if (!monthlyAdSpend) errors.monthlyAdSpend = "invalid";
  if (!primaryMarket) errors.primaryMarket = "required";
  if (!workstreams.length) errors.workstreams = "required";
  if (problem.length < 3) errors.problem = "required";
  if (!trigger) errors.trigger = "required";
  if (!timeline) errors.timeline = "invalid";
  if (!projectBudget) errors.projectBudget = "invalid";
  if (!ownerReadiness) errors.ownerReadiness = "invalid";
  if (input.privacyAccepted !== true) errors.privacyAccepted = "required";
  if (privacyVersion !== QUALIFICATION_NOTICE_VERSION) errors.privacyVersion = "invalid";
  if (!privacyAcceptedAt || Number.isNaN(Date.parse(privacyAcceptedAt))) errors.privacyAcceptedAt = "invalid";
  if (marketingConsentRequested) errors.marketingConsent = "unsupported";
  if (analyticsConsent) {
    if (!analyticsConsentAt || Number.isNaN(Date.parse(analyticsConsentAt))) errors.analyticsConsentAt = "invalid";
    if (analyticsConsentVersion !== ANALYTICS_CONSENT_SCHEMA_VERSION) errors.analyticsConsentVersion = "invalid";
    if (!new Set(["banner", "preferences"]).has(analyticsConsentSource)) errors.analyticsConsentSource = "invalid";
  }
  if (constraint.length < 3) errors.constraint = "required";

  const valid = Object.keys(errors).length === 0;
  if (!valid) return { valid, errors };

  return {
    valid,
    errors,
    value: {
      submissionId,
      name,
      workEmail,
      role,
      company,
      storeUrl,
      platform,
      annualRevenue,
      monthlyAdSpend,
      primaryMarket,
      workstreams,
      problem,
      trigger,
      timeline,
      projectBudget,
      ownerReadiness,
      constraint,
      privacyAccepted: true,
      privacyVersion,
      privacyAcceptedAt,
      marketingConsent,
      marketingConsentAt: marketingConsent ? marketingConsentAt : "",
      marketingConsentVersion: marketingConsent ? marketingConsentVersion : "",
      marketingConsentSource: marketingConsent ? marketingConsentSource : "",
      analyticsConsent,
      analyticsConsentAt: analyticsConsent ? analyticsConsentAt : "",
      analyticsConsentVersion: analyticsConsent ? analyticsConsentVersion : "",
      analyticsConsentSource: analyticsConsent ? analyticsConsentSource : "",
      attribution: analyticsConsent ? normalizeAttribution(input.attribution) : null,
      turnstileToken,
    },
  };
}

function isEuropeanMarket(value) {
  return /(^|\b)(albania|andorra|austria|belarus|belgium|bosnia|bulgaria|croatia|cyprus|czechia|czech republic|denmark|estonia|finland|france|germany|greece|hungary|iceland|ireland|italy|italia|kosovo|latvia|liechtenstein|lithuania|luxembourg|malta|moldova|monaco|montenegro|netherlands|north macedonia|norway|poland|portugal|romania|san marino|serbia|slovakia|slovenia|spain|españa|sweden|switzerland|uk|united kingdom|vatican|dach|benelux|baltics|balkans|eu|europe|european|scandinavia|nordic)(\b|$)/i.test(value);
}

/** Deterministic qualification: no model output controls routing or priority. */
export function scoreSubmission(submission) {
  const commerceReady = !/^(none|no-store|pre-launch|idea)$/.test(submission.platform);
  const europeReady = isEuropeanMarket(submission.primaryMarket);
  const revenueScore = {
    "under-500k": 0,
    "500k-1m": 15,
    "1m-5m": 25,
    "5m-20m": 30,
    "20m-plus": 35,
    confidential: 5,
  }[submission.annualRevenue] ?? 0;
  const adSpendScore = {
    none: 0,
    "under-1k": 0,
    "1k-5k": 5,
    "5k-20k": 10,
    "20k-50k": 20,
    "50k-plus": 25,
    confidential: 5,
  }[submission.monthlyAdSpend] ?? 0;
  const budgetReady = ["10k-15k", "10k-25k", "15k-30k", "25k-plus", "30k-plus"].includes(submission.projectBudget);
  const timingReady = ["now", "this-month", "this-quarter"].includes(submission.timeline);
  const ownerReady = ["decision-maker", "budget-owner", "sponsor-access"].includes(submission.ownerReadiness);
  const concreteProblem = submission.workstreams.length > 0 && submission.problem.length >= 3 && !/^(research|curious|training|student)$/i.test(submission.trigger);
  const scaleReady = revenueScore >= 25 || adSpendScore >= 20 || (revenueScore >= 15 && adSpendScore >= 10);

  const score =
    (commerceReady ? 10 : 0) +
    (europeReady ? 10 : 0) +
    revenueScore +
    adSpendScore +
    (concreteProblem ? 10 : 0) +
    (timingReady ? 10 : 0) +
    (budgetReady ? 20 : 0) +
    (ownerReady ? 10 : 0);

  const hardReview = submission.projectBudget === "under-5k" || submission.timeline === "research" || !commerceReady;
  const fit = !hardReview && scaleReady && europeReady && concreteProblem && timingReady && budgetReady && ownerReady
    ? "high"
    : !hardReview && score >= 55
      ? "medium"
      : "low";

  return {
    fit,
    priority: fit === "high" ? "P1 (High)" : fit === "medium" ? "P2 (Mid)" : "P3 (Low)",
    score,
    safeguards: {
      ruleSetVersion: QUALIFICATION_RULESET_VERSION,
      automatedEffect: fit === "high"
        ? "queue_priority_and_optional_booking_shortcut"
        : "queue_priority_only",
      automatedRejection: false,
      automatedContractDecision: false,
      automatedPricing: false,
      humanReviewRequired: true,
    },
    signals: {
      commerceReady,
      europeReady,
      scaleReady,
      concreteProblem,
      timingReady,
      budgetReady,
      ownerReady,
    },
  };
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, private",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function requestOriginAllowed(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let parsed;
  try {
    parsed = new URL(origin).origin;
  } catch {
    return false;
  }
  const sameOrigin = new URL(request.url).origin;
  const configured = cleanString(env.ALLOWED_ORIGINS, 4000)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      try {
        return new URL(item).origin;
      } catch {
        return "";
      }
    });
  return parsed === sameOrigin || configured.includes(parsed);
}

function isLocalRequest(request) {
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function isCloudflarePagesPreview(request) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return hostname === "aetheris-studio.pages.dev"
    || hostname.endsWith(".aetheris-studio.pages.dev");
}

async function fetchWithTimeout(fetchImpl, input, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("upstream_timeout"), timeoutMs);
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function hostnameMatchesRule(hostname, rule) {
  const candidate = cleanString(hostname, 253).toLowerCase();
  const expected = cleanString(rule, 253).toLowerCase();
  if (!candidate || !expected) return false;
  if (!expected.startsWith("*.")) return candidate === expected;

  const suffix = expected.slice(1);
  return candidate.endsWith(suffix) && candidate.length > suffix.length;
}

async function verifyTurnstile(request, env, token, fetchImpl) {
  if (env.ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS === "true" && isLocalRequest(request)) return true;
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;

  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  const connectingIp = request.headers.get("cf-connecting-ip");
  if (connectingIp) form.set("remoteip", connectingIp);

  const response = await fetchWithTimeout(
    fetchImpl,
    TURNSTILE_VERIFY_URL,
    { method: "POST", body: form },
    TURNSTILE_TIMEOUT_MS,
  );
  if (!response.ok) return false;
  const result = await response.json();
  if (!result?.success) return false;

  const expectedHosts = cleanString(env.TURNSTILE_EXPECTED_HOSTNAMES, 2000)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const allowedHosts = expectedHosts.length ? expectedHosts : [new URL(request.url).hostname.toLowerCase()];
  return allowedHosts.some((rule) => hostnameMatchesRule(result.hostname, rule));
}

class AttioError extends Error {
  constructor(status, path) {
    super(`Attio request failed (${status}) at ${path}`);
    this.name = "AttioError";
    this.status = status;
  }
}

async function attioRequest(fetchImpl, token, method, path, body) {
  const response = await fetchWithTimeout(
    fetchImpl,
    `${ATTIO_API_BASE}/${path.replace(/^\//, "")}`,
    {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    ATTIO_TIMEOUT_MS,
  );
  if (!response.ok) throw new AttioError(response.status, path);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function attioTextValue(attribute) {
  if (typeof attribute === "string") return attribute;
  if (!Array.isArray(attribute)) return "";
  return attribute.map((item) => item?.value || item?.text || "").filter(Boolean).join("\n");
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function qualificationLedger(submission, qualification, receivedAt) {
  return {
    schemaVersion: 1,
    source: "website_qualification",
    submissionId: submission.submissionId,
    receivedAt,
    identity: {
      name: submission.name,
      workEmail: submission.workEmail,
      role: submission.role,
      company: submission.company,
      storeUrl: submission.storeUrl,
      emailVerified: false,
      identityAssurance: "turnstile-only",
    },
    qualification: {
      fit: qualification.fit,
      priority: qualification.priority,
      score: qualification.score,
      safeguards: qualification.safeguards,
      signals: qualification.signals,
      inputs: {
        platform: submission.platform,
        annualRevenue: submission.annualRevenue,
        monthlyAdSpend: submission.monthlyAdSpend,
        primaryMarket: submission.primaryMarket,
        workstreams: submission.workstreams,
        problem: submission.problem,
        trigger: submission.trigger,
        timeline: submission.timeline,
        projectBudget: submission.projectBudget,
        ownerReadiness: submission.ownerReadiness,
        constraint: submission.constraint,
      },
    },
    attribution: submission.attribution,
    consent: {
      privacyNotice: {
        acknowledged: true,
        noticeVersion: QUALIFICATION_NOTICE_VERSION,
        clientRecordedAt: submission.privacyAcceptedAt || null,
        serverRecordedAt: receivedAt,
      },
      marketing: {
        requested: submission.marketingConsent,
        clientRecordedAt: submission.marketingConsentAt || null,
        serverRecordedAt: submission.marketingConsent ? receivedAt : null,
        wordingVersion: submission.marketingConsent ? QUALIFICATION_NOTICE_VERSION : null,
        source: submission.marketingConsentSource || null,
        emailVerified: false,
        activationPermitted: false,
      },
      analytics: {
        granted: submission.analyticsConsent,
        clientRecordedAt: submission.analyticsConsentAt || null,
        serverRecordedAt: receivedAt,
        schemaVersion: submission.analyticsConsent ? ANALYTICS_CONSENT_SCHEMA_VERSION : null,
        source: submission.analyticsConsentSource || null,
      },
    },
    security: {
      turnstileVerified: true,
    },
  };
}

export function canonicalSubmissionEvidence(submission) {
  return {
    contractVersion: WEBSITE_PAYLOAD_CONTRACT_VERSION,
    source: "website_qualification",
    submissionId: submission.submissionId,
    identity: {
      name: submission.name,
      workEmail: submission.workEmail,
      role: submission.role,
      company: submission.company,
      storeUrl: submission.storeUrl,
    },
    qualificationInputs: {
      platform: submission.platform,
      annualRevenue: submission.annualRevenue,
      monthlyAdSpend: submission.monthlyAdSpend,
      primaryMarket: submission.primaryMarket,
      workstreams: submission.workstreams,
      problem: submission.problem,
      trigger: submission.trigger,
      timeline: submission.timeline,
      projectBudget: submission.projectBudget,
      ownerReadiness: submission.ownerReadiness,
      constraint: submission.constraint,
    },
    attribution: submission.attribution,
    consent: {
      privacyNotice: {
        acknowledged: submission.privacyAccepted,
        noticeVersion: submission.privacyVersion,
        clientRecordedAt: submission.privacyAcceptedAt,
      },
      marketing: {
        requested: submission.marketingConsent,
        clientRecordedAt: submission.marketingConsentAt || null,
        wordingVersion: submission.marketingConsentVersion || null,
        source: submission.marketingConsentSource || null,
      },
      analytics: {
        granted: submission.analyticsConsent,
        clientRecordedAt: submission.analyticsConsentAt || null,
        schemaVersion: submission.analyticsConsentVersion || null,
        source: submission.analyticsConsentSource || null,
      },
    },
  };
}

async function findWebsiteEntry(fetchImpl, token, listId, submissionId) {
  const result = await attioRequest(
    fetchImpl,
    token,
    "POST",
    `lists/${encodeURIComponent(listId)}/entries/query`,
    {
      filter: { [WEBSITE_ENTRY_ATTRIBUTES.submissionId]: { value: { $eq: submissionId } } },
      limit: 2,
      offset: 0,
    },
  );
  const matches = Array.isArray(result?.data) ? result.data : [];
  if (matches.length > 1) throw new AttioError(409, "duplicate_website_submission_id");
  return matches[0] || null;
}

function entryHash(entry) {
  return attioTextValue(entry?.entry_values?.[WEBSITE_ENTRY_ATTRIBUTES.payloadSha256]);
}

async function persistToAttio(submission, qualification, env, fetchImpl, receivedAt) {
  const token = env.ATTIO_API_KEY;
  const inboundListId = env.ATTIO_WEBSITE_INBOUND_LIST_ID;
  const intakeRecordId = resolveIntakeRecordId(env);
  const ledgerJson = JSON.stringify(qualificationLedger(submission, qualification, receivedAt));
  const deterministicEvidence = JSON.stringify(canonicalSubmissionEvidence(submission));
  const payloadSha256 = await sha256Hex(deterministicEvidence);

  const existingEntry = await findWebsiteEntry(fetchImpl, token, inboundListId, submission.submissionId);
  if (existingEntry) {
    if (entryHash(existingEntry) !== payloadSha256) throw new AttioError(409, "website_submission_id");
    return existingEntry;
  }

  const entryBody = {
    data: {
      parent_record_id: intakeRecordId,
      parent_object: "people",
      entry_values: {
        [WEBSITE_ENTRY_ATTRIBUTES.submissionId]: submission.submissionId,
        [WEBSITE_ENTRY_ATTRIBUTES.receivedAt]: receivedAt,
        [WEBSITE_ENTRY_ATTRIBUTES.payloadSha256]: payloadSha256,
        [WEBSITE_ENTRY_ATTRIBUTES.ledgerJson]: ledgerJson,
        [WEBSITE_ENTRY_ATTRIBUTES.fit]: qualification.fit,
        [WEBSITE_ENTRY_ATTRIBUTES.priority]: qualification.priority,
        [WEBSITE_ENTRY_ATTRIBUTES.contactName]: submission.name,
        [WEBSITE_ENTRY_ATTRIBUTES.workEmail]: submission.workEmail,
        [WEBSITE_ENTRY_ATTRIBUTES.role]: submission.role,
        [WEBSITE_ENTRY_ATTRIBUTES.company]: submission.company,
        [WEBSITE_ENTRY_ATTRIBUTES.storeUrl]: submission.storeUrl,
      },
    },
  };

  try {
    return await attioRequest(
      fetchImpl,
      token,
      "POST",
      `lists/${encodeURIComponent(inboundListId)}/entries`,
      entryBody,
    );
  } catch (error) {
    if (!(error instanceof AttioError)) throw error;
    const raced = await findWebsiteEntry(fetchImpl, token, inboundListId, submission.submissionId);
    if (!raced || entryHash(raced) !== payloadSha256) throw error;
    return raced;
  }
}

export async function onRequestPost(context) {
  const { request, env = {} } = context;
  const fetchImpl = context.fetch || fetch;

  if (isCloudflarePagesPreview(request) && env.ALLOW_PREVIEW_SUBMISSIONS !== "true") {
    return jsonResponse({ status: "review", error: { code: "preview_submissions_disabled" } }, 403);
  }
  if (!requestOriginAllowed(request, env)) {
    return jsonResponse({ status: "review", error: { code: "origin_denied" } }, 403);
  }
  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/json(?:;|$)/i.test(contentType)) {
    return jsonResponse({ status: "review", error: { code: "json_required" } }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ status: "review", error: { code: "payload_too_large" } }, 413);
  }

  let raw;
  try {
    const body = await readRequestBodyWithinLimit(request, MAX_BODY_BYTES);
    if (body.tooLarge) {
      return jsonResponse({ status: "review", error: { code: "payload_too_large" } }, 413);
    }
    raw = JSON.parse(body.text);
  } catch {
    return jsonResponse({ status: "review", error: { code: "invalid_json" } }, 400);
  }

  // Deliberately indistinguishable success path: honeypot submissions never touch the CRM.
  if (cleanString(raw?.website, 100)) return jsonResponse({ status: "review" }, 202);

  const validation = validateSubmission(raw);
  if (!validation.valid) {
    return jsonResponse(
      { status: "review", error: { code: "validation_failed", fields: Object.keys(validation.errors) } },
      400,
    );
  }
  const submission = validation.value;

  let human = false;
  try {
    human = await verifyTurnstile(request, env, submission.turnstileToken, fetchImpl);
  } catch {
    human = false;
  }
  if (!human) return jsonResponse({ status: "review", error: { code: "verification_failed" } }, 403);

  if (!env.ATTIO_API_KEY || !env.ATTIO_WEBSITE_INBOUND_LIST_ID || !resolveIntakeRecordId(env)) {
    return jsonResponse({ status: "review", error: { code: "temporarily_unavailable" } }, 503);
  }

  const qualification = scoreSubmission(submission);
  let persistedEntry;
  try {
    persistedEntry = await persistToAttio(submission, qualification, env, fetchImpl, new Date().toISOString());
  } catch {
    return jsonResponse({ status: "review", error: { code: "temporarily_unavailable" } }, 502);
  }

  // An idempotent retry may resolve to an entry created under an earlier
  // ruleset. Return the stored fit so the public outcome cannot diverge from
  // the immutable evidence ledger for that submission ID.
  const persistedFit = attioTextValue(persistedEntry?.entry_values?.[WEBSITE_ENTRY_ATTRIBUTES.fit]);
  const effectiveFit = persistedFit || qualification.fit;
  return jsonResponse({ status: effectiveFit === "high" ? "qualified" : "review" }, 201);
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    const response = jsonResponse(
      { ok: false, error: "method_not_allowed" },
      405,
      { allow: "POST" },
    );
    if (context.request.method === "HEAD") {
      return new Response(null, { status: response.status, headers: response.headers });
    }
    return response;
  }
  return onRequestPost(context);
}
