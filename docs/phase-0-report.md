# Phase 0 Completion Report

Date: 2026-07-22

## Matrix IDs addressed

- PLAT-001: Windows `SETUP.bat`
- PLAT-002: Windows `LAUNCH.bat`
- SEC-001: access modes (`disabled`, `protected`, `demo`, `unprotected`)
- SEC-002: origin, bearer token, per-process rate limit, and trusted proxy handling

`SEC-003` and `QA-001` remain in progress across all phases. No newly discovered user-facing baseline feature was missing from `FEATURE_MATRIX.md` during this phase.

## Files and design decisions

- Added the Next.js 15.5 / React 18.3 / TypeScript foundation and pinned dependencies.
- Used Pages Router and kept third-party calls outside UI components.
- Added Zod server environment validation, typed safe errors, trace IDs, structured logging with recursive secret redaction, and a shared API security wrapper.
- Bound development and production scripts to `127.0.0.1`.
- Defaulted access to `disabled`; `protected` uses constant-time bearer-token comparison; `demo` validates origins and can require a separate token.
- Kept rate limiting in-process for local use and documented that shared/serverless deployment needs external enforcement.
- Added a secret-free diagnostics endpoint used by Windows readiness checks and E2E tests.
- `SETUP.bat` never overwrites `.env.local`; both batch files use quoted paths, `cd /d`, and `call npm.cmd`.

## Dependencies

See the pinned `package.json` and `package-lock.json`. Direct foundations include Next.js, React, Tailwind CSS, Zustand, Zod, i18next, Jest, Testing Library, and Playwright. npm overrides pin patched `postcss` and `sharp` versions required to make the dependency audit clean while retaining Next.js 15.5.

## Commands and results

- `npm.cmd audit --audit-level=moderate`: 0 vulnerabilities
- `npm.cmd run format:check`: passed
- `npm.cmd run lint`: passed
- `npm.cmd run typecheck`: passed
- `npm.cmd test`: passed
- `npm.cmd run test:integration`: passed
- `npm.cmd run build`: passed
- `npm.cmd run test:e2e -- --reporter=line`: passed with Chromium

## Windows launch evidence

The app was started by the Playwright web-server command on Windows using `npm.cmd run dev`, reached `http://127.0.0.1:3000/api/diagnostics`, and passed the Chromium smoke test. Static unit tests also verify the required batch conventions. A clean-machine manual run of `SETUP.bat` and interactive `LAUNCH.bat` remains a final release audit item.

## Unresolved risks

- The rate limiter is process-local and must be replaced or supplemented for multi-instance deployments.
- SSRF and path-traversal defenses remain ongoing because Phase 0 has no outbound URL or file-resource endpoints.
- Full Windows clean-machine and paths-with-spaces/Japanese-path verification remains required before final release.

## Next recommended phase

Phase 1: UI, settings shell, and internationalization. Phase 1 has not been started.
