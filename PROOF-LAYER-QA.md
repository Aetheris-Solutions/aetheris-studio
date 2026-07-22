# Proof layer and qualification QA

Date: 22 July 2026

## Public evidence boundary

- That’s It: live production storefront, canonical implementation scope and Aetheris-authored brand system. No performance uplift is claimed without an approved baseline and period.
- Cielo 1914: 2026 operating archive, structured content kits and the live Social Agent queue. No Shopify delivery or commercial KPI is claimed by this case.
- Google Agent, Social Agent and Lead Gen Agent: dated, read-only production captures. Public facts are limited to aggregate values visible at capture; no credentials or personal records are shown.
- Capture provenance is recorded in `public/proof/README.md`.

## Automated gates

- Targeted Attio boundary and retry suite: 2 files, 19/19 tests passed. Re-run the full `npm test` gate after all concurrent launch changes are integrated.
- `npm run build`: TypeScript and Vite production build passed.
- Dynamic contrast: 32/32 sampled desktop, mobile and tablet frames passed; stable and every-frame gates passed.
- Attio tests use a fetch double. No real Turnstile token, Attio record or Cal.com booking was created.

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
- Outbound and canonical lead fields are untouched. The ledger records Turnstile-only identity assurance and blocks marketing activation until email verification.
- The browser receives only `qualified` or `review`; score, reasons and Attio IDs remain server-side.
- Analytics uses a non-PII allowlist. Contact data, free text, store URL and click IDs stay out of `dataLayer`.

## Live CRM activation state

- [x] Dedicated Attio **Website Inbound** list created and independently read back.
- [x] Existing Cloudflare bindings stored encrypted in both production and preview.
- [x] Dedicated managed Turnstile widget created with the canonical hostname allowlist.
- [x] Create the five additional Website Inbound identity attributes and provision the fixed internal intake record. The verified live list/record pair is pinned in the server Function; hosting may supply `ATTIO_WEBSITE_INTAKE_RECORD_ID` as an override.
- [ ] Perform one explicitly authorised synthetic submission and verify the fixed parent ID, unique Website Inbound entry, canonical evidence hash and full ledger. Confirm that no submitted Person or Company was queried, created or modified. No real lead was created during provisioning.
