# Phase 4 Progress Report

Phase 4 is in progress. The first checkpoint establishes the independent
MotionPNGTuber-compatible playback layer.

## AVATAR-008 MotionPNGTuber-compatible mode

- Studio selects separate user-supplied idle and talking MP4/WebM videos.
- A typed state selector switches playback from activity level and sensitivity.
- Videos are looped, muted, local object URLs and are never uploaded.
- Validation rejects empty, unsupported, and files larger than 200 MB.
- Unit tests cover input validation, threshold clamping, and state switching.

Remaining work includes durable model sets, Chromium switching evidence, chroma
key rendering, transforms, and the Live2D user-supplied SDK workflow.
