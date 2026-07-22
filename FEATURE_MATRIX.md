# Feature Matrix

- Baseline repository: `tegnike/aituber-kit`
- Baseline branch: `main`
- Baseline commit: `198dbe1d5f8a7f86f9b527c7f0fd1eb3fc9d0988`
- Allowed status: `Not Started`, `In Progress`, `Blocked`, `Done`
- Final completion rule: all `Required` rows must be `Done`
- Discovery rule: any additional user-facing feature found during implementation must be added as a new row

| ID           | Category        | Feature                                            | Requirement | Phase    | Status      | Evidence                                                                                 |
| ------------ | --------------- | -------------------------------------------------- | ----------- | -------- | ----------- | ---------------------------------------------------------------------------------------- |
| PLAT-001     | Platform        | Windows SETUP.bat                                  | Required    | Phase 0  | Done        | `SETUP.bat`; `tests/unit/windows-scripts.test.ts`; `README.md`; `docs/phase-0-report.md` |
| PLAT-002     | Platform        | Windows LAUNCH.bat                                 | Required    | Phase 0  | Done        | `LAUNCH.bat`; `scripts/open-browser.ps1`; Chromium E2E; `docs/phase-0-report.md`         |
| PLAT-003     | Platform        | macOS LAUNCH.command                               | Required    | Phase 14 | Not Started |                                                                                          |
| PLAT-004     | Platform        | Docker / docker-compose                            | Required    | Phase 14 | Not Started |                                                                                          |
| PLAT-005     | Platform        | Electron desktop mode                              | Required    | Phase 14 | Not Started |                                                                                          |
| PLAT-006     | Platform        | Vercel deployment                                  | Required    | Phase 14 | Not Started |                                                                                          |
| PLAT-007     | Platform        | Cloudflare Workers/OpenNext                        | Required    | Phase 14 | Not Started |                                                                                          |
| PLAT-008     | Platform        | Restricted mode and asset manifest                 | Required    | Phase 13 | Not Started |                                                                                          |
| UI-001       | UI              | Introduction screen                                | Required    | Phase 1  | Done        | `Studio.tsx`; unit and Chromium E2E; Phase 1 report                                      |
| UI-002       | UI              | Quick menu and control panel                       | Required    | Phase 1  | Done        | Header actions and `DraggablePanel.tsx`; README                                          |
| UI-003       | UI              | Assistant text bubble/borderless                   | Required    | Phase 1  | Done        | Settings-backed assistant style in `Studio.tsx`; unit test                               |
| UI-004       | UI              | Chat log position/width/style/offset               | Required    | Phase 1  | Done        | Persisted chat settings and E2E message flow                                             |
| UI-005       | UI              | Themes: default/cool/mono/ocean/forest/sunset      | Required    | Phase 1  | Done        | Six settings themes; Chromium theme E2E                                                  |
| UI-006       | UI              | Draggable and resizable UI                         | Required    | Phase 1  | Done        | Pointer drag and CSS resize in `DraggablePanel.tsx`                                      |
| UI-007       | UI              | Fullscreen and presentation display                | Required    | Phase 1  | Done        | Fullscreen API and presentation input suppression                                        |
| UI-008       | UI              | Background image/video/webcam/capture/green screen | Required    | Phase 1  | Done        | `MediaBackground.tsx`; local media workflow; README                                      |
| UI-009       | UI              | Image overlay/modal/placed image                   | Required    | Phase 1  | Done        | Local overlay selection and placed/modal toggle                                          |
| UI-010       | UI              | Preset questions and character presets             | Required    | Phase 1  | Done        | Five typed presets and question shortcuts                                                |
| I18N-001     | I18N            | 16-language UI                                     | Required    | Phase 1  | Done        | 16 complete native resources; detection; switching; RTL; unit and Chromium E2E tests     |
| AVATAR-001   | Avatar          | VRM renderer                                       | Required    | Phase 3  | Done        | VRM 0/1 render lifecycle; blink/lip/look-at; generated-fixture Chromium E2E              |
| AVATAR-002   | Avatar          | VRM upload/list/select                             | Required    | Phase 3  | Done        | Validated upload; IndexedDB library; list/select/delete/restore UI; tests and docs       |
| AVATAR-003   | Avatar          | VRM pose/motion/emotion                            | Required    | Phase 3  | Done        | Typed controls; humanoid pose/idle/wave/blink animation; expression mapping; tests/docs  |
| AVATAR-004   | Avatar          | VRM lighting/transform/fixed position              | Required    | Phase 3  | Done        | Validated persistent transforms; ambient/key lighting; position lock; UI/unit tests/docs |
| AVATAR-005   | Avatar          | Thinking pose                                      | Required    | Phase 3  | Done        | Generation-state override; humanoid thinking pose; automatic restore; tests/docs         |
| AVATAR-006   | Avatar          | Live2D Cubism 3+                                   | Required    | Phase 4  | Done        | Same-origin SDK bridge; lifecycle/security contracts; original fixture Chromium E2E      |
| AVATAR-007   | Avatar          | Live2D emotions and motion groups                  | Required    | Phase 4  | Done        | Expression and motion-group/index bridge controls; contract, UI, and Chromium tests      |
| AVATAR-008   | Avatar          | MotionPNGTuber-compatible mode                     | Required    | Phase 4  | Done        | Idle/talking videos; IndexedDB restore/clear; sensitivity switch; unit and Chromium E2E  |
| AVATAR-009   | Avatar          | PNGTuber chroma key/sensitivity/transform          | Required    | Phase 4  | Done        | Canvas chroma key; color/tolerance/sensitivity/scale/offsets; persistence; tests/E2E     |
| AI-001       | AI              | OpenAI                                             | Required    | Phase 2  | Done        | Server config; compatible adapter; contract and route tests; provider guide              |
| AI-002       | AI              | Anthropic                                          | Required    | Phase 2  | Done        | Native messages adapter; validation/stream contracts; provider guide                     |
| AI-003       | AI              | Google Gemini                                      | Required    | Phase 2  | Done        | Native content adapter; grounding/multimodal contracts; provider guide                   |
| AI-004       | AI              | Azure OpenAI                                       | Required    | Phase 2  | Done        | Deployment/version mapping; host validation; contract tests; provider guide              |
| AI-005       | AI              | xAI                                                | Required    | Phase 2  | Done        | Compatible adapter; environment/config and contract tests; provider guide                |
| AI-006       | AI              | Groq                                               | Required    | Phase 2  | Done        | Compatible adapter; environment/config and contract tests; provider guide                |
| AI-007       | AI              | Cohere                                             | Required    | Phase 2  | Done        | Native v2 adapter; citations/usage normalization; contract tests; provider guide         |
| AI-008       | AI              | Mistral AI                                         | Required    | Phase 2  | Done        | Compatible adapter; environment/config and contract tests; provider guide                |
| AI-009       | AI              | Perplexity                                         | Required    | Phase 2  | Done        | Compatible/search adapter; environment/config and contract tests; provider guide         |
| AI-010       | AI              | Fireworks                                          | Required    | Phase 2  | Done        | Compatible adapter; environment/config and contract tests; provider guide                |
| AI-011       | AI              | DeepSeek                                           | Required    | Phase 2  | Done        | Compatible reasoning adapter; config and contract tests; provider guide                  |
| AI-012       | AI              | OpenRouter                                         | Required    | Phase 2  | Done        | Compatible/search adapter; environment/config and contract tests; provider guide         |
| AI-013       | AI              | LM Studio                                          | Required    | Phase 2  | Done        | Loopback-only compatible adapter; keyless/config/contract tests; provider guide          |
| AI-014       | AI              | Ollama                                             | Required    | Phase 2  | Done        | Native chat adapter; loopback validation; contract tests; provider guide                 |
| AI-015       | AI              | Dify                                               | Required    | Phase 2  | Done        | Workflow adapter; conversation metadata; validation/contracts; provider guide            |
| AI-016       | AI              | Custom API                                         | Required    | Phase 2  | Done        | Server-only mapped adapter; SSRF/redirect/header guards; contract tests; Phase 2 report  |
| AI-017       | AI              | Streaming and cancellation                         | Required    | Phase 2  | Done        | Secured relay; browser/provider abort chain; partial UI states; unit/integration/E2E     |
| AI-018       | AI              | Multimodal image/webcam/screen capture             | Required    | Phase 2  | Done        | File and live-frame attachments; size/type guards; adapter contracts; Phase 2 report     |
| AI-019       | AI              | Reasoning mode and metadata                        | Required    | Phase 2  | Done        | Effort/budget settings; adapter mapping; streamed metadata UI and tests; Phase 2 report  |
| AI-020       | AI              | Search grounding                                   | Required    | Phase 2  | Done        | Persisted controls; capability gate; Gemini/search adapter mapping and contract tests    |
| REALTIME-001 | Realtime        | OpenAI/Azure Realtime                              | Required    | Phase 7  | Not Started |                                                                                          |
| REALTIME-002 | Realtime        | Text and audio input                               | Required    | Phase 7  | Not Started |                                                                                          |
| REALTIME-003 | Realtime        | Function calling tools                             | Required    | Phase 7  | Not Started |                                                                                          |
| AUDIO-001    | Audio Mode      | OpenAI Audio mode                                  | Required    | Phase 7  | Not Started |                                                                                          |
| STT-001      | Speech Input    | Browser SpeechRecognition                          | Required    | Phase 5  | Done        | Adapter; interim/final transcript UI; permission/errors/timeouts; contract and UI tests  |
| STT-002      | Speech Input    | Whisper transcription models                       | Required    | Phase 5  | Done        | Server-only adapter/API; 3 models; validation; contract, integration, and UI tests       |
| STT-003      | Speech Input    | Silence detection and progress                     | Required    | Phase 5  | Done        | Web Audio RMS monitor; speech-gated timeout/reset; level/progress UI; unit and UI tests  |
| STT-004      | Speech Input    | Continuous microphone                              | Required    | Phase 5  | In Progress | Continuous restart/explicit stop adapter and UI toggle; silence/exclusivity pending      |
| TTS-001      | TTS             | VOICEVOX                                           | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-002      | TTS             | Koeiromap                                          | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-003      | TTS             | Google Text-to-Speech                              | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-004      | TTS             | Style-Bert-VITS2                                   | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-005      | TTS             | AivisSpeech                                        | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-006      | TTS             | Aivis Cloud API                                    | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-007      | TTS             | GSVI TTS                                           | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-008      | TTS             | ElevenLabs                                         | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-009      | TTS             | OpenAI TTS                                         | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-010      | TTS             | Azure TTS                                          | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-011      | TTS             | Cartesia                                           | Required    | Phase 6  | Not Started |                                                                                          |
| TTS-012      | TTS             | Audio queue/interrupt/lip sync                     | Required    | Phase 6  | Not Started |                                                                                          |
| MEM-001      | Memory          | Short-term history                                 | Required    | Phase 2  | Done        | `history.ts`; bounded studio/API history; migration, unit/E2E tests; Phase 2 report      |
| MEM-002      | Memory          | Embedding and RAG                                  | Required    | Phase 8  | Not Started |                                                                                          |
| MEM-003      | Memory          | Memory files CRUD                                  | Required    | Phase 8  | Not Started |                                                                                          |
| MEM-004      | Memory          | Restore and store sync                             | Required    | Phase 8  | Not Started |                                                                                          |
| LOG-001      | Logging         | Local JSON chat log                                | Required    | Phase 8  | Not Started |                                                                                          |
| LOG-002      | Logging         | Optional Supabase chat log                         | Required    | Phase 8  | Not Started |                                                                                          |
| YT-001       | YouTube         | YouTube API comments                               | Required    | Phase 9  | Not Started |                                                                                          |
| YT-002       | YouTube         | OneComme comments                                  | Required    | Phase 9  | Not Started |                                                                                          |
| YT-003       | YouTube         | Conversation continuity                            | Required    | Phase 9  | Not Started |                                                                                          |
| YT-004       | YouTube         | New topic and sleep state                          | Required    | Phase 9  | Not Started |                                                                                          |
| KIOSK-001    | Kiosk           | Kiosk mode/passcode/input limit                    | Required    | Phase 10 | Not Started |                                                                                          |
| KIOSK-002    | Kiosk           | NG word and guidance                               | Required    | Phase 10 | Not Started |                                                                                          |
| PRES-001     | Presence        | Camera face presence detection                     | Required    | Phase 10 | Not Started |                                                                                          |
| PRES-002     | Presence        | Greeting/departure/history clear                   | Required    | Phase 10 | Not Started |                                                                                          |
| IDLE-001     | Idle            | Fixed phrases sequential/random                    | Required    | Phase 10 | Not Started |                                                                                          |
| IDLE-002     | Idle            | Time-period greetings                              | Required    | Phase 10 | Not Started |                                                                                          |
| IDLE-003     | Idle            | AI-generated speech                                | Required    | Phase 10 | Not Started |                                                                                          |
| GAME-001     | Game Commentary | Periodic screen capture                            | Required    | Phase 11 | Not Started |                                                                                          |
| GAME-002     | Game Commentary | Commentary and background analysis                 | Required    | Phase 11 | Not Started |                                                                                          |
| SLIDE-001    | Slides          | Slide rendering/presentation                       | Required    | Phase 11 | Not Started |                                                                                          |
| SLIDE-002    | Slides          | Markdown conversion and editor                     | Required    | Phase 11 | Not Started |                                                                                          |
| WS-001       | External        | WebSocket external linkage                         | Required    | Phase 12 | Not Started |                                                                                          |
| EXT-001      | External        | Message receiver and send-message page             | Required    | Phase 12 | Not Started |                                                                                          |
| API-001      | External API    | /api/v1/speak                                      | Required    | Phase 12 | Not Started |                                                                                          |
| API-002      | External API    | /api/v1/chat                                       | Required    | Phase 12 | Not Started |                                                                                          |
| API-003      | External API    | /api/v1/messages                                   | Required    | Phase 12 | Not Started |                                                                                          |
| API-004      | External API    | /api/v1/stop                                       | Required    | Phase 12 | Not Started |                                                                                          |
| API-005      | External API    | /api/v1/status                                     | Required    | Phase 12 | Not Started |                                                                                          |
| API-006      | External API    | /api/v1/events                                     | Required    | Phase 12 | Not Started |                                                                                          |
| API-007      | External API    | client commands/status                             | Required    | Phase 12 | Not Started |                                                                                          |
| EMBED-001    | Embed           | embed.js loader                                    | Required    | Phase 13 | Not Started |                                                                                          |
| EMBED-002    | Embed           | /embed and /embed/[embedId]                        | Required    | Phase 13 | Not Started |                                                                                          |
| EMBED-003    | Embed           | allowed origins and postMessage                    | Required    | Phase 13 | Not Started |                                                                                          |
| ASSET-001    | Assets          | Background/image CRUD                              | Required    | Phase 13 | Not Started |                                                                                          |
| ASSET-002    | Assets          | VRM/Live2D/PNGTuber lists and upload               | Required    | Phase 13 | Not Started |                                                                                          |
| ASSET-003    | Assets          | Pose and slide resource APIs                       | Required    | Phase 13 | Not Started |                                                                                          |
| SEC-001      | Security        | Access modes disabled/protected/demo/unprotected   | Required    | Phase 0  | Done        | `src/lib/access-policy/access-policy.ts`; unit tests; `README.md`                        |
| SEC-002      | Security        | Origin/token/rate limit/trusted proxy              | Required    | Phase 0  | Done        | API security wrapper; origin/rate-limit tests; diagnostics integration test              |
| SEC-003      | Security        | SSRF and path traversal defenses                   | Required    | All      | In Progress | Phase 0 has no outbound/file endpoints; continue per endpoint in later phases            |
| QA-001       | QA              | Unit/integration/E2E suite                         | Required    | All      | In Progress | Phase 0: unit, integration, build, and Chromium E2E pass; expand per phase               |
| QA-002       | QA              | Final source parity audit                          | Required    | Phase 15 | Not Started |                                                                                          |

## Status update rules

1. `Done` requires implementation, tests, documentation, and quality gates.
2. A mock-only adapter is not complete unless real-connection setup is documented and the adapter contract is verified.
3. A license-gated feature may be marked `Done` when the integration works with user-supplied licensed files and automated fixtures.
4. A feature may not be removed because it is difficult.
5. During Phase 15, compare README, environment variables, source directories, API routes, settings UI, and tests against the baseline again.
