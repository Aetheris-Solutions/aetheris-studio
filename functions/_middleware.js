const CANONICAL_HOST = "aetherisstudio.com";
const WWW_HOST = `www.${CANONICAL_HOST}`;

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname.toLowerCase() === WWW_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
