import { AppError } from '@/lib/errors/app-error';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  ValidationResult,
} from '../types';

type Fetcher = typeof fetch;
export class CohereAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & { provider: 'cohere' },
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!config.apiKey) errors.push('API key is required');
    const url = new URL(config.baseUrl ?? 'https://api.cohere.com/v2');
    if (url.protocol !== 'https:') errors.push('Cohere URL must use HTTPS');
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
    const base = (this.config.baseUrl ?? 'https://api.cohere.com/v2').replace(
      /\/$/,
      '',
    );
    const response = await this.fetcher(`${base}/chat`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        preamble: request.systemPrompt,
        messages: request.messages.map((message) => ({
          role:
            message.role === 'assistant'
              ? 'assistant'
              : message.role === 'system'
                ? 'system'
                : 'user',
          content:
            typeof message.content === 'string'
              ? message.content
              : message.content
                  .filter((item) => item.type === 'text')
                  .map((item) => (item.type === 'text' ? item.text : ''))
                  .join('\n'),
        })),
        temperature: request.temperature,
        max_tokens: request.maxOutputTokens,
        stream,
      }),
    });
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Cohere request failed with status ${response.status}`,
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
      message?: { content?: Array<{ type: string; text?: string }> };
      citations?: unknown[];
      usage?: Record<string, unknown>;
    };
    const text = data.message?.content
      ?.filter((item) => item.type === 'text')
      .map((item) => item.text ?? '')
      .join('');
    if (!text)
      throw new AppError('INTERNAL_ERROR', 502, 'Cohere returned no text');
    return {
      text,
      providerMetadata: { citations: data.citations, usage: data.usage },
    };
  }
  supportsMultimodal(): boolean {
    return false;
  }
  supportsReasoning(): boolean {
    return false;
  }
  supportsSearchGrounding(): boolean {
    return false;
  }
}
