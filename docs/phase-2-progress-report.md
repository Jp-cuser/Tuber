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
- The existing Playwright E2E cases started but did not terminate within the 240-second gate timeout; this must be diagnosed before MEM-001 can move from In Progress to Done.
- Final provider parity review remains outstanding.
