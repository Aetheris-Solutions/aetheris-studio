# Cloudflare deployment

## Pages project

- Repository: `Aetheris-Solutions/aetheris-studio`
- Production branch: `main`
- Build command: leave empty
- Build output directory: `webflow-site`
- Root directory: `/`

Cloudflare Pages automatically deploys the files in `webflow-site` and the
serverless routes in `functions`.

## Environment variables

Configure these for both Preview and Production:

- `RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_ALLOWED_HOSTNAMES`
- `RECAPTCHA_MIN_SCORE`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Use `.dev.vars.example` as the reference. Never commit real secret values.

## Cache after deploy

`/assets/*` is served with `Cache-Control: immutable`, and a Pages deploy does
not purge the zone's edge cache. After any deploy that changes, adds or removes
files under `/assets/` (or adds `404.html`), run **Caching → Configuration →
Purge Everything** on the `aetherisstudio.com` zone, then check:

- `curl -sI https://aetherisstudio.com/assets/js/does-not-exist.js` returns 404;
- `curl -sI https://aetherisstudio.com/ecommerce-growth-audit/` shows
  `x-robots-tag: noindex, nofollow`.

The consent script URL carries a content hash (`?v=…`). Never request a new
asset URL on production before its deploy is live, or the edge caches the old
file under the new URL.

## Domain

The active domain is `aetherisstudio.com`. Add both:

- `aetherisstudio.com`
- `www.aetherisstudio.com`

`aetherisstudio.com` is canonical. `functions/_middleware.js` redirects
`www.aetherisstudio.com` to the apex while preserving path and query string.
The generated pages and sitemap use `https://aetherisstudio.com` canonical URLs.

## Domain transfer safety

When the `aetherisstudio.com` transfer completes, keep the current Cloudflare
nameservers. Do not switch to Hostinger nameservers unless every record has
first been recreated and verified there, including website A/CNAME records,
MX, SPF, DKIM, DMARC, Resend records, verification TXT records, and any
autodiscover or service records.

Capture the complete Cloudflare zone before any nameserver change and verify
web traffic, inbound mail, outbound Resend delivery, and domain ownership
records before completing a cutover.

## Email

Verify `aetherisstudio.com` in Resend before using
`Aetheris Studio <website@aetherisstudio.com>` as the sender. Resend will
provide the DNS records that must be added to Cloudflare.
