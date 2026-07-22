# Deferred experience layer: Motion, Rive and Rotato

Status: **deferred intentionally**. None of these tools is installed or loaded by the current build.

This backlog preserves the intended role of each tool without committing the site to a runtime dependency before the final composition, proof assets and logo are stable.

## Motion (motion.dev)

**Specific use case**

- Orchestrate the scroll transition from Proof Index into Work Folios as one continuous editorial movement.
- Add restrained spring response to proof-card expansion and the qualification step transition.
- Keep the existing reveal system as the no-JavaScript and reduced-motion baseline.

**Activation gate**

Activate only after the Home section order, final copy lengths and proof-media aspect ratios are frozen. The implementation must preserve zero horizontal overflow, produce no layout shift, keep keyboard order unchanged and reduce to immediate state changes under `prefers-reduced-motion`.

## Rive

**Specific use case**

- Build one state-machine moment for the Aetheris ocular mark: `idle` → `focus` → `oculus/open`.
- Reuse that authored state machine at the hero threshold and, if it remains visually useful, as the entrance into the Atelier section.
- Retain the approved static SVG mark as the semantic and low-power fallback.

**Activation gate**

Activate only after the logo master and hero camera transition are formally locked. The `.riv` asset must be production-authored, expose an explicit reduced-motion state, avoid blocking first paint and pass the dynamic contrast gate across every animated state.

## Rotato

**Specific use case**

- Produce pre-rendered device studies for the authentic Google Agent, Social Agent and lead-generation dashboards.
- Use the real approved screenshots already present in the proof layer; Rotato supplies camera, device and lighting only, never invented product UI.
- Export short WebM/MP4 loops plus a still poster for every clip. Rotato is a production tool, not a browser runtime dependency.

**Activation gate**

Activate after screenshot content, publication scope and dashboard redactions are approved. Every render must have a lightweight mobile alternative, a poster fallback, captions that identify the authentic interface and a compression pass before it enters `public/`.

## Order of operations

1. Freeze Home composition, proof assets and logo master.
2. Prototype the Rive ocular transition in isolation and validate fallback/contrast.
3. Add Motion choreography around stable DOM geometry.
4. Replace selected static proof frames with approved Rotato exports.
5. Repeat performance, reduced-motion, responsive and dynamic-contrast QA after each material change.
