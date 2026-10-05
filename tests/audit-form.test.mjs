import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  bindAuditForm,
  normalizeStoreUrl,
  parseDraft,
  serializeDraft,
  storeUrlError,
} from "../webflow-site/ecommerce-growth-audit/assets/audit-form.js";

test("a store address is accepted with or without a scheme", () => {
  for (const value of ["yourstore.com", "www.yourstore.com", "https://yourstore.com/path", "http://shop.example"]) {
    assert.equal(storeUrlError(value), "", value);
  }
  assert.equal(normalizeStoreUrl("www.yourstore.com"), "https://www.yourstore.com");
  assert.equal(normalizeStoreUrl("  yourstore.com/path "), "https://yourstore.com/path");
  assert.equal(normalizeStoreUrl("https://yourstore.com"), "https://yourstore.com");
  assert.equal(storeUrlError(""), "");
  assert.ok(storeUrlError("not a url"));
  assert.ok(storeUrlError("hello"));
  assert.ok(storeUrlError("https://user:pass@yourstore.com"));
});

test("the draft keeps filled answers and drops the honeypot", () => {
  const raw = serializeDraft({
    name: "Ada",
    email: "ada@shop.com",
    url: "shop.com",
    revenue: "€1M–€5M",
    challenge: "Checkout",
    website: "spam",
  });
  assert.deepEqual(parseDraft(raw), {
    name: "Ada",
    email: "ada@shop.com",
    url: "shop.com",
    revenue: "€1M–€5M",
    challenge: "Checkout",
  });
  assert.equal(serializeDraft({ name: "", email: "" }), "");
  assert.deepEqual(parseDraft("{"), {});
});

test("the form restores a draft, accepts a bare domain, and clears after reset", () => {
  const storage = new Map();
  storage.getItem = (key) => (storage.has(key) ? storage.get(key) : null);
  storage.setItem = (key, value) => Map.prototype.set.call(storage, key, value);
  storage.removeItem = (key) => storage.delete(key);
  const fields = Object.fromEntries(["name", "email", "url", "revenue", "challenge", "website"].map((name) => [name, {
    name,
    value: "",
    message: "",
    setCustomValidity(message) { this.message = message; },
  }]));
  const listeners = new Map();
  const form = {
    elements: fields,
    querySelector(selector) {
      return selector === 'input[name="url"]' ? fields.url : null;
    },
    addEventListener(type, handler, capture) {
      const key = `${type}:${capture === true ? "capture" : "bubble"}`;
      listeners.set(key, handler);
    },
  };

  storage.setItem("aetheris.auditForm.v1", JSON.stringify({ name: "Ada", url: "www.shop.com", website: "spam" }));
  bindAuditForm(form, storage);
  assert.equal(fields.name.value, "Ada");
  assert.equal(fields.url.value, "www.shop.com");
  assert.equal(fields.website.value, "");

  fields.url.value = "shop.com";
  listeners.get("input:bubble")({ target: fields.url });
  assert.equal(JSON.parse(storage.get("aetheris.auditForm.v1")).url, "shop.com");

  listeners.get("submit:capture")();
  assert.equal(fields.url.value, "https://shop.com");
  assert.equal(fields.url.message, "");

  fields.url.value = "hello";
  listeners.get("submit:capture")();
  assert.equal(fields.url.value, "hello");
  assert.equal(fields.url.message, "Enter a store address, such as yourstore.com");

  listeners.get("reset:bubble")();
  assert.equal(storage.has("aetheris.auditForm.v1"), false);
});

test("the published form no longer uses the browser URL constraint", async () => {
  const html = await readFile(new URL("../webflow-site/ecommerce-growth-audit/index.html", import.meta.url), "utf8");
  assert.match(html, /id="ecom-url"[^>]*type="text"[^>]*placeholder="yourstore.com"/);
  assert.equal(html.includes('id="ecom-url" name="url" type="url"'), false);
  assert.match(html, /src="\/ecommerce-growth-audit\/assets\/audit-form\.js"/);
});
