# AGENTS.md

## Mission

Build `LocalAITuber` as an independent implementation with full functional parity against the baseline repository described in `SPECIFICATION.md`.

The project is not complete until every required row in `FEATURE_MATRIX.md` is `Done`.

## Source Priority

1. `SPECIFICATION.md`
2. `FEATURE_MATRIX.md`
3. `AGENTS.md`
4. Current phase plan
5. README

## Parity Rules

- Do not delete a matrix row to avoid implementing it.
- Add newly discovered user-facing features to the matrix.
- Record evidence for every completed row.
- Complete one phase at a time.
- Do not start the next phase with failing quality gates.
- Final parity must be checked against the recorded baseline commit.

## Intellectual Property

- Do not copy code from `tegnike/aituber-kit`.
- Do not copy its UI assets, logo, character models, audio, backgrounds, or slides.
- Do not reproduce its proprietary visual design exactly.
- Implement behavior using original code and original project structure.
- License-gated integrations must use user-supplied licensed SDKs or assets where redistribution is not allowed.

## Windows

- Windows 10 and Windows 11 are primary targets.
- Use `cd /d "%~dp0"` in batch scripts.
- Use `call npm ...` in batch scripts.
- Support paths with spaces and Japanese characters.
- Do not overwrite `.env.local`.
- Bind to `127.0.0.1` by default.
- Wait for HTTP readiness before opening the browser.
- Preserve useful error output and exit codes.

## Architecture

Use adapters and interfaces for:

- AI providers
- TTS engines
- speech recognition
- avatar formats
- memory storage
- chat log storage
- deployment-specific resource access
- external control transports

UI components must not call third-party services directly.

## Security

- Keep secrets server-side.
- Never log API keys or Authorization headers.
- Validate all external input with Zod or equivalent runtime validation.
- Add request size limits.
- Protect file paths against traversal.
- Restrict local-service URLs by default.
- Revalidate redirects for SSRF-sensitive requests.
- Implement access modes: disabled, protected, demo, unprotected.
- Do not expose server diagnostics secrets.
- Improve unsafe reference behavior rather than copying it.

## Testing

Before completing a phase, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
```

Run E2E tests for user-visible or integration behavior:

```bash
npm run test:e2e
```

Every provider adapter requires contract tests.

## Matrix Completion

A feature row can be `Done` only when:

- implementation exists
- error handling exists
- tests exist
- documentation exists
- quality gates pass
- evidence is recorded

A license-gated integration can be `Done` with automated fixtures and a verified user-supplied-file workflow.

## Phase Completion Report

Include:

- matrix IDs addressed
- files changed
- design decisions
- dependencies added
- commands run
- results
- unresolved risks
- next recommended phase

## Definition of Done

The entire project is done only when:

- all required matrix rows are Done
- Windows local setup and launch succeed
- all character formats work
- all AI and TTS adapters pass contract tests
- all modes and external APIs work
- security review passes
- license review passes
- format, lint, types, tests, build, and E2E pass
- final baseline parity audit is complete
