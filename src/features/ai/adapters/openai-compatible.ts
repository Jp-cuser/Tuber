import { AppError } from '@/lib/errors/app-error';
import { getProviderDescriptor } from '../registry';
import { providerConfigSchema } from '../schemas';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  Message,
  ValidationResult,
} from '../types';

const supportedProviders = [
  'openai',
  'xai',
  'groq',
  'mistralai',
  'perplexity',
  'fireworks',
  'deepseek',
  'openrouter',
  'lmstudio',
] as const;
type CompatibleProvider = (typeof supportedProviders)[number];
type Fetcher = typeof fetch;

function messageContent(message: Message): unknown {
  if (typeof message.content === 'string') return message.content;
  return message.content.map((item) =>
    item.type === 'text'
      ? { type: 'text', text: item.text }
      : {
          type: 'image_url',
          image_url: {
            url: item.data.startsWith('data:')
              ? item.data
              : `data:${item.mimeType ?? 'image/png'};base64,${item.data}`,
          },
        },
  );
}

function safeBaseUrl(config: AiProviderConfig): string {
  const descriptor = getProviderDescriptor(config.provider);
  const raw = config.baseUrl ?? descriptor.defaultBaseUrl;
  if (!raw)
    throw new AppError('BAD_REQUEST', 400, 'Provider base URL is required');
  const url = new URL(raw);
  if (descriptor.kind === 'local') {
    if (
      !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      !['http:', 'https:'].includes(url.protocol)
    )
      throw new AppError(
        'BAD_REQUEST',
        400,
        'Local provider URL must use a loopback host',
      );
  } else if (url.protocol !== 'https:')
    throw new AppError(
      'BAD_REQUEST',
      400,
      'Hosted provider URL must use HTTPS',
    );
  return url.toString().replace(/\/$/, '');
}

export class OpenAiCompatibleAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & {
      provider: CompatibleProvider;
    },
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const parsed = providerConfigSchema.safeParse(config);
    const errors = parsed.success
      ? []
      : parsed.error.issues.map((issue) => issue.message);
    if (!supportedProviders.includes(config.provider as CompatibleProvider))
      errors.push('Provider is not OpenAI-compatible');
    const descriptor = getProviderDescriptor(config.provider);
    if (descriptor.requiresApiKey && !config.apiKey)
      errors.push('API key is required');
    try {
      safeBaseUrl(config);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Invalid base URL');
    }
    return { valid: errors.length === 0, errors };
  }

  private async request(
    request: AiRequest,
    signal: AbortSignal,
    stream: boolean,
  ): Promise<Response> {
    const validation = await this.validateConfig(this.config);
    if (!validation.valid)
      throw new AppError('BAD_REQUEST', 400, validation.errors.join('; '));
    const response = await this.fetcher(
      `${safeBaseUrl(this.config)}/chat/completions`,
      {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {}),
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            ...(request.systemPrompt
              ? [{ role: 'system', content: request.systemPrompt }]
              : []),
            ...request.messages.map((message) => ({
              role: message.role,
              content: messageContent(message),
            })),
          ],
          temperature: request.temperature,
          max_tokens: request.maxOutputTokens,
          stream,
          ...(request.reasoning?.enabled
            ? { reasoning_effort: request.reasoning.effort }
            : {}),
          ...(request.searchGrounding?.enabled
            ? { search_grounding: request.searchGrounding }
            : {}),
          ...request.providerOptions,
        }),
      },
    );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `AI provider request failed with status ${response.status}`,
      );
    return response;
  }

  stream(request: AiRequest, signal: AbortSignal): Promise<Response> {
    return this.request(request, signal, true);
  }
  async generate(request: AiRequest, signal: AbortSignal): Promise<AiResult> {
    const response = await this.request(request, signal, false);
    const data = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string; reasoning_content?: string };
      }>;
      usage?: Record<string, unknown>;
    };
    const message = data.choices?.[0]?.message;
    if (!message?.content)
      throw new AppError('INTERNAL_ERROR', 502, 'AI provider returned no text');
    return {
      text: message.content,
      reasoning: message.reasoning_content,
      providerMetadata: data.usage ? { usage: data.usage } : undefined,
    };
  }
  supportsMultimodal(model: string): boolean {
    return /vision|gpt-4o|gpt-4\.1|gpt-5|pixtral|vl/i.test(model);
  }
  supportsReasoning(model: string): boolean {
    return /(^|[-_/])(o[1-9]|gpt-5|reason|r1)/i.test(model);
  }
  supportsSearchGrounding(): boolean {
    return (
      this.config.provider === 'perplexity' ||
      this.config.provider === 'openrouter'
    );
  }
}

export function isOpenAiCompatibleProvider(
  provider: string,
): provider is CompatibleProvider {
  return supportedProviders.includes(provider as CompatibleProvider);
}
