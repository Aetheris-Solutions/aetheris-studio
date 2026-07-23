# Aetheris Studio — release status

Date: 23 July 2026  
Scope: Vite Home candidate, localized routes, Pages Functions, proof layer,
consent, analytics and qualification.

## Deployment status

- **Candidate state:** preview-only; the source has not yet been frozen into a
  final release commit.
- **Production cutover:** not performed.
- **Current Production application:** legacy Webflow export.
- **Known-good rollback deployment:**
  `https://0debe4ae.aetheris-studio.pages.dev`.
- **Known-good rollback source commit:** `12d9b5f`.
- **Real team population:** intentionally excluded. The public roster remains
  empty and six anonymous placeholders are rendered.

This record is not immutable release evidence until it includes the final
release commit SHA and the immutable Pages preview URL generated from that
exact commit.

## Current automated evidence

The following local non-writing gate was run on 23 July 2026:

| Gate | Result | External write |
| --- | --- | --- |
| `npm test` | PASS — 58 Vitest tests and 22 Node tests; 80 total, 0 failures | None; network integrations use local doubles |
| `npm run build:release` | PASS — public Turnstile key validated, TypeScript and Vite production build complete | None |
| `npm audit --omit=dev` | PASS — 0 known production dependency vulnerabilities | Registry read only |
| strict dynamic contrast | PASS — EN/IT across desktop, mobile, portrait tablet and landscape; stable and every sampled frame green | None |

The release owner must rerun the non-browser gates from the frozen commit.
The following evidence is still required against that exact source state:

- immutable-preview consent/network QA;
- localized route, redirect, `404`, security-header and non-writing API checks;
- final commit SHA, immutable preview URL and artifact checksum manifest.

The GitHub workflow verifies tests, the strict release build and the production
dependency audit. Its job name deliberately does not claim to perform browser,
consent, legal or Production deployment verification.

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
- immutable-preview consent/network QA after the final GTM state.

The proof layer also remains publication-gated where
`docs/PROOF-ASSETS.md` records missing client, photographer, retailer or
third-party rights evidence. Project-owner approval does not replace those
rights.

## Cutover decision

The release is **NO-GO for Production** at the date of this record. A later
go/no-go record must name the frozen commit, immutable preview, completed
evidence, approved legal version and exact rollback target before any
`main` deployment.
