// Keep this module in sync with lib/attio-intake.js in the campaign source repo.
export function enquiryDetails(message) {
  const campaign = message.startsWith("Ecommerce Growth Leak Audit request\n");
  let storeUrl = "";
  let domain = "";
  if (campaign) {
    const supplied = message.match(/^Store URL: (.+)$/m)?.[1]?.trim();
    if (supplied) {
      try {
        const url = new URL(/^https?:\/\//i.test(supplied) ? supplied : `https://${supplied}`);
        if (["http:", "https:"].includes(url.protocol) && url.hostname.includes(".") && !url.username && !url.password) {
          storeUrl = url.href;
          domain = url.hostname.replace(/^www\./, "");
        }
      } catch { /* Preserve malformed store URLs in the original message only. */ }
    }
  }
  return { source: campaign ? "ecommerce_growth_audit" : "studio_contact", storeUrl, domain };
}

export async function saveEnquiry(env, { name, email, message }, fetchImpl = fetch) {
  if (!env.ATTIO_API_KEY || !env.ATTIO_WEBSITE_INBOUND_LIST_ID) {
    throw new Error("Attio intake is not configured");
  }
  const request = async (path, method, body) => {
    const response = await fetchImpl(`https://api.attio.com/v2/${path}`, {
      method,
      headers: { Authorization: `Bearer ${env.ATTIO_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    // Do not put contact details or provider response bodies in deployment logs.
    if (!response.ok) throw new Error(`Attio returned HTTP ${response.status}`);
    return (await response.json()).data;
  };
  const details = enquiryDetails(message);
  const person = await request("objects/people/records?matching_attribute=email_addresses", "PUT", {
    data: { values: { email_addresses: [email] } },
  });
  const values = {};
  if (!person.values?.name?.length) {
    const [first_name, ...rest] = name.split(/\s+/);
    values.name = [{ first_name, last_name: rest.join(" "), full_name: name }];
  }
  let companyId = null;
  if (details.domain) {
    const company = await request("objects/companies/records?matching_attribute=domains", "PUT", {
      data: { values: { domains: [details.domain] } },
    });
    companyId = company.id.record_id;
    // Retain an existing employer relationship; the submitted store stays in the entry.
    if (!person.values?.company?.length) {
      values.company = [{ target_object: "companies", target_record_id: companyId }];
    }
  }
  if (Object.keys(values).length) {
    await request(`objects/people/records/${person.id.record_id}`, "PATCH", { data: { values } });
  }
  const submissionId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const entry = await request(`lists/${encodeURIComponent(env.ATTIO_WEBSITE_INBOUND_LIST_ID)}/entries`, "POST", {
    data: {
      parent_object: "people",
      parent_record_id: person.id.record_id,
      entry_values: {
        website_submission_id: submissionId,
        website_received_at: receivedAt,
        website_contact_name: name,
        website_work_email: email,
        website_store_url: details.storeUrl,
        website_company: details.domain,
        website_ledger_json: JSON.stringify({
          schemaVersion: 2, submissionId, receivedAt, ...details,
          name, email, message, companyId, recaptchaVerified: true, emailVerified: false,
        }),
      },
    },
  });
  return entry.id.entry_id;
}
