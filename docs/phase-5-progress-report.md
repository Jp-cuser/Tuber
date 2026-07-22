# Phase 5 Progress Report

Phase 5 is in progress. The first checkpoint implements browser-native speech
recognition without sending microphone audio through the application server.

## STT-001 Browser SpeechRecognition

- A browser adapter supports standard and WebKit-prefixed recognition runtimes.
- Interim text updates the Studio input and final text becomes editable chat
  input; microphone output is never submitted automatically.
- Permission denial, missing microphones, no-speech, unsupported browsers, and
  generic recognition errors produce safe user-visible status messages.
- The initial-speech timer aborts stalled recognition after ten seconds.
- Contract fixtures cover configuration, interim/final results, timeout,
  permission failure, continuous restart, and explicit stop.
- Chromium verifies unsupported/permission-limited microphone environments are
  reported without crashing the Studio.

## STT-002 Whisper transcription

- A server-side OpenAI-compatible adapter supports `whisper-1`,
  `gpt-4o-transcribe`, and `gpt-4o-mini-transcribe`.
- Runtime validation restricts models, MIME types, language tags, and file
  names before provider access.
- The Studio can transcribe a selected audio file into editable chat input.
- The API key remains server-only and provider failures return safe errors.
- Contract and integration fixtures verify the multipart provider request and
  protected application route.

## STT-004 continuous microphone foundation

- Continuous mode restarts after normal recognition end and preserves confirmed
  transcript text across segments.
- Explicit stop and component cleanup prevent automatic restart and clear timers.
- Completion still requires silence progress/detection and mutual exclusion with
  later Realtime and Audio modes.

## STT-003 silence detection and progress

- A Web Audio analyser measures RMS microphone level without retaining audio.
- Silence countdown starts only after speech crosses the configured threshold.
- Resumed speech resets the countdown; two seconds of continuous silence stops
  recognition and releases the microphone stream.
- The Studio shows microphone level and accessible silence progress.
- Unit fixtures cover speech gating, progress, reset, timeout, and unsupported
  browser handling.

## Verification

- Unit: 37 suites and 207 tests pass.
- Integration: 4 suites and 9 tests pass.
- Chromium E2E: 7 tests pass, including microphone availability and Whisper
  route handling.
