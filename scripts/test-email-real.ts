#!/usr/bin/env -S npx --yes tsx
/**
 * Test integration: chiama la vera funzione `sendContactEmail` da lib/email.ts
 * usando lo stesso path del Server Action in produzione.
 *
 * Uso:
 *   npx tsx scripts/test-email-real.ts
 *
 * Verifica le env vars effettivamente disponibili (Resend / Web3Forms / fallback).
 */

import { sendContactEmail, TARGET_EMAIL } from "../lib/email.js";
import { saveSubmissionToSupabase } from "../lib/supabase.js";

const submission = {
  name: "Test Aetheris (real path)",
  email: "info@aetheris.solutions",
  company: "Aetheris Solutions · Self-test reale",
  agent: "hermes" as const,
  message:
    "Test invocato direttamente sulla funzione reale sendContactEmail() per riprodurre il path del Server Action.",
  source: "test-real-lib",
};

console.log("\n┌─ Aetheris — Real-path Email Test ─────────────────────");
console.log(`│  TARGET_EMAIL:        ${TARGET_EMAIL}`);
console.log(`│  CONTACT_TO_EMAIL:    ${process.env.CONTACT_TO_EMAIL || "(unset)"}`);
console.log(`│  RESEND_API_KEY:      ${process.env.RESEND_API_KEY ? "SET" : "(unset)"}`);
console.log(`│  WEB3FORMS_KEY:       ${process.env.WEB3FORMS_KEY ? "SET" : "(unset)"}`);
console.log(`│  SUPABASE_URL:        ${process.env.SUPABASE_URL ? "SET" : "(unset)"}`);
console.log(`│  SITE_ORIGIN:         ${process.env.SITE_ORIGIN || "(unset)"}`);
console.log("└───────────────────────────────────────────────────────\n");

async function main() {
  console.log("→ Test Supabase save…");
  try {
    const db = await saveSubmissionToSupabase(submission);
    console.log("  ", db);
  } catch (err) {
    console.error("  threw:", err);
  }

  console.log("\n→ Test sendContactEmail (real lib)…");
  try {
    const result = await sendContactEmail(submission);
    console.log("  ", result);
    if (!result.ok) {
      console.error("\n✗ Server Action ritornerebbe 'error' all'utente.");
      process.exit(1);
    }
    console.log(`\n✓ OK via ${result.provider}`);
  } catch (err) {
    console.error("\n✗ THROW (Server Action ritornerebbe 500):", err);
    process.exit(1);
  }
}

main();
