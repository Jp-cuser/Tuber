# LocalAITuber

LocalAITuber is an independent Windows-first implementation of a local AI character application. The project follows `SPECIFICATION.md` and tracks parity in `FEATURE_MATRIX.md`. It does not include code or proprietary assets from the reference project.

## Current status

Phase 2 is in progress. The studio now connects chat to server-side AI adapters, supports streamed responses and cancellation, and keeps a configurable bounded short-term history. Character renderers begin in later phases.

### Studio controls

- Open settings with the gear button to change language, theme, names, visibility, assistant/chat style, position, width, preset, and Japanese reading preference.
- Select image/video files as local backgrounds, or request webcam/screen-capture backgrounds. Browser permission denial leaves the rest of the studio usable.
- Select a local image overlay, click it to toggle placed/modal display, and use presentation mode to hide the input bar.
- Attach JPEG, PNG, WebP, or GIF images to chat prompts. Attachments are capped at 650 KiB so the base64 request remains below the default API body limit.
- When webcam or screen-capture background mode is active, use `+Frame` to attach its current frame to the next prompt. Captures are scaled to at most 768 pixels and JPEG-compressed before validation.
- Reasoning can be enabled per studio profile with effort and token-budget controls. Reasoning deltas are stored separately from the visible answer and can be inspected from each message when metadata display is enabled.
- Search grounding can be enabled with the optional dynamic-threshold flag. Unsupported provider/model combinations are rejected before an upstream request is made.
- Streaming responses can be cancelled from the chat UI. Cancellation aborts the browser request, explicitly cancels its response reader, propagates to the server/provider signal, and preserves the partial message with a cancelled state.
- Settings persist in browser local storage. Export/import uses versioned JSON; reset restores defaults. `NEXT_PUBLIC_DEFAULT_LANGUAGE` and `NEXT_PUBLIC_DEFAULT_THEME` set initial defaults. Set `NEXT_PUBLIC_SETTINGS_ENV_OVERRIDE=true` to keep those two environment values authoritative.

## Windows quick start

Requirements: Windows 10 22H2 or Windows 11, Node.js 24.x, npm 11.x, and Edge or Chrome.

1. Run `SETUP.bat`. It preserves an existing `.env.local` and otherwise copies `.env.example`.
2. Review `.env.local`.
3. Run `LAUNCH.bat`.
4. Wait for the browser to open at `http://127.0.0.1:3000`.

Paths containing spaces or Japanese characters are supported. The server binds to `127.0.0.1` by default. `LAUNCH.bat` waits for the diagnostics endpoint before opening the browser and preserves the application exit code.

## Development

```text
npm ci
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm run test:e2e
```

Install the optional E2E browser with `npx playwright install chromium`.

## Access modes

- `disabled` (default): anonymous server secrets are unavailable; protected writes are denied; local read-only endpoints remain available.
- `protected`: requires `Authorization: Bearer <ACCESS_TOKEN>`.
- `demo`: requires same-origin or an entry in `ALLOWED_ORIGINS`; `DEMO_TOKEN` is optional; rate limiting is applied.
- `unprotected`: no authentication check. Use only on a trusted local machine.

All API routes using the shared security wrapper receive method checks, a body-size check, origin/access evaluation, rate limiting, trace IDs, and safe error responses. The in-memory limiter is per-process and is not sufficient as a shared serverless rate limiter. Set `TRUST_PROXY=true` only behind a trusted proxy that overwrites `X-Forwarded-For`.

The diagnostics response never includes tokens or other environment secrets. Do not place secrets in `NEXT_PUBLIC_*` variables, commit `.env.local`, or expose the development server to a public network.

## Configuration

See `.env.example`. `ACCESS_TOKEN` and `DEMO_TOKEN`, when used, must contain at least 16 characters. `ALLOWED_ORIGINS` is a comma-separated list of absolute origins.

AI secrets remain server-side. Configure a provider with variables such as `AI_OPENAI_API_KEY`, `AI_ANTHROPIC_API_KEY`, or `AI_GOOGLE_API_KEY`; provider-specific base URLs use `AI_<PROVIDER>_BASE_URL`. Azure additionally uses `AI_AZURE_DEPLOYMENT` and `AI_AZURE_API_VERSION`. `AI_REQUEST_TIMEOUT_MS` defaults to 60000. Select the provider, model, and short-term history limit in studio settings. Imported history limits outside 2-200 are reset to the safe default of 20 messages. See [`docs/ai-providers.md`](docs/ai-providers.md) for the complete provider matrix and safety rules.

Custom API uses `AI_CUSTOM_API_URL`, `AI_CUSTOM_API_ALLOWED_ORIGINS`, `AI_CUSTOM_API_HEADERS`, `AI_CUSTOM_API_BODY_TEMPLATE`, and `AI_CUSTOM_API_RESPONSE_TEXT_PATH`. Headers and body templates are JSON strings. Non-loopback targets must appear in the comma-separated origin allowlist. Redirects are rejected and sensitive headers remain server-side.

## Baseline and parity

Behavioral parity is measured against baseline commit `198dbe1d5f8a7f86f9b527c7f0fd1eb3fc9d0988` recorded in `SOURCE_BASELINE.md`. `FEATURE_MATRIX.md` is authoritative for completion. License-gated integrations will require user-supplied licensed SDKs or assets.
