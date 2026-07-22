import { AppError } from '@/lib/errors/app-error';
import { renderBodyTemplate } from './body-template';
import { buildCustomHeaders } from './custom-headers';
import { readResponsePath } from './response-path';
import { validateCustomApiUrl } from './custom-url-policy';
import type {
  AiProviderAdapter,
  AiRequest,
  AiResult,
  ValidationResult,
} from '../types';

export interface CustomApiOptions {
  url: string;
  allowedOrigins: ReadonlySet<string>;
  headers?: Record<string, string>;
  bodyTemplate: unknown;
  responseTextPath: string;
}
export class CustomApiAdapter implements AiProviderAdapter {
  constructor(
    private readonly options: CustomApiOptions,
    private readonly fetcher: typeof fetch = fetch,
  ) {}
  async validateConfig(): Promise<ValidationResult> {
    const errors: string[] = [];
    try {
      validateCustomApiUrl(this.options.url, this.options.allowedOrigins);
      buildCustomHeaders(this.options.headers ?? {});
      if (!this.options.responseTextPath.trim())
        errors.push('Response text path is required');
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : 'Invalid configuration',
      );
    }
    return { valid: errors.length === 0, errors };
  }
  async generate(request: AiRequest, signal: AbortSignal): Promise<AiResult> {
    const validation = await this.validateConfig();
    if (!validation.valid)
      throw new AppError('BAD_REQUEST', 400, validation.errors.join('; '));
    const url = validateCustomApiUrl(
      this.options.url,
      this.options.allowedOrigins,
    );
    const body = renderBodyTemplate(this.options.bodyTemplate, {
      model: request.model,
      messages: request.messages,
      systemPrompt: request.systemPrompt ?? '',
      temperature: request.temperature,
      maxOutputTokens: request.maxOutputTokens,
      reasoning: request.reasoning,
      searchGrounding: request.searchGrounding,
    });
    const response = await this.fetcher(url, {
      method: 'POST',
      signal,
      redirect: 'manual',
      headers: buildCustomHeaders(this.options.headers ?? {}),
      body: JSON.stringify(body),
    });
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'Custom API redirects are not followed automatically',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Custom API failed with status ${response.status}`,
      );
    return {
      text: readResponsePath(
        await response.json(),
        this.options.responseTextPath,
      ),
    };
  }
  async stream(request: AiRequest, signal: AbortSignal): Promise<Response> {
    const result = await this.generate(request, signal);
    return new Response(`${JSON.stringify({ text: result.text })}\n`, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    });
  }
  supportsMultimodal(): boolean {
    return true;
  }
  supportsReasoning(): boolean {
    return false;
  }
  supportsSearchGrounding(): boolean {
    return false;
  }
}
