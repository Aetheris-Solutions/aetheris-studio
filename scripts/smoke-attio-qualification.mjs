import {
  onRequestPost,
  QUALIFICATION_NOTICE_VERSION,
  QUALIFICATION_RULESET_VERSION,
} from '../functions/api/qualification.js';

const ATTIO_API = 'https://api.attio.com/v2';
const LIST_ID = process.env.ATTIO_WEBSITE_INBOUND_LIST_ID
  || 'ea94e071-c5a1-4255-aff3-429b033c7d39';
const INTAKE_RECORD_ID = '02ec4555-ba27-4799-a2ce-b0468d3aff0e';
const token = process.env.ATTIO_API_KEY;
const verifyArgument = process.argv.find((argument) => argument.startsWith('--verify-existing='));
const existingSubmissionId = verifyArgument?.slice('--verify-existing='.length) || '';
const lowFit = process.argv.includes('--low-fit');
const expectedStatus = lowFit ? 'review' : 'qualified';

if (!existingSubmissionId && !process.argv.includes('--apply')) {
  throw new Error('Refusing a real Attio smoke write without the explicit --apply flag');
}
if (!token) throw new Error('ATTIO_API_KEY is unavailable');

async function attio(method, path, body) {
  const response = await fetch(`${ATTIO_API}/${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`);
  return result;
}

function textValue(values) {
  if (typeof values === 'string') return values;
  if (!Array.isArray(values)) return '';
  return values.map((value) => value?.value || value?.text || '').filter(Boolean).join('\n');
}

const suffix = existingSubmissionId
  ? existingSubmissionId.replace(/^website_smoke_/, '')
  : `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
const submissionId = existingSubmissionId || `website_smoke_${suffix}`;
const syntheticEmail = `website-smoke-${suffix}@aetheris-qa.example`;
const acceptedAt = new Date().toISOString();
const payload = {
  submissionId,
  name: 'Aetheris Studio Synthetic QA',
  workEmail: syntheticEmail,
  role: 'Synthetic integration test',
  company: 'Aetheris Website QA — Synthetic',
  storeUrl: 'https://commerce-smoke.aetheris-qa.example/',
  platform: 'shopify-plus',
  annualRevenue: '1m-5m',
  monthlyAdSpend: '20k-50k',
  primaryMarket: 'European Union',
  workstreams: ['conversion', 'measurement'],
  problem: 'Synthetic smoke only: validate the accountable inbound ledger.',
  trigger: 'growth-stalled',
  timeline: lowFit ? 'research' : 'this-quarter',
  projectBudget: lowFit ? 'under-5k' : '15k-30k',
  ownerReadiness: lowFit ? 'exploring' : 'decision-maker',
  constraint: 'Synthetic smoke only: no customer or production identity.',
  privacyAccepted: true,
  privacyVersion: QUALIFICATION_NOTICE_VERSION,
  privacyAcceptedAt: acceptedAt,
  marketingConsent: false,
  marketingConsentAt: '',
  marketingConsentVersion: QUALIFICATION_NOTICE_VERSION,
  marketingConsentSource: 'website_qualification',
  analyticsConsent: false,
  analyticsConsentAt: '',
  analyticsConsentVersion: '',
  analyticsConsentSource: '',
  attribution: null,
  turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
  website: ''
};

let responseBody = { status: expectedStatus };
if (!existingSubmissionId) {
  const request = new Request('http://localhost/api/qualification', {
    method: 'POST',
    headers: {
      origin: 'http://localhost',
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const response = await onRequestPost({
    request,
    env: {
      ATTIO_API_KEY: token,
      ATTIO_WEBSITE_INBOUND_LIST_ID: LIST_ID,
      ATTIO_WEBSITE_INTAKE_RECORD_ID: INTAKE_RECORD_ID,
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      // Cloudflare's always-pass testing response uses example.com as its
      // deterministic hostname (metadata.result_with_testing_key is true).
      TURNSTILE_EXPECTED_HOSTNAMES: 'example.com'
    },
    fetch
  });
  responseBody = await response.json();
  if (response.status !== 201 || responseBody.status !== expectedStatus) {
    throw new Error(`Qualification smoke failed: HTTP ${response.status}`);
  }
}

const entryResult = await attio('POST', `lists/${encodeURIComponent(LIST_ID)}/entries/query`, {
  filter: { website_submission_id: { value: { $eq: submissionId } } },
  limit: 2,
  offset: 0
});
const entries = entryResult.data || [];
if (entries.length !== 1) throw new Error(`Expected one smoke entry, received ${entries.length}`);
const entry = entries[0];
const values = entry.entry_values || {};
const ledgerText = textValue(values.website_ledger_json);
const ledger = JSON.parse(ledgerText);

const peopleResult = await attio('POST', 'objects/people/records/query', {
  filter: { email_addresses: { email_address: { $eq: syntheticEmail } } },
  limit: 2,
  offset: 0
});
const requiredAttributes = [
  'website_submission_id',
  'website_received_at',
  'website_payload_sha256',
  'website_ledger_json',
  'website_fit',
  'website_priority',
  'website_contact_name',
  'website_work_email',
  'website_role',
  'website_company',
  'website_store_url'
];
const verification = {
  response: responseBody.status,
  submissionId,
  entryId: entry.id?.entry_id,
  parentRecordId: entry.parent_record_id,
  oneEntry: entries.length === 1,
  allEntryAttributesPresent: requiredAttributes.every((attribute) => textValue(values[attribute])),
  payloadSha256Valid: /^[a-f0-9]{64}$/.test(textValue(values.website_payload_sha256)),
  ledgerSubmissionMatches: ledger.submissionId === submissionId,
  ruleSetVersion: ledger.qualification?.safeguards?.ruleSetVersion,
  storedFit: ledger.qualification?.fit,
  automatedEffect: ledger.qualification?.safeguards?.automatedEffect,
  humanReviewRequired: ledger.qualification?.safeguards?.humanReviewRequired,
  automatedRejection: ledger.qualification?.safeguards?.automatedRejection,
  automatedContractDecision: ledger.qualification?.safeguards?.automatedContractDecision,
  automatedPricing: ledger.qualification?.safeguards?.automatedPricing,
  safeguardsRequiredForThisRun: !existingSubmissionId,
  turnstileVerified: ledger.security?.turnstileVerified === true,
  turnstileMode: 'Cloudflare official always-pass test credential',
  identityAssurance: ledger.identity?.identityAssurance,
  emailVerified: ledger.identity?.emailVerified,
  marketingActivationPermitted: ledger.consent?.marketing?.activationPermitted,
  analyticsGranted: ledger.consent?.analytics?.granted,
  attributionIsNull: ledger.attribution === null,
  tokenExcluded: !ledgerText.includes('XXXX.DUMMY.TOKEN.XXXX'),
  syntheticPersonRecords: (peopleResult.data || []).length,
  companyWritePreventedByDesign: true
};

if (
  verification.parentRecordId !== INTAKE_RECORD_ID
  || !verification.oneEntry
  || !verification.allEntryAttributesPresent
  || !verification.payloadSha256Valid
  || !verification.ledgerSubmissionMatches
  || (
    verification.safeguardsRequiredForThisRun
    && (
      verification.ruleSetVersion !== QUALIFICATION_RULESET_VERSION
      || verification.storedFit !== (lowFit ? 'low' : 'high')
      || verification.automatedEffect !== (
        lowFit ? 'queue_priority_only' : 'queue_priority_and_optional_booking_shortcut'
      )
      || verification.humanReviewRequired !== true
      || verification.automatedRejection !== false
      || verification.automatedContractDecision !== false
      || verification.automatedPricing !== false
    )
  )
  || !verification.turnstileVerified
  || verification.identityAssurance !== 'turnstile-only'
  || verification.emailVerified !== false
  || verification.marketingActivationPermitted !== false
  || verification.analyticsGranted !== false
  || !verification.attributionIsNull
  || !verification.tokenExcluded
  || verification.syntheticPersonRecords !== 0
) {
  throw new Error(`Smoke verification failed for ${submissionId}`);
}

console.log(JSON.stringify(verification, null, 2));
