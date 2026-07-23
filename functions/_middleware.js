const CANONICAL_HOST = "aetherisstudio.com";
const WWW_HOST = `www.${CANONICAL_HOST}`;
const PAGES_PREVIEW_SUFFIX = ".pages.dev";
const LEGACY_ROUTE_TARGETS = new Map([
  ["/services", "/#system"],
  ["/portfolio", "/#work"],
  ["/contact", "/#qualification"],
  ["/book", "/#qualification"],
  ["/about", "/#studio"],
  ["/studio", "/#studio"],
  ["/work", "/#work"],
  ["/it/services", "/it/#system"],
  ["/it/portfolio", "/it/#work"],
  ["/it/contact", "/it/#qualification"],
  ["/it/book", "/it/#qualification"],
  ["/it/about", "/it/#studio"],
  ["/it/studio", "/it/#studio"],
  ["/it/work", "/it/#work"],
]);
const PAGE_ROUTES = new Set([
  "/",
  "/it",
  "/privacy-policy",
  "/cookies-policy",
  "/it/privacy-policy",
  "/it/cookies-policy",
]);
const API_ROUTES = new Set(["/api/qualification"]);
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms",
  "connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://c.bing.com",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://c.bing.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function redirectWithSecurityHeaders(url, status = 301) {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      ...SECURITY_HEADERS,
    },
  });
}

function notFoundResponse(pathname) {
  const italian = pathname === "/it" || pathname.startsWith("/it/");
  const home = italian ? "/it/" : "/";
  const title = italian ? "Pagina non trovata" : "Page not found";
  const message = italian
    ? "La pagina richiesta non esiste o è stata spostata."
    : "The page you requested does not exist or has moved.";
  const action = italian ? "Torna allo studio" : "Return to the studio";
  const body = `<!doctype html>
<html lang="${italian ? "it" : "en"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>404 — ${title} · Aetheris Studio</title>
    <style>html{color-scheme:dark}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080b0f;color:#ede7da;font-family:Georgia,serif}.folio{width:min(760px,86vw);padding:8vh 0;border-block:1px solid rgba(237,231,218,.25)}small,a{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em}h1{font-size:clamp(58px,12vw,144px);line-height:.82;margin:.25em 0}p{font:18px/1.6 Arial,sans-serif;max-width:520px;color:#b9c7dc}a{display:inline-block;margin-top:2rem;color:#a9c9ff;text-underline-offset:.35em}</style>
  </head>
  <body><main class="folio"><small>Aetheris Studio · 404</small><h1>${title}.</h1><p>${message}</p><a href="${home}">${action} ↗</a></main></body>
</html>`;

  return new Response(body, {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      ...SECURITY_HEADERS,
    },
  });
}

function apiNotFoundResponse() {
  return new Response(JSON.stringify({ ok: false, error: "not_found" }), {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      ...SECURITY_HEADERS,
    },
  });
}

function isStaticOrPlatformPath(pathname) {
  if (pathname.startsWith("/.well-known/") || pathname.startsWith("/cdn-cgi/")) return true;
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) || "";
  return lastSegment.includes(".");
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  if (hostname === WWW_HOST) {
    url.hostname = CANONICAL_HOST;
    return redirectWithSecurityHeaders(url.toString());
  }

  if (hostname.endsWith(PAGES_PREVIEW_SUFFIX) && url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        ...SECURITY_HEADERS,
      },
    });
  }

  const legacyPath = url.pathname.replace(/\/+$/, "") || "/";
  const legacyTarget = LEGACY_ROUTE_TARGETS.get(legacyPath);
  if (legacyTarget) {
    const [pathname, hash] = legacyTarget.split("#");
    url.pathname = pathname;
    url.hash = hash ? `#${hash}` : "";
    return redirectWithSecurityHeaders(url.toString());
  }

  if (url.pathname.startsWith("/api/") && !API_ROUTES.has(legacyPath)) {
    return apiNotFoundResponse();
  }

  if (!PAGE_ROUTES.has(legacyPath) && !isStaticOrPlatformPath(url.pathname)) {
    return notFoundResponse(url.pathname);
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  if (headers.get("Content-Type")?.includes("text/html")) {
    headers.set("Cache-Control", "no-cache");
  }
  if (hostname.endsWith(PAGES_PREVIEW_SUFFIX)) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
