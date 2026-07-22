import { AppError } from '@/lib/errors/app-error';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  ValidationResult,
} from '../types';

type Fetcher = typeof fetch;
export class OllamaAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & { provider: 'ollama' },
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const url = new URL(config.baseUrl ?? 'http://127.0.0.1:11434');
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    )
      errors.push('Ollama URL must use a loopback host');
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
    const base = (this.config.baseUrl ?? 'http://127.0.0.1:11434').replace(
      /\/$/,
      '',
    );
    const response = await this.fetcher(`${base}/api/chat`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          ...request.messages.map((message) => ({
            role: message.role,
            content:
              typeof message.content === 'string'
                ? message.content
                : message.content
                    .filter((item) => item.type === 'text')
                    .map((item) => (item.type === 'text' ? item.text : ''))
                    .join('\n'),
            images:
              typeof message.content === 'string'
                ? undefined
                : message.content
                    .filter((item) => item.type === 'image')
                    .map((item) =>
                      item.type === 'image'
                        ? item.data.replace(/^data:[^;]+;base64,/, '')
                        : '',
                    ),
          })),
        ],
        stream,
        options: {
          temperature: request.temperature,
          num_predict: request.maxOutputTokens,
        },
      }),
    });
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Ollama request failed with status ${response.status}`,
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
      message?: { content?: string; thinking?: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };
    if (!data.message?.content)
      throw new AppError('INTERNAL_ERROR', 502, 'Ollama returned no text');
    return {
      text: data.message.content,
      reasoning: data.message.thinking,
      providerMetadata: {
        promptTokens: data.prompt_eval_count,
        completionTokens: data.eval_count,
      },
    };
  }
  supportsMultimodal(model: string): boolean {
    return /llava|vision|vl|gemma3/i.test(model);
  }
  supportsReasoning(model: string): boolean {
    return /deepseek-r1|qwq|thinking/i.test(model);
  }
  supportsSearchGrounding(): boolean {
    return false;
  }
}
