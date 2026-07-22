# Phase 2 Progress Report

Phase 2 remains in progress. This report records completed evidence without claiming completion for provider rows that still require final documentation and full phase gates.

## MEM-001 short-term history

- `ShortTermHistory` and `trimConversationHistory` enforce an immutable newest-message window.
- Studio settings persist a validated limit from 2 through 200 messages, defaulting to 20.
- Imported invalid limits are replaced with the default during settings migration.
- The studio sends only the newest configured messages to the AI API and bounds its visible conversation state.
- Unit coverage is recorded in `tests/unit/ai-foundation.test.ts` and `tests/unit/settings-migration.test.ts`; the real UI-to-stream flow is covered in `tests/unit/home.test.tsx`.

## Current verification

- Format, lint, type checking, unit tests, integration tests, and production build pass at this checkpoint.
- The Windows E2E runner now owns the Next.js server job explicitly, so both Chromium cases pass and the process terminates cleanly.
- Final provider parity review remains outstanding.

## AI-016 Custom API

- Custom API configuration is loaded only from server environment variables.
- Request headers, structured body templates, response text paths, origin allowlisting, manual redirect rejection, and safe streaming normalization are implemented.
- Contract and configuration tests cover request mapping, redirects, malformed configuration, and the shared NDJSON stream path.

## AI-018 multimodal input

- In progress: local JPEG, PNG, WebP, and GIF files can be validated, previewed, removed, rendered in history, and sent as multimodal message content.
- Client and server size/type validation prevents unsupported or oversized payloads.
- Webcam and screen-capture frame attachment remain outstanding, so AI-018 is not Done.
