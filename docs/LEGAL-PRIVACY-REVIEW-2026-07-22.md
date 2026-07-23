# Aetheris Studio — privacy and tracking launch review

Date: 22 July 2026  
Scope: new Aetheris Studio website preview, qualification form, Attio CRM write, Cloudflare Pages/Turnstile, GTM, GA4 and Microsoft Clarity.

## Status

This is an operational GDPR/ePrivacy gap review, not legal advice or a legal certification. The code and public notices now reflect the intended preview. Production remains blocked until the open items below are evidenced and approved by an Italian privacy professional.

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
- No subscription or marketing request is activated by this build. If email marketing is introduced later, it requires a separately reviewed opt-in and confirmation flow. The public response exposes only `qualified` or `review`.
- Public privacy and cookies notices now name the active providers, purposes, legal bases, controls, retention targets and deterministic profiling safeguards.

## Production blockers

1. Obtain an official company-register extract and verify/add the REA number. The registered office and corporate PEC already shown in the notices are supported by current signed company records.
2. Have Italian privacy counsel approve the legal bases, Article 6(1)(f) legitimate-interests assessment, Article 22/DPIA screening, retention schedule, transfers and English/Italian notices.
3. Execute and archive the applicable DPAs and transfer records for Attio, Cloudflare, Google, Microsoft Clarity and Cal.com; verify current subprocessors, data regions, adequacy/SCC mechanism and any transfer-impact assessment.
4. Configure GA4 before production: first-party cookie lifetime 13 months or less; user/event retention no more than 14 months; reset-on-activity off; Google Signals, ads features and product/service data sharing off unless separately reviewed; automatic form-content capture disabled; no PII or click identifiers as custom event parameters.
5. Confirm Clarity consent mode, masking mode and project access. Keep the qualification form masked and verify no field value is present in captured payloads/recordings.
6. Implement the internal retention job/review: unconverted leads up to 24 months from last meaningful interaction (low-fit review at 12 months), active opportunities through activity plus 24 months, any future separately activated marketing until withdrawal or 24 months inactivity, and fiscal documents—not the full CRM ledger—where a ten-year statutory period applies.
7. Confirm Cloudflare Pages, edge and Turnstile log retention in the live account and contract.
8. Run a fresh/reject/accept/revoke browser network scan on the immutable Pages preview after every GTM container change. Re-inventory the container before production.
9. Publish explicit allowlisted GA4 event tags if qualification lifecycle reporting is wanted; the current live container measures page use but does not yet forward the prepared `qualification_*` data-layer events.

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
