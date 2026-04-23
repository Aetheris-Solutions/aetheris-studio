/**
 * Diagnostic endpoint for the contact pipeline.
 *
 *   GET /api/contact-health           → returns env var status (no send)
 *   GET /api/contact-health?send=1    → executes a real test submission
 *
 * Protected by a shared-secret query param if HEALTH_TOKEN is set:
 *   GET /api/contact-health?send=1&token=XYZ
 *
 * If HEALTH_TOKEN is unset, the endpoint is open (only useful during
 * initial setup / debugging — rotate or unset after).
 */

import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail, TARGET_EMAIL } from "@/lib/email";
import { saveSubmissionToSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const send = url.searchParams.get("send") === "1";
  const token = url.searchParams.get("token");
  const expected = process.env.HEALTH_TOKEN;

  if (expected && token !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: missing or invalid token." },
      { status: 401 }
    );
  }

  const env = {
    target_email: TARGET_EMAIL,
    contact_to_email: process.env.CONTACT_TO_EMAIL || null,
    resend_api_key: process.env.RESEND_API_KEY ? "SET" : null,
    resend_from_email: process.env.RESEND_FROM_EMAIL || null,
    web3forms_key: process.env.WEB3FORMS_KEY ? "SET" : null,
    supabase_url: process.env.SUPABASE_URL ? "SET" : null,
    supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "SET"
      : null,
    site_origin: process.env.SITE_ORIGIN || null,
    health_token_required: !!expected,
  };

  if (!send) {
    return NextResponse.json({
      ok: true,
      message:
        "Health check OK. Append ?send=1 to execute a real test submission.",
      env,
    });
  }

  const submission = {
    name: "Health-check Aetheris",
    email: "info@aetheris.solutions",
    company: "Aetheris Solutions · /api/contact-health",
    agent: "hermes",
    message:
      "Test automatico dall'endpoint /api/contact-health per verificare " +
      "che il contact pipeline funzioni in produzione.",
    source: "health-check",
  };

  let supabase: unknown;
  try {
    supabase = await saveSubmissionToSupabase(submission);
  } catch (err) {
    supabase = {
      threw: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  let email: unknown;
  try {
    email = await sendContactEmail(submission);
  } catch (err) {
    email = {
      threw: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return NextResponse.json({
    ok: true,
    env,
    supabase,
    email,
  });
}
