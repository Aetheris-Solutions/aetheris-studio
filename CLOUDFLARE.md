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

## Domain

The active domain is `aetherisstudio.com`. Add both:

- `aetherisstudio.com`
- `www.aetherisstudio.com`

`aetherisstudio.com` is canonical. `functions/_middleware.js` redirects
`www.aetherisstudio.com` to the apex while preserving path and query string.
The generated pages and sitemap use `https://aetherisstudio.com` canonical URLs.

## Email

Verify `aetherisstudio.com` in Resend before using
`Aetheris Studio <website@aetherisstudio.com>` as the sender. Resend will
provide the DNS records that must be added to Cloudflare.
