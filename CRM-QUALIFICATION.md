# Website qualification → Attio

## Resolved live resources (2026-07-22)

- Attio workspace: `Aetheris Solutions` (`87a80bf8-990d-4262-b573-22923060b061`).
- Dedicated list: `Website Inbound`, slug `website_inbound`, parent object `people`.
- Website Inbound list ID: `ea94e071-c5a1-4255-aff3-429b033c7d39`.
- Cloudflare account: `Info@aetheris-solutions.com's Account` (`cd46c98eac675a734eb9a8da628976a5`).
- Pages project: `aetheris-studio`; canonical hostnames `aetherisstudio.com`, `www.aetherisstudio.com`, plus `aetheris-studio.pages.dev`.
- Turnstile widget: `Aetheris Studio — Website Qualification`, managed mode, no pre-clearance. Its public site key is recorded in `.env.example`; its private key is stored only as an encrypted Pages secret. Server verification accepts the canonical hosts plus explicit `*.aetheris-studio.pages.dev` preview subdomains.
- The runtime bindings are present in both Pages `production` and `preview`. `ATTIO_API_KEY` and `TURNSTILE_SECRET_KEY` remain encrypted; `VITE_TURNSTILE_SITE_KEY` is intentionally a public `plain_text` build variable. List IDs, origin allowlists and expected hostnames are treated as configuration and are not presented as secrets.
- The fixed internal Attio People record is provisioned. Its UUID is pinned server-side to the verified live Website Inbound list ID and may be overridden with `ATTIO_WEBSITE_INTAKE_RECORD_ID` in hosting. This is intentionally not a submitted lead; unknown list configurations still fail closed while the binding is absent.

No real customer lead was created while provisioning these resources. One explicitly authorised synthetic QA submission was subsequently written and read back through the final Function contract; its identifiers and assertions are recorded in `PROOF-LAYER-QA.md`.

The public form posts JSON to the same-origin endpoint `POST /api/qualification`. The Cloudflare Pages Function validates and scores the request before writing to Attio. The browser never receives an Attio key, an internal score, an Attio record ID, or another lead's data.

## CRM boundary

- Attio remains the source of truth.
- Website submissions enter a dedicated **Website Inbound** list through `ATTIO_WEBSITE_INBOUND_LIST_ID`.
- The function never writes to the Outbound Pipeline and never changes `aetheris_track` or `aetheris_outreach_status`.
- It never queries, creates or updates a submitted Person or Company. Unverified identity claims never enter canonical Person/Company attributes.
- Every Website Inbound entry is parented to one pre-provisioned internal People record identified by `ATTIO_WEBSITE_INTAKE_RECORD_ID`. That record is only a stable technical parent for the People-backed list.
- Each accepted submission creates its own list entry with `POST`; identity and commerce claims remain entry-scoped.
- `website_submission_id` is unique. `website_payload_sha256` hashes canonical normalized source evidence under contract version `1`, excluding Turnstile token, server receipt time and derived qualification. Same-attempt retries are idempotent and conflicting ID reuse fails closed.
- The browser freezes the submission ID, consent timestamps and remaining request evidence across an ambiguous retry, refreshing only the Turnstile token. Any form or consent change starts a new attempt.
- The entry stores receipt, hash, ledger, fit/priority and the five submitted identity fields listed below. This is application-append-only, not WORM storage.

Application-required Website Inbound entry attributes (Attio does not permit `is_required: true` on list attributes, so completeness is enforced by the Function and the smoke gate):

- `website_submission_id` — text, unique;
- `website_received_at` — timestamp;
- `website_payload_sha256` — text;
- `website_ledger_json` — text;
- `website_fit` — text;
- `website_priority` — text;
- `website_contact_name` — text;
- `website_work_email` — text;
- `website_role` — text;
- `website_company` — text;
- `website_store_url` — text.

## Public request contract

```json
{
  "submissionId": "website_01J...",
  "name": "Ada Lovelace",
  "workEmail": "ada@brand.example",
  "role": "Ecommerce Director",
  "company": "Example Brand",
  "storeUrl": "https://shop.brand.example",
  "platform": "shopify-plus",
  "annualRevenue": "1m-5m",
  "monthlyAdSpend": "20k-50k",
  "primaryMarket": "European Union",
  "workstreams": ["cro", "tracking"],
  "problem": "Conversion has stalled while traffic keeps growing.",
  "trigger": "growth-stalled",
  "timeline": "this-quarter",
  "projectBudget": "15k-30k",
  "ownerReadiness": "decision-maker",
  "constraint": "The main delivery constraint",
  "privacyAccepted": true,
  "privacyVersion": "2026-07-22",
  "privacyAcceptedAt": "2026-07-22T09:00:00.000Z",
  "marketingConsent": false,
  "marketingConsentAt": "",
  "marketingConsentVersion": "2026-07-22",
  "marketingConsentSource": "website_qualification",
  "analyticsConsent": true,
  "analyticsConsentAt": "2026-07-22T08:55:00.000Z",
  "analyticsConsentVersion": "1",
  "analyticsConsentSource": "banner",
  "attribution": {
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "commerce-growth",
    "utmContent": "hero",
    "utmTerm": "shopify agency",
    "gclid": "...",
    "wbraid": "...",
    "gbraid": "...",
    "landingUrl": "https://aetherisstudio.com/...",
    "referrer": "https://www.google.com/"
  },
  "turnstileToken": "...",
  "website": ""
}
```

`website` is the invisible honeypot. It must remain empty. Keep it out of browser autocomplete and the tab order, but do not remove it.

Canonical band values:

- `annualRevenue`: `under-500k`, `500k-1m`, `1m-5m`, `5m-20m`, `20m-plus`, `confidential`
- `monthlyAdSpend`: `none`, `under-1k`, `1k-5k`, `5k-20k`, `20k-50k`, `50k-plus`, `confidential`
- `timeline`: `now`, `this-month`, `this-quarter`, `six-months`, `research`
- `projectBudget`: `under-5k`, `5k-10k`, `10k-15k`, `15k-30k`, `30k-plus`, `unsure` (`10k-25k` and `25k-plus` are also accepted for landing-page compatibility)
- `ownerReadiness`: `decision-maker`, `budget-owner`, `sponsor-access`, `collaborator`, `exploring`

Success is intentionally minimal:

```json
{ "status": "qualified" }
```

or:

```json
{ "status": "review" }
```

Only `qualified` may unlock the Cal.com handoff in the UI. `review` keeps the lead in a manual review path. Validation errors expose field names but never field values; internal score, fit reason, Attio IDs and secrets stay server-side.

## Deterministic routing

High fit requires all of the following:

- an operating ecommerce platform;
- a European primary market;
- a scale signal: at least `1m-5m` annual revenue, at least `20k-50k` monthly ad spend, or the combined `500k-1m` + `5k-20k` threshold;
- a concrete workstream/problem;
- action by this quarter;
- project budget of at least EUR 10k;
- a decision maker, budget owner, or direct sponsor path.

Everything else returns `review`; there is no public rejection response. Internally the list entry records fit and P1/P2/P3 priority. The exact deterministic score is stored in the private per-submission Attio ledger, not sent to analytics or the browser.

## Cloudflare configuration

Set these as encrypted Pages secrets/variables. Never prefix a private value with `VITE_`.

Required:

- `ATTIO_API_KEY`: server-only Attio token with record/list read-write access.
- `ATTIO_WEBSITE_INBOUND_LIST_ID`: the dedicated Website Inbound list ID, never the outbound list ID.
- `ATTIO_WEBSITE_INTAKE_RECORD_ID`: optional hosting override for the fixed internal People record used only as the technical parent for Website Inbound entries. The verified live list/record pair is pinned server-side; every unknown list configuration returns `503` and performs no Attio request when this override is absent.
- `TURNSTILE_SECRET_KEY`: server-side Turnstile secret.
- `ALLOWED_ORIGINS`: comma-separated canonical origins, for example `https://aetherisstudio.com,https://www.aetherisstudio.com`.

Recommended:

- `TURNSTILE_EXPECTED_HOSTNAMES`: comma-separated hostnames returned by Siteverify, for example `aetherisstudio.com,www.aetherisstudio.com`. Explicit `*.example.com` rules are supported for controlled preview subdomains. When omitted, the request hostname is enforced.

Frontend-only:

- `VITE_TURNSTILE_SITE_KEY`: public Turnstile site key.

`ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS=true` bypasses Turnstile **only** when the request URL is `localhost`, `127.0.0.1`, or `[::1]`. Do not set it in Cloudflare production or preview environments.

## Privacy and measurement

- Update `privacyVersion` whenever the published notice changes.
- Privacy acknowledgement and analytics consent are separate. The server binds the current wording/schema versions and its receipt time; client times are supplementary only.
- This release exposes no marketing opt-in. The browser always sends `marketingConsent: false`, and the Function rejects a crafted positive value as unsupported. A future marketing workflow requires a separate reviewed contract and double opt-in before activation.
- Attribution is discarded server-side unless valid analytics-consent evidence accompanies the submission. Landing/referrer values are sanitised again to origin + path.
- Send only lifecycle events such as `qualification_start`, `qualification_step_complete`, `qualification_submit`, and the returned status to analytics. Do not send names, emails, companies, URLs, free text, click IDs, or Attio IDs to `dataLayer`, Meta, Clarity, or Langfuse.
- Turnstile is verified server-side and fails closed. Origin checks, JSON/body-size limits, the honeypot, and `Cache-Control: no-store` are enforced before the CRM write.

## Verification

Unit tests use a local fetch double and never call Turnstile or Attio:

```sh
npx vitest run tests/qualification-function.test.js src/lib/qualificationAttempt.test.ts
```

The five additional Website Inbound identity attributes, fixed internal intake record and all eleven attribute slugs were provisioned and verified on 22 July 2026. One explicitly authorised synthetic lead was submitted and read back; its unique entry, parent ID, source-evidence SHA-256 and ledger assertions are recorded in `PROOF-LAYER-QA.md`. That write is historical activation evidence and must not be repeated without a new explicit authorisation for the exact external write. Routine release gates use mocks or rejection paths and never use a real customer's identity.
