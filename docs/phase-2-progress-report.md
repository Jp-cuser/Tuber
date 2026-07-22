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

- Local JPEG, PNG, WebP, and GIF files can be validated, previewed, removed, rendered in history, and sent as multimodal message content.
- Active webcam and screen-capture backgrounds expose their current video frame to the same attachment pipeline.
- Frames are scaled to at most 768 pixels, JPEG-compressed, and then processed by the shared size/type validation.
- Client and server validation prevents unsupported or oversized payloads; capture readiness and encoding failures are surfaced safely.

## AI-019 reasoning mode and metadata

- Settings persist reasoning enablement, effort (`none` through `xhigh`), token budget, and metadata visibility with validated migration defaults.
- Requests carry the shared reasoning contract into compatible adapters.
- Provider-specific streamed reasoning deltas are accumulated separately from answer text and exposed in collapsible message metadata.
- Unit coverage verifies request settings, streamed metadata display, provider normalization, and invalid imported values.

## AI-020 search grounding

- Settings persist search-grounding enablement and the dynamic-threshold flag and include them in the shared AI request.
- Gemini maps grounded search to its Google Search tool and returns grounding metadata; compatible search-oriented adapters receive the shared option.
- The gateway checks adapter capability before any upstream request and returns a safe validation error for unsupported provider/model selections.
- UI request, Gemini contract, and gateway rejection paths are covered by tests.

## AI-017 streaming and cancellation

- Provider streams are relayed through the secured API and normalized in the browser for incremental chat rendering.
- The chat exposes cancellation while generation is active and records complete, cancelled, and error states without discarding partial text.
- Abort signals propagate through the browser request, response reader, API route, gateway, and provider adapter; disconnects explicitly cancel upstream readers.
- Unit, adapter-contract, integration-disconnect, and Chromium UI tests pass.
