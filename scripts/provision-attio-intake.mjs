const API = 'https://api.attio.com/v2';
const token = process.env.ATTIO_API_KEY;
const listId = process.env.ATTIO_WEBSITE_INBOUND_LIST_ID
  || 'ea94e071-c5a1-4255-aff3-429b033c7d39';

if (!token) throw new Error('ATTIO_API_KEY is unavailable');
if (!process.argv.includes('--apply')) {
  throw new Error('Refusing external Attio changes without the explicit --apply flag');
}

async function request(method, path, body) {
  const response = await fetch(`${API}/${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`);
  return data;
}

const people = await request('POST', 'objects/people/records/query', {
  filter: { name: { full_name: { $eq: 'Aetheris Website Intake' } } },
  limit: 2,
  offset: 0
});
const matches = Array.isArray(people.data) ? people.data : [];
if (matches.length > 1) throw new Error('Multiple Aetheris Website Intake records exist');

let intake = matches[0];
let createdIntake = false;
if (!intake) {
  const created = await request('POST', 'objects/people/records', {
    data: {
      values: {
        name: [{
          first_name: 'Aetheris Website',
          last_name: 'Intake',
          full_name: 'Aetheris Website Intake'
        }],
        description: 'Technical holding record for unverified website qualification entries. Do not use as a contact or marketing recipient.'
      }
    }
  });
  intake = created.data;
  createdIntake = true;
}

const expected = [
  ['website_contact_name', 'Website contact name', 'Unverified contact name submitted through the website.'],
  ['website_work_email', 'Website work email', 'Unverified work email submitted through the website.'],
  ['website_role', 'Website role', 'Unverified role submitted through the website.'],
  ['website_company', 'Website company', 'Unverified company or brand submitted through the website.'],
  ['website_store_url', 'Website store URL', 'Unverified store or company URL submitted through the website.']
];

const before = await request('GET', `lists/${encodeURIComponent(listId)}/attributes`);
const existing = new Map((before.data || []).map((attribute) => [attribute.api_slug, attribute]));
const createdAttributes = [];

for (const [apiSlug, title, description] of expected) {
  if (existing.has(apiSlug)) continue;
  await request('POST', `lists/${encodeURIComponent(listId)}/attributes`, {
    data: {
      title,
      description,
      api_slug: apiSlug,
      type: 'text',
      is_required: false,
      is_unique: false,
      is_multiselect: false,
      config: {}
    }
  });
  createdAttributes.push(apiSlug);
}

const after = await request('GET', `lists/${encodeURIComponent(listId)}/attributes`);
const finalAttributes = new Map((after.data || []).map((attribute) => [attribute.api_slug, attribute]));
const verified = expected.map(([apiSlug]) => {
  const attribute = finalAttributes.get(apiSlug);
  return {
    apiSlug,
    present: Boolean(attribute),
    type: attribute?.type,
    unique: attribute?.is_unique
  };
});

if (verified.some((attribute) => !attribute.present || attribute.type !== 'text' || attribute.unique !== false)) {
  throw new Error('The Website Inbound staging attribute schema did not verify');
}

const intakeRecordId = intake?.id?.record_id;
if (!intakeRecordId) throw new Error('The intake record has no record_id');

console.log(JSON.stringify({
  intakeRecordId,
  createdIntake,
  createdAttributes,
  verified
}, null, 2));
