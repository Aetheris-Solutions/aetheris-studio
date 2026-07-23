# Aetheris Studio — release status

Date: 23 July 2026  
Scope: Vite Home candidate, localized routes, Pages Functions, proof layer,
consent, analytics and qualification.

## Deployment status

- **Candidate state:** preview-only; the current validated application source
  is commit `725ad669e06d61838d7e4dc22777f33f1edb0a27`.
- **Immutable candidate:**
  `https://88a42fe2.aetheris-studio.pages.dev`.
- **Latest Git-integrated preview:**
  `https://9de54503.aetheris-studio.pages.dev`.
- **Preview access:** restricted by Cloudflare Access application
  `7fd72986-d480-46f2-8610-f3e8e22600b3`; anonymous requests must authenticate.
- **Pull request:** `https://github.com/Aetheris-Solutions/aetheris-studio/pull/4`
  (open; do not merge while this record remains NO-GO).
- **Production cutover:** not performed.
- **Current Production application:** legacy Webflow export.
- **Known-good rollback deployment:**
  `https://0debe4ae.aetheris-studio.pages.dev`.
- **Known-good rollback source commit:** `12d9b5f`.
- **Real team population:** intentionally excluded. The public roster remains
  empty and six anonymous placeholders are rendered.

The prior legal-baseline `dist` tree at `82c0c75` contained 49 files. Its
sorted SHA-256 manifest is held with the release evidence and has SHA-256
`396a865f7aed94d71e14fe77cf2065b481088788dda662459fa69d31dcba99d6`.
The scroll-driven candidate rebuild at `725ad66` also contains 49 files; its
corresponding manifest hash is
`24dff8604113968827fd5290057770acac5ccfe5fb6e349c75a7c4ff1aa507f2`.

## Current automated evidence

The following local non-writing gate was run on 23 July 2026:

| Gate | Result | External write |
| --- | --- | --- |
| `npm test` | PASS — 66 Vitest tests and 24 Node tests; 90 total, 0 failures | None; network integrations use local doubles |
| `npm run build:release` | PASS — public Turnstile key validated, TypeScript and Vite production build complete | None |
| `npm audit --omit=dev` | PASS — 0 known production dependency vulnerabilities | Registry read only |
| strict dynamic contrast | PASS — EN/IT across desktop, mobile, portrait tablet and landscape; stable and every sampled frame green | None |
| immutable-preview consent/network QA | PASS — EN/IT; 64 checks, 0 failures; fresh, close, reject, accept, reload, preferences and withdrawal; the 30-second post-opt-in window and the full interval through withdrawal both produced 0 GTM/GA4/Clarity requests | Vendor reads remained at zero; no CRM or booking write |
| immutable-preview HTTP matrix | PASS — EN/IT Home/policies, localized `404`, robots, sitemap, security headers, GET API contract, blocked POST and quarantined asset `404` | GET/HEAD and rejected/malformed non-writing checks only |
| immutable-preview visual smoke | PASS — final hero at 1440×900 and 390×844; EN/IT copy within viewport, no horizontal overflow, no Turnstile script | None |

## Historical preview retirement

Cloudflare reported successful deletion on 23 July 2026 for the eight Preview
deployments proven to serve the quarantined image:

- `780b2508-15d3-4faa-931f-3e6fd1743450`;
- `aee66e53-3aff-4d1b-be99-7e84451dd79d`;
- `a19ba1e0-05e8-442e-83fb-79ada58c390d`;
- `9073565d-63b5-438f-bb8d-a9073205fe65`;
- `752d26b3-9525-48a2-bdf0-5113e6ee19bd`;
- `59c04be7-ec3e-4a9a-a35f-41b3191f98fb`;
- `c258d0f3-745e-463f-9598-ad3d7cfabcf5`; and
- `bed265e1-2653-4d59-b34e-811a311c4031`.

Production deployments were excluded. Immediate no-cache verification returned
`404` for `752d26b3`, `59c04be7` and `c258d0f3`. Cloudflare's Pages edge still
served the exact old image hash from `780b2508`, `aee66e53`, `a19ba1e0`,
`9073565d` and `bed265e1`. Deletion is therefore recorded as complete at the
deployment-control plane. A repeated no-cache check later the same day still
returned `200 image/webp`, 79,230 bytes and the quarantined SHA-256 from all
five URLs before access protection was enabled.

At 23 July 2026 19:47 CEST, project-wide Preview Access was enabled from the
authenticated Cloudflare account. Anonymous checks against the current
previews and all five residual cache URLs returned `302` to
`aetheris-studio-pages.cloudflareaccess.com`, with `Cache-Control: private,
no-store` and `WWW-Authenticate: Cloudflare-Access`. The residual bytes may
remain in Cloudflare's platform cache until expiry, but they are no longer
publicly retrievable. The public takedown blocker is therefore **closed by
access control**; continue periodic checks until the underlying URLs return
`404`.

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

- Italian privacy-counsel approval of the operational legitimate-interest /
  Article 22 / DPIA screening; business-owner approval is recorded separately;
- service-specific processor/controller and international-transfer records;
- an operational Attio human-review workflow with reviewer, override and
  disposition evidence;
- live GA4, GTM and Clarity settings;
- operational retention and deletion/review controls;
- Cloudflare log-retention confirmation;
- preservation and owner approval of the immutable-preview consent/network
  evidence for the final GTM state.
- expiry or `404` verification of the five now access-protected residual Pages
  edge-cache copies identified above.

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
image has been removed from both sanitised successor bundles and the eight
historical deployments were deleted. Five historical edge-cache copies remain
stored at the tested edge but anonymous access is blocked by Cloudflare Access.

## Cutover decision

The release is **NO-GO for Production** at the date of this record. A later
go/no-go record must name the frozen commit, immutable preview, completed
evidence, approved legal version and exact rollback target before any
`main` deployment.
