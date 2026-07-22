# Phase 3 Progress Report

Phase 3 is in progress. This checkpoint establishes the original VRM rendering
foundation without bundling or copying any character asset.

## AVATAR-001 VRM renderer

- Three.js and `@pixiv/three-vrm` load user-supplied VRM 0.x/1.0 models in a
  browser-only rendering boundary.
- The stage includes a perspective camera, transparent WebGL canvas, responsive
  sizing, ambient/key lighting, frame updates, and complete GPU/model cleanup.
- Upload validation accepts only non-empty `.vrm` files up to 100 MB.
- Loading and failure state is shown in the control panel.
- The renderer remains `In Progress` until a licensed fixture workflow, visual
  E2E evidence, transforms, expressions, motion, gaze, and lip sync are complete.

## Dependencies added

- `three`
- `@pixiv/three-vrm`
- `@types/three` (development)

## Verification

- Format, lint, type checking, unit tests, integration tests, and production
  build pass at this checkpoint.
- Unit total: 27 suites and 163 tests.
