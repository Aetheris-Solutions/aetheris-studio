# Proof layer and qualification QA

Date: 22 July 2026

## Public evidence boundary

- That’s It: live production storefront, canonical implementation scope and Aetheris-authored brand system. No performance uplift is claimed without an approved baseline and period.
- Cielo 1914: 2026 operating archive, structured content kits and the live Social Agent queue. No Shopify delivery or commercial KPI is claimed by this case.
- Google Agent, Social Agent and Lead Gen Agent: dated, read-only production captures. Public facts are limited to aggregate values visible at capture; no credentials or personal records are shown.
- Capture provenance, exact file hashes, claim IDs and current rights boundaries are recorded in `docs/PROOF-ASSETS.md`.

## Automated gates

- Full `npm test` gate: 58/58 Vitest checks plus 22/22 legacy/static checks passed (80/80 total).
- Targeted Attio boundary, retry, payload-limit and method suite passed with fetch doubles only.
- `npm run build:release`: public build variable validation, TypeScript and Vite production build passed.
- Dynamic contrast: both locales across desktop, mobile, portrait tablet and landscape passed; stable and every sampled-frame strict gates passed.
- During the automated mocked gates, Attio uses a fetch double and no real Turnstile token, Attio record or Cal.com booking is created. The separately authorised historical CRM smoke is recorded below.

## Browser and responsive QA

- Chrome desktop 1512×771: zero broken images, missing `alt` attributes, duplicate IDs or empty accessible button names.
- Direct Cal.com links before qualification: zero.
- Qualification step 1 validation: passed with focusable error summary and field errors.
- Step 1 → 2 → 3 transition: passed after preventing browser reinterpretation of the changing action button as a form submit.
- Deep-link restoration: `#work`, agent anchors and `#qualification` are re-anchored after stylesheet/font/media settlement.
- Responsive same-origin viewport checks:
  - 390×700 mobile proof index: 0 px horizontal overflow.
  - 390×700 mobile qualification panel: 0 px horizontal overflow.
  - 412×700 Android agent ledger and capture: 0 px horizontal overflow.
  - 1024×700 tablet qualification panel: 0 px horizontal overflow.

## CRM safety contract

- Browser → same-origin `POST /api/qualification`; no Attio credential is present in the client bundle.
- Origin, content type, 32 KB body limit, honeypot and server-side Turnstile validation fail closed.
- No submitted Person or Company is queried, created or updated from unverified public claims.
- Every entry is parented to one pre-provisioned internal intake record used only as the stable technical parent for the People-backed Website Inbound list.
- Every submission is a separate Website Inbound entry created with `POST`. Identity remains in dedicated entry attributes, never canonical Person/Company fields.
- Unique `website_submission_id` plus a contract-versioned hash of canonical source evidence makes an unchanged ambiguous retry idempotent. The hash excludes derived scoring, server time and Turnstile token.
- The browser freezes the attempt payload across ambiguous retries and refreshes only Turnstile. Form or consent changes mint a new attempt.
- Outbound and canonical lead fields are untouched. The ledger records Turnstile-only identity assurance. This release exposes no marketing opt-in, forces a negative state in the browser and rejects crafted positive values server-side.
- The browser receives only `qualified` or `review`; score, reasons and Attio IDs remain server-side.
- Analytics uses a non-PII allowlist. Contact data, free text, store URL and click IDs stay out of `dataLayer`.

## Live CRM activation state

- [x] Dedicated Attio **Website Inbound** list created and independently read back.
- [x] Runtime Cloudflare bindings configured in production and preview: private API/Turnstile keys encrypted, public Vite Turnstile site key stored as `plain_text`, and non-secret origin/hostname configuration present.
- [x] Dedicated managed Turnstile widget created with the canonical hostname allowlist.
- [x] Create the five additional Website Inbound identity attributes and provision the fixed internal intake record. The verified live list/record pair is pinned in the server Function; hosting may supply `ATTIO_WEBSITE_INTAKE_RECORD_ID` as an override.
- [x] Explicitly authorised synthetic submission written and read back: submission `website_smoke_1784756927748-6cb84c09`, entry `f410cbef-2f8f-4bfc-9bfd-ac3ddb35d319`, fixed parent `02ec4555-ba27-4799-a2ce-b0468d3aff0e`. All eleven entry fields, canonical SHA-256, ledger identity/consent/security flags and token exclusion verified. The official Cloudflare always-pass testing credential exercised Siteverify; no submitted Person record was created and the Function has no submitted Company write path.
