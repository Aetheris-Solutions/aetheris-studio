/**
 * Email provider abstraction.
 *
 * Sends contact submissions to TARGET_EMAIL using the first provider
 * that is configured, in this priority order:
 *   1. Resend         (RESEND_API_KEY)        — production-grade
 *   2. Web3Forms      (WEB3FORMS_KEY)         — free, requires only a key
 *   3. FormSubmit.co  (always available)      — zero-config fallback
 */

export const TARGET_EMAIL =
  process.env.CONTACT_TO_EMAIL || "maru@hey.com";

export type ContactSubmission = {
  name: string;
  email: string;
  company?: string;
  agent?: string;
  message?: string;
  source?: string;
};

export type SendResult = {
  ok: boolean;
  provider: string;
  error?: string;
};

const AGENT_LABELS: Record<string, string> = {
  hermes: "Hermes — Lead Qualifier",
  vulcano: "Vulcano — Operations Engine",
  minerva: "Minerva — Data Analyst",
  custos: "Custos — Customer Care",
  custom: "Agente custom",
  dontknow: "Non sa / vuole consiglio",
};

function buildSubject(s: ContactSubmission) {
  const agent = s.agent ? ` · ${AGENT_LABELS[s.agent] || s.agent}` : "";
  return `Nuova richiesta da ${s.name}${agent}`;
}

function buildPlainText(s: ContactSubmission) {
  const agent = s.agent ? AGENT_LABELS[s.agent] || s.agent : "—";
  return [
    "Nuova richiesta dal sito Aetheris Solutions",
    "============================================",
    "",
    `Nome:     ${s.name}`,
    `Email:    ${s.email}`,
    `Azienda:  ${s.company || "—"}`,
    `Agente:   ${agent}`,
    `Sorgente: ${s.source || "homepage"}`,
    "",
    "Messaggio:",
    "----------",
    s.message || "(nessun messaggio)",
    "",
    "============================================",
    `Inviato il ${new Date().toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
    })}`,
  ].join("\n");
}

function buildHtml(s: ContactSubmission) {
  const agent = s.agent ? AGENT_LABELS[s.agent] || s.agent : "—";
  const safe = (v: string) =>
    v.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
    );
  return `<!doctype html><html><body style="font-family: -apple-system, system-ui, sans-serif; background:#0a0a0a; color:#fafaf9; padding:32px;">
  <div style="max-width:600px; margin:0 auto; background:#111; border:1px solid #2a2a2a; border-radius:14px; padding:32px;">
    <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#d4b896; margin-bottom:8px;">
      Aetheris Solutions · Contact form
    </div>
    <h1 style="font-family: Georgia, serif; font-weight:400; color:#fafaf9; margin:0 0 24px; font-size:24px;">
      Nuova richiesta da ${safe(s.name)}
    </h1>
    <table style="width:100%; border-collapse:collapse; font-size:14px; color:#e7e5e4;">
      <tr><td style="padding:8px 0; color:#a8a29e; width:120px;">Nome</td><td>${safe(s.name)}</td></tr>
      <tr><td style="padding:8px 0; color:#a8a29e;">Email</td><td><a href="mailto:${safe(s.email)}" style="color:#d4b896;">${safe(s.email)}</a></td></tr>
      <tr><td style="padding:8px 0; color:#a8a29e;">Azienda</td><td>${safe(s.company || "—")}</td></tr>
      <tr><td style="padding:8px 0; color:#a8a29e;">Agente</td><td>${safe(agent)}</td></tr>
      <tr><td style="padding:8px 0; color:#a8a29e;">Sorgente</td><td>${safe(s.source || "homepage")}</td></tr>
    </table>
    <div style="margin-top:24px; padding-top:24px; border-top:1px solid #2a2a2a;">
      <div style="color:#a8a29e; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:8px;">
        Messaggio
      </div>
      <div style="white-space:pre-wrap; color:#fafaf9; line-height:1.6;">${safe(s.message || "(nessun messaggio)")}</div>
    </div>
    <div style="margin-top:24px; color:#78716c; font-size:11px;">
      Inviato il ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}
    </div>
  </div>
</body></html>`;
}

/* ------------------------------------------------------------------ */
/* Provider 1: Resend                                                 */
/* ------------------------------------------------------------------ */

async function sendViaResend(
  s: ContactSubmission
): Promise<SendResult | null> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Aetheris Solutions <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to: [TARGET_EMAIL],
        reply_to: s.email,
        subject: buildSubject(s),
        text: buildPlainText(s),
        html: buildHtml(s),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        provider: "resend",
        error: `HTTP ${res.status}: ${body}`,
      };
    }

    return { ok: true, provider: "resend" };
  } catch (err) {
    return {
      ok: false,
      provider: "resend",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ------------------------------------------------------------------ */
/* Provider 2: Web3Forms                                              */
/* ------------------------------------------------------------------ */

async function sendViaWeb3Forms(
  s: ContactSubmission
): Promise<SendResult | null> {
  const accessKey = process.env.WEB3FORMS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        from_name: "Aetheris Solutions Site",
        subject: buildSubject(s),
        to: TARGET_EMAIL,
        replyto: s.email,
        name: s.name,
        email: s.email,
        company: s.company || "—",
        agent: s.agent || "—",
        message: s.message || "(nessun messaggio)",
        source: s.source || "homepage",
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        provider: "web3forms",
        error: `HTTP ${res.status}: ${body}`,
      };
    }

    return { ok: true, provider: "web3forms" };
  } catch (err) {
    return {
      ok: false,
      provider: "web3forms",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ------------------------------------------------------------------ */
/* Provider 3: FormSubmit.co (zero-config fallback)                   */
/* ------------------------------------------------------------------ */

async function sendViaFormSubmit(
  s: ContactSubmission
): Promise<SendResult> {
  // Use AJAX endpoint to get JSON response.
  // First submission triggers an activation email — recipient must click
  // the confirmation link once. After that, subsequent submissions arrive
  // directly.
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(TARGET_EMAIL)}`;
  const origin = process.env.SITE_ORIGIN || "https://aetheris.solutions";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/`,
        "User-Agent":
          "Mozilla/5.0 (compatible; AetherisHomepage/1.0; +https://aetheris.solutions)",
      },
      body: JSON.stringify({
        _subject: buildSubject(s),
        _template: "table",
        _replyto: s.email,
        _captcha: "false",
        _autoresponse:
          "Grazie per averci scritto. Abbiamo ricevuto la tua richiesta — ti risponderemo entro 24h lavorative.\n\n— Aetheris Solutions",
        Nome: s.name,
        Email: s.email,
        Azienda: s.company || "—",
        Agente: s.agent ? AGENT_LABELS[s.agent] || s.agent : "—",
        Sorgente: s.source || "homepage",
        Messaggio: s.message || "(nessun messaggio)",
        _full_text: buildPlainText(s),
      }),
    });

    const raw = await res.text().catch(() => "");
    let body: { success?: string; message?: string } = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      // Non-JSON response (rare, but possible if FormSubmit returns HTML)
    }

    // FormSubmit returns success:"false" with an activation/confirmation
    // message on the very first submission to a new recipient. Treat it as
    // success — the recipient will activate the form by clicking the link
    // in their inbox, and we don't want to show an error to the visitor.
    const msg = body?.message || "";
    const needsActivation =
      /activat|confirm|verify|verifica|conferma/i.test(msg);

    if (!res.ok || (body?.success === "false" && !needsActivation)) {
      return {
        ok: false,
        provider: "formsubmit",
        error: msg || `HTTP ${res.status}: ${raw.slice(0, 200)}`,
      };
    }

    if (needsActivation) {
      console.warn(
        `[email] FormSubmit needs activation for ${TARGET_EMAIL} — ` +
          "recipient must click the activation link sent to their inbox. " +
          "After activation, all future submissions will be delivered."
      );
    }

    return { ok: true, provider: "formsubmit" };
  } catch (err) {
    return {
      ok: false,
      provider: "formsubmit",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ------------------------------------------------------------------ */
/* Orchestrator                                                       */
/* ------------------------------------------------------------------ */

export async function sendContactEmail(
  s: ContactSubmission
): Promise<SendResult> {
  const providers = [sendViaResend, sendViaWeb3Forms];

  for (const p of providers) {
    const result = await p(s);
    if (result === null) continue; // not configured
    if (result.ok) return result;
    console.warn(`[email] provider ${result.provider} failed:`, result.error);
  }

  return sendViaFormSubmit(s);
}
