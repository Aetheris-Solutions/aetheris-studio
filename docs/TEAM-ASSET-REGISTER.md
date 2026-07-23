# Aetheris Studio — team asset register

This is an internal publication gate. It is not shipped in the website bundle.

A person can be added to `src/content/team.ts` only when every item in their row is marked `yes`. Consent evidence, photographer releases and source files must remain in the private project archive; the public bundle contains only the approved profile fields and web derivatives.

## Required gate

| Person | Identity + spelling | Public title | Relationship label | Source photo | Photo publication consent | AI transformation consent | Photographer rights | Painted portrait approved | Ready |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lorenzo Masiello | yes | proposed, confirm | founder | available | pending | pending | pending | pending | no |
| Daniele Colombo | yes | proposed, confirm | collaborator, confirm | missing | pending | pending | pending | pending | no |
| Marouane “Maru” Moustaid | yes | proposed, confirm | collaborator, confirm | missing | pending | pending | pending | pending | no |
| Bhoumik “Boomic” Shankar Mishra | yes | pending | collaborator, confirm | missing | pending | pending | pending | pending | no |
| Cristiano — candidate: Cristiano Perdigão | confirm identity | pending | collaborator, confirm | missing | pending | pending | pending | pending | no |
| Maverick — candidate: Maverick Tenace | confirm identity | pending | team / partner / client-side, confirm | missing | pending | pending | pending | pending | no |
| Chiara | surname or profile required | pending | collaborator, confirm | missing | pending | pending | pending | pending | no |

## Proposed public copy — not approved

These lines are working copy only. They must not be copied into the public roster until the corresponding person has approved them.

- **Lorenzo Masiello** — `Founder · Commerce Systems Lead`
- **Daniele Colombo** — `Brand & Web Designer · Social & Content`
- **Marouane “Maru” Moustaid** — `Shopify Engineer · Web Systems`
- **Bhoumik “Boomic” Shankar Mishra** — `Software & AI/ML Engineering`

## Source asset specification

For every person:

- source image: minimum 1600 × 2000 px, sRGB, with enough room for a 4:5 crop;
- photographed and painted versions must share the same eye line, crop and head scale;
- two approved exports per layer: 480 × 600 and 800 × 1000;
- AVIF and WebP plus a JPEG fallback;
- no watermark or embedded text;
- target weight for the complete six-person section: 1.5 MB or less on first load.

Expected structure:

```text
public/team/<slug>/
  portrait-painted-480.avif
  portrait-painted-800.avif
  portrait-painted-480.webp
  portrait-painted-800.webp
  portrait-painted-800.jpg
  portrait-real-480.avif
  portrait-real-800.avif
  portrait-real-480.webp
  portrait-real-800.webp
  portrait-real-800.jpg
```

Use comma-separated `480w` / `800w` source sets in the `ResponsiveTeamImage.avif` and `.webp` fields. Consent records and original source photography must never be placed under `public/`.
