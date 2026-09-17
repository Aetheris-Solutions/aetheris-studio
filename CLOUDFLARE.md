# Cloudflare deployment

## Pages project

- Repository: `Aetheris-Solutions/aetheris-studio`
- Production branch: `main`
- Build command: `npm test`
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
- `ATTIO_API_KEY` (secret)
- `ATTIO_WEBSITE_INBOUND_LIST_ID`

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

## Attio website intake

After reCAPTCHA passes, contact and audit enquiries create or match a real person
by email. Audit store domains create or match companies. Existing names and
employer links are retained; the submitted identity and full message remain in
a separate Website Inbound entry for each enquiry. No marketing consent or
email ownership is inferred from a form submission.

Use an Attio token with Records and List Entries read-write, Object Configuration
and List Configuration read-only, and other scopes disabled. The existing
Website Inbound list (`ea94e071-c5a1-4255-aff3-429b033c7d39`) already has the
`website_*` attributes used by this integration. The full enquiry is preserved
in `website_ledger_json`; no placeholder person is used.

Email notifications continue if Attio is unavailable and explicitly flag that
the enquiry needs manual CRM entry. Review those notifications for sync failures.
The shared intake helper is also maintained in the campaign source repository.
