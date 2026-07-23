# Cloudflare Pages deployment

## Current deployment state — 23 July 2026

The new Vite application is **preview-only**. It has not been deployed to the
Production branch and no domain cutover has occurred. The current known-good
Production rollback target is:

- immutable deployment: `https://0debe4ae.aetheris-studio.pages.dev`;
- source commit: `12d9b5f`;
- application: legacy Webflow export.

The target above must remain available until a frozen release commit passes the
immutable-preview, legal and operational gates in
`docs/RELEASE-STATUS-2026-07-23.md`.

## Release contract

- Pages project: `aetheris-studio`
- Production branch: `main`
- Runtime: Node.js `22.12.0` or later in the Node 22 line
- Build command: `npm test && npm run build:release`
- Build output directory: `dist`
- Root directory: repository root (represented as an empty string by the API)
- Functions source: `functions/`
- Canonical origin: `https://aetherisstudio.com`

The deployable application is the Vite output in `dist/`, not the legacy
`webflow-site/` export. `wrangler.jsonc` declares the same output directory.
The Pages deployment command must run from the repository root so Wrangler
bundles the root `functions/` directory together with the static artifact.

## Bindings and variables

Configure the following in both Preview and Production unless a narrower scope
is explicitly stated.

| Name | Scope | Requirement | Secret | Purpose |
|---|---|---|---:|---|
| `VITE_TURNSTILE_SITE_KEY` | Build | Required | No | Public Turnstile site key embedded by Vite |
| `TURNSTILE_SECRET_KEY` | Function runtime | Required | Yes | Server-side Turnstile verification |
| `TURNSTILE_EXPECTED_HOSTNAMES` | Function runtime | Recommended | No | Comma-separated accepted hosts for the environment |
| `ATTIO_API_KEY` | Function runtime | Required | Yes | Attio API authentication |
| `ATTIO_WEBSITE_INBOUND_LIST_ID` | Function runtime | Required | Treat as private config | Target Website Inbound list |
| `ATTIO_WEBSITE_INTAKE_RECORD_ID` | Function runtime | Optional override | Treat as private config | Override for the list-pinned internal intake person |
| `ALLOWED_ORIGINS` | Function runtime | Required | No | Exact comma-separated browser origins |

Use `.env.example` for the public Vite variable and `.dev.vars.example` only as
a local shape reference. Never commit real secrets. Do not define
`ALLOW_UNVERIFIED_LOCAL_SUBMISSIONS` in Preview or Production; it exists only
for deliberate localhost tests.

`VITE_TURNSTILE_SITE_KEY` is deliberately stored as a public `plain_text`
build variable, not as an encrypted secret. `TURNSTILE_SECRET_KEY` and
`ATTIO_API_KEY` remain encrypted. The verified Website Inbound list resolves
to a fixed internal intake record in the Function; the optional
`ATTIO_WEBSITE_INTAKE_RECORD_ID` binding is needed only to override that
known pair. Unknown list configurations without an explicit valid override
fail closed.

Production host values must cover the apex and `www` origin where applicable.
The middleware redirects `www.aetherisstudio.com` to the apex while preserving
the path and query string. Preview hosts are served with `X-Robots-Tag:
noindex, nofollow, noarchive`.

## Immutable preview

From a clean, committed source state:

```bash
npm ci
npm test
npm audit --omit=dev
VITE_TURNSTILE_SITE_KEY=<preview-site-key> npm run build:release
npx wrangler pages deploy dist \
  --project-name aetheris-studio \
  --branch <preview-branch>
```

Record the commit SHA and immutable `*.pages.dev` deployment URL. Validate that
exact URL rather than only the mutable branch alias:

- `/` and `/it/` render the intended locale and canonical/hreflang metadata;
- both locale variants of the privacy and cookies notices return `200`;
- legacy service, work, studio and booking paths redirect to the intended
  in-page destination;
- arbitrary extensionless routes return the custom `404`;
- preview HTML and `robots.txt` remain non-indexable;
- `/api/qualification` rejects invalid origin, payload and Turnstile requests;
- consent QA produces no Google or Clarity request before opt-in or after
  withdrawal.

A routine preview gate must not submit a valid qualification payload because
that writes a real record to Attio. Use the dedicated controlled smoke
procedure only when a real CRM write has been explicitly authorized.

The one authorised synthetic Attio smoke was completed and read back on
22 July 2026. It is historical activation evidence, not a recurring release
step. Do not repeat it, and do not complete a Cal.com booking, unless the
release owner gives a new explicit authorisation for that exact external
write. Current preview verification is non-writing.

## Atomic production cutover

1. Freeze a release commit and complete CI plus the immutable-preview gate.
2. Build once from that exact commit with the Production public Turnstile key.
3. Keep the resulting `dist/` unchanged; record the commit SHA and a checksum
   manifest for the release evidence.
4. Confirm Production bindings before the deploy. Binding changes and code
   rollout should be treated as one release window.
5. Deploy the already-verified artifact from the same clean checkout:

   ```bash
   npx wrangler pages deploy dist \
     --project-name aetheris-studio \
     --branch main
   ```

6. Verify the immutable production deployment first, then the apex and `www`
   domains. Check English/Italian routes, canonical redirects, security
   headers, consent transitions and a non-writing qualification rejection.
7. Keep the default Production verification non-writing. The historical Attio
   smoke must not be repeated automatically. Run another end-to-end
   qualification or Cal.com booking only after the non-writing checks pass and
   the release owner gives a new explicit authorisation for that exact write;
   identify and remove or label any synthetic Attio record according to the
   CRM test protocol.

The Pages deployment is atomic: the prior version continues serving until the
new static bundle and Functions bundle are available. Domain DNS should remain
attached to the existing `aetheris-studio` Pages project, so the release does
not require a DNS switch.

## Rollback

Keep the previous production deployment ID and source commit in the release
record. Until cutover, the known rollback target is the immutable
`0debe4ae` deployment from source commit `12d9b5f`. If any production gate
fails:

1. stop further CRM smoke submissions;
2. use the Cloudflare Pages deployment history to roll back the Production
   environment to the last known-good deployment;
3. if dashboard rollback is unavailable, rebuild and redeploy the recorded
   last known-good commit with its matching public build variable;
4. re-run apex/`www`, locale, security-header, consent and non-writing API
   checks;
5. document whether bindings changed, because reverting code does not
   automatically restore edited environment variables.

No database migration is part of this site release. Attio remains an external
write target, so rollback does not delete records already created by an
authorized smoke test.
