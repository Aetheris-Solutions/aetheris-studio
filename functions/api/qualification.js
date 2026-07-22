const MAX_BODY_BYTES = 32 * 1024;
const ATTIO_API_BASE = "https://api.attio.com/v2";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

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

function normalizeAttribution(raw) {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const landingUrl = normalizeUrl(input.landingUrl);
  const referrer = normalizeUrl(input.referrer);
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
  const turnstileToken = cleanString(input.turnstileToken, 2048);

  const workstreams = Array.isArray(input.workstreams)
    ? [...new Set(input.workstreams.map((item) => cleanString(item, 100).toLowerCase()).filter(Boolean))].slice(0, 12)
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
  if (!privacyVersion) errors.privacyVersion = "required";
  if (privacyAcceptedAt && Number.isNaN(Date.parse(privacyAcceptedAt))) errors.privacyAcceptedAt = "invalid";

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
      marketingConsent: input.marketingConsent === true,
      attribution: normalizeAttribution(input.attribution),
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

/** Append once per submission while preserving the existing Attio text value. */
export function appendHookLog(existing, entry, submissionId, maxLength = 16000) {
  const prior = typeof existing === "string" ? existing.trim() : "";
  const marker = `[website:${submissionId}]`;
  if (prior.includes(marker)) return prior;
  const line = `${marker} ${cleanString(entry, 8000)}`.trim();
  if (!prior) return line.slice(0, maxLength);

  // Existing CRM history wins over new enrichment. If the attribute is near
  // its safe payload ceiling, append only what fits and never cut the front of
  // the established ledger.
  const available = maxLength - prior.length - 1;
  if (available <= marker.length) return prior;
  return `${prior}\n${line.slice(0, available)}`;
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

  const response = await fetchImpl(TURNSTILE_VERIFY_URL, { method: "POST", body: form });
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
  const response = await fetchImpl(`${ATTIO_API_BASE}/${path.replace(/^\//, "")}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new AttioError(response.status, path);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function attioTextValue(attribute) {
  if (typeof attribute === "string") return attribute;
  if (!Array.isArray(attribute)) return "";
  return attribute.map((item) => item?.value || item?.text || "").filter(Boolean).join("\n");
}

function storeDomain(storeUrl) {
  return new URL(storeUrl).hostname.toLowerCase().replace(/^www\./, "");
}

function qualificationLedger(submission, qualification, receivedAt) {
  const record = {
    receivedAt,
    fit: qualification.fit,
    score: qualification.score,
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
    attribution: submission.attribution,
    consent: {
      privacyAccepted: true,
      privacyVersion: submission.privacyVersion,
      clientAcceptedAt: submission.privacyAcceptedAt || null,
      serverReceivedAt: receivedAt,
      marketingConsent: submission.marketingConsent,
    },
  };
  return `Website inbound ${JSON.stringify(record)}`;
}

async function persistToAttio(submission, qualification, env, fetchImpl, receivedAt) {
  const token = env.ATTIO_API_KEY;
  const inboundListId = env.ATTIO_WEBSITE_INBOUND_LIST_ID;
  const domain = storeDomain(submission.storeUrl);

  await attioRequest(fetchImpl, token, "PUT", "objects/companies/records?matching_attribute=domains", {
    data: { values: { name: submission.company, domains: [{ domain }] } },
  });

  const personValues = {
    name: submission.name,
    email_addresses: [submission.workEmail],
    job_title: submission.role,
    company: [{ target_object: "companies", domains: [{ domain }] }],
  };
  const personResult = await attioRequest(fetchImpl, token, "PUT", "objects/people/records?matching_attribute=email_addresses", {
    data: { values: personValues },
  });
  const personRecordId = personResult?.data?.id?.record_id;
  if (!personRecordId) throw new AttioError(502, "objects/people/records");

  const person = await attioRequest(fetchImpl, token, "GET", `objects/people/records/${encodeURIComponent(personRecordId)}`);
  const hookAttribute = cleanString(env.ATTIO_HOOK_LOG_ATTRIBUTE, 100) || "aetheris_hook_log";
  const unitAttribute = cleanString(env.ATTIO_BUSINESS_UNIT_ATTRIBUTE, 100) || "aetheris_business_unit";
  const priorityAttribute = cleanString(env.ATTIO_PRIORITY_ATTRIBUTE, 100) || "aetheris_priority";
  const currentHook = attioTextValue(person?.data?.values?.[hookAttribute]);
  const hookLog = appendHookLog(
    currentHook,
    qualificationLedger(submission, qualification, receivedAt),
    submission.submissionId,
  );

  await attioRequest(fetchImpl, token, "PATCH", `objects/people/records/${encodeURIComponent(personRecordId)}`, {
    data: {
      values: {
        [unitAttribute]: "Studio",
        [priorityAttribute]: qualification.priority,
        [hookAttribute]: hookLog,
      },
    },
  });

  await attioRequest(fetchImpl, token, "PUT", `lists/${encodeURIComponent(inboundListId)}/entries`, {
    data: {
      parent_record_id: personRecordId,
      parent_object: "people",
      entry_values: {},
    },
  });
}

export async function onRequestPost(context) {
  const { request, env = {} } = context;
  const fetchImpl = context.fetch || fetch;

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
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ status: "review", error: { code: "payload_too_large" } }, 413);
    }
    raw = JSON.parse(body);
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

  if (!env.ATTIO_API_KEY || !env.ATTIO_WEBSITE_INBOUND_LIST_ID) {
    return jsonResponse({ status: "review", error: { code: "temporarily_unavailable" } }, 503);
  }

  const qualification = scoreSubmission(submission);
  try {
    await persistToAttio(submission, qualification, env, fetchImpl, new Date().toISOString());
  } catch {
    return jsonResponse({ status: "review", error: { code: "temporarily_unavailable" } }, 502);
  }

  return jsonResponse({ status: qualification.fit === "high" ? "qualified" : "review" }, 201);
}
