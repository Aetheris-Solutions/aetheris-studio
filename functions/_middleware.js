const CANONICAL_HOST = "aetherisstudio.com";
const WWW_HOST = `www.${CANONICAL_HOST}`;
const PAGES_PREVIEW_SUFFIX = ".pages.dev";
const LEGACY_ROUTE_TARGETS = new Map([
  ["/services", "/#system"],
  ["/portfolio", "/#work"],
  ["/contact", "/#qualification"],
]);
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
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  if (hostname === WWW_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
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
    return Response.redirect(url.toString(), 301);
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
