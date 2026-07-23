# Aetheris Studio — Home release candidate

Production-oriented React + TypeScript + Vite site for Aetheris Studio. The
opening B8-to-oculus sequence passes through authored architectural geometry;
the complete conversion journey remains semantic HTML from selected work to
the qualified Cal.com call.

## Release status — 23 July 2026

This repository is still a **preview-only release candidate**. No Production
cutover of the new Vite application has taken place. The current known-good
Production rollback target remains the legacy Webflow deployment at
`https://0debe4ae.aetheris-studio.pages.dev`, sourced from commit `12d9b5f`.
Do not deploy this candidate to the `main` Pages environment while the
documented legal and operational blockers remain open.

The public team roster is intentionally empty. Six anonymous layout
placeholders remain until each identity, role, source image and publication
right passes `docs/TEAM-ASSET-REGISTER.md`; this release does not populate the
real team.

The current release evidence and unresolved gates are recorded in
`docs/RELEASE-STATUS-2026-07-23.md`. The privacy/legal no-go is maintained in
`docs/LEGAL-PRIVACY-REVIEW-2026-07-22.md`.

## Home architecture

```text
Celestial oculus hero
→ selected proof index
→ fragmentation thesis
→ five-discipline commerce system
→ That’s It / Cielo / operating-infrastructure folios
→ 90-day engagement
→ Google Agent / Social Agent / Lead Gen Agent system demos
→ Aetheris atelier
→ qualified call + footer
```

The live booking destination is `https://cal.com/aetherisstudio`. Case-study
copy avoids unsupported performance claims; the agent interfaces are labelled
as system demos rather than client dashboards. The canonical asset, claim and
rights ledger is `docs/PROOF-ASSETS.md`.

## Contracts and invariants

The runtime reads the two locked contracts vendored with this deployment branch:

- `src/contracts/aetheris-b8-paths.json`
- `src/contracts/aetheris-hero-motion-v1.json`

The five canonical paths are emitted as one inline SVG. Through the inclusive
fidelity gate (`1.78 s` desktop / `1.48 s` mobile), the only path transform is
the contract's rigid screen-space `-90deg` Z rotation. There is no path morph,
per-path animation, perspective tilt or non-uniform scale.

Runtime stack:

```text
AVIF/WebP poster first paint
→ exact canonical inline SVG
→ preloaded R3F canvas underneath
→ camera dolly / carved full-frame bevel
→ camera crosses the oculus
→ responsive V7 DOM picture + live DOM copy
```

## Run

```bash
npm install
npm test
npm run dev
npm run build
npm run qa:contrast -- --strict-transitions
npm run qa:consent -- https://your-immutable-preview.pages.dev/
npm run preview
```

## Cloudflare Pages preview

The canonical Pages project is `aetheris-studio`. The deployable application is
the Vite `dist/` bundle plus the root `functions/` directory; the legacy
`webflow-site/` export is not a release artifact. Direct Wrangler previews let
the complete candidate be verified before the atomic Production cutover
documented in `CLOUDFLARE.md`.

```bash
VITE_TURNSTILE_SITE_KEY=<public-site-key> npm run build:release
npx wrangler pages deploy dist \
  --project-name aetheris-studio \
  --branch codex-new-site-preview-20260722
```

The Turnstile site key is public, documented in `.env.example` and configured
as a non-secret `plain_text` build variable. The matching Turnstile secret and
the Attio token remain encrypted Cloudflare bindings. Preview hosts receive
`X-Robots-Tag: noindex` from the Pages middleware. Do not submit a completed
qualification form during routine visual QA because a valid token creates a
real Attio inbound record. One authorised synthetic Attio smoke was completed
on 22 July 2026; it must not be repeated without a new explicit authorisation.
No Cal.com booking is part of the routine release gate.

The previous email contact Function is retained under
`legacy-pages-functions/` for regression coverage only. It sits outside the
routable `functions/` directory and is not included in this preview.

Run `qa:consent` only against the immutable Pages URL produced by the current
deploy. It independently exercises English and Italian fresh, close, reject,
accept, revoke and clean-reload paths at 390×844; verifies focus trap,
background inertness and focus restoration; requires zero Google/Clarity
requests before consent and after withdrawal; checks the exact GTM container
plus GA4/Clarity responses; and proves that a synthetic PII query sentinel
never reaches those requests.

Development defaults to `http://127.0.0.1:4182`; preview defaults to port
`4183`.

Useful query parameters:

- `?replay=1` bypasses the session one-shot.
- `?static=1` forces the final poster and never imports the R3F chunk.
- `?qa-time=<seconds>` freezes an authored frame for deterministic visual QA.

## Production GLB

The loader expects:

`public/assets/aetheris-b8-oculus-production-v2.glb`

The production asset is installed at that path and decoded with the local
WASM Draco decoder under `public/draco/`. Its SHA-256 is
`910ad5a0d5d67996a2feadeac4c8fc50a2d814a2f51dc79a55cca9c29d76bc14`.
A mineral, extruded procedural oculus remains only as a load/error fallback.
A GLB is accepted only when all gate names exist.

At runtime the textureless GLB receives a deterministic 64×64 mineral grain
only on derived bevel/oculus surfaces. The canonical front face, silhouette,
occlusion shutter and camera contract remain untouched. The grain is created
in memory, adds no request and is disposed with the cloned scene.

Required nodes:

- `AETHERIS_HERO_ROOT`
- `B8_RENDER_UNION`
- `B8_EDGE_PROFILE`
- `OCULUS_INNER_ARCH`
- `OCULUS_OUTER_ARCH`
- `OCCLUSION_SHUTTER`

Required materials:

- `MAT_B8_FRONT_EXACT`
- `MAT_B8_BEVEL_STONE`
- `MAT_OCULUS_INNER_STONE`
- `MAT_OCULUS_OUTER_FRESCO`
- `MAT_OCCLUSION_HOLDOUT`

If a name is missing, the browser console reports the exact missing contract
entries and the runtime stays on the procedural geometry. GLB clones dispose
their geometries, materials and textures when replaced or unmounted.

## Fallback matrix

| Condition | Result | WebGL probe | R3F / GLB request |
|---|---|---:|---:|
| Normal first visit | Authored intro | yes | yes |
| `prefers-reduced-motion` | Final live-copy poster | no | no |
| Save-Data | Final live-copy poster | no | no |
| Session already seen | Final live-copy poster | no | no |
| `?static=1` | Final live-copy poster | no | no |
| WebGL capability failure | Final live-copy poster | yes, released | no |
| Context loss / Canvas error | Immediate final poster | already active | removed |
| GLB absent | Procedural architectural bevel | already active | attempted once |
| WebGL prewarm exceeds 5 s | Immediate final poster | already active | cancelled on unmount |

The WebGL capability probe explicitly releases its temporary context. The
live canvas also removes its context-loss listener on unmount.

The motion clock does not start while the lazy WebGL chunk or GLB is loading.
It begins only after either the production asset passes its naming gate or the
procedural bevel is ready. A five-second watchdog resolves to the final
poster, so a slow or stalled asset can never expose a late topology handoff.

## Performance behaviour

- AVIF posters are 59 KB desktop and 19 KB mobile; WebP fallbacks are 106 KB
  and 41 KB.
- R3F/Three remains isolated in a lazy `webgl-runtime` chunk. Use the size table
  printed by the current `npm run build` as release evidence; this document
  intentionally does not freeze bundle-size claims that become stale as the
  Home and localized content evolve.
- DPR is clamped to `1–1.75` desktop and `1–1.25` mobile.
- `frameloop="demand"` prevents a render loop after settle.
- The timeline pauses when the hero leaves the viewport or the document is
  hidden.
- Mobile uses a masked `contain` plate over a blended `cover` background, so
  the complete native portrait composition remains available.
- The transparent canvas carries no duplicate atelier texture: the final art
  remains the responsive DOM picture, avoiding a second GPU upload and mobile
  crop seams while the GLB owns the bevel, oculus, light and shutter.

## Tests

`src/motion/controller.test.ts` verifies smootherstep endpoints, both fidelity
gates, authored durations, copy order, post-gate depth and deterministic
completion clamping. `npm run qa:contrast` then builds the site, launches an
isolated preview and Chrome session, and measures English and Italian
shown/backdrop captures across desktop, mobile, portrait tablet and landscape
timeline frames. The strict variant passes only when every sampled rendered
frame meets WCAG contrast. Browser QA should additionally check:

1. no GLB or WebGL chunk request on every static path;
2. no visible topology switch at 0.5× playback;
3. all six makers remain visible on representative portrait devices;
4. keyboard focus, skip interaction and the live CTA remain usable;
5. `production/hero/webgl-gate-v2.manifest.json` passes the project validator.

Current machine-readable review evidence is kept under `qa/artifacts/`.
`npm test`, `npm run build:release`, the strict dynamic-contrast run and the
immutable preview consent/network run must be executed again for each release
commit; their live output is authoritative, not a pass count copied into this
README.
The agreed iPhone/iPad coverage used Xcode Simulator and is recorded as
simulator evidence, never as a physical-device result.
