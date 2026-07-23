# Aetheris Studio — release status

Date: 23 July 2026  
Scope: Vite Home candidate, localized routes, Pages Functions, proof layer,
consent, analytics and qualification.

## Deployment status

- **Candidate state:** preview-only; the validated application source is frozen
  at commit `2a0f8a1c22ca56f43e4935d75e03f32e2eefec34`.
- **Immutable candidate:**
  `https://aee66e53.aetheris-studio.pages.dev`.
- **Pull request:** `https://github.com/Aetheris-Solutions/aetheris-studio/pull/4`
  (open; do not merge while this record remains NO-GO).
- **Production cutover:** not performed.
- **Current Production application:** legacy Webflow export.
- **Known-good rollback deployment:**
  `https://0debe4ae.aetheris-studio.pages.dev`.
- **Known-good rollback source commit:** `12d9b5f`.
- **Real team population:** intentionally excluded. The public roster remains
  empty and six anonymous placeholders are rendered.

The checked `dist` tree contains 50 files. Its sorted SHA-256 manifest is held
with the release evidence and has SHA-256
`621f2e31ce830c53eb48d7c332352d001f03cf903b4df45f4a64084e880a4d01`.

## Current automated evidence

The following local non-writing gate was run on 23 July 2026:

| Gate | Result | External write |
| --- | --- | --- |
| `npm test` | PASS — 58 Vitest tests and 23 Node tests; 81 total, 0 failures | None; network integrations use local doubles |
| `npm run build:release` | PASS — public Turnstile key validated, TypeScript and Vite production build complete | None |
| `npm audit --omit=dev` | PASS — 0 known production dependency vulnerabilities | Registry read only |
| strict dynamic contrast | PASS — EN/IT across desktop, mobile, portrait tablet and landscape; stable and every sampled frame green | None |
| immutable-preview consent/network QA | PASS — EN/IT fresh, close, reject, accept, reload, granular preferences and withdrawal; 0 failures | Vendor network reads after explicit synthetic acceptance; no CRM or booking write |
| immutable-preview HTTP matrix | PASS — EN/IT pages and policies, legacy redirects, localized `404`, preview robots, sitemap, security/cache headers and API method contract | GET/HEAD and non-writing method checks only |
| immutable-preview visual smoke | PASS — EN/IT at 1440×900 and 390×844; stable intro state, no horizontal overflow or text clipping | None |

The GitHub workflow verifies tests, the strict release build and the production
dependency audit. The open pull request must remain unmerged until that
independent CI job and the Git-integrated Cloudflare Preview both pass.

The CI job name deliberately does not claim to perform browser, consent, legal
or Production deployment verification.

## External-write history

One synthetic Attio qualification smoke was explicitly authorised, written and
read back on 22 July 2026. Its detailed identifiers and assertions remain in
the historical `PROOF-LAYER-QA.md` record. No real customer lead was used.

That smoke is activation evidence, not a recurring gate. No additional Attio
submission and no Cal.com booking was performed during the 23 July release
review. Do not repeat either action without a new explicit authorisation from
the release owner for that exact external write.

All routine release verification must use rejection, malformed-payload,
mocked, GET/HEAD-only or other non-writing paths.

## Production no-go

Production remains blocked. At minimum, close and evidence every open item in
`docs/LEGAL-PRIVACY-REVIEW-2026-07-22.md`, including:

- official REA verification;
- Italian privacy-counsel review, legitimate-interest assessment and Article
  22/DPIA screening;
- executed processor and international-transfer records;
- live GA4, GTM and Clarity settings;
- operational retention and deletion/review controls;
- Cloudflare log-retention confirmation;
- preservation and owner approval of the immutable-preview consent/network
  evidence for the final GTM state.

The proof layer also remains publication-gated where
`docs/PROOF-ASSETS.md` records missing client, photographer, retailer or
third-party rights evidence. Project-owner approval does not replace those
rights.

## Cutover decision

The release is **NO-GO for Production** at the date of this record. A later
go/no-go record must name the frozen commit, immutable preview, completed
evidence, approved legal version and exact rollback target before any
`main` deployment.
