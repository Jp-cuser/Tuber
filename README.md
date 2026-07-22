# LocalAITuber

LocalAITuber is an independent Windows-first implementation of a local AI character application. The project follows `SPECIFICATION.md` and tracks parity in `FEATURE_MATRIX.md`. It does not include code or proprietary assets from the reference project.

## Current status

Phase 0 provides the Next.js foundation, Tailwind CSS, Zustand, Zod, i18next, typed errors, structured redacted logging, environment validation, access-policy primitives, diagnostics, and Windows setup/launch scripts. Character and conversation features begin in later phases and are not implemented yet.

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

## Baseline and parity

Behavioral parity is measured against baseline commit `198dbe1d5f8a7f86f9b527c7f0fd1eb3fc9d0988` recorded in `SOURCE_BASELINE.md`. `FEATURE_MATRIX.md` is authoritative for completion. License-gated integrations will require user-supplied licensed SDKs or assets.
