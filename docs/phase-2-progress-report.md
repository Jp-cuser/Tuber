# Phase 2 Completion Report

Phase 2 is complete. All AI provider, gateway, advanced-input, and short-term
memory rows have implementation, error handling, tests, documentation, passing
quality gates, and recorded evidence.

## Matrix IDs addressed

`AI-001` through `AI-020` and `MEM-001`.

## Provider adapters

- OpenAI, xAI, Groq, Mistral AI, Perplexity, Fireworks, DeepSeek, OpenRouter,
  and LM Studio share the OpenAI-compatible request and normalization contract.
- Anthropic, Google Gemini, Azure OpenAI, Cohere, Ollama, and Dify use native
  request adapters for their distinct authentication, message, streaming, and
  response formats.
- Hosted endpoints require HTTPS and credentials remain server-only. LM Studio
  and Ollama default to loopback-only URLs. Azure resource hosts are validated.
- `docs/ai-providers.md` and `.env.example` record every supported provider's
  configuration and default endpoint.

## MEM-001 short-term history

- `ShortTermHistory` and `trimConversationHistory` enforce an immutable newest-message window.
- Studio settings persist a validated limit from 2 through 200 messages, defaulting to 20.
- Imported invalid limits are replaced with the default during settings migration.
- The studio sends only the newest configured messages to the AI API and bounds its visible conversation state.
- Unit coverage is recorded in `tests/unit/ai-foundation.test.ts` and `tests/unit/settings-migration.test.ts`; the real UI-to-stream flow is covered in `tests/unit/home.test.tsx`.

## Current verification

- `npm run format:check`: passed.
- `npm run lint`: passed with zero warnings.
- `npm run typecheck`: passed.
- `npm test`: 26 suites and 159 tests passed.
- `npm run test:integration`: 3 suites and 7 tests passed.
- `npm run build`: passed.
- `npm run test:e2e`: 2 Chromium tests passed.

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

## Files changed for finalization

- `.env.example`
- `README.md`
- `docs/ai-providers.md`
- `docs/phase-2-progress-report.md`
- `tests/unit/ai-server-config.test.ts`
- `FEATURE_MATRIX.md`

## Design decisions

- Provider credentials and endpoints remain server-owned environment settings.
- Provider-specific wire formats stay behind the shared adapter interface.
- OpenAI-compatible services reuse one adapter while retaining explicit registry
  entries, configuration names, and parameterized contract coverage.
- Local model endpoints remain loopback-only by default.

## Dependencies added

None.

## Unresolved risks

- Contract tests use deterministic HTTP fixtures; real hosted-provider smoke
  tests require user-supplied credentials and may vary with upstream API changes.
- Multimodal and reasoning support still depends on the selected model's actual
  capabilities, even when the provider supports the feature family.

## Next recommended phase

Phase 3: implement the VRM avatar runtime, model loading, animation, expression,
gaze, and lip-sync matrix rows without copying baseline assets or visual design.
