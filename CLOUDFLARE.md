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

## Registrar, nameservers and the Hostinger DNS mirror (2026-09-21)

The Squarespace → Hostinger transfer of `aetherisstudio.com` completed on
2026-09-21 05:21 UTC. Hostinger is now the registrar (registrar lock and
privacy on, 60-day transfer lock until 2026-11-20). **Nameservers did not
change**: the domain still delegates to `matias.ns.cloudflare.com` and
`thea.ns.cloudflare.com`, so the Cloudflare zone
(`163bb6e61c9f464f30a69021f447dfbd`, status active) keeps serving web, mail
and Resend records exactly as before. The domain is not DNSSEC-signed and has
no CAA records, so a nameserver change is not blocked by a stale DS record.

### Keep Cloudflare authoritative while Cloudflare Pages is the origin

A Cloudflare Pages custom **apex** domain only works while the domain is a
zone on the same Cloudflare account. If the nameservers move away, the zone
goes to *Moved* and is deleted after 7 days, after which `aetherisstudio.com`
is no longer served (`www` would survive as a plain CNAME). Any nameserver
switch to Hostinger therefore has to be coupled with the web-origin move to
the Vercel project `aetheris-studio`, never done on its own.

### Hostinger DNS zone = mirror of the Cloudflare zone

Hostinger created the zone with a parking placeholder (`@ A 2.57.91.91`,
`www CNAME aetherisstudio.com`). On 2026-09-21 the placeholder was replaced
with a mirror of the live Cloudflare zone so that an accidental or automatic
nameserver flip can no longer expose a parking page or drop mail:

| Name | Type | Content |
| --- | --- | --- |
| `@` | ALIAS | `aetheris-studio.pages.dev` |
| `www` | CNAME | `aetheris-studio.pages.dev` |
| `@` | MX | `10 mx.gomailify.com` |
| `@` | TXT | SPF `v=spf1 include:spf.gomailify.com -all`, `gomailify=…`, two `google-site-verification=…` |
| `gm0._domainkey`, `gm1._domainkey` | CNAME | GoMailify DKIM |
| `_dmarc` | TXT | `v=DMARC1;p=quarantine;…` (EasyDMARC reporting) |
| `send` | MX + TXT | Resend return-path (`feedback-smtp.eu-west-1.amazonses.com`, `include:amazonses.com`) |
| `resend._domainkey` | TXT | Resend DKIM |

All records use TTL 300. The retired Webflow `_webflow` verification TXT was
dropped from both zones. Captures live in `dns/`:

- `cloudflare-zone-aetherisstudio.com-2026-09-21.json`: the Cloudflare zone
  as exported before any change (rollback reference).
- `hostinger-zone-placeholder-2026-09-21.json`: the Hostinger zone as found.
- `hostinger-zone-aetherisstudio.com.json`: the mirror as applied.

Hostinger snapshots the zone automatically on every change (snapshot
`182263432` is the pre-change placeholder). Restore with the Hostinger API
`DNS_restoreDNSSnapshotV1`, or re-apply `dns/hostinger-zone-aetherisstudio.com.json`
with `overwrite=true`. Do **not** use "reset zone" on this domain: it
reinstates Hostinger's default (parking + Hostinger mail) records.

Hostinger's nameservers (`cosmos`/`nova.dns-parking.com`) answer `REFUSED`
for a zone that is not delegated to them (verified from an external host on
2026-09-21), so the mirror can only be verified through the API until a real
cutover.

### Gates before any nameserver switch

1. Web origin moved to Vercel first: port `functions/` (contact form + Attio
   intake) to Vercel functions, port `webflow-site/_headers` and the
   `www → apex` redirect, set the form env vars, attach both domains to the
   project, and verify the form end-to-end on the Vercel deployment. Then
   change the Hostinger mirror to `@ A 76.76.21.21` and
   `www CNAME cname.vercel-dns.com` (the aetheris.consulting layout).
2. Export the zone-level Cloudflare configuration that disappears with the
   zone (WAF/rate-limiting rules, redirect/cache rules, page rules,
   Always Use HTTPS, HSTS, min TLS) and decide per item: recreate on the new
   origin or accept the loss.
3. Re-read the Hostinger zone immediately before the switch and diff it
   against the Cloudflare export (attaching a Hostinger Mail or Reach order
   auto-injects Hostinger MX/SPF/DKIM records into the Hostinger zone and
   would replace the GoMailify records).
4. Re-check `dig DS aetherisstudio.com` is still empty.
5. Certificates: both Pages certificates expire 2026-11-03 (`www`) and
   2026-11-04 (apex). Prefer switching only after they have auto-renewed
   (`openssl s_client … | openssl x509 -noout -dates` shows a `notBefore` on
   or after 2026-10-05), so no renewal has to happen mid-cutover.
6. After the switch, query the nameserver pair Hostinger assigns to this
   account (`cosmos.dns-parking.com` / `nova.dns-parking.com`, read from
   `domains_getDomainDetailsV1`): `dig A/AAAA/MX/TXT`, HTTPS 200 on the apex
   and `www → apex` 301, `/api/contact-config` 200, an SMTP `RCPT TO` test
   for `info@aetherisstudio.com` against the live MX, one Resend send with
   `Authentication-Results` showing spf/dkim/dmarc pass, Resend domain still
   *verified*. Roll back by pointing the nameservers at Cloudflare again
   within the 7-day *Moved* grace; do not delete the Cloudflare zone until
   every check passes.

Queries to `*.dns-parking.com` from the office LAN are intercepted by the
router's resolver (answers carry `ra`/`ad` flags and `SERVFAIL` on
`+norecurse`), so run authoritative checks from an external host.

### Senders (confirmed by Lorenzo, 2026-09-21)

- GoMailify is the only service sending with an `@aetherisstudio.com`
  envelope on the apex, so the strict apex SPF `-all` is safe to keep.
- Resend sends only as `Aetheris Studio <website@aetherisstudio.com>` from the
  Studio Resend team (API key "Aetheris Studio Website"). The other Resend
  team (Aetheris Solutions) holds no `aetherisstudio.com` domain, so no
  second sender exists.

### Moving inbound mail to Hostinger Mail (planned for info@)

Buying a Hostinger Mail plan does not change the authoritative (Cloudflare)
zone. The switch is a deliberate GoMailify → Hostinger migration done in one
change on Cloudflare, mirrored to the Hostinger zone afterwards:

- create the mailbox `info@aetherisstudio.com` in Hostinger first;
- replace `@ MX 10 mx.gomailify.com` with `5 mx1.hostinger.com` and
  `10 mx2.hostinger.com`;
- replace the SPF TXT with `v=spf1 include:_spf.mail.hostinger.com ~all`;
- add `hostingermail-a/b/c._domainkey` CNAMEs to
  `hostingermail-a/b/c.dkim.mail.hostinger.com` and the `autoconfig` /
  `autodiscover` CNAMEs to `*.mail.hostinger.com`;
- keep the Resend `send` / `resend._domainkey` records and the DMARC record;
  remove the `gm0`/`gm1` DKIM CNAMEs and the `gomailify=` TXT only once
  GoMailify is decommissioned;
- gate: today `mx1.hostinger.com` answers `Relay access denied` for
  `@aetherisstudio.com` recipients (no mail order exists yet), which is the
  exact failure that blocked aetheris.consulting inbound mail for ~17 days.
  Before touching the MX, an SMTP probe (EHLO, STARTTLS, `MAIL FROM` a real
  external address, `RCPT TO:<info@aetherisstudio.com>`) against **both**
  `mx1.hostinger.com` and `mx2.hostinger.com` must return 250, and a real
  test message must land in the mailbox. Keep the GoMailify MX until the
  probe passes and watch the DMARC reports for a week afterwards.
- attaching the mail order also auto-writes Hostinger MX/SPF/DKIM into the
  Hostinger DNS zone. That is harmless while Cloudflare is authoritative, but
  it means the mirror no longer matches Cloudflare: re-diff the Hostinger
  zone against `dns/` before any nameserver switch.

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
