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

- Unit: 44 suites and 227 tests pass.
- Integration: 5 suites and 11 tests pass.
- Chromium E2E: 13 tests pass, including protected cloud and local TTS preview
  playback through Style-Bert-VITS2, AivisSpeech, and Aivis Cloud.
- Format, lint, typecheck, and production build pass.

## TTS-002 Koeiromap

- API key and endpoint stay server-side; HTTPS is mandatory and redirects are
  rejected.
- X/Y voice coordinates are constrained to -10 through 10 and emotion style is
  validated.
- The adapter accepts both base64 JSON and direct binary audio responses.
- Studio engine selection exposes coordinates and style without leaking the key.
- Contract and Chromium fixtures cover adapter mapping and application routing.

## TTS-003 Google Text-to-Speech

- The adapter maps text, language/voice selection, speaking rate, pitch, and
  volume gain to the official `v1/text:synthesize` REST request.
- API keys remain server-side and use `x-goog-api-key`, avoiding URL exposure.
- Only HTTPS `googleapis.com` service endpoints are accepted and redirects are
  rejected.
- Base64 `audioContent` is normalized to MP3 and `v1/voices` is normalized to
  the shared voice contract.
- Studio, contract, and Chromium fixtures cover configuration and playback.

## TTS-004 Style-Bert-VITS2

- The adapter uses the official server's recommended `POST /voice` endpoint.
- Model ID, speaker ID, style, SDP ratio, and speaking rate are validated and
  mapped to server parameters; speaking rate is converted to inverse `length`.
- Loopback is the default, non-loopback origins require the local-service
  allowlist, redirects are rejected, and an optional API key remains server-side.
- Studio, contract, and Chromium fixtures cover controls and playback routing.

## TTS-005 AivisSpeech

- A dedicated adapter uses `/audio_query`, `/synthesis`, and `/speakers` while
  respecting Aivis-specific AudioQuery semantics.
- Style ID, speed, pitch, emotion intensity, tempo dynamics, and pre/post
  phoneme silence are validated and configurable.
- Loopback is the default; non-loopback origins require the explicit local
  allowlist and redirects are rejected.
- Contract, Studio, and Chromium fixtures cover synthesis and timing controls.

## TTS-006 Aivis Cloud API

- The adapter uses the official `POST /v1/tts/synthesize` endpoint with a
  server-only Bearer credential and returns MP3 audio.
- Model and optional speaker UUIDs are validated, and style ID/style name are
  mutually exclusive.
- Studio controls map speaking rate, pitch, emotional intensity, tempo
  dynamics, and leading/trailing silence to the Cloud request.
- Redirect rejection, bounded inputs, contract fixtures, and Chromium routing
  cover the protected provider path.
