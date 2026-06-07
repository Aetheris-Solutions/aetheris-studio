const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function clean(value, maxLength) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function verifyRecaptcha({ env, request, token }) {
  if (!env.RECAPTCHA_SECRET_KEY || !token) {
    return { ok: false, error: "reCAPTCHA is not configured." };
  }

  const body = new URLSearchParams({
    secret: env.RECAPTCHA_SECRET_KEY,
    response: token,
  });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = await response.json();
  const threshold = Number(env.RECAPTCHA_MIN_SCORE || "0.5");
  const requestHostname = new URL(request.url).hostname;
  const allowedHostnames = (env.RECAPTCHA_ALLOWED_HOSTNAMES || requestHostname)
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean);

  if (
    !result.success ||
    result.action !== "contact" ||
    Number(result.score) < threshold ||
    !allowedHostnames.includes(result.hostname)
  ) {
    return { ok: false, error: "Unable to verify this submission." };
  }

  return { ok: true };
}

async function sendEmail(env, payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend returned HTTP ${response.status}: ${detail}`);
  }
}

export async function onRequestPost({ request, env, waitUntil }) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 20_000) {
    return json({ ok: false, error: "Submission is too large." }, 413);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const name = clean(input.name, 120);
  const email = clean(input.email, 254).toLowerCase();
  const message = clean(input.message, 5_000);
  const honeypot = clean(input.website, 200);
  const recaptchaToken = clean(input.recaptchaToken, 4_000);

  if (honeypot) return json({ ok: true });
  if (name.length < 2) {
    return json({ ok: false, error: "Please enter your name." }, 400);
  }
  if (!EMAIL_PATTERN.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 400);
  }
  if (!message) {
    return json({ ok: false, error: "Please enter a message." }, 400);
  }

  let verification;
  try {
    verification = await verifyRecaptcha({
      env,
      request,
      token: recaptchaToken,
    });
  } catch (error) {
    console.error("reCAPTCHA verification failed", error);
    return json(
      { ok: false, error: "Unable to verify this submission." },
      502,
    );
  }
  if (!verification.ok) {
    return json({ ok: false, error: verification.error }, 403);
  }

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return json(
      { ok: false, error: "Email delivery is not configured." },
      503,
    );
  }

  const destination = env.CONTACT_TO_EMAIL || "info@aetherisstudio.com";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    await sendEmail(env, {
      from: env.RESEND_FROM_EMAIL,
      to: [destination],
      reply_to: email,
      subject: `New website enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<h1>New website enquiry</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p><p><strong>Message:</strong></p><p>${safeMessage}</p>`,
    });
  } catch (error) {
    console.error("Contact notification failed", error);
    return json(
      { ok: false, error: "We could not send your message. Please try again." },
      502,
    );
  }

  const confirmation = sendEmail(env, {
    from: env.RESEND_FROM_EMAIL,
    to: [email],
    reply_to: destination,
    subject: "We received your message | Aetheris Studio",
    text: `Hi ${name},\n\nThank you for reaching out. We received your message and will get back to you shortly.\n\nAetheris Studio`,
    html: `<p>Hi ${safeName},</p><p>Thank you for reaching out. We received your message and will get back to you shortly.</p><p>Aetheris Studio</p>`,
  }).catch((error) => {
    console.error("Contact confirmation failed", error);
  });
  waitUntil(confirmation);

  return json({ ok: true });
}

export function onRequest() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
