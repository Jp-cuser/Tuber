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

## AVATAR-002 VRM upload, list, and selection

- User-supplied VRM bytes and metadata are stored durably in browser IndexedDB;
  models are not uploaded to the application server or a third party.
- The control panel lists stored models and supports upload, selection, deletion,
  and restoration of the last selected model after a page reload.
- Replaced object URLs are revoked, database connections are closed, and storage
  failures are surfaced without discarding the current session.
- Unit tests use an IndexedDB-compatible implementation to verify the full
  save/list/read/delete lifecycle and selected-model persistence.

## AVATAR-003 VRM pose, motion, and emotion

- Typed, renderer-independent controls define neutral, wave, and confident
  poses; still and idle motion; and neutral, happy, sad, angry, and surprised
  emotions.
- Humanoid normalized bones receive deterministic pose rotations. Idle motion
  adds subtle torso/head movement and automatic blinking; wave motion animates
  the lower arm over time.
- Expressions use the VRM expression manager and are reset every frame before
  applying the selected preset, preventing stale emotion weights.
- Missing optional bones and expression managers degrade safely. Controls update
  through a ref so changing pose or emotion does not reload the model or recreate
  the WebGL renderer.
- Pure animation tests verify still, wave, and blink frames; Studio tests verify
  all three user controls.

## AVATAR-004 VRM lighting, transform, and fixed position

- Studio controls adjust horizontal/vertical position, Y rotation, uniform
  scale, ambient-light intensity, and directional key-light intensity without
  recreating the renderer or reloading the model.
- Transform ranges are runtime-validated and saved locally. Malformed, partial,
  wrong-type, and out-of-range stored values fall back to safe defaults.
- Position locking disables position, rotation, and scale inputs while leaving
  lighting adjustable; the lock and all values survive page reloads.
- Unit tests cover valid persistence and invalid storage recovery. Studio tests
  verify transform persistence and the lock's disabled-control behavior.

## Dependencies added

- `three`
- `@pixiv/three-vrm`
- `@types/three` (development)

## Verification

- Format, lint, type checking, unit tests, integration tests, and production
  build pass at this checkpoint.
- Unit total: 30 suites and 174 tests.
