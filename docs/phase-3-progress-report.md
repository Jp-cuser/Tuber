# Phase 3 Completion Report

Phase 3 is complete. All VRM rows have implementation, error handling, tests,
documentation, passing quality gates, and recorded evidence without bundling or
copying any third-party character asset.

## Matrix IDs addressed

`AVATAR-001` through `AVATAR-005`.

## AVATAR-001 VRM renderer

- Three.js and `@pixiv/three-vrm` load user-supplied VRM 0.x/1.0 models in a
  browser-only rendering boundary.
- The stage includes a perspective camera, transparent WebGL canvas, responsive
  sizing, ambient/key lighting, frame updates, and complete GPU/model cleanup.
- Upload validation accepts only non-empty `.vrm` files up to 100 MB.
- Loading and failure state is shown in the control panel.
- Pointer movement drives the VRM look-at target and safely returns it to center
  when the pointer leaves the canvas.
- Streamed response activity drives the VRM `aa` expression with a bounded
  deterministic lip-sync envelope; inactive generation closes the mouth.
- Chromium E2E constructs an original minimal VRM 1.0 GLB in memory, verifies
  real parser and renderer readiness, reload restoration, and deletion. The
  user-supplied model checklist is documented in `docs/vrm-verification.md`.

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

## AVATAR-005 thinking pose

- AI generation state automatically activates a dedicated head, torso, and
  hand-to-chin humanoid pose while retaining subtle idle movement.
- Thinking takes temporary priority over the user-selected pose. The original
  pose remains stored and is restored automatically when generation completes,
  is cancelled, or fails because the shared `finally` path clears generation.
- Pure animation tests verify that thinking overrides a wave without mutating
  the selected pose, and the control panel exposes the current pose state.

## Dependencies added

- `three`
- `@pixiv/three-vrm`
- `@types/three` (development)
- `fake-indexeddb` (development)

## Files changed

- `src/components/studio/Studio.tsx`
- `src/components/studio/VrmRenderer.tsx`
- `src/features/avatar/control.ts`
- `src/features/avatar/presentation.ts`
- `src/features/avatar/vrm-file.ts`
- `src/features/avatar/vrm-library.ts`
- avatar unit tests and `tests/e2e/smoke.spec.ts`
- `README.md`, `FEATURE_MATRIX.md`, and VRM documentation

## Design decisions

- Character assets remain user-owned and browser-local; no model is bundled or
  sent to the server.
- IndexedDB owns durable model bytes, while typed pure functions own animation
  state independently from Three.js.
- Browser-only dynamic loading keeps Three.js out of server rendering and Jest's
  CommonJS path.
- Renderer refs apply live state without recreating WebGL or reloading the model.

## Verification

- Format, lint, type checking, unit tests, integration tests, and production
  build pass.
- Unit total: 30 suites and 177 tests.
- Integration total: 3 suites and 7 tests.
- Chromium E2E total: 3 tests, including generated VRM load/restore/delete.

## Unresolved risks

- Visual appearance and optional expressions vary across user models; the
  supplied-file checklist remains necessary for model-specific acceptance.
- Lip sync currently follows streamed response activity. Phase 6 will replace
  the envelope input with real audio amplitude while retaining the `aa` output.

## Next recommended phase

Phase 4: implement adapter-based Live2D Cubism 3+ and MotionPNGTuber modes,
including emotions, motion groups, video switching, chroma key, and transforms.
