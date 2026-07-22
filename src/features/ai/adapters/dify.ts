import { AppError } from '@/lib/errors/app-error';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  ValidationResult,
} from '../types';
type Fetcher = typeof fetch;
export class DifyAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & { provider: 'dify' },
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!config.apiKey) errors.push('API key is required');
    if (!config.baseUrl) errors.push('Dify API URL is required');
    if (config.baseUrl && new URL(config.baseUrl).protocol !== 'https:')
      errors.push('Dify API URL must use HTTPS');
    return { valid: errors.length === 0, errors };
  }
  private requestData(request: AiRequest, stream: boolean) {
    const options = request.providerOptions ?? {};
    const last = [...request.messages]
      .reverse()
      .find((message) => message.role === 'user');
    return {
      inputs: options.inputs ?? {},
      query: typeof last?.content === 'string' ? last.content : '',
      response_mode: stream ? 'streaming' : 'blocking',
      conversation_id: options.conversationId ?? '',
      user: options.userId ?? 'local-ai-tuber',
    };
  }
  private async request(
    request: AiRequest,
    signal: AbortSignal,
    stream: boolean,
  ): Promise<Response> {
    const valid = await this.validateConfig(this.config);
    if (!valid.valid)
      throw new AppError('BAD_REQUEST', 400, valid.errors.join('; '));
    const response = await this.fetcher(
      `${this.config.baseUrl!.replace(/\/$/, '')}/chat-messages`,
      {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(this.requestData(request, stream)),
      },
    );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Dify request failed with status ${response.status}`,
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
      answer?: string;
      conversation_id?: string;
      metadata?: Record<string, unknown>;
    };
    if (!data.answer)
      throw new AppError('INTERNAL_ERROR', 502, 'Dify returned no answer');
    return {
      text: data.answer,
      providerMetadata: {
        conversationId: data.conversation_id,
        ...data.metadata,
      },
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
