/**
 * Optional Supabase persistence for contact submissions.
 *
 * Uses the Supabase REST endpoint directly (no SDK dependency) so the
 * homepage stays dependency-free and serverless-friendly.
 *
 * Required env vars to enable:
 *   SUPABASE_URL              e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY (server-side only — never expose to client)
 *
 * SQL schema: see supabase/schema.sql
 */

import type { ContactSubmission } from "./email";

export type SupabaseSaveResult = {
  ok: boolean;
  enabled: boolean;
  id?: string;
  error?: string;
};

export async function saveSubmissionToSupabase(
  s: ContactSubmission & { ip?: string; userAgent?: string }
): Promise<SupabaseSaveResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_TABLE || "contact_submissions";

  if (!url || !key) {
    return { ok: true, enabled: false };
  }

  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${table}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: s.name,
      email: s.email,
      company: s.company || null,
      agent: s.agent || null,
      message: s.message || null,
      source: s.source || "homepage",
      ip: s.ip || null,
      user_agent: s.userAgent || null,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      enabled: true,
      error: `HTTP ${res.status}: ${body}`,
    };
  }

  const rows = (await res.json().catch(() => null)) as
    | Array<{ id?: string }>
    | null;

  return { ok: true, enabled: true, id: rows?.[0]?.id };
}
