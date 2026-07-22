import { AppError } from '@/lib/errors/app-error';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  ValidationResult,
} from '../types';

type Fetcher = typeof fetch;
export class AnthropicAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & { provider: 'anthropic' },
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!config.apiKey) errors.push('API key is required');
    const url = new URL(config.baseUrl ?? 'https://api.anthropic.com');
    if (url.protocol !== 'https:') errors.push('Anthropic URL must use HTTPS');
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
    const base = (this.config.baseUrl ?? 'https://api.anthropic.com').replace(
      /\/$/,
      '',
    );
    const response = await this.fetcher(`${base}/v1/messages`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey ?? '',
        'anthropic-version': this.config.apiVersion ?? '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model,
        system: request.systemPrompt,
        messages: request.messages
          .filter((message) => message.role !== 'system')
          .map((message) => ({
            role: message.role,
            content:
              typeof message.content === 'string'
                ? message.content
                : message.content.map((item) =>
                    item.type === 'text'
                      ? { type: 'text', text: item.text }
                      : {
                          type: 'image',
                          source: {
                            type: 'base64',
                            media_type: item.mimeType ?? 'image/png',
                            data: item.data.replace(/^data:[^;]+;base64,/, ''),
                          },
                        },
                  ),
          })),
        max_tokens: request.maxOutputTokens ?? 1024,
        temperature: request.temperature,
        stream,
        ...(request.reasoning?.enabled
          ? {
              thinking: {
                type: 'enabled',
                budget_tokens: request.reasoning.tokenBudget ?? 1024,
              },
            }
          : {}),
      }),
    });
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Anthropic request failed with status ${response.status}`,
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
      content?: Array<{ type: string; text?: string; thinking?: string }>;
      usage?: Record<string, unknown>;
    };
    const text = data.content
      ?.filter((item) => item.type === 'text')
      .map((item) => item.text ?? '')
      .join('');
    if (!text)
      throw new AppError('INTERNAL_ERROR', 502, 'Anthropic returned no text');
    return {
      text,
      reasoning: data.content?.find((item) => item.type === 'thinking')
        ?.thinking,
      providerMetadata: data.usage ? { usage: data.usage } : undefined,
    };
  }
  supportsMultimodal(model: string): boolean {
    return /claude-3|claude-4/i.test(model);
  }
  supportsReasoning(model: string): boolean {
    return /claude-(3-7|4)/i.test(model);
  }
  supportsSearchGrounding(): boolean {
    return false;
  }
}
