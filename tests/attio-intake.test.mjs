import assert from "node:assert/strict";
import test from "node:test";
import { enquiryDetails, saveEnquiry } from "../functions/_lib/attio-intake.js";

const env = { ATTIO_API_KEY: "test-key", ATTIO_WEBSITE_INBOUND_LIST_ID: "website_inbound" };

test("each enquiry belongs to its real person and retains the complete message", async () => {
  const calls = [];
  const lead = { name: "Jamie Doe", email: "jamie@example.com", message: "Please help with conversion." };
  const mock = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    if (url.includes("entries")) return Response.json({ data: { id: { entry_id: "entry-1" } } });
    return Response.json({ data: { id: { record_id: "person-1" }, values: {} } });
  };
  assert.equal(await saveEnquiry(env, lead, mock), "entry-1");
  assert.equal(calls.length, 3);
  assert.match(calls[0].url, /matching_attribute=email_addresses$/);
  assert.deepEqual(calls[0].body.data.values, { email_addresses: [lead.email] });
  assert.equal(calls[1].body.data.values.name[0].full_name, lead.name);
  const entry = calls[2].body.data;
  assert.equal(entry.parent_record_id, "person-1");
  assert.equal(entry.parent_object, "people");
  assert.equal(JSON.parse(entry.entry_values.website_ledger_json).message, lead.message);
  assert.equal(JSON.parse(entry.entry_values.website_ledger_json).emailVerified, false);
});

test("audit requests match the supplied store domain without replacing existing CRM identity", async () => {
  const calls = [];
  const mock = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    const id = url.includes("companies") ? "company-1" : "person-1";
    return Response.json({ data: { id: { record_id: id, entry_id: "entry-1" }, values: { name: [{}], company: [{}] } } });
  };
  await saveEnquiry(env, {
    name: "Jamie", email: "jamie@gmail.com",
    message: "Ecommerce Growth Leak Audit request\nStore URL: https://www.shop.example/path\nAnnual revenue: 1m\n\nMain challenge:\nCheckout",
  }, mock);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[1].body.data.values, { domains: ["shop.example"] });
  const ledger = JSON.parse(calls[2].body.data.entry_values.website_ledger_json);
  assert.equal(ledger.companyId, "company-1");
  assert.equal(ledger.source, "ecommerce_growth_audit");
  assert.equal(ledger.storeUrl, "https://www.shop.example/path");
});

test("ordinary messages cannot infer a company, and credentialed URLs are ignored", () => {
  assert.equal(enquiryDetails("Store URL: https://example.com").domain, "");
  assert.equal(enquiryDetails("Ecommerce Growth Leak Audit request\nStore URL: https://user:pass@example.com").domain, "");
});

test("Attio errors do not expose response bodies or credentials", async () => {
  await assert.rejects(saveEnquiry(env, { name: "Jamie", email: "jamie@example.com", message: "Hello" },
    async () => new Response("private contact details", { status: 403 })), /^Error: Attio returned HTTP 403$/);
});
