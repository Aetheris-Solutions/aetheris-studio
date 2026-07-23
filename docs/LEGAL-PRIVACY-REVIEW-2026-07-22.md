# Aetheris Studio — privacy and tracking launch review

Date: 22 July 2026; updated 23 July 2026
Scope: new Aetheris Studio website preview, qualification form, Attio CRM write, Cloudflare Pages/Turnstile, GTM, GA4 and Microsoft Clarity.

## Status

This is an operational GDPR/ePrivacy review, not legal advice or a legal
certification. The code and public notices reflect the intended preview.
Corporate identity has been verified from the official company-register
extract. Production remains blocked until the remaining open items below are
evidenced and approved by an Italian privacy professional.

## Corporate verification closed

The ordinary company-register extract issued by the CCIAA Milano Monza
Brianza Lodi / InfoCamere on 17 January 2026, document
`L ZG0RXNQ11H8QDS4RWD`, verifies:

- Aetheris Solutions S.r.l.;
- CF, VAT and Companies Register number `14468170965`;
- REA `MI-2786509`;
- registered office and corporate PEC;
- EUR 10,000 fully paid share capital; and
- sole-shareholder status.

Internal evidence ID: `CORP-VISURA-2026-01-17`. The private source has SHA-256
`42daa8e11e732c98839b08852b01095336d1e6a3f40643ee95d707786a5a0629`.
No personal director/shareholder data from the extract is copied into this
repository. Corporate disclosures have been added to the public footer,
structured data and EN/IT notices.

## Implemented in the preview

- Google Consent Mode v2 in **basic** mode: denied defaults are queued locally and GTM is not requested before analytics opt-in.
- `analytics_storage` may become granted; `ad_storage`, `ad_user_data`, `ad_personalization`, marketing and personalisation stay denied.
- Equal-prominence reject/accept actions, a close control that persists rejection, granular preferences, six-month versioned local storage (or a tab/session fallback when durable storage is unavailable), and a permanent footer route to change the choice.
- Rejection/revocation clears first-party GA/Clarity cookies accessible to Aetheris, attribution storage, and reloads to tear down the analytics runtime.
- First-touch attribution is consent-gated, has a 90-day maximum age and is never required for form submission.
- Arbitrary query values and unrecognised fragments are removed before GTM/GA4/Clarity loads; the server independently strips attribution URLs to origin + path.
- Qualification lifecycle events use a non-PII allowlist and are not queued before analytics consent.
- The qualification form is explicitly masked with `data-clarity-mask="true"`.
- Mandatory form acknowledgement is a notice acknowledgement, not consent to contact. The current browser form exposes no email-marketing opt-in and sends the marketing fields in their denied/empty state.
- Every accepted request becomes a separate Website Inbound list entry beneath one pre-existing internal intake record, with a unique submission ID, server receipt time, deterministic SHA-256, operator-facing contact fields and a complete normalised ledger. The public form neither queries nor creates a Person from submitted identity claims, does not patch existing Attio people, and makes no company write from the submitted email domain or store URL.
- Public Cloudflare Pages preview hostnames do not render the qualification
  Turnstile widget, keep GTM/GA4/Clarity offline and reject submissions before
  server-side Turnstile verification or Attio by default. A temporary
  `ALLOW_PREVIEW_SUBMISSIONS=true` override requires explicit approval because
  it creates real CRM processing.
- No subscription or marketing request is activated by this build. If email marketing is introduced later, it requires a separately reviewed opt-in and confirmation flow. The public response exposes only `qualified` or `review`.
- Public privacy and cookies notices now name the active providers, purposes, legal bases, controls, retention targets and deterministic profiling safeguards.
- The ruleset records its version and the invariants that it never performs an automated rejection, contract decision or price decision; a low-fit brief is still persisted for human review.
- An operational LIA, Article 22 and DPIA screening is recorded in `docs/GDPR-LIA-ARTICLE-22-DPIA-SCREENING-2026-07-23.md`.
- Processor, transfer, retention/log and asset-rights evidence requirements are recorded in `docs/LEGAL-EVIDENCE-AND-RETENTION-REGISTER-2026-07-23.md`.
- Cloudflare Access now protects every Pages preview deployment. Anonymous
  requests, including the five residual edge-cache URLs, are redirected to the
  Access login before asset delivery.
- Lorenzo Masiello is designated as business owner and human-review owner and
  approved the documented 1/3/5-business-day operating targets. Attio
  implementation evidence remains pending.

## Production blockers

1. Have Italian privacy counsel approve the legal bases, Article 6(1)(f) LIA,
   Article 22/DPIA screening, retention schedule, transfers and EN/IT notices.
   Business-owner approval is recorded as `AUTH-BUSINESS-2026-07-23`.
2. Execute or otherwise evidence acceptance of the service-specific DPA and
   transfer records for Attio, Cloudflare, Google, Microsoft Clarity and
   Cal.com; verify current subprocessors, data regions, adequacy/SCC mechanism
   and any transfer-impact assessment. Do not assume one provider role applies
   to every service.
3. Activate and evidence the Attio review workflow: original brief and reason
   visibility, competent reviewer, override authority, review SLA, final
   disposition and override log. The current `humanReviewRequired` ledger value
   is a policy flag, not proof that a person completed the review.
4. Configure GA4 before production: first-party cookie lifetime 13 months or
   less; user/event retention no more than 14 months; reset-on-activity off;
   Google Signals, ads features and product/service data sharing off unless
   separately reviewed; automatic form-content capture disabled; no PII or
   click identifiers as custom event parameters.
5. Confirm Clarity consent mode, masking mode, service-specific privacy role
   and project access. Keep the qualification form masked and verify no field
   value is present in captured payloads/recordings.
6. Implement the internal retention job/review and execution log: unconverted
   leads up to 24 months from last meaningful interaction (low-fit review at
   12 months), active opportunities through activity plus 24 months, and
   fiscal documents — not the full CRM ledger — where a ten-year statutory
   period applies.
7. Confirm active Cloudflare Pages, edge, security and Turnstile products and
   their account/contract log retention.
8. Preserve the completed immutable-preview fresh/reject/accept/revoke browser
   network evidence. Repeat it after every GTM container change and against the
   final Production configuration.
9. Archive the client, trademark, photographer, model, retailer/upstream-brand,
   confidentiality and IP chain-of-title evidence identified in
   `docs/PROOF-ASSETS.md`. The unledgered That’s It studio image has been
   removed from `public/` pending those rights. Other gated proof assets remain
   available only after Cloudflare Access authentication under the owner's
   instruction; that restricted exposure is not third-party rights clearance.
10. Publish explicit allowlisted GA4 event tags only if qualification lifecycle
    reporting is wanted; the current container measures page use but does not
    forward the prepared `qualification_*` data-layer events.

## Reviewed technical inventory

- GTM container: `GTM-5553RFJZ`
- GA4 measurement ID discovered in the public container: `G-WL5GGPH5LS`
- Microsoft Clarity project discovered in the public container: `wlgrvcv2zm`
- Attio list: `Website Inbound`, ID `ea94e071-c5a1-4255-aff3-429b033c7d39`
- Consent record: `aetheris_consent_v1`, six months
- Consent fallback: `aetheris_consent_session_override_v1`, current tab/session only when durable storage is unavailable
- Attribution record: `aetheris_studio_attribution_v1`, analytics consent only, maximum 90 days
- Hero state: `aetheris-production-hero-intro-v1`, session only

## Font licensing record

- The project owner confirmed on 22 July 2026 that Aetheris holds a licence for the embedded Gilroy webfont files used by this build.
- The purchase/licence evidence remains an internal business record and is not published with the website. It should be retained with the project handover so the permitted webfont scope can be demonstrated if required.

## Legal rationale used for the draft

- Requested pre-contract steps: Article 6(1)(b) GDPR where the person is the prospective contracting party.
- B2B enquiry management, CRM operations, deterministic prioritisation and security: Article 6(1)(f), subject to documented balancing and safeguards.
- Analytics, Clarity and attribution terminal storage: consent under Article 6(1)(a) GDPR and Article 122 Italian Privacy Code.
- Optional email marketing is not active in the current form. If introduced later, it requires separate consent under Article 6(1)(a), a reviewed confirmation flow and compliance with applicable Italian electronic-communications rules.
- Specific statutory obligations: Article 6(1)(c); legal claims: Article 6(1)(f).
- The rules-based score must remain advisory, allow human review and never autonomously conclude/refuse a contract or create legal/similarly significant effects.

## Primary sources

- [GDPR — Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)
- [Italian Privacy Code, Article 122](https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Adecreto.legislativo%3A2003-06-30%3B196~art122=)
- [Italian Garante — cookie and tracking guidelines](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/9677876)
- [EDPB Guidelines 05/2020 on consent](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en)
- [Attio Data Processing Addendum](https://attio.com/legal/attio-data-processing-addendum)
- [Cloudflare Turnstile Privacy Addendum](https://www.cloudflare.com/turnstile-privacy-policy/)
- [Google — basic versus advanced Consent Mode](https://support.google.com/tagmanager/answer/10000067)
- [Google Analytics cookie usage](https://support.google.com/analytics/answer/11397207)
- [Google Analytics data retention](https://support.google.com/analytics/answer/7667196)
- [Microsoft Clarity cookies and consent](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies)
- [Microsoft Clarity masking API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)
- [Cal.com privacy notice](https://cal.com/privacy)
