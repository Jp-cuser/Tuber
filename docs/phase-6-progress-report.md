# Phase 6 Progress Report

Phase 6 is in progress. The first checkpoint establishes the shared TTS
contract and completes VOICEVOX end to end.

## TTS foundation

- A typed registry contains all eleven required voice engines.
- Every adapter implements the shared synthesis and optional voice-list contract.
- Provider failures use safe application errors and cancellation signals are
  forwarded.

## TTS-001 VOICEVOX adapter

- Localhost `http://127.0.0.1:50021` is the default endpoint.
- Non-loopback endpoints require an explicit server-side origin allowlist.
- Synthesis calls `/audio_query`, applies speed, pitch, and intonation, then
  calls `/synthesis` with the selected speaker.
- Redirects are rejected to prevent allowlist bypass.
- `/speakers` results are normalized into the common voice definition.
- Contract fixtures cover synthesis, controls, speaker listing, and URL policy.
- The protected `/api/tts/synthesize` route returns base64 audio without
  exposing service configuration.
- Studio controls provide speaker, speed, pitch, intonation, and preview
  playback with user-visible status.
- Integration and Chromium fixtures verify the application route and playback
  flow.

## Verification

- Unit: 39 suites and 213 tests pass.
- Integration: 5 suites and 11 tests pass.
- Chromium E2E: 8 tests pass, including protected VOICEVOX preview playback.
- Format, lint, typecheck, and production build pass.
