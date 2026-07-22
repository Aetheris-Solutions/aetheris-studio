# Proof layer and qualification QA

Date: 22 July 2026

## Public evidence boundary

- That’s It: live production storefront, canonical implementation scope and Aetheris-authored brand system. No performance uplift is claimed without an approved baseline and period.
- Cielo 1914: 2026 operating archive, structured content kits and the live Social Agent queue. No Shopify delivery or commercial KPI is claimed by this case.
- Google Agent, Social Agent and Lead Gen Agent: dated, read-only production captures. Public facts are limited to aggregate values visible at capture; no credentials or personal records are shown.
- Capture provenance is recorded in `public/proof/README.md`.

## Automated gates

- `npm test`: 3 files, 20/20 tests passed.
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
- Company is upserted by domain; person by work email; the list entry is asserted with `PUT` into the dedicated Website Inbound list.
- Writes are limited to `aetheris_business_unit`, `aetheris_priority` and append-only `aetheris_hook_log`. Outbound track/status fields are untouched.
- Existing hook history is never truncated to make room for a new submission.
- The browser receives only `qualified` or `review`; score, reasons and Attio IDs remain server-side.
- Analytics uses a non-PII allowlist. Contact data, free text, store URL and click IDs stay out of `dataLayer`.

## Live CRM activation state

- [x] Dedicated Attio **Website Inbound** list created and independently read back.
- [x] Required Cloudflare bindings stored encrypted in both production and preview.
- [x] Dedicated managed Turnstile widget created with the canonical hostname allowlist.
- [ ] Perform one explicitly authorised synthetic submission and verify the resulting Attio company, person, hook ledger and list entry. No real lead was created during provisioning.
