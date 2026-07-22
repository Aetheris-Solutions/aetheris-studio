# Aetheris Studio — production Home

Production-oriented React + TypeScript + Vite site for Aetheris Studio. The
opening B8-to-oculus sequence passes through authored architectural geometry;
the complete conversion journey remains semantic HTML from selected work to
the qualified Cal.com call.

## Home architecture

```text
Celestial oculus hero
→ selected proof index
→ fragmentation thesis
→ five-discipline commerce system
→ That’s It / Cielo / operating-infrastructure folios
→ 90-day engagement
→ Google Agent / Social Agent system demos
→ Aetheris atelier
→ qualified call + footer
```

The live booking destination is `https://cal.com/aetherisstudio`. Case-study
copy avoids unsupported performance claims; the agent interfaces are labelled
as system demos rather than client dashboards.

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
npm run preview
```

## Cloudflare Pages preview

The canonical Pages project remains `aetheris-studio`. Production continues to
build `main` from the legacy `webflow-site` directory until the final switch.
This branch is previewed with a direct Wrangler upload so the Vite `dist/`
bundle and root `functions/` directory are deployed together without changing
the production build settings.

```bash
VITE_TURNSTILE_SITE_KEY=<public-site-key> npm run build
npx wrangler pages deploy dist \
  --project-name aetheris-studio \
  --branch codex-new-site-preview-20260722
```

The Turnstile site key is public and documented in `.env.example`; the matching
secret and the Attio token exist only as encrypted Cloudflare bindings. Preview
hosts receive `X-Robots-Tag: noindex` from the Pages middleware. Do not submit a
completed qualification form during routine visual QA because a valid token
creates a real Attio inbound record.

The previous email contact Function is retained under
`legacy-pages-functions/` for regression coverage only. It sits outside the
routable `functions/` directory and is not included in this preview.

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
- R3F/Three is a lazy chunk. The initial application + React runtime is about
  75 KB gzip in the current build; CSS is under 9 KB gzip. Both remain inside
  the declared gate budgets.
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
isolated preview and Chrome session, and measures paired shown/backdrop
captures at 12 desktop and 9 mobile timeline frames. The strict variant passes
only when every sampled frame meets WCAG contrast. Browser QA should
additionally check:

1. no GLB or WebGL chunk request on every static path;
2. no visible topology switch at 0.5× playback;
3. all six makers remain visible on representative portrait devices;
4. keyboard focus, skip interaction and the live CTA remain usable;
5. `production/hero/webgl-gate-v2.manifest.json` passes the project validator.

Current review captures:

- `qa-desktop-production-final.webm`
- `qa-desktop-production-final-contact-sheet.png`
- `qa-mobile-production-final.webm`
- `qa-mobile-production-final-contact-sheet.png`

The core engineering gate reports `330 passed / 0 failed`. The automated
dynamic-contrast gate passes both final compositions and every sampled motion
frame. Mac Safari and Mac Chrome have physical captures; iPhone Safari, iPad
Safari and mid-range Android Chrome remain pending until those devices are
attached. `--strict` is the complete launch gate and fails closed;
`--core-strict` intentionally excludes physical evidence and prints a warning.
The repeatable workflow is documented in
`production/hero/qa/PHYSICAL-DEVICE-QA-PROTOCOL.md`; no emulated measurement is
promoted into a physical-device slot.
