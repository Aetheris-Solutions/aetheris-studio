# Aetheris Studio — Renaissance Experience Production Brief

**Date:** 23 July 2026

**Status:** Pass 1 scroll-driven vertical slice implemented; layered media and
below-hero room production not started

**Owner:** Lorenzo Masiello

**Scope:** Home experience from the ÆS mark to qualification

**Release constraint:** preview only until the existing release, legal, accessibility and performance gates are closed

## 1. Decision

The next visual pass must stop behaving like a strong hero followed by a conventional agency site. The Home becomes one connected Renaissance world: the exact ÆS mark turns into its Horus reading, gains architectural depth, opens into an oculus, reveals the celestial atelier and continues through four rooms before ending at the commissions ledger and qualification call.

This is not a request to reproduce Shopify Editions Winter 2026. Shopify is a quality and category reference for editorial scale, painterly staging, scroll continuity and the integration of modern proof inside a historical visual world. Aetheris must retain its own mark, palette, people, architecture, copy, proof, camera route and commercial narrative.

The pre-existing implementation remains the rollback baseline while the new
experience is produced. The user-authorised Pass 1 vertical slice is recorded
at commit `725ad66`; this document does not independently authorise later
dependencies, media publication or Production deployment.

## 2. Baseline and gap diagnosis

### What is already production-worthy and must be reused

- The Figma component **B8 / SOURCE MASTER — trimmed wedges** and its exported canonical paths.
- The exact geometry contract in `src/contracts/aetheris-b8-paths.json`.
- The motion invariants in `src/contracts/aetheris-hero-motion-v1.json`.
- The packed Blender source `aetheris-b8-oculus-production-v2.blend`.
- The named-node GLB `public/assets/aetheris-b8-oculus-production-v2.glb`.
- The V7 desktop/mobile composition and protected live-copy fields.
- The painterly treatment of `concepts/v4/hero/02-celestial-atelier-painted-figures-pass-b.png`.
- The poster-first, lazy WebGL and static/reduced-motion fallbacks already documented in `README.md`.
- The current semantic copy, proof content, authentic product screenshots, qualification form and Attio workflow.
- The current English/Italian content structure.

### What the gap audit found

- The hero is a fixed `4.8 s` desktop / `4 s` mobile RAF sequence, not a continuous scroll narrative.
- Any interaction can skip the sequence, so the experience is not reliably authored or reversible.
- The painterly poster is flat behind a logo-only GLB; there are no independently controllable foreground, figure, architecture, atmosphere or depth layers.
- An opaque shutter conceals the topology handoff instead of making the architectural transformation itself the visual event.
- Approximately forty generic one-shot reveal treatments take over below the hero.
- The later sections lose the hero’s material, lighting, perspective and Renaissance identity.
- Proof often reads as interface content placed on a page rather than evidence discovered inside the same world.

### Production objective

Replace the fixed intro with native scroll mapped to one reversible scene graph. Continue the world after the oculus through four distinct rooms. Use authored plaster masks, real depth separation, camera and lighting continuity, and authentic proof embedded in the scenes. Do not scroll-jack, lock the page or subordinate semantic HTML to WebGL.

## 3. Originality contract

### Permitted reference qualities

- Monumental editorial type.
- Full-bleed painterly tableaux.
- Historical and contemporary visual tension.
- A persistent chapter/index rail.
- Scroll-linked camera and layered parallax.
- Material transitions that feel physically authored.
- Authentic product proof integrated into the art direction.

These are general design and interaction categories, not proprietary assets.

### Prohibited copying

- No Shopify artwork, characters, models, textures, screenshots, copy, icons, 3D files, source code or generated derivatives.
- No tracing of Shopify compositions, camera paths, scene timing, masks or section order.
- No duplication of its modern props, product metaphors, pink accent system or branded interface.
- No use of Shopify-specific typefaces or an imitation custom display face.
- No section-by-section visual correspondence that makes the Aetheris page a reskin.
- No training or image-reference input that asks a generator to reproduce a protected Shopify frame.

### Aetheris-owned narrative

The experience is grounded in Aetheris-specific material:

1. the vertical ÆS monogram;
2. its rigid horizontal Horus reading;
3. the mark becoming carved architecture;
4. the eye becoming an oculus;
5. the celestial commerce atelier;
6. real work and in-house agents as evidence;
7. the workshop and commissions metaphor as the route to a qualified call.

Every generated or externally produced asset must be recorded in an asset ledger with source, prompt or production method, human editor, date, licence/rights status and final SHA-256. A visual-similarity review against the references is mandatory before acceptance.

## 4. Approved visual system

### Palette

The following values are the authoring baseline. They may be optically calibrated during compositing, but a change of hue family or semantic role requires art-direction approval and a new dynamic contrast run.

| Token | Baseline | Role |
|---|---:|---|
| Carbon black | `#080B0F` | deepest field, UI ink, night continuity |
| Glaze brown | `#2A1D17` | warm shadow, oil glaze and room transitions |
| Lime ivory | `#EDE7DA` | plaster, parchment fields and primary light text |
| Aetheris sky blue | `#A9C9FF` | brand accent, focus and celestial light |
| Ultramarine | `#173B78` | fresco sky, deep blue fields and atmospheric depth |
| Verdigris | `#476B5B` | oxidised metal, botanical and measurement accents |
| Burnished brass | `#9A7440` | fine rules, instruments, inlay and restrained highlights |

Supporting material colours already in the runtime—travertine and umber—remain available as mixtures, not additional brand accents.

Rules:

- Aetheris sky blue is the primary recognisable accent; burnished brass is secondary and sparing.
- Parchment fields use lime ivory with visible material variation, never flat white.
- Night fields mix carbon, glaze brown and ultramarine rather than using generic black gradients.
- Text contrast is determined from rendered frames, not nominal token pairs.

### Typography

- **Gilroy:** navigation, controls, metadata, captions, proof labels and form UI.
- **Playfair Display:** editorial headings, propositions, room titles and long-form emphasis.
- **One calligraphic or epigraphic display treatment:** initials and a small number of monumental passages only.

The display treatment must not become a third general-purpose family. It requires a documented licence and glyph QA for English and Italian before production use. No generated text is baked into imagery; conversion copy remains live DOM text.

### Layout

- Twelve-column architectural grid.
- A persistent chapter rail on desktop and a compact accessible equivalent on mobile.
- Alternation between full-bleed tableaux and lime-ivory parchment fields.
- Proof is embedded as an object, fresco, ledger, instrument or device inside a scene—not presented as a generic SaaS-card wall.
- The rail, grid lines and inlays provide continuity; they must not cover or clip copy.
- Desktop protected text regions and native mobile framing remain independently authored.

### Motion language

- One narrative camera: **eye → oculus → atelier → proof → team → call**.
- Native scroll is the master clock. The sequence is reversible and does not skip merely because the user touches, wheels or presses a key.
- Plaster masks, apertures, curtains, light and spatial occlusion transition between rooms.
- Layered parallax comes from controlled depth separation, not arbitrary transform drift.
- Lighting direction, colour temperature and camera horizon persist across boundaries unless a transition explicitly motivates a change.
- Micro-animation supports the scene; it never competes with the route or qualification.

## 5. Six-beat opening storyboard

The definitive layered opening and handoff may occupy `520–650vh`, tuned after
device tests. The current code-only vertical slice intentionally uses `260svh`
to validate the scroll clock before new media exists. The ranges below are
normalized scroll progress, not fixed seconds. Native scroll remains
interruptible; there is no forced snapping.

### Beat 01 — Mark (`0.00–0.13`)

**Image:** exact vertical ÆS master, centred in a carbon-and-glaze field with a barely visible plaster grain.

**Motion:** initial hold, then a subtle camera approach with no path mutation.

**Invariant:** canonical inline SVG is the visible authority; no perspective tilt, non-uniform scale or per-path movement.

**Exit:** a brass grazing light discovers edge thickness without changing the front silhouette.

### Beat 02 — Horus (`0.13–0.27`)

**Image:** the master rotates rigidly `−90°` in screen space to reveal the intended Horus reading.

**Motion:** one rigid rotation around the canonical pivot with zero overshoot.

**Invariant:** the existing inclusive fidelity gate remains exact through the end of the Horus hold.

**Exit:** light begins to travel along the lower and upper terminals, preparing the carved form.

### Beat 03 — Bevel (`0.27–0.43`)

**Image:** the flat mark acquires architectural depth as the camera—not the paths—moves toward the existing named-node geometry.

**Motion:** a matched-camera handoff from inline SVG to the B8 front face and edge profile; the bevel grows legible through grazing light and occlusion.

**Material:** carbon stone, lime dust, faint brass inlay; no liquid-metal or generic glass effect.

**Acceptance:** no visible topology pop at `0.5×`, forward or reverse.

### Beat 04 — Oculus (`0.43–0.59`)

**Image:** the carved Horus aperture becomes an inhabitable oculus.

**Motion:** the camera crosses the inner arch; the opening reveals ultramarine sky and atmospheric depth. Plaster fragments and shadow masks travel with the geometry.

**Rule:** replace the “opaque shutter hides the switch” feeling with a motivated architectural passage. Holdout geometry may protect the transition, but may not be the visible event.

### Beat 05 — Atelier (`0.59–0.80`)

**Image:** the V7 composition resolves into a layered celestial atelier using Pass B’s painterly figure treatment. The cupola remains highly detailed; figures remain visibly human but painterly, less photographic and less micro-detailed.

**Motion:** far sky, architecture, far figures, near figures, props and atmosphere settle at different restrained depths. Six secular figures keep the approved breathing room.

**Copy:** live eyebrow, headline, body and CTA occupy the protected desktop/mobile field. Text enters through contrast-safe plaster or shadow shaping, not through image-baked lettering.

### Beat 06 — Proof room (`0.80–1.00`)

**Image:** the atelier’s architectural line leads into the first below-hero room. A proof object enters before the hero has fully released, preventing a hard “hero ends / website begins” boundary.

**Motion:** the chapter rail appears; a plaster edge or fresco seam wipes the scene into the Gallery of Proof while camera direction and key light remain continuous.

**DOM handoff:** the section is semantic HTML, with media layered behind or inside it. Focus order and anchor navigation follow document order, never camera order.

### Responsive behavior

- Desktop, tablet and mobile use the same six narrative beats but separately authored camera endpoints and crop-safe zones.
- Mobile uses a native portrait composition; it is not a crop of the desktop tableau.
- Tablet receives an authored rig or constrained interpolation only after both portrait and landscape frames pass.
- The current session-seen behavior may resolve to the settled atelier/proof threshold, but the user can explicitly replay the scroll narrative.
- A single wheel, touch or keyboard event must not force completion.

## 6. Layer, depth and alpha asset manifest

### Source and delivery tiers

| Tier | Context | Runtime treatment |
|---|---|---|
| A | desktop/tablet, capable GPU, normal data mode | full six-beat scroll, Blender geometry, layered plates, restrained atmosphere |
| B | mobile/touch, capable GPU, normal data mode | native portrait plates, reduced layer count and depth, same narrative beats |
| C | reduced motion, Save-Data, failed WebGL or constrained device | settled responsive poster, live DOM copy, immediate semantic room states; no WebGL, Rive or video request |

### Opening sequence assets

| ID | Asset | Source master | Runtime export | Depth / alpha | Desktop / mobile requirement |
|---|---|---|---|---|---|
| `H00` | Exact ÆS front master | canonical SVG paths | inline SVG | vector alpha | one exact source for all tiers |
| `H01` | B8 bevel and oculus geometry | packed `.blend` | named-node Draco GLB | real geometry | current GLB reused; mobile draw/mesh budget validated |
| `H02` | Camera and proxy set | Blender scene | authored camera data / manifest | real depth | desktop, portrait mobile and tablet endpoints |
| `H10` | Celestial sky | 16-bit layered master | AVIF/WebP plate | far depth; opaque | 3840×2160 master; 2160×3840 native portrait master |
| `H20` | Cupola/fresco architecture | layered master aligned to Blender proxy | AVIF/WebP or KTX2 texture | mid-far depth; alpha or mask | separate desktop and portrait compositions |
| `H30` | Far figure group | Higgsfield base plus human repaint | alpha WebP; PNG fallback only if needed | mid depth; clean alpha | identity-locked; no hand/tool artefacts |
| `H40` | Near figure group | Higgsfield base plus human repaint | alpha WebP; PNG fallback only if needed | near depth; clean alpha | Pass B painterly treatment |
| `H50` | Foreground props / ledge | layered master | alpha WebP | near depth; alpha | reduced or merged on mobile |
| `H60` | Atmosphere | Blender/Higgsfield composite source | small sprite atlas or procedural shader | volumetric depth; alpha | no full-frame transparent video |
| `H70` | Plaster transition masks | authored grayscale master | compressed grayscale texture / SVG mask | mask only | separate edges for desktop and portrait |
| `H80` | Light, shadow and contact masks | Blender render passes | compressed grayscale textures | mask only | matched to camera version |
| `H90` | Static poster | approved final composite | AVIF + WebP | opaque | at least 1440 desktop and 456 mobile delivery widths |

### Required authoring passes

For every layered tableau:

- beauty;
- subject/cryptomatte IDs;
- z-depth;
- normal where a runtime light response is intended;
- ambient occlusion/contact shadow;
- foreground holdout;
- transition mask;
- clean plate with no figures or interface;
- final approved composite for visual matching;
- still poster for Tier C.

Source masters may use EXR, TIFF, PSD or lossless PNG and stay outside the public bundle. Runtime assets must be deliberately compressed and listed in the production manifest.

### Below-hero room asset classes

| Prefix | Room | Required classes |
|---|---|---|
| `R1` | Gallery of Proof | architectural plate, frame/altar objects, authentic screenshots, logo treatments, subtle depth masks, posters |
| `R2` | Chamber of Measure | parchment/fresco plate, astrolabe or measurement geometry, ledger lines, charts rendered as live accessible DOM/SVG |
| `R3` | Cabinet of Systems | cabinet/armillary geometry, agent proof screens, connector ornaments, transition masks, posters |
| `R4` | Atelier | workshop plate, six anonymous portrait placeholders, frame masks, hover/focus states, final static fallback |
| `CL` | Commissions Ledger | parchment field, restrained inlay, live qualification form, consent and status UI; no decorative layer may obscure controls |

## 7. Responsibility split

### Blender

Owns:

- canonical bevel, oculus and room proxy geometry;
- matched cameras and safe-area guides for desktop, tablet and mobile;
- camera path, depth staging and parallax reference;
- physically coherent key/fill/rim lighting and transition occluders;
- UVs, normals, material IDs, contact shadows and render passes;
- GLB optimization, named-node validation and geometry acceptance renders.

Blender does not own live conversion copy, form UI or painterly human detail.

### Higgsfield

Owns:

- painterly base plates and figure/prop variations within the approved V7 composition;
- consistent figure appearance across selected scenes using locked reference sheets;
- short source-motion studies only where a painterly plate genuinely needs motion;
- variant generation for human selection and repaint.

Higgsfield is an authoring tool, not the website runtime. It must not bake in text, logo geometry, product UI or unsupported KPI. Outputs require human paint cleanup, separation into usable layers, provenance recording and visual-similarity review.

### React Three Fiber + Motion

Owns:

- the browser scene graph and lazy WebGL boundary;
- mapping native scroll progress to the six-beat camera and room transitions;
- reversible camera, geometry, depth and light choreography;
- layer parallax, plaster-mask progress and proof-object entry;
- spring smoothing that never disconnects the scene from user scroll;
- pause/resume on visibility, demand rendering after settle and capability tiers;
- DOM/WebGL synchronization without changing semantic reading or focus order.

Motion is the scroll/orchestration layer. R3F owns 3D rendering. Neither tool is used to recreate painterly imagery procedurally when a compressed plate is the better medium.

### Rive

Owns:

- the ÆS `idle → focus → Horus/oculus` ornamental state study after the master is locked;
- small responsive ornaments or chapter-rail indicators with explicit states;
- pointer/focus response where it improves meaning.

Rive does not own the camera, room transitions, proof screens or the main cinematic background. It must expose an immediate reduced-motion/static state and cannot block first paint.

### Rotato

Owns:

- offline device compositions for authentic Google Agent, Social Agent and Lead Gen Agent screenshots;
- camera, device, shadow and lighting around those approved interfaces;
- short WebM/MP4 loops and matched still posters.

Rotato is not a runtime dependency. It may never invent product UI, alter evidence or imply a result that the source ledger does not support.

## 8. The four Renaissance rooms

The rooms replace the sequence of generic reveal sections. Each room is distinct but shares camera direction, plaster scale, line weight, sky-blue light and the persistent chapter rail.

### Room I — Gallery of Proof

**Purpose:** establish trust immediately after the celestial atelier.

**Content:** That’s It, Cielo and approved project evidence.

**Visual system:** a dark fresco gallery with two or three monumental evidence objects, not a card grid. Screenshots can sit inside framed apertures, altarpiece-like panels or a device study, with live labels and claim limits adjacent.

**Motion:** lateral camera drift and shallow depth; each work is discovered as the architecture passes, not popped in by a generic reveal.

**Evidence rule:** name, logo, screenshot, KPI, person, location and upstream mark remain governed by the proof ledger and publication authorisation.

### Room II — Chamber of Measure

**Purpose:** explain the fragmentation problem, five-discipline view and Commerce Growth Diagnostic.

**Content:** fragmentation thesis, measurement, prioritisation and the ordered 90-day plan.

**Visual system:** lime plaster and parchment, verdigris measurement instruments, ultramarine diagrams and burnished-brass rules. Data is live accessible DOM/SVG, never flattened into an unreadable image.

**Motion:** a single astrolabe/ledger mechanism reconfigures to connect the narrative; copy moves through the same grid rather than appearing in disconnected blocks.

### Room III — Cabinet of Systems

**Purpose:** prove that Aetheris connects commerce execution and builds agents in-house.

**Content:** Google Agent, Social Agent and Lead Gen Agent authentic demonstrations plus the connected operating model.

**Visual system:** a studiolo/cabinet of instruments. Modern interfaces appear as active objects inside drawers, lenses or framed devices.

**Motion:** cabinets open, instruments align and proof screens become legible on approach. Rotato renders may be used only after authentic screenshots and redactions are locked.

### Room IV — Atelier

**Purpose:** show the people and craft behind the system.

**Content:** positioning, working method and six team placeholders until real publication rights are complete.

**Visual system:** a daylight workshop that inherits figures and material from the hero. Placeholder portraits remain intentionally anonymous and must not imply real identities.

**Motion:** portrait interpretation and real-photo reveal behavior can be prototyped with placeholders, but real people are out of scope for this pass. Hover behavior must have focus and touch equivalents.

### Closing space — Commissions Ledger

The 90-day engagement and qualification form form a closing loggia/ledger rather than a fifth spectacle room. Motion settles, contrast increases and decorative density falls so the user can read, consent and submit without distraction. The primary outcome is a qualified project submitted to Attio and then a plausible-fit call at `cal.com/aetherisstudio`.

## 9. Runtime and performance budgets

Budgets are release gates, not aspirations. Measure compressed transfer, decoded memory and runtime behavior on the final build.

### Core Web Vitals

| Metric | Release maximum | Internal target |
|---|---:|---:|
| LCP, mobile p75 | `2.5 s` | `≤ 1.8 s` |
| INP, mobile p75 | `200 ms` | `≤ 150 ms` |
| CLS | `0.10` | `≤ 0.05` |

### Transfer and media

- First-paint mobile poster: `≤ 45 KiB`; desktop poster: `≤ 90 KiB`.
- Critical shell before lazy experience: `≤ 450 KiB` compressed including HTML, critical CSS, shell JavaScript, first poster and required font subsets.
- Lazy R3F/Three/Motion runtime: `≤ 350 KiB` Brotli.
- Opening GLB: `≤ 350 KiB` transferred.
- Opening layered media fetched before the Gallery of Proof: `≤ 1.8 MiB` desktop and `≤ 900 KiB` mobile.
- Any single alpha plate: `≤ 180 KiB` desktop and `≤ 100 KiB` mobile.
- Rive asset: `≤ 100 KiB` transferred.
- Rotato proof loop: `≤ 1.5 MiB` desktop and `≤ 700 KiB` mobile, with a still poster always available.
- No decorative video or image sequence is loaded for Tier C.

### GPU and animation

- Device pixel ratio remains capped at `1.75` desktop and `1.25` mobile unless device testing proves a lower cap is required.
- Target decoded texture memory: `≤ 96 MiB` desktop and `≤ 48 MiB` mobile.
- Target scene complexity: `≤ 80` draw calls and `≤ 250k` visible triangles desktop; `≤ 50` draw calls and `≤ 100k` visible triangles mobile.
- Scroll animation target: `55–60 fps` on the agreed desktop reference and `≥ 45 fps` on the agreed representative mobile tier.
- No recurring main-thread task above `50 ms` during ordinary scroll.
- Render on demand after scene settle; pause when hidden or outside the active scene.
- Poster and semantic content must remain usable if a media, GLB, decoder, Rive or WebGL request fails.

If a budget cannot be met, reduce layers, merge static depth bands, shorten proof loops or move an effect offline before raising the budget.

## 10. Accessibility and reduced-motion contract

- Native page scrolling remains available at all times; no wheel or touch hijacking.
- Semantic headings, landmarks, links, proof captions and form controls remain live DOM in logical source order.
- Camera position never determines reading order.
- The persistent chapter rail is keyboard reachable, exposes the current chapter accessibly and has a compact mobile equivalent.
- Every hover interaction has focus and touch behavior.
- No essential copy, KPI, consent text or error state is baked into a plate or video.
- All proof video has an equivalent still, accessible caption and pause behavior.
- No audio autoplays.
- No flash exceeds WCAG thresholds; material wipes avoid rapid full-field luminance changes.
- Minimum contrast is `4.5:1` for normal text and `3:1` for large text, UI boundaries and focus indicators across every sampled frame.
- The qualification form is the calmest surface: no moving background behind fields, labels, consent, validation or success/error states.

### `prefers-reduced-motion: reduce`

- Do not request WebGL, Rive, decorative video or animated sprite assets.
- Resolve directly to the settled atelier/proof poster with live hero copy.
- Rooms appear as static tableaux and parchment fields in normal document flow.
- Plaster masks become immediate cuts or a maximum `160 ms` opacity transition.
- Chapter navigation and all conversion actions remain fully available.

### Save-Data and capability failure

Save-Data, failed WebGL and the low-capability tier use the same static-first contract as reduced motion, while respecting the user’s independent motion preference. A failed enhancement must not delay LCP or expose a blank transition.

## 11. Dynamic contrast checkpoint

After **every substantive change** to a background, material, light, camera, crop, text-safe mask, plate compression or transition timing:

1. rebuild the candidate;
2. run `npm run qa:contrast -- --strict-transitions`;
3. sample English and Italian at desktop, portrait tablet, landscape tablet and representative mobile widths;
4. sample the beginning, midpoint and end of each affected camera/light transition, plus the darkest and brightest rendered frames;
5. verify hero copy, chapter rail, proof captions, controls, links, form fields, errors and focus indicators;
6. require **zero failures**;
7. store the JSON evidence and representative screenshots under a versioned `qa/artifacts/` directory;
8. record the asset/camera/light version and commit under test.

The check must be repeated after final media compression because colour quantisation and alpha changes can alter rendered contrast. A solid emergency scrim may protect copy, but it must be designed into the material system and reviewed at all breakpoints; it cannot be added as an unexamined global overlay.

## 12. Naming, versioning and source control

### Asset names

Use:

`aes-[sequence]-[beat-or-room]-[layer]-[purpose]-[breakpoint]-vNN.ext`

Examples:

- `aes-hero-atelier-l30-far-figures-desktop-v01.webp`
- `aes-hero-oculus-l70-plaster-mask-mobile-v03.webp`
- `aes-r1-proof-thatsit-device-desktop-v02.webm`
- `aes-r4-atelier-portrait-placeholder-03-v01.webp`

Layer numbers remain spatially ordered:

- `l10` far field;
- `l20` architecture;
- `l30` far subjects;
- `l40` near subjects;
- `l50` foreground;
- `l60` atmosphere;
- `l70` masks;
- `l80` light/contact;
- `l90` poster/composite.

### Version rules

- Never overwrite a source master.
- `vNN` increments for an authored visual change; compression-only exports add `-encNN`.
- Camera, light rig and material versions are recorded separately and referenced by the asset manifest.
- Locked canonical B8 files remain content-addressed and are not regenerated as part of art iteration.
- Every delivery manifest records source path, export path, dimensions, colour space, alpha, depth band, transfer size, decoded size estimate, licence/rights status and SHA-256.
- “Final”, “final-final” and unversioned exports are prohibited.

## 13. Acceptance gates

### G0 — Originality and provenance

- [ ] No Shopify asset, copy, code, trace or composition derivative is present.
- [ ] Every external/generated asset has a provenance and rights record.
- [ ] A side-by-side similarity review passes.

### G1 — Art-direction lock

- [ ] Palette, type roles, twelve-column grid and chapter rail are approved.
- [ ] One frame for each beat and room demonstrates continuous Renaissance identity.
- [ ] Pass B figure treatment and V7 breathing room are preserved.

### G2 — Layer-production lock

- [ ] Clean plates, figure groups, foreground, atmosphere, masks, depth and final composite are delivered.
- [ ] Desktop and native portrait masters are separately authored.
- [ ] Alpha edges, hands, tools, props and repeated identities pass `200%` review.

### G3 — Geometry and camera lock

- [ ] Exact B8 master remains invariant through the Horus hold.
- [ ] Blender and DOM safe areas match desktop, tablet and mobile.
- [ ] Forward/reverse handoff shows no topology pop at `0.5×`.
- [ ] Lighting and camera continuity survive every room threshold.

### G4 — Motion prototype

- [ ] Six beats map to native, reversible scroll.
- [ ] No ordinary input skips the experience.
- [ ] Plaster masks and layered parallax are materially motivated.
- [ ] All content and controls work without motion.

### G5 — Room integration

- [ ] Gallery, Measure, Systems and Atelier read as four rooms in one world.
- [ ] Proof is authentic and embedded in scene, not a generic card wall.
- [ ] The commissions ledger becomes calmer and more legible than the preceding rooms.
- [ ] Team remains anonymous placeholders.

### G6 — Responsive and performance

- [ ] Tier A, B and C behavior is implemented.
- [ ] Transfer, GPU, frame-rate and Core Web Vitals budgets pass.
- [ ] Portrait/landscape tablet, mobile touch/background and desktop scroll runs pass.
- [ ] Failure paths preserve copy and qualification.

### G7 — Accessibility and contrast

- [ ] Reduced motion requests no WebGL, Rive or decorative video.
- [ ] Keyboard, focus, touch, landmarks and reading order pass manual review.
- [ ] Strict dynamic contrast reports zero failures after final compression.
- [ ] Form labels, consent, errors and status messages pass without animation.

### G8 — Proof and publication rights

- [ ] Each published logo, screenshot, KPI, person, location and upstream mark has an approved scope.
- [ ] Claim limits match `docs/PROOF-ASSETS.md`.
- [ ] Real team identities remain excluded until separately approved.

### G9 — Release candidate

- [ ] Existing unit, build, consent/network and security gates pass.
- [ ] New motion and visual regression evidence is attached to the exact commit.
- [ ] Privacy/legal blockers in the release register are closed.
- [ ] Production cutover receives a separate explicit approval.

## 14. Inputs already sufficient

The first production cycle does **not** need:

- another logo redesign or reinterpretation of the B8 master;
- a new information architecture, proof order or qualification strategy;
- new copy before spatial prototyping;
- real team names, faces or biographies;
- a new CRM or booking provider;
- a new frontend framework;
- Shopify assets, code or a clone template;
- live production deployment access;
- another Cal.com test;
- another Attio write;
- a full-CGI human cast;
- sound design.

The current B8 sources, Blender/GLB baseline, V7 composition, Pass B figure direction, proof screenshots, copy, form, Attio integration and fallbacks are enough to build the first layered storyboard and scroll prototype.

## 15. Inputs still required

### Needed before G2

- Layerable high-resolution source for the selected V7 desktop and mobile compositions, or approval to repaint/rebuild them from the current flat candidates.
- Locked character sheets for the six secular figures so identities remain consistent across generated variants.
- Human cleanup capacity for hands, tools, facial planes, alpha edges and painted texture.
- Selection and licence evidence for the single calligraphic/epigraphic display treatment.
- Final colour-managed export profile and a named reviewer for painterly/master sign-off.

### Needed before G5

- Approved room-level concept frames for Gallery, Measure, Systems and Atelier.
- The exact authentic screenshot set and redaction state for each proof object.
- A decision on which proof objects merit Rotato loops versus still-only treatment.
- Rights-cleared high-resolution project logos and any physical-location imagery that will enter a scene.

### Needed before G8 or production

- Written publication authorisation from an authorised signatory for That’s It and Cielo covering the exact names, logos, screenshots, KPI, photographs, recognisable people, locations and upstream marks used. Equity ownership or family relationship alone is not treated as the signed publication instrument.
- Contributor/IP assignment and third-party licence evidence for in-house agent assets where applicable.
- Italian privacy-counsel validation and the remaining account-specific vendor evidence tracked in the legal register.

### Explicitly deferred

- Real team roster, portraits and the Renaissance-to-real portrait reveal.
- Any paid Rive, Rotato or additional generation subscription until the corresponding gate selects a concrete production use.

## 16. First production package

The next authorised implementation pass should deliver, without deploying:

1. a six-beat desktop animatic tied to normalized scroll;
2. a native portrait animatic using the same beats;
3. a Blender camera/light/depth package with versioned endpoints;
4. one layered atelier proof with clean plate, two figure bands, foreground, masks, depth and final composite;
5. one concept frame for each of the four rooms and the commissions ledger;
6. a manifest with transfer-size estimates for Tier A, B and C;
7. a contrast-safe copy overlay proof in English and Italian;
8. an originality/provenance checklist for every new asset.

Only after that package passes G0–G3 should the repository add Motion/Rive integrations, new runtime media or below-hero scene code.
