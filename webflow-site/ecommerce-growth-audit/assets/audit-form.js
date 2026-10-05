const DRAFT_KEY = "aetheris.auditForm.v1";
const FIELDS = ["name", "email", "url", "revenue", "challenge"];
const URL_MESSAGE = "Enter a store address, such as yourstore.com";

const boundForms = new WeakSet();

export function normalizeStoreUrl(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function storeUrlError(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(normalizeStoreUrl(trimmed));
    const allowedProtocol = url.protocol === "http:" || url.protocol === "https:";
    if (allowedProtocol && url.hostname.includes(".") && !url.username && !url.password) return "";
  } catch {
    return URL_MESSAGE;
  }
  return URL_MESSAGE;
}

export function serializeDraft(values) {
  const draft = {};
  for (const name of FIELDS) {
    const value = String(values?.[name] ?? "");
    if (value) draft[name] = value;
  }
  return Object.keys(draft).length ? JSON.stringify(draft) : "";
}

export function parseDraft(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const draft = {};
    for (const name of FIELDS) {
      if (typeof parsed[name] === "string") draft[name] = parsed[name];
    }
    return draft;
  } catch {
    return {};
  }
}

function fieldValue(form, name) {
  const field = form.elements?.[name];
  return field && "value" in field ? field.value : "";
}

export function bindAuditForm(form, storage) {
  if (boundForms.has(form)) return;
  boundForms.add(form);
  const urlField = form.querySelector('input[name="url"]');

  const snapshot = () => {
    const values = {};
    for (const name of FIELDS) values[name] = fieldValue(form, name);
    return values;
  };

  const save = () => {
    try {
      const raw = serializeDraft(snapshot());
      if (raw) storage.setItem(DRAFT_KEY, raw);
      else storage.removeItem(DRAFT_KEY);
    } catch {
      /* Private browsing can reject storage writes. The form still submits. */
    }
  };

  const restore = () => {
    let draft = {};
    try {
      draft = parseDraft(storage.getItem(DRAFT_KEY));
    } catch {
      return;
    }
    for (const name of FIELDS) {
      const field = form.elements?.[name];
      if (field && "value" in field && typeof draft[name] === "string") field.value = draft[name];
    }
  };

  form.addEventListener("input", (event) => {
    if (event.target === urlField) urlField.setCustomValidity("");
    save();
  });
  form.addEventListener("change", save);
  form.addEventListener("reset", () => {
    try {
      storage.removeItem(DRAFT_KEY);
    } catch {
      /* The in-memory form is already clear. */
    }
    if (urlField) urlField.setCustomValidity("");
  });
  form.addEventListener("submit", () => {
    if (!urlField) return;
    const error = storeUrlError(urlField.value);
    if (!error) urlField.value = normalizeStoreUrl(urlField.value);
    urlField.setCustomValidity(error);
  }, true);

  restore();
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", restore);
  if (typeof window !== "undefined") {
    window.addEventListener("pageshow", restore);
    window.addEventListener("pagehide", save);
  }
}

if (typeof document !== "undefined") {
  const start = () => {
    document.querySelectorAll("form.audit-form").forEach((form) => bindAuditForm(form, window.sessionStorage));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
