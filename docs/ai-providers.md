# AI Provider Configuration

All credentials and provider endpoints are read on the server. Never expose an
AI credential through a `NEXT_PUBLIC_` variable. Select the provider and model
from Studio after configuring the matching variables in `.env.local`.

| Provider      | Required configuration                                                                 | Default endpoint                            |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| OpenAI        | `AI_OPENAI_API_KEY`                                                                    | `https://api.openai.com/v1`                 |
| Anthropic     | `AI_ANTHROPIC_API_KEY`                                                                 | `https://api.anthropic.com`                 |
| Google Gemini | `AI_GOOGLE_API_KEY`                                                                    | `https://generativelanguage.googleapis.com` |
| Azure OpenAI  | `AI_AZURE_API_KEY`, `AI_AZURE_BASE_URL`, `AI_AZURE_DEPLOYMENT`, `AI_AZURE_API_VERSION` | none                                        |
| xAI           | `AI_XAI_API_KEY`                                                                       | `https://api.x.ai/v1`                       |
| Groq          | `AI_GROQ_API_KEY`                                                                      | `https://api.groq.com/openai/v1`            |
| Cohere        | `AI_COHERE_API_KEY`                                                                    | `https://api.cohere.com/v2`                 |
| Mistral AI    | `AI_MISTRALAI_API_KEY`                                                                 | `https://api.mistral.ai/v1`                 |
| Perplexity    | `AI_PERPLEXITY_API_KEY`                                                                | `https://api.perplexity.ai`                 |
| Fireworks     | `AI_FIREWORKS_API_KEY`                                                                 | `https://api.fireworks.ai/inference/v1`     |
| DeepSeek      | `AI_DEEPSEEK_API_KEY`                                                                  | `https://api.deepseek.com`                  |
| OpenRouter    | `AI_OPENROUTER_API_KEY`                                                                | `https://openrouter.ai/api/v1`              |
| LM Studio     | none                                                                                   | `http://127.0.0.1:1234/v1`                  |
| Ollama        | none                                                                                   | `http://127.0.0.1:11434`                    |
| Dify          | `AI_DIFY_API_KEY`, `AI_DIFY_BASE_URL`                                                  | none                                        |

Every hosted endpoint must use HTTPS. LM Studio and Ollama are restricted to
loopback hosts by default. Azure accepts only Azure OpenAI resource hosts. The
global `AI_REQUEST_TIMEOUT_MS` accepts 1,000 through 300,000 milliseconds and
defaults to 60,000.

Provider errors are normalized by the server API and credentials are never
included in responses or logs. Streaming requests carry browser cancellation
through the API gateway to the upstream request.

## Custom API

Custom HTTP services use the `AI_CUSTOM_API_*` variables documented in
`.env.example`. Non-loopback origins must be explicitly allowlisted. Redirects
are rejected and response extraction uses the configured text path.

## Verification

Each adapter has contract coverage for request mapping, response normalization,
configuration validation, and cancellation. Run `npm test` for adapter contracts
and `npm run test:integration` for secured generation and streaming routes.
