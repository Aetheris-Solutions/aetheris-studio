# Aetheris Studio — release status

Date: 23 July 2026  
Scope: Vite Home candidate, localized routes, Pages Functions, proof layer,
consent, analytics and qualification.

## Deployment status

- **Candidate state:** preview-only; the legal-control pass is validated locally
  and its frozen commit is to be recorded after the clean release commit.
- **Immutable candidate:** pending the sanitised successor deployment. Historical
  preview `aee66e53` is not a release candidate because it predates the preview
  processing block and still contains the quarantined image.
- **Pull request:** `https://github.com/Aetheris-Solutions/aetheris-studio/pull/4`
  (open; do not merge while this record remains NO-GO).
- **Production cutover:** not performed.
- **Current Production application:** legacy Webflow export.
- **Known-good rollback deployment:**
  `https://0debe4ae.aetheris-studio.pages.dev`.
- **Known-good rollback source commit:** `12d9b5f`.
- **Real team population:** intentionally excluded. The public roster remains
  empty and six anonymous placeholders are rendered.

The checked `dist` tree contains 49 files. Its sorted SHA-256 manifest is held
with the release evidence and has SHA-256
`396a865f7aed94d71e14fe77cf2065b481088788dda662459fa69d31dcba99d6`.

## Current automated evidence

The following local non-writing gate was run on 23 July 2026:

| Gate | Result | External write |
| --- | --- | --- |
| `npm test` | PASS — 64 Vitest tests and 23 Node tests; 87 total, 0 failures | None; network integrations use local doubles |
| `npm run build:release` | PASS — public Turnstile key validated, TypeScript and Vite production build complete | None |
| `npm audit --omit=dev` | PASS — 0 known production dependency vulnerabilities | Registry read only |
| strict dynamic contrast | PASS — EN/IT across desktop, mobile, portrait tablet and landscape; stable and every sampled frame green | None |
| immutable-preview consent/network QA | PENDING — rerun on the sanitised immutable successor | No CRM or booking write permitted |
| immutable-preview HTTP matrix | PENDING — rerun on the sanitised immutable successor | GET/HEAD and rejected/malformed non-writing method checks only |
| immutable-preview visual smoke | PENDING — rerun on the sanitised immutable successor | None |

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

- managing-director confirmation and Italian privacy-counsel approval of the
  operational legitimate-interest / Article 22 / DPIA screening;
- service-specific processor/controller and international-transfer records;
- an operational Attio human-review workflow with reviewer, override and
  disposition evidence;
- live GA4, GTM and Clarity settings;
- operational retention and deletion/review controls;
- Cloudflare log-retention confirmation;
- preservation and owner approval of the immutable-preview consent/network
  evidence for the final GTM state.

Corporate identity and disclosure are closed for the new-site candidate by
evidence `CORP-VISURA-2026-01-17`: CF/VAT/Companies Register number
`14468170965`, REA `MI-2786509`, registered office, PEC, EUR 10,000 fully paid
share capital and sole-shareholder status. The currently live legacy Webflow
Production site does not receive that fix until it is separately patched or
the approved candidate is cut over.

The proof layer remains Production-gated where `docs/PROOF-ASSETS.md` records
missing client, photographer, retailer or third-party rights evidence.
Project-owner approval does not replace those rights. Public, noindex Pages
previews are not a rights clearance. The rights-unproven identifiable-people
image has been removed from the candidate bundle; historical previews that
still expose that exact hash must be retired after the sanitised successors are
confirmed.

## Cutover decision

The release is **NO-GO for Production** at the date of this record. A later
go/no-go record must name the frozen commit, immutable preview, completed
evidence, approved legal version and exact rollback target before any
`main` deployment.
