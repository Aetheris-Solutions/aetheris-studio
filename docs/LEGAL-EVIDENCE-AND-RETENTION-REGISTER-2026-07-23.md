# Aetheris Studio — legal evidence and retention register

Date: 23 July 2026
Scope: corporate disclosure, processors, international transfers, operational
retention, logs and public proof rights

## Status

This register separates facts supported by evidence from launch targets and
missing records. It is an operational control, not legal advice.

No agreement, personal document, API key, raw account export or signed release
belongs in the public website bundle. Private evidence should be stored in the
company archive. This repository records only an evidence ID, document title,
date, signatory or account owner, scope, expiry/revocation condition, private
archive reference and SHA-256.

## Corporate evidence

| Evidence ID | Evidence | Verified facts | Status |
| --- | --- | --- | --- |
| `CORP-VISURA-2026-01-17` | Ordinary company-register extract, CCIAA Milano Monza Brianza Lodi / InfoCamere, document `L ZG0RXNQ11H8QDS4RWD`, extracted 17 January 2026, SHA-256 `42daa8e11e732c98839b08852b01095336d1e6a3f40643ee95d707786a5a0629` | Aetheris Solutions S.r.l.; registered office; PEC; CF/VAT/Companies Register no. `14468170965`; REA `MI-2786509`; EUR 10,000 fully paid capital; sole shareholder; active status | Verified; private source retained outside the public bundle |

The extract closes corporate identity and disclosure only. It does not prove
software ownership, vendor agreements, transfer safeguards, retention controls
or third-party publication rights.

## Processor, controller and transfer evidence

The role must be determined for the specific service and configuration. A
provider may be a processor for one activity and an independent controller for
another.

| Service | Current use | Working role classification | Evidence required before Production | Status |
| --- | --- | --- | --- | --- |
| Attio | Website Inbound CRM and qualification ledger | Processor for Customer Data; separate-controller activities may apply to account/usage data | Accepted DPA version and account; current subprocessors; UK adequacy and onward-transfer mechanism; SCC module/TIA where applicable; data region; deletion/export terms; AI/enrichment/recording settings | Public DPA identified; account-specific evidence missing |
| Cloudflare Pages / Turnstile | Hosting, edge security and bot verification | Processor for site delivery/bot detection; Turnstile improvement activity may be separate-controller processing | Accepted Customer DPA and Turnstile addendum; subprocessors; regions; transfer mechanism; actual Pages/edge/security/Turnstile log products and retention; export/delete controls | Public terms identified; account-specific evidence missing |
| Google Tag Manager / GA4 | Consent-gated site measurement | Service-specific Google role under accepted data-processing terms | Accepted terms; property/account owner; subprocessors; transfer framework; retention screenshot/export; reset-on-activity off; Signals, ads features, automatic form capture and unnecessary sharing off | Consent/network behaviour verified; account evidence missing |
| Microsoft Clarity | Consent-gated heatmaps and session reconstruction | Treat as service-specific and unresolved; do not assume the generic Microsoft processor terms apply | Counsel-confirmed role; Clarity terms; transfer basis; project owner/access list; masking and Consent API state; retention settings/evidence | Consent/network behaviour and form mask verified; legal/account evidence missing |
| Cal.com | Separate booking page opened by user; qualification payload is not sent automatically | To be confirmed for the configured booking service; direct user collection and Aetheris access must be analysed separately | Current DPA or controller terms as applicable; account owner; subprocessors; transfer basis; booking retention/delete/export settings; event-type privacy configuration | Public privacy/security pages identified; account evidence missing |

For each row, archive:

1. the accepted document or immutable copy and version date;
2. evidence that it applies to the Aetheris account and service;
3. the current subprocessor list and change-notification setting;
4. processing and storage locations;
5. adequacy, DPF certification scope or SCC module;
6. transfer-impact assessment and supplementary measures where needed;
7. return/deletion, audit and incident-notification terms; and
8. the internal owner and next annual review date.

## Operational retention matrix

Vendor maximums are not automatically Aetheris retention decisions. The
business purpose, deletion trigger and proof of execution control the schedule.

| Record | System | Target | Trigger / exception | Owner | Implementation evidence |
| --- | --- | --- | --- | --- | --- |
| Low-fit unconverted enquiry and qualification ledger | Attio Website Inbound | Review at 12 months; delete or irreversibly anonymise no later than 24 months after last meaningful interaction | Active dispute, documented legal hold or a new meaningful interaction | Commercial operations | Procedure drafted; Attio workflow/job and execution log missing |
| Medium/high unconverted opportunity | Attio | While active, then no more than 24 months after last meaningful interaction | Active dispute or legal hold | Opportunity owner | Procedure drafted; workflow/job missing |
| Client relationship record | CRM and contract archive | Contract term plus the period needed for administration and claims | Apply a specific statutory period only to records that require it | Account owner / administration | Record-class mapping missing |
| Accounting and tax evidence | Accounting archive | 10 years where Italian law requires | Do not extend this period to free text or the whole qualification ledger | Administration | External accounting procedure required |
| Privacy-notice acknowledgement and qualification evidence | Attio ledger | Same lifecycle as the related enquiry, unless needed for a dispute | Legal hold | Privacy / commercial operations | Stored; lifecycle automation missing |
| Browser consent choice | Visitor browser | 6 months | Rejection, withdrawal, expiry, schema change or browser deletion | Product owner | Implemented and tested |
| First-touch attribution | Visitor browser and submitted lead where consented | Local copy no more than 90 days; submitted copy follows enquiry lifecycle | Withdrawal clears the local record | Product owner | Implemented and tested |
| GA4 user/event data | GA4 | No more than 14 months; reset-on-activity off | Aggregated reporting must not contain personal-level data | Analytics owner | Account screenshot/export missing |
| GA/Clarity first-party cookies | Browser | 13 months or less for GA target; vendor-specific Clarity expiry | Withdrawal removes accessible first-party values | Analytics owner | Runtime control tested; live configuration evidence missing |
| Clarity recordings / heatmaps | Clarity | Vendor exposure normally 30 days for playback and up to 9 months for selected/aggregate material; minimise further where possible | Delete project/export on purpose change | Analytics owner | Project setting/access evidence missing |
| Cloudflare request, edge, security and Turnstile logs | Cloudflare | Product-specific minimum necessary period | Security incident or legal hold | Infrastructure owner | Active products and account retention evidence missing |
| Cal.com booking record | Cal.com | Set after service-specific role and business-purpose review | Meeting completion, active opportunity, dispute or legal hold | Commercial operations | Account setting and deletion procedure missing |
| Data-subject request file | Private compliance archive | Request lifecycle plus a proportionate claims period | Legal hold | Privacy owner | Intake and closure register missing |
| Signed asset release / licence | Private rights archive | Contract term plus claims period; permanent chain-of-title record where rights are perpetual | Expiry, territory/channel limits, withdrawal terms and legal hold | Asset owner | Missing for the third-party scopes listed below |

## Retention execution log

No production deletion or review run is evidenced yet. When the workflow is
activated, append one row per run in the private compliance register:

| Run ID | System / scope | Cut-off and query | Candidates | Reviewed | Deleted | Anonymised | Held | Errors | Operator | Start/end | Evidence hash |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — | — | — | — |

Minimum controls:

- default to a dry run and require a second-person approval for deletion;
- export only the minimum identifiers needed for review;
- record the query/version and immutable result hash;
- distinguish deleted, anonymised, active and legal-hold records;
- test restoration boundaries and processor/back-up deletion commitments;
- investigate errors and rerun only affected records; and
- review the schedule annually and after any purpose or provider change.

## Public proof and release evidence

`AUTH-OWNER-001` authorises the project workstream to publish the current
proof layer. It is not a client, trademark, photographer, model, retailer,
upstream-brand or confidentiality release.

| Scope | Public asset IDs | Evidence required | Status |
| --- | --- | --- | --- |
| That’s It case, mark and storefront | `AST-THI-CAP-001`, `AST-THI-MARK-001`, `AST-THI-MARK-SRC-001` | Authorised-signatory approval covering name, mark, screenshot, case copy, scope and visible creative | Missing |
| That’s It context in Google Agent | `AST-GA-CAP-001` | Confidentiality/data-publication approval tied to the exact hash; remove or approve any account identifier and metric beyond the claim ledger | Missing |
| Cielo name and mark | `AST-CIE-MARK-001`, `AST-CIE-MARK-SRC-001` | Client/retailer mark and portfolio approval | Missing |
| Cielo product/campaign image | `AST-CIE-MEDIA-001` | Photographer/licensor chain, retailer permission, upstream watch-brand terms and any required model release | Missing |
| Cielo storefront image | `AST-CIE-MEDIA-002` | Photographer/licensor chain, location/client permission and treatment of incidental identifiable people | Missing |
| Cielo context in Social Agent | `AST-SA-CAP-001` | Client confidentiality approval and upstream-brand permission for visible Rado context | Missing |
| Lead Gen Agent aggregate | `AST-LGA-CAP-001` | Aetheris chain of title, canonical repository/deployment mapping and private source export for the 7-day decision claim | Partial; owner instruction only |
| Aetheris agent UI and code | Google, Social and Lead Gen Agent captures | Repository URLs, frozen commits/deployments, contributor IP assignments and third-party licence schedule | Missing |

The unreferenced file formerly published at
`public/cases/thatsit-studio.webp` was removed from the public bundle on
23 July 2026. Its SHA-256 was
`c1541fc093c048c32319add5e7e5d60c7e2ad2d0d4cca72583c626dd42cb384a`.
It showed two identifiable people and had no ledger entry, photographer rights,
model releases, client approval or location permission. It remains recoverable
from Git history but must not return to `public/` until every required right is
archived.

## Release evidence record format

For each signed approval or licence, record privately:

- evidence ID and exact public asset/claim IDs;
- legal name of rights holder and signatory capacity;
- document or email date and acceptance method;
- rights granted: name, mark, image, likeness, dashboard, data and copy;
- channels, territory, term, derivative/crop/redaction rights and attribution;
- confidentiality waiver and exact metrics/account identifiers approved;
- sublicensing or upstream-brand authority where relevant;
- expiry, withdrawal and takedown procedure;
- private archive reference and SHA-256; and
- reviewer, review date and final publication decision.

## Primary sources

- [GDPR — processor contracts, accountability and transfers](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679)
- [EDPB Guidelines 07/2020 on controller and processor concepts](https://www.edpb.europa.eu/documents/guideline/guidelines-072020-on-the-concepts-of-controller-and-processor-in-the-gdpr_en)
- [European Commission SCC decision 2021/914](https://eur-lex.europa.eu/legal-content/en/TXT/?uri=CELEX%3A32021D0914)
- [EDPB Recommendations 01/2020 on supplementary transfer measures](https://www.edpb.europa.eu/documents/recommendation/recommendations-012020-on-measures-that-supplement-transfer-tools-to_en)
- [Italian Garante storage-limitation and accountability decisions](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10009033)
