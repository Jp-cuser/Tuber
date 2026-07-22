import { AppError } from '@/lib/errors/app-error';
import { renderBodyTemplate } from './body-template';
import { buildCustomHeaders } from './custom-headers';
import { readResponsePath } from './response-path';
import { validateCustomApiUrl } from './custom-url-policy';
import type { AiRequest, AiResult } from '../types';

export interface CustomApiOptions {
  url: string;
  allowedOrigins: ReadonlySet<string>;
  headers?: Record<string, string>;
  bodyTemplate: unknown;
  responseTextPath: string;
}
export class CustomApiAdapter {
  constructor(
    private readonly options: CustomApiOptions,
    private readonly fetcher: typeof fetch = fetch,
  ) {}
  async generate(request: AiRequest, signal: AbortSignal): Promise<AiResult> {
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
}
