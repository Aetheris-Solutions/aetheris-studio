export function onRequestGet({ env }) {
  if (!env.RECAPTCHA_SITE_KEY) {
    return Response.json(
      { error: "Contact form is not configured." },
      { status: 503 },
    );
  }

  return Response.json(
    { siteKey: env.RECAPTCHA_SITE_KEY },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
