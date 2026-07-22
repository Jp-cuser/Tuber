# Phase 4 Progress Report

Phase 4 is in progress. The first checkpoint establishes the independent
MotionPNGTuber-compatible playback layer.

## AVATAR-006 Live2D Cubism 3+ foundation

- A runtime bridge isolates the UI from user-supplied licensed Cubism Core and
  rendering framework files.
- Core, bridge, and model paths are restricted to same-origin `.js` and
  `.model3.json` resources.
- The adapter owns script ordering, model mount, and deterministic disposal.
- Contract fixtures verify the lifecycle and missing-runtime/unsafe-path errors
  without redistributing proprietary SDK or model files.

## AVATAR-008 MotionPNGTuber-compatible mode

- Studio selects separate user-supplied idle and talking MP4/WebM videos.
- A typed state selector switches playback from activity level and sensitivity.
- Videos are looped, muted, local object URLs and are never uploaded.
- Validation rejects empty, unsupported, and files larger than 200 MB.
- IndexedDB persists both videos, supports independent replacement, restores the
  pair after reload, and clears the complete local model safely.
- Unit tests cover input validation, threshold clamping, state switching, and
  storage lifecycle. Chromium verifies upload, render, reload, and clear.

Remaining work is the Live2D user-supplied SDK workflow, including emotion and
motion-group mapping.

## AVATAR-009 PNGTuber chroma key, sensitivity, and transforms

- Every video frame is drawn to a canvas. Optional chroma key compares normalized
  RGB distance against a validated key color and tolerance, clearing matching
  pixels without changing non-key pixels.
- Sensitivity, chroma enablement/color/tolerance, scale, and X/Y offsets are
  runtime validated and persisted locally with safe fallback for malformed data.
- Transform changes apply directly to the renderer canvas. Chromium verifies
  scale and chroma settings persist alongside the video pair.
- Pure pixel tests verify key removal; UI tests verify controls and persistence.

## Verification

- Unit: 34 suites and 194 tests pass.
- Chromium E2E: 4 tests pass, including VRM and MotionPNGTuber asset lifecycles.
