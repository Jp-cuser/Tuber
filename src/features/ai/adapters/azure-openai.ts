import { AppError } from '@/lib/errors/app-error';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  Message,
  ValidationResult,
} from '../types';

type Fetcher = typeof fetch;
function content(message: Message): unknown {
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
export class AzureOpenAiAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & { provider: 'azure' },
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!config.apiKey) errors.push('API key is required');
    if (!config.baseUrl) errors.push('Azure resource URL is required');
    if (!config.deployment) errors.push('Azure deployment is required');
    if (!config.apiVersion) errors.push('Azure API version is required');
    if (config.baseUrl) {
      const url = new URL(config.baseUrl);
      if (
        url.protocol !== 'https:' ||
        (!url.hostname.endsWith('.openai.azure.com') &&
          !url.hostname.endsWith('.cognitiveservices.azure.com'))
      )
        errors.push('Azure resource URL must use an approved HTTPS host');
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
    const base = this.config.baseUrl!.replace(/\/$/, '');
    const endpoint = `${base}/openai/deployments/${encodeURIComponent(this.config.deployment!)}/chat/completions?api-version=${encodeURIComponent(this.config.apiVersion!)}`;
    const response = await this.fetcher(endpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey!,
      },
      body: JSON.stringify({
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          ...request.messages.map((message) => ({
            role: message.role,
            content: content(message),
          })),
        ],
        temperature: request.temperature,
        max_tokens: request.maxOutputTokens,
        stream,
        ...(request.reasoning?.enabled
          ? { reasoning_effort: request.reasoning.effort }
          : {}),
      }),
    });
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Azure OpenAI request failed with status ${response.status}`,
      );
    return response;
  }
  stream(request: AiRequest, signal: AbortSignal): Promise<Response> {
    return this.request(request, signal, true);
  }
  async generate(request: AiRequest, signal: AbortSignal): Promise<AiResult> {
    const data = (await (
      await this.request(request, signal, false)
    ).json()) as {
      choices?: Array<{
        message?: { content?: string; reasoning_content?: string };
      }>;
      usage?: Record<string, unknown>;
    };
    const message = data.choices?.[0]?.message;
    if (!message?.content)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'Azure OpenAI returned no text',
      );
    return {
      text: message.content,
      reasoning: message.reasoning_content,
      providerMetadata: data.usage ? { usage: data.usage } : undefined,
    };
  }
  supportsMultimodal(model: string): boolean {
    return /gpt-4o|gpt-4\.1|gpt-5|vision/i.test(model);
  }
  supportsReasoning(model: string): boolean {
    return /(^|[-_/])(o[1-9]|gpt-5)/i.test(model);
  }
  supportsSearchGrounding(): boolean {
    return false;
  }
}
