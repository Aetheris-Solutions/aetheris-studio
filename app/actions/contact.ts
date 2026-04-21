"use server";

import { headers } from "next/headers";
import {
  sendContactEmail,
  type ContactSubmission,
} from "@/lib/email";
import { saveSubmissionToSupabase } from "@/lib/supabase";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  provider?: string;
  fieldErrors?: Partial<Record<keyof ContactSubmission, string>>;
};

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function s(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function submitContact(
  _prev: ContactState | null,
  formData: FormData
): Promise<ContactState> {
  // Anti-bot honeypot
  const honey = s(formData, "website");
  if (honey) {
    return {
      status: "success",
      message: "Grazie, abbiamo ricevuto la tua richiesta.",
    };
  }

  const submission: ContactSubmission = {
    name: s(formData, "name"),
    email: s(formData, "email"),
    company: s(formData, "company") || undefined,
    agent: s(formData, "agent") || undefined,
    message: s(formData, "message") || undefined,
    source: s(formData, "source") || "homepage",
  };

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (!submission.name || submission.name.length < 2) {
    fieldErrors.name = "Inserisci il tuo nome.";
  }
  if (!submission.email) {
    fieldErrors.email = "Inserisci la tua email.";
  } else if (!EMAIL_RX.test(submission.email)) {
    fieldErrors.email = "Email non valida.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Controlla i campi evidenziati.",
      fieldErrors,
    };
  }

  // Headers for analytics / abuse prevention
  let ip: string | undefined;
  let userAgent: string | undefined;
  try {
    const h = await headers();
    ip =
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      undefined;
    userAgent = h.get("user-agent") || undefined;
  } catch {
    // headers() may not be available in some test contexts
  }

  // Persist to Supabase if configured (non-blocking on failure)
  const dbResult = await saveSubmissionToSupabase({
    ...submission,
    ip,
    userAgent,
  });
  if (dbResult.enabled && !dbResult.ok) {
    console.warn("[supabase] save failed:", dbResult.error);
  }

  // Send email (with provider fallback chain)
  const emailResult = await sendContactEmail(submission);

  if (!emailResult.ok) {
    console.error("[contact] email send failed:", emailResult.error);
    return {
      status: "error",
      message:
        "Non siamo riusciti a inviare la richiesta. Riprova o scrivici direttamente a info@aetheris.solutions.",
    };
  }

  return {
    status: "success",
    message:
      "Richiesta inviata. Ti rispondiamo entro 24h lavorative all'indirizzo che hai indicato.",
    provider: emailResult.provider,
  };
}
