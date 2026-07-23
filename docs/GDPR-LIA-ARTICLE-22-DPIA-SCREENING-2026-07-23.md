# Aetheris Studio — LIA, Article 22 and DPIA screening

Date: 23 July 2026
Controller: Aetheris Solutions S.r.l., operating through Aetheris Studio
System: public commerce qualification form, deterministic scoring and Attio
Website Inbound ledger
Ruleset: `2026-07-23.1`

## Status and decision

This is an operational assessment, not legal advice or a legal certification.
It records the implementation reviewed in the repository and must be approved
by the managing director and an Italian privacy professional before Production.

Current operational conclusion:

- the workflow performs profiling because it evaluates a request associated
  with an identifiable contact;
- Article 22(1) GDPR is not triggered by the implementation as reviewed because
  the automated output does not accept, reject, price or conclude a contract
  and is not intended to create a legal or similarly significant effect;
- the only immediate automated difference is queue priority and, for a
  high-fit result, display of an optional Cal.com booking shortcut;
- every successfully accepted valid submission is retained in the Website
  Inbound intake. A non-high-fit submission receives `review`, not a rejection;
- legitimate interest is the proposed basis for consistent B2B triage and
  capacity allocation. Requested pre-contract steps may separately rely on
  Article 6(1)(b) where the requester is the prospective contracting party;
- a full DPIA is not presently assessed as mandatory, but the documented
  screening and the change triggers below must be retained.

This conclusion is conditional. It becomes invalid if the score is used to
deny service, suppress a response, set price or contractual terms, determine
credit or eligibility, or if operators treat it as determinative without
meaningful authority to override it.

## Evidence reviewed

The release record will name the frozen source commit and matching immutable
preview after the sanitised candidate has been deployed and verified. The
current source review covers:

- normalisation and validation: `validateSubmission`;
- deterministic scoring: `scoreSubmission`;
- evidence ledger: `qualificationLedger`;
- Attio persistence: `persistToAttio` and `findWebsiteEntry`;
- public `qualified` / `review` response: `onRequestPost`;
- result interface and optional booking shortcut:
  `QualificationForm`;
- Public explanation:
  `public/privacy-policy/index.html#qualification` and
  `public/it/privacy-policy/index.html#qualification`
- Automated tests:
  `tests/qualification-function.test.js`

## Processing description

The form collects contact identity, organisation and store URL, commerce
platform, revenue and advertising-spend bands, market, requested workstreams,
commercial problem, trigger, timeline, project-budget band, decision-maker or
sponsor access and a free-text constraint. Attribution is included only where
valid analytics-consent evidence exists.

The rules assign `high`, `medium` or `low` fit, `P1`, `P2` or `P3` priority and
reason signals. The full input, score, signals, ruleset version and safeguards
are recorded in a list-entry ledger. The public response exposes only
`qualified` or `review`.

The form does not solicit special-category data and tells users not to enter
payment, health, criminal-offence, credential or third-party confidential data
in free text. The length and presence checks do not technically prevent an
incidental submission in a free-text field; operators must minimise, restrict
and delete such content if encountered. The workflow does not verify the
contact's identity or email and marks that limitation in the ledger.

## Legitimate-interests assessment

### Purpose test

Aetheris has a legitimate commercial and organisational interest in:

- responding to genuine B2B enquiries;
- allocating finite Studio capacity consistently;
- prioritising time-sensitive and plausible commerce mandates;
- preserving a reproducible record of how an enquiry was routed; and
- protecting the form and CRM from abuse.

These purposes are specific to enquiry handling and do not include direct
marketing, enrichment, unrelated profiling or sale of lead data.

### Necessity test

The selected inputs are relevant to service fit, delivery feasibility and
commercial readiness. Fixed, reviewable rules are less intrusive and more
predictable than opaque model-generated scoring. The public endpoint returns a
coarse outcome rather than the score or reason codes.

Data minimisation still requires periodic review. Remove any field that is not
used in routing or human assessment. Do not add inferred wealth, protected
characteristics, social profiles, third-party enrichment or behavioural
predictions without a new assessment and notice.

The proposed 24-month ceiling reflects the potentially long consideration and
re-engagement cycle of complex B2B commerce projects and the need to understand
prior discussions. The 12-month low-fit review reduces retention where that
need is weaker. This rationale and actual conversion/re-engagement evidence
must be confirmed by the managing director and counsel; absent that evidence,
the shorter period must be preferred.

### Balancing test

The context is a deliberate B2B enquiry. A requester can reasonably expect the
Studio to assess commercial fit and prioritise limited capacity. The principal
risks are an inaccurate low priority, delayed response, opaque treatment,
excess retention and an operator over-relying on the score.

The present safeguards reduce those risks:

- every successfully accepted valid brief is stored; a low result is not
  discarded or declined;
- no automatic contract, price, credit, eligibility or service-access decision;
- the high result only reveals an optional booking shortcut;
- rule inputs and consequences are explained in the privacy notice;
- original answers, score, signals and ruleset version are retained together;
- the ledger marks `humanReviewRequired: true` as a policy requirement, not as
  proof that a review occurred;
- before Production, Attio must give operators original-input and reason
  visibility, override authority, ownership, SLA and disposition logging;
- the data subject can object and request human reassessment;
- no marketing activation is permitted by the form;
- retention targets distinguish low-fit review from active opportunities; and
- Turnstile tokens and IP addresses are excluded from the Attio ledger.

Subject to implementation of the review and retention procedure, Aetheris's
interests are assessed as not overridden by the requester's rights and
interests. Business-owner approval is recorded below; counsel approval remains
pending.

## Article 22 screening

Article 22(1) requires a decision based solely on automated processing that
produces legal effects or similarly significantly affects the person. The
workflow contains an automated route, but the reviewed consequence is limited:

- `high`: queue priority plus display of a booking shortcut;
- `medium` / `low`: queue priority and a human-review message;
- every successfully accepted valid outcome: a Website Inbound entry is created;
- no outcome: contract acceptance or rejection, binding offer, different
  price, credit decision, employment decision or denial of an Aetheris service.

The current route is therefore assessed as outside Article 22(1). This does
not remove the duties of transparency, fairness, accuracy, security, data
minimisation, objection handling and accountability.

An operator's presence is not enough if the score becomes de facto decisive.
The reviewer must examine the original brief and signals, understand the rule,
have authority to change priority or response, and not simply approve the
automated output.

## Human-review procedure

The following procedure is the launch target and must be reflected in the
actual Attio operating workflow:

| Priority | Review target | Required action |
| --- | --- | --- |
| P1 | Before the booked call or by the next business day, whichever comes first | Read the original brief and signals; confirm or override fit; assign an owner |
| P2 | Within three business days | Read the original brief and signals; choose response, clarification or archive |
| P3 | Within five business days | Read the original brief and signals; send a useful response or record a reasoned no-follow-up disposition |

The review record must contain submission ID, reviewer, review time, ruleset
version, original fit/priority, final disposition, override flag and reason,
next action and any legal-hold marker. Do not put special-category data or
unnecessary commentary in the review record.

Rights requests and objections go to `info@aetherisstudio.com` or the corporate
PEC. A request for reassessment must be routed to a person with authority to
change the commercial disposition.

## DPIA screening

| Criterion | Finding |
| --- | --- |
| Evaluation or scoring | Yes, but limited to B2B fit and queue priority |
| Solely automated significant decision | No, subject to the invariants above |
| Systematic monitoring | No continuous observation of individuals; consented web analytics is assessed separately |
| Sensitive or highly personal data | Not solicited and prohibited by the notice, but arbitrary free text cannot technically exclude incidental submission |
| Large scale | Planned volume has not been quantified; a baseline and annual review are required before Production |
| Matching or combining datasets | No enrichment or external matching in the public form |
| Vulnerable data subjects | Not a targeted population |
| Innovative or opaque technology | No model or inference; fixed code rules |
| Preventing a right, service or contract | No; email contact and human review remain available |

On the reviewed facts, the combination does not presently indicate a likely
high risk requiring a full DPIA. Counsel must confirm this conclusion. A DPIA
re-screen is mandatory before any of the following:

- automatic rejection, pricing, contract or service-access decision;
- a score that operators are expected to follow without independent judgment;
- AI/ML output, enrichment, inferred characteristics or external datasets;
- special-category data, minors or vulnerable groups;
- material volume increase or cross-client matching;
- new purpose, recipient, region or retention period; or
- loss of the human-review and objection procedure.

## Analytics and Clarity DPIA screening

The lead-scoring screen does not by itself cover consented GA4 and Clarity
processing. The following is a preliminary, separate screen; its final outcome
is pending live account evidence and counsel review.

| Criterion | GA4 / Clarity finding |
| --- | --- |
| Evaluation or scoring | Audience and interaction measurement; no qualification inputs are sent |
| Systematic monitoring | Clarity reconstructs consented page interaction and therefore introduces monitoring risk |
| Scale | Planned visitor/session volume is not yet documented |
| Sensitive data | Not intended; the qualification form is masked, but payload/recording verification is required |
| Data combination | No Aetheris CRM identifier or form identity is allowlisted; Google/Microsoft service-specific data use and account sharing must be confirmed |
| Vulnerable groups | Not targeted |
| Rights or service access | No |
| Security and access | Project roles, exports, masking and retention evidence are pending |

The current controls — no vendor request before opt-in, form masking, PII-free
event allowlist, easy withdrawal and first-party cleanup — reduce risk but do
not replace verification. Before Production, record expected annual traffic,
inspect captured payloads/recordings, confirm Clarity's service-specific role,
restrict project access, archive retention settings and have counsel decide
whether the combined monitoring scale requires a full DPIA.

## Approval record

| Approval | Status | Date | Evidence reference |
| --- | --- | --- | --- |
| Technical implementation review | Complete | 23 July 2026 | Repository and automated tests |
| Business-owner confirmation of the operating procedure, 1/3/5-business-day review targets and workflow ownership | Approved — Lorenzo Masiello | 23 July 2026 | `AUTH-BUSINESS-2026-07-23`, project-owner instruction |
| Italian privacy-professional review | Pending | — | Required before Production |
| Attio review owner | Designated — Lorenzo Masiello | 23 July 2026 | `AUTH-BUSINESS-2026-07-23`; account implementation still required |
| Attio review fields and SLA activated | Pending | — | Account screenshot/export required |
| GA4/Clarity live-account and DPIA screen | Pending | — | Volume, masking, access, role and retention evidence required |

## Primary sources

- [GDPR, including Articles 5, 6, 13, 21, 22, 25 and 35](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679)
- [EDPB/WP29 guidance on automated decision-making and profiling](https://www.edpb.europa.eu/documents/guideline/automated-decision-making-and-profiling_en)
- [CJEU C-634/21, SCHUFA](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=celex%3A62021CJ0634)
- [Italian Garante list of processing subject to DPIA](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9058979)
