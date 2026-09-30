# Lead conversion tracking — Ecommerce Growth Leak Audit

This runbook covers how the campaign landing at `/ecommerce-growth-audit`
reports a lead, and how to count that lead in Google Tag Manager
(`GTM-5553RFJZ`), GA4 (`G-WL5GGPH5LS`) and, once the account is opened,
Google Ads.

The site only sends the signals described in section 1. Every GTM, GA4 and
Google Ads step has to be set up by hand, in the order below.

Live container version 6 (checked on 30 September 2026) has two tags:

- the Google tag `G-WL5GGPH5LS`, on **Initialization – All Pages**, with no
  additional consent;
- a Microsoft Clarity custom-template tag, on **All Pages**, that already
  requires `analytics_storage`.

## 1. What the site does

### Consent: two choices, Basic mode

Consent Mode runs in **Basic** mode: no Google tag (GTM, GA4, Google Ads) and
no Microsoft Clarity loads before the visitor grants a choice. There are no
cookieless pings and no modelling for visitors who reject or ignore the banner.

| Choice | Covers | `localStorage` key | Consent Mode when granted |
| --- | --- | --- | --- |
| Analytics | Google Analytics and Microsoft Clarity | `aetheris.analyticsConsent.v2` | `analytics_storage: granted` |
| Advertising measurement | Google Ads conversion measurement | `aetheris.adsConsent.v1` | `ad_storage: granted` (`ad_user_data` stays `denied`, see section 5) |

- Each key holds `granted` or `denied`. The main site and the campaign pages
  share this storage, because they are on the same origin.
- `ad_personalization` is always `denied`, so there is no remarketing.
- **Campaign pages** (the landing and the thank-you page) show *Reject all*
  and *Accept all* with equal weight, plus *Settings*. Settings reveals the two
  toggles, both off, and *Save choices*. *Cookie settings*, as a floating
  button or in the page footer, reopens the banner. Visitors who only have the
  older analytics choice are asked again, because advertising measurement is a
  new purpose.
- **Main site**: the banner stays analytics-only (*Accept* / *Reject*) and
  never grants advertising measurement. Its *Reject*, and withdrawal through
  *Cookie preferences*, also set `aetheris.adsConsent.v1` to `denied` and
  clear the Google Ads cookies (`_gcl_*`) and the ad click the Conversion
  Linker keeps in local storage (`_gcl_ls`).
- Withdrawing a choice clears that choice's cookies, and reloads the page if
  GTM was already running. Withdrawing Advertising measurement also clears the
  stored ad click (`_gcl_ls`). GA4's `_gac_*` cookies, which hold ad click
  data, are cleared when either choice is withdrawn.
- **Other tabs and Back/Forward.** A page left open in another tab, or
  restored with Back or Forward, re-reads the stored choices. If a choice it
  was running with has been withdrawn elsewhere, it reloads. Otherwise it
  applies the stored choices as if they had been made on the page; on the
  thank-you page, a held lead is then pushed once.

### When GTM loads

- On campaign pages, only on `aetherisstudio.com` and
  `www.aetherisstudio.com`. Pages previews (`*.pages.dev`), Vercel and
  localhost never load it there, so the lead flow can only be tested on
  production.
- Only after at least one choice is granted: stored from an earlier visit,
  clicked in the banner, or made in another tab.
- The consent update is always in the dataLayer before `{event: "gtm.js"}`,
  so every tag sees the visitor's choices when it is triggered.
- **New:** on campaign pages, GTM now also loads for visitors who grant only
  Advertising measurement. That is why section 2 must be done before the
  deploy.

### The lead event

1. **The visitor submits the form.** When `/api/contact` succeeds and
   Analytics or Advertising measurement was granted before the submit, the
   landing writes a one-time marker to `sessionStorage` (per tab) under
   `aetheris.leadConversion.v1`:

   ```json
   {"v":1,"form_id":"ecommerce-audit","lead_source":"ecommerce_growth_audit","revenue_band":"1m_5m","lead_id":"<random UUID v4>","created_at":1790000000000}
   ```

   With no choice granted (no choice yet, or *Reject all*), no marker is
   written, because storage used only for measurement needs consent. That lead
   is not measured, even if the visitor accepts on the thank-you page.

2. **It redirects to `/ecommerce-growth-audit/thank-you`.** Only these
   parameters are copied from the landing URL, unchanged, when present and
   non-empty: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
   `utm_content`, `utm_id`, `gclid`, `gbraid`, `wbraid`, `dclid`, `gclsrc`,
   `gad_source`, `gad_campaignid`.
   - The Conversion Linker and GA4 on the thank-you page see the same ad click
     and campaign as on the landing.
   - No personal data goes into the URL or the dataLayer, and nothing new is
     stored server-side: `/api/contact`, Attio and the emails are unchanged.
3. **The thank-you page reads and deletes the marker.** If it is valid and
   less than 30 minutes old, the page pushes this event exactly once:

   ```js
   dataLayer.push({
     event: "generate_lead",
     form_id: "ecommerce-audit",
     lead_source: "ecommerce_growth_audit",
     revenue_band: "1m_5m", // slug of the revenue range chosen in the form
     lead_id: "5f0c4d1e-8a2b-4c3d-9e7f-1a2b3c4d5e6f", // random, one per lead
   });
   ```

   - GTM is normally already running, because a choice was granted on the
     landing, so the event is pushed straight away.
   - If no choice is granted any more (withdrawn in another tab in the
     meantime), the event waits. It is pushed right after a later grant on
     the same page, in its banner or in another tab, loads GTM. If none comes,
     the lead is not measured.

| Revenue option in the form | `revenue_band` |
| --- | --- |
| Under €500k | `under_500k` |
| €500k–€1M | `500k_1m` |
| €1M–€5M | `1m_5m` |
| €5M–€10M | `5m_10m` |
| €10M–€25M | `10m_25m` |
| €25M–€50M | `25m_50m` |
| Over €50M | `over_50m` |
| anything else | `unknown` |

**`generate_lead` is never pushed on:**

- a submission made with no choice granted (no marker);
- a reload of the thank-you page;
- Back or Forward to it;
- a direct visit, bookmark, shared link or new tab (no marker);
- a honeypot hit: bot submissions keep the inline confirmation, get no marker
  and are not redirected.

The landing still sends its older `contact_form_submit` event through the
analytics-only `aetherisTrack` just before the redirect, and the main
contact page sends the same event. Leave it as an ordinary event: don't mark
it as a key event and don't build a Google Ads conversion from it, or campaign
leads are counted twice.

## 2. GA4 consent in GTM (do it first)

With this release, GTM also loads for visitors who grant only Advertising
measurement. In version 6 the Google tag `G-WL5GGPH5LS` fires on
Initialization with no additional consent. The code backstop below keeps GA4
silent for those visitors, but the tag itself should also require analytics
consent. The Clarity tag already requires `analytics_storage`.

In GTM (`GTM-5553RFJZ`):

1. **Tags → the Google tag `G-WL5GGPH5LS`** → Tag Configuration → **Advanced
   Settings → Consent Settings → Require additional consent for tag to fire**
   → add `analytics_storage` → Save.
2. **Tags → the Microsoft Clarity tag** → confirm that the same setting still
   lists `analytics_storage`. It does in version 6, so nothing changes.
3. Set up section 3 in the same workspace, then **Submit → Publish** one
   version with both, for example *Analytics consent for GA4, generate_lead*.
   Until section 3 is published, the site pushes `generate_lead` but no tag
   uses it.
4. Do section 5, then run the checks in section 7, step 1.

Before this release, GTM only ever loaded after an analytics grant.

A tag blocked by this check does not fire later on the same page if the
visitor grants analytics afterwards. It fires from the next page view.

**Backstop in the code.** While Analytics isn't granted, the campaign consent
module sets `window["ga-disable-G-WL5GGPH5LS"] = true`, so GA4 sends nothing
even if the Google tag fires. That is what made it safe to go live before
step 1, but it does not replace step 1. If the GA4
measurement ID ever changes, change it in the source repo's
`analytics-consent.js` too.

**GTM's new Settings tab.** GTM offers an optional optimisation that moves the
Google tag settings into a new container **Settings** tab and sends data
directly to Google destinations
([Google's announcement](https://support.google.com/tagmanager/answer/17079602)).
It can move the settings that step 1 relies on. Don't adopt it, or any other
direct-to-destination configuration, without re-running the *Analytics only*
and *Advertising measurement only* rows of section 6.

Optional: Admin → Container Settings → **Enable consent overview** shows every
tag's consent settings in one list.

## 3. GTM and GA4: the lead event

### Variables

Variables → User-Defined Variables → New → **Data Layer Variable**, Data Layer
Version 2:

| Variable name | Data Layer Variable Name |
| --- | --- |
| `DLV - form_id` | `form_id` |
| `DLV - lead_source` | `lead_source` |
| `DLV - revenue_band` | `revenue_band` |
| `DLV - lead_id` | `lead_id` |

Don't use Custom JavaScript variables here. The site's Content Security Policy
has no `'unsafe-eval'`, so they evaluate to `undefined`.

### Trigger

**`CE - generate_lead`**, type **Custom Event**:

- Event name: `generate_lead`
- This trigger fires on: **Some Custom Events** → `Page Path` **matches RegEx**
  `^/ecommerce-growth-audit/thank-you/?$`

Match on Page Path, not Page URL, because the URL carries campaign and click
parameters.

### GA4 Event tag

**`GA4 - generate_lead`**, type **Google Analytics: GA4 Event**:

- Measurement ID: `G-WL5GGPH5LS`
- Event name: `generate_lead`
- Event parameters:
  - `form_id` → `{{DLV - form_id}}`
  - `lead_source` → `{{DLV - lead_source}}`
  - `revenue_band` → `{{DLV - revenue_band}}`
- Don't send `lead_id` to GA4. It is unique per lead, adds nothing to
  reports and is only needed for Google Ads (section 4).
- Advanced Settings → Consent Settings → **Require additional consent for tag
  to fire** → `analytics_storage`
- Trigger: `CE - generate_lead`

### GA4 settings

- **Key event:** Admin → Data display → **Events**. Once `generate_lead` has
  arrived, click the star next to it (*Mark as key event*). Before that:
  *+ Create event* → name `generate_lead` → turn on *Mark as key event* →
  Counting method **Once per event** → *Create*. Add no matching conditions:
  don't derive `generate_lead` from the thank-you page's `page_view`, which
  would count reloads and direct visits.
- If `contact_form_submit` or `form_submit` is already a key event, unmark it,
  or leads are counted twice.
- **Custom dimension:** Admin → Data display → **Custom definitions** →
  *Create custom dimension* → name *Revenue band*, scope **Event**, event
  parameter `revenue_band`. Add `form_id` and `lead_source` the same way if
  useful. New dimensions take 24–48 hours to appear in reports.

## 4. Google Ads, once the account is opened

**Keep Google Ads apart from GA4**, so each choice controls only its own
product. Google Ads keeps its own Google tag (`AW-…`):

- Don't add it as a destination of `G-WL5GGPH5LS`, don't combine the two tags,
  and decline any offer to use the existing Google tag.
- In Google Ads → Tools → **Data manager** → Google tag, the `AW-…` tag's
  destinations list only `AW-…`.
- Otherwise Google Ads would measure visitors who allowed only analytics (the
  main-site *Accept* included), and GA4 would measure visitors who allowed only
  advertising measurement.

1. **Conversion action.** Goals → **Summary** → *+ Create conversion action* →
   **Conversions on a website** (`aetherisstudio.com`) → **Use Google Tag
   Manager**:
   - Don't accept suggested conversions, and don't create a URL or page-load
     conversion for `/thank-you` (*Automatically without code*, *Set up with
     URL*): it would count reloads, direct visits and shared links.
   - Category: **Submit lead form**
   - Name: for example *Ecommerce audit request*
   - Value: *Use different values for each conversion* if you use the lookup
     table below; otherwise *Use the same value for each conversion* or
     *Don't use a value*
   - Count: **One**
   - Action optimisation: **Primary action**, so bidding uses it. Keep the
     default conversion windows and attribution.
   - Copy the Conversion ID and Conversion Label.
   - Afterwards, Goals → Summary lists one **Primary** *Submit lead form*
     action.
2. **Conversion Linker tag**, type **Conversion Linker**:
   - Trigger: **All Pages**
   - Consent Settings → Require additional consent → `ad_storage`
   - It never fires on the main site, whose banner never grants `ad_storage`.
3. **Optional value by revenue band.** Variables → New → **Lookup Table**,
   named `LT - lead value (EUR)`, input `{{DLV - revenue_band}}`, one row per
   slug (`under_500k`, `500k_1m`, `1m_5m`, `5m_10m`, `10m_25m`, `25m_50m`,
   `over_50m`) with your estimated lead value in euros. Leave `unknown` without
   a row, or set a default value.
4. **Google Ads Conversion Tracking tag**:
   - Conversion ID and Conversion Label from step 1
   - Conversion Value: `{{LT - lead value (EUR)}}` (optional), Currency Code:
     `EUR`
   - Transaction ID: `{{DLV - lead_id}}`. It guards against the same lead
     being sent twice.
   - Leave **Include user-provided data from your website** unchecked, and
     never create a *Google Ads User-Provided Data Event* tag.
   - Consent Settings → Require additional consent → `ad_storage`
   - Trigger: `CE - generate_lead`
   - If you used *Set up in Google Tag Manager* from Google Ads instead, open
     every tag it created: add the `ad_storage` requirement, and delete any
     Google tag it created for `AW-…`. GTM loads that Google tag itself before
     a Google Ads tag fires.
5. **Only Advertising measurement feeds Google Ads.** Don't import the GA4
   `generate_lead` key event into Google Ads, not even as Secondary: GA4
   measures under the Analytics choice. If you link GA4 and Google Ads, keep
   personalised advertising off in the link.
6. **Enhanced conversions are out of scope.** Leave them off and don't accept
   the customer data terms. See section 5.

## 5. User-provided data and the `grantAdUserData` switch

The campaign consent module ships with `grantAdUserData: false` (source repo,
`analytics-consent.js`). Advertising measurement then grants `ad_storage`
only, and `ad_user_data` stays `denied`. Google's
[consent mode overview](https://developers.google.com/tag-platform/security/concepts/consent-mode)
says that with `ad_user_data` denied, personal data collection for advertising
is disabled, including `user_id` and the hashed first-party data used by
enhanced conversions. Click-based conversion measurement still works through
`ad_storage` and the ad click identifier. The switch is what made it safe to
go live before this section was done.

The Google tag setting **Allow user-provided data capabilities** has an
**Automatically detect user-provided data** option. Google describes it as
inspecting the page for strings that look like email addresses. With
`ad_user_data` granted, it can then send the email address typed into the
landing form to Google, hashed. The privacy and cookie policies say that apart
from the revenue range, nothing entered in our forms is sent to Google. On 30
September 2026 the live tag still had the setting on, with automatic email,
phone and address detection.

Keep the switch off. Turn it on only if you ever want enhanced conversions, and
only after the policies disclose sending hashed contact details to Google and
the checks below pass. Either way, switch the tag setting off now so it cannot
activate by accident:

- **Required — GA4 Google tag `G-WL5GGPH5LS`:** GA4 → Admin → Data collection
  and modification → **Data streams** → the web stream → *Configure tag
  settings* → Settings (*Show all*) → **Allow user-provided data
  capabilities**: turn it off.
- **Required — GA4 property:** Admin → Data collection and modification →
  **Data collection** → *User-provided data collection*: confirm it is off.
- **Recommended — Form interactions:** the same web stream → **Enhanced
  measurement** → the settings icon → **Form interactions**: turn it off.
  Otherwise GA4 also records an automatic `form_submit` for every audit
  request, a duplicate of `generate_lead`.
- **Google Ads, once opened:** Tools → **Data manager** → Google tag →
  *Manage*: the same setting on the Ads Google tag (`AW-…`). Since April 2025,
  GTM loads that Google tag with its full settings before a Google Ads tag
  fires, even though the container has no separate Google tag for it. Also
  leave Goals → Settings → **Enhanced conversions** off.

**Check** the published Google tag, and paste the output into the Studio PR:

```bash
tag='https://www.googletagmanager.com/gtag/js?id=G-WL5GGPH5LS'
# Must print nothing, or show "vtp_isEnabled":false
curl -s "$tag" | grep -o '"function":"__ogt_1p_data_v2"[^}]*'
# Shows "vtp_enableForm":false once Form interactions is off
curl -s "$tag" | grep -o '"vtp_enableForm":[a-z]*'
```

On 30 September 2026 the first check showed `"vtp_isEnabled":true` and
`"vtp_isAutoEnabled":true`. Section 6 repeats the check in the browser, on the
real test submission.

If you ever want this feature, update the policies first to disclose sending
hashed contact details to Google, then set `grantAdUserData: true`, update the
test that pins it, rebuild and sync (section 7, step 2).

Google moves these settings from time to time. Check the current pages:
[Configure your Google tag settings](https://support.google.com/tagmanager/answer/12131703),
[User-provided data collection](https://support.google.com/analytics/answer/14077171).

## 6. QA with Tag Assistant on production

The campaign pages only load GTM on `aetherisstudio.com`, so test on
production after the deploy, using GTM **Preview** (Tag Assistant). Tag
Assistant connects only once a choice is granted, because GTM loads only then.

In a private window, where the Tag Assistant extension doesn't run, Tag
Assistant can't follow the path where GTM first loads on the thank-you page
after the redirect (the second row below), because the redirect drops
`gtm_debug`. Check that path in the console instead.

**First**, keep test traffic out of GA4 reports. GA4 → Admin → Data streams →
the web stream → *Configure tag settings* → **Define internal traffic** → add
your IP address. Then Admin → **Data filters** → *Internal Traffic* → set it to
**Active**. Tag Assistant still shows your hits.

**Test data.** Use a fresh private window for each path, or clear
`aetheris.analyticsConsent.v2`, `aetheris.adsConsent.v1` and the cookies in
DevTools → Application between paths. In Tag Assistant, start Preview with
`https://aetherisstudio.com/ecommerce-growth-audit/?utm_source=qa&gclid=TEST`.

- Make **two real submissions**, clearly labelled, for example name *QA test —
  please delete* and message *Test submission*: one after *Accept all* on the
  landing (first row), and one with no choice (second row). Each sends the
  real notification and autoresponder emails. Delete both records from Attio
  afterwards.
- During the *Accept all* submission, filter DevTools → Network by `em=`. No
  request to `google-analytics.com`, `google.com/ccm` or `googleadservices.com`
  may carry an `em=` parameter (section 5).
- For the other paths, grant the choice for the row, then create the marker
  from the DevTools console of the same tab, instead of submitting again:

  ```js
  sessionStorage.setItem("aetheris.leadConversion.v1", JSON.stringify({
    v: 1, form_id: "ecommerce-audit", lead_source: "ecommerce_growth_audit",
    revenue_band: "1m_5m", lead_id: crypto.randomUUID(), created_at: Date.now(),
  }));
  location.assign("/ecommerce-growth-audit/thank-you?utm_source=qa&gclid=TEST&gtm_debug=x");
  ```

  The snippet writes the marker whatever the consent, so it can't stand in for
  the no-choice submission. `gtm_debug=x` keeps Tag Assistant connected on the
  thank-you page.
- In the console, `aetherisConsentChoices()` shows the choices the page is
  running with, for example `{analytics: true, ads: false}`.

A test `gclid` is never matched to an ad click, so Google Ads records no
conversion. That is expected: Ads counts a conversion only after a real ad
interaction.

**Expected results.** The Ads column applies once section 4 is set up.

| Path | GTM | `generate_lead` | GA4 and Clarity tags | Ads tags |
| --- | --- | --- | --- | --- |
| *Accept all* on the landing, then submit | Loads on both pages | Once, after `gtm.js` | Fire | Linker and conversion fire once |
| No choice on the landing, submit, then *Accept all* on the thank-you page | Loads on the click | Never: no marker without an earlier grant. In the console, `dataLayer.filter(e => e.event === "generate_lead")` is empty | Page view only | Linker only |
| Settings → Analytics only → Save choices | Loads | Once | Fire | Blocked by consent (`ad_storage`); no requests to `googleadservices.com` or `googleads.g.doubleclick.net` |
| Settings → Advertising measurement only → Save choices | Loads | Once | Blocked by consent (`analytics_storage`); no requests to `*.google-analytics.com`, `*.analytics.google.com` or `clarity.ms`, even after the Ads conversion fires | Fire |
| *Reject all* | Never loads; Tag Assistant does not connect | Never | None | None |
| Reload the thank-you page | Loads if a choice is granted | Not again | Page view only | Linker only |
| Back to the landing, then Forward | As above | Not again | Page view only | Linker only |
| Direct visit, new tab or pasted link | As above | Never | Page view only | Linker only |
| Main site: *Accept* | Loads | Never | Fire | Blocked by consent; no requests to `googleadservices.com` or `googleads.g.doubleclick.net` |

**Also check:**

- **Consent tab** on each page: after the update, the state matches the
  choices made, and `ad_personalization` is always *Denied*.
- **On the `generate_lead` event:** the four Data Layer Variables hold the
  expected values, and the URL keeps only the allow-listed parameters.
- **Footer:** *Cookie settings* in the footer of both campaign pages reopens
  the banner, with the toggles showing the stored choices.
- **Main-site withdrawal and other tabs:** after *Accept all* on the landing,
  open the footer's *Cookies Policy* link (it opens a new tab) → *Cookie
  preferences* → *Reject*. DevTools → Application should show
  `aetheris.adsConsent.v1` = `denied`, no `_gcl_*` cookies and no `_gcl_ls`.
  Back in the campaign tab, the page has reloaded and requests no `gtm.js`.
- **Back/Forward:** after the *Accept all* submission, choose *Cookie settings*
  → *Reject all* on the thank-you page, then go Back. The landing reloads and
  requests no `gtm.js`.
- **Content Security Policy:** check Tag Assistant's issues list for CSP
  issues, and the DevTools console for `Content-Security-Policy` errors.
  - The policy lives in `scripts/seo-utils.mjs` (`CONTENT_SECURITY_POLICY`).
  - If a Google country domain is reported, add it to `googleCountryDomains`,
    run `npm run seo:apply`, and keep `npm test` green. A test keeps the
    `_headers` line under Cloudflare's 2,000-character limit, and another
    fails if `_headers` no longer matches the generator.
- **After the Ads setup:** in Google Ads, Goals → Summary → *Troubleshoot*.
  Tag status can take 24–48 hours, and conversions up to a day to report.

## 7. Release

1. **GTM and Google tag settings.** Sections 2 and 3 published in one
   version, and section 5 done. The first release went live before these
   steps, which is safe because of the two code backstops (the GA4 switch in
   section 2 and `grantAdUserData` in section 5). Do them as soon as possible,
   and before any later release; these checks confirm them:

   ```bash
   gtm='https://www.googletagmanager.com/gtm.js?id=GTM-5553RFJZ'
   # GA4 Google tag: must include "consent":["list","analytics_storage"]
   curl -s "$gtm" | grep -o '{"function":"__googtag"[^}]*}' | grep 'G-WL5GGPH5LS'
   # Clarity tag: must still include "consent":["list","analytics_storage"]
   curl -s "$gtm" | grep -o '{"function":"__cvt_MQDKZ"[^}]*}'
   # Must show a version above 6
   curl -s "$gtm" | grep -o '"version":"[0-9]*"'
   ```

   Also run the two `gtag/js` checks in section 5. On 30 September 2026 the
   container was still version 6, and its Google tag had no consent list.
2. **Paired PRs, merged together:**
   - the source repo (`Aetheris-Solutions/aetheris-studio-campaign-landing-page`);
   - this repo, carrying the build. In the source repo, on the commit being
     released:

     ```bash
     npm test && npm run build:studio
     git rev-parse --short HEAD
     rsync -a --delete dist/ ~/aetheris-studio/webflow-site/ecommerce-growth-audit/
     ```

     Keep both trailing slashes. `--delete` removes whatever in that folder
     isn't in `dist/`, including the previous build's hashed files, so
     `git status` in this repo must list those as deleted. Put the source
     commit SHA in the Studio PR description.
   - `npm test` must pass. It checks that `thank-you.html` is published, that
     every file the campaign pages load is present and nothing stale is left
     in `assets/`, and that the built JavaScript redirects to
     `/ecommerce-growth-audit/thank-you` and reports `generate_lead`.
3. **Once Cloudflare Pages has deployed `main`:** Caching → Configuration →
   **Purge Everything** on the `aetherisstudio.com` zone (see
   [CLOUDFLARE.md](../CLOUDFLARE.md)). Don't request the new URLs before the
   deploy is live, or the edge may cache the old response.
4. **Checks:**

   ```bash
   # 200 and x-robots-tag: noindex, nofollow
   curl -sI https://aetherisstudio.com/ecommerce-growth-audit/thank-you
   # 308 to /ecommerce-growth-audit/thank-you, query string kept
   curl -sI "https://aetherisstudio.com/ecommerce-growth-audit/thank-you/?utm_source=qa"
   curl -sI https://aetherisstudio.com/ecommerce-growth-audit/thank-you.html
   # The CSP carries the Google Ads hosts
   curl -sI https://aetherisstudio.com/ | grep -io 'www.googleadservices.com'
   ```

5. **Run the QA in section 6.**

### Known limits

- **Only consenting visitors are measured.** In Basic mode, leads from
  visitors who reject or ignore the banner never reach GA4 or Google Ads. A
  lead is measured only if a choice was granted before the submit, so a
  visitor who accepts only on the thank-you page is not counted. Attio
  remains the lead count of record.
- `generate_lead` is pushed once, under the choices in force at that moment.
  If a visitor with only Advertising measurement turns on Analytics later on
  the same page, GA4 does not receive that lead. If a visitor who only had an
  Analytics choice (for example from the main site) turns on Advertising
  measurement on the thank-you page, Google Ads does not receive it either.
- `lead_id` exists only in the browser and in Google. It is not stored in
  Attio, so an Ads conversion cannot be matched to a CRM record.
- With `grantAdUserData` off, Google Ads gets no user data (no enhanced
  conversions, no `user_id`). It still measures conversions from the ad click
  identifier kept under `ad_storage`.
- The marker lives in the tab's `sessionStorage` for 30 minutes. With storage
  blocked, the visitor still sees the thank-you page, but the lead is not
  measured.
- **On Vercel, the submit flow works only once `functions/` is ported.**
  `/api/contact` is a Cloudflare Pages Function, so there is no successful
  submission and no redirect on Vercel. Vercel also ignores `_headers`: the
  Content Security Policy, the security headers and the `/assets/*` caching
  rules would have to move into `vercel.json`, which today carries only
  `cleanUrls` and the campaign's `X-Robots-Tag` rules.
