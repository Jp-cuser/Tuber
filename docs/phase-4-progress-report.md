# Phase 4 Progress Report

Phase 4 is in progress. The first checkpoint establishes the independent
MotionPNGTuber-compatible playback layer.

## AVATAR-008 MotionPNGTuber-compatible mode

- Studio selects separate user-supplied idle and talking MP4/WebM videos.
- A typed state selector switches playback from activity level and sensitivity.
- Videos are looped, muted, local object URLs and are never uploaded.
- Validation rejects empty, unsupported, and files larger than 200 MB.
- IndexedDB persists both videos, supports independent replacement, restores the
  pair after reload, and clears the complete local model safely.
- Unit tests cover input validation, threshold clamping, state switching, and
  storage lifecycle. Chromium verifies upload, render, reload, and clear.

Remaining work includes chroma-key rendering, transforms, and the Live2D
user-supplied SDK workflow.

## Verification

- Unit: 32 suites and 185 tests pass.
- Chromium E2E: 4 tests pass, including VRM and MotionPNGTuber asset lifecycles.
