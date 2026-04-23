#!/usr/bin/env node
/**
 * Test del sistema email — invia una richiesta di prova al destinatario
 * configurato (default: marouane.moustaid@aetheris.consulting).
 *
 * Uso:
 *   node scripts/test-email.mjs
 *
 * Provider usato: lo stesso fallback chain del Server Action
 *   1. Resend       (se RESEND_API_KEY)
 *   2. Web3Forms    (se WEB3FORMS_KEY)
 *   3. FormSubmit   (fallback zero-config)
 *
 * NOTA su FormSubmit: la PRIMA submission verso un nuovo indirizzo
 * triggera un'email di attivazione. L'utente deve cliccare il link
 * di conferma una volta. Dopo, tutte le successive arrivano dirette.
 */

const TARGET =
  process.env.CONTACT_TO_EMAIL || "maru@hey.com";

const submission = {
  name: "Test Aetheris",
  email: "info@aetheris.solutions",
  company: "Aetheris Solutions S.r.l. · Self-test",
  agent: "hermes",
  message:
    "Questa è una richiesta di test inviata dallo script scripts/test-email.mjs.\n\n" +
    "Se ricevi questa email, il sistema di contatto del sito funziona correttamente.\n" +
    "Provider usato in fallback: FormSubmit.co (la prima volta richiede conferma cliccando il link).",
  source: "test-script",
};

const AGENT_LABELS = {
  hermes: "Hermes — Lead Qualifier",
  vulcano: "Vulcano — Operations Engine",
  minerva: "Minerva — Data Analyst",
  custos: "Custos — Customer Care",
  custom: "Agente custom",
  dontknow: "Non sa / vuole consiglio",
};

function buildSubject(s) {
  const agent = s.agent ? ` · ${AGENT_LABELS[s.agent] || s.agent}` : "";
  return `[TEST] Nuova richiesta da ${s.name}${agent}`;
}

function buildPlainText(s) {
  const agent = s.agent ? AGENT_LABELS[s.agent] || s.agent : "—";
  return [
    "── TEST EMAIL — Aetheris Solutions homepage ──",
    "",
    `Nome:     ${s.name}`,
    `Email:    ${s.email}`,
    `Azienda:  ${s.company || "—"}`,
    `Agente:   ${agent}`,
    `Sorgente: ${s.source}`,
    "",
    "Messaggio:",
    s.message,
  ].join("\n");
}

async function trySendResend(s) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Aetheris Solutions <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from,
      to: [TARGET],
      reply_to: s.email,
      subject: buildSubject(s),
      text: buildPlainText(s),
    }),
  });
  const body = await res.text();
  return { provider: "resend", ok: res.ok, status: res.status, body };
}

async function trySendWeb3Forms(s) {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) return null;
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: key,
      from_name: "Aetheris Solutions Site (test)",
      subject: buildSubject(s),
      to: TARGET,
      replyto: s.email,
      name: s.name,
      email: s.email,
      company: s.company,
      agent: AGENT_LABELS[s.agent] || s.agent,
      message: s.message,
      source: s.source,
    }),
  });
  const body = await res.text();
  return { provider: "web3forms", ok: res.ok, status: res.status, body };
}

async function trySendFormSubmit(s) {
  const origin = process.env.SITE_ORIGIN || "https://aetheris.solutions";
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(TARGET)}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    },
    body: JSON.stringify({
      _subject: buildSubject(s),
      _template: "table",
      _replyto: s.email,
      _captcha: "false",
      Nome: s.name,
      Email: s.email,
      Azienda: s.company,
      Agente: AGENT_LABELS[s.agent] || s.agent,
      Sorgente: s.source,
      Messaggio: s.message,
    }),
  });
  const body = await res.text();
  return { provider: "formsubmit", ok: res.ok, status: res.status, body };
}

async function main() {
  console.log("\n┌─ Aetheris Solutions — Email Test ─────────────────────────");
  console.log(`│  Target:  ${TARGET}`);
  console.log(`│  From:    ${submission.email}`);
  console.log(`│  Subject: ${buildSubject(submission)}`);
  console.log("└────────────────────────────────────────────────────────────\n");

  const providers = [trySendResend, trySendWeb3Forms];

  for (const p of providers) {
    const res = await p(submission);
    if (res === null) continue;
    console.log(
      `→ provider=${res.provider} status=${res.status} ok=${res.ok}`
    );
    if (res.ok) {
      console.log("\n✓ Email inviata via", res.provider);
      console.log("  Body:", res.body.slice(0, 300));
      process.exit(0);
    }
    console.warn(`✗ ${res.provider} fallito:`, res.body.slice(0, 300));
  }

  console.log("→ Fallback su FormSubmit.co…");
  const res = await trySendFormSubmit(submission);
  console.log(`→ provider=${res.provider} status=${res.status} ok=${res.ok}`);
  console.log("  Body:", res.body.slice(0, 500));

  if (!res.ok) {
    console.error("\n✗ TUTTI i provider sono falliti.");
    process.exit(1);
  }

  console.log("\n✓ Submission accettata da FormSubmit.");
  console.log("\nIMPORTANTE — prima submission ad un nuovo indirizzo:");
  console.log("  → controlla la inbox di", TARGET);
  console.log("  → riceverai un'email da FormSubmit con un link di conferma");
  console.log("  → cliccalo per attivare la consegna automatica futura");
  console.log("  → da quel momento, ogni richiesta arriva dritta\n");
}

main().catch((err) => {
  console.error("Errore inatteso:", err);
  process.exit(1);
});
