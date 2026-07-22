# Website qualification → Attio

## Resolved live resources (2026-07-22)

- Attio workspace: `Aetheris Solutions` (`87a80bf8-990d-4262-b573-22923060b061`).
- Dedicated list: `Website Inbound`, slug `website_inbound`, parent object `people`.
- Website Inbound list ID: `ea94e071-c5a1-4255-aff3-429b033c7d39`.
- Cloudflare account: `Info@aetheris-solutions.com's Account` (`cd46c98eac675a734eb9a8da628976a5`).
- Pages project: `aetheris-studio`; canonical hostnames `aetherisstudio.com`, `www.aetherisstudio.com`, plus `aetheris-studio.pages.dev`.
- Turnstile widget: `Aetheris Studio — Website Qualification`, managed mode, no pre-clearance. Its public site key is recorded in `.env.example`; its private key is stored only as an encrypted Pages secret. Server verification accepts the canonical hosts plus explicit `*.aetheris-studio.pages.dev` preview subdomains.
- The six required bindings are present as encrypted values in both Pages `production` and `preview`: `ATTIO_API_KEY`, `ATTIO_WEBSITE_INBOUND_LIST_ID`, `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY`, `ALLOWED_ORIGINS`, `TURNSTILE_EXPECTED_HOSTNAMES`.

No real lead was created while provisioning these resources. The first end-to-end CRM smoke remains a separately authorised launch action.

The public form posts JSON to the same-origin endpoint `POST /api/qualification`. The Cloudflare Pages Function validates and scores the request before writing to Attio. The browser never receives an Attio key, an internal score, an Attio record ID, or another lead's data.

## CRM boundary

- Attio remains the source of truth.
- Website submissions enter a dedicated **Website Inbound** list through `ATTIO_WEBSITE_INBOUND_LIST_ID`.
- The function never writes to the Outbound Pipeline and never changes `aetheris_track` or `aetheris_outreach_status`.
- It upserts the company by store domain and the person by work email, then patches only:
  - `aetheris_business_unit = Studio`
  - `aetheris_priority = P1 (High) | P2 (Mid) | P3 (Low)`
  - `aetheris_hook_log`, preserving existing history
- The list entry uses `PUT`, so retries do not create duplicate entries for the same person. The hook ledger includes `[website:<submissionId>]` and will not append the same submission twice.

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
  "constraint": "Optional context",
  "privacyAccepted": true,
  "privacyVersion": "2026-07-22",
  "privacyAcceptedAt": "2026-07-22T09:00:00.000Z",
  "marketingConsent": false,
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

Everything else returns `review`; there is no public rejection response. Internally the CRM priority is P1/P2/P3. The exact deterministic score is stored in the private Attio hook ledger, not sent to analytics or the browser.

## Cloudflare configuration

Set these as encrypted Pages secrets/variables. Never prefix a private value with `VITE_`.

Required:

- `ATTIO_API_KEY`: server-only Attio token with record/list read-write access.
- `ATTIO_WEBSITE_INBOUND_LIST_ID`: the dedicated Website Inbound list ID, never the outbound list ID.
- `TURNSTILE_SECRET_KEY`: server-side Turnstile secret.
- `ALLOWED_ORIGINS`: comma-separated canonical origins, for example `https://aetherisstudio.com,https://www.aetherisstudio.com`.

Recommended:

- `TURNSTILE_EXPECTED_HOSTNAMES`: comma-separated hostnames returned by Siteverify, for example `aetherisstudio.com,www.aetherisstudio.com`. Explicit `*.example.com` rules are supported for controlled preview subdomains. When omitted, the request hostname is enforced.
- `ATTIO_HOOK_LOG_ATTRIBUTE` (default `aetheris_hook_log`).
- `ATTIO_BUSINESS_UNIT_ATTRIBUTE` (default `aetheris_business_unit`).
- `ATTIO_PRIORITY_ATTRIBUTE` (default `aetheris_priority`).

Frontend-only:

- `VITE_TURNSTILE_SITE_KEY`: public Turnstile site key.

`ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS=true` bypasses Turnstile **only** when the request URL is `localhost`, `127.0.0.1`, or `[::1]`. Do not set it in Cloudflare production or preview environments.

## Privacy and measurement

- Update `privacyVersion` whenever the published notice changes.
- Privacy acceptance and optional marketing consent are separate booleans. The ledger records the client acceptance time and the authoritative server receipt time.
- Send only lifecycle events such as `qualification_start`, `qualification_step_complete`, `qualification_submit`, and the returned status to analytics. Do not send names, emails, companies, URLs, free text, click IDs, or Attio IDs to `dataLayer`, Meta, Clarity, or Langfuse.
- Turnstile is verified server-side and fails closed. Origin checks, JSON/body-size limits, the honeypot, and `Cache-Control: no-store` are enforced before the CRM write.

## Verification

Unit tests use a local fetch double and never call Turnstile or Attio:

```sh
npm test -- functions/api/qualification.test.js
```

Before launch, create the Website Inbound list, set its ID, verify the Attio attribute slugs in a non-production record, and submit one explicitly authorized test lead. Do not use a real customer's identity for that smoke test.
