import type { AiRequest, AiResult } from './types';

export type AiStreamChunk =
  | { format: 'sse'; data: string; event?: string }
  | { format: 'ndjson'; data: unknown }
  | { format: 'text'; data: string };

export class AiApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = 'AiApiError';
  }
}

type Fetcher = typeof fetch;

export interface AiApiClientOptions {
  basePath?: string;
  accessToken?: string;
  fetcher?: Fetcher;
}

function parseSseBlock(block: string): AiStreamChunk | undefined {
  let event: string | undefined;
  const data: string[] = [];
  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    const separator = line.indexOf(':');
    const field = separator < 0 ? line : line.slice(0, separator);
    const value =
      separator < 0 ? '' : line.slice(separator + 1).replace(/^ /, '');
    if (field === 'event') event = value;
    if (field === 'data') data.push(value);
  }
  return data.length
    ? { format: 'sse', event, data: data.join('\n') }
    : undefined;
}

export function parseSsePayload(payload: string): AiStreamChunk[] {
  return payload
    .replace(/\r\n/g, '\n')
    .split('\n\n')
    .map(parseSseBlock)
    .filter((chunk): chunk is AiStreamChunk => Boolean(chunk));
}

export function parseNdjsonPayload(payload: string): AiStreamChunk[] {
  return payload
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => ({ format: 'ndjson', data: JSON.parse(line) }));
}

async function apiError(response: Response): Promise<AiApiError> {
  try {
    const payload = (await response.json()) as {
      error?: { code?: string; message?: string; traceId?: string };
    };
    return new AiApiError(
      response.status,
      payload.error?.code ?? 'HTTP_ERROR',
      payload.error?.message ?? 'AI request failed',
      payload.error?.traceId,
    );
  } catch {
    return new AiApiError(response.status, 'HTTP_ERROR', 'AI request failed');
  }
}

export class AiApiClient {
  private readonly basePath: string;
  private readonly accessToken?: string;
  private readonly fetcher: Fetcher;

  constructor(options: AiApiClientOptions = {}) {
    this.basePath = (options.basePath ?? '/api/ai').replace(/\/$/, '');
    this.accessToken = options.accessToken;
    this.fetcher = options.fetcher ?? fetch;
  }

  async generate(request: AiRequest, signal?: AbortSignal): Promise<AiResult> {
    const response = await this.request('generate', request, signal);
    return (await response.json()) as AiResult;
  }

  async *stream(
    request: AiRequest,
    signal?: AbortSignal,
  ): AsyncGenerator<AiStreamChunk> {
    const response = await this.request('stream', request, signal);
    if (!response.body) {
      throw new AiApiError(
        response.status,
        'EMPTY_STREAM',
        'AI stream is empty',
      );
    }

    const contentType = response.headers.get('content-type')?.split(';')[0];
    const reader = response.body.getReader();
    const cancelReader = () => void reader.cancel(signal?.reason);
    if (signal?.aborted) cancelReader();
    else signal?.addEventListener('abort', cancelReader, { once: true });
    const decoder = new TextDecoder();
    let buffer = '';
    const separator = contentType === 'text/event-stream' ? '\n\n' : '\n';

    try {
      while (true) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        if (chunk.done) break;

        const parts = buffer.replace(/\r\n/g, '\n').split(separator);
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          if (contentType === 'text/event-stream') {
            const parsed = parseSseBlock(part);
            if (parsed) yield parsed;
          } else if (contentType === 'application/x-ndjson') {
            if (part.trim()) yield { format: 'ndjson', data: JSON.parse(part) };
          } else if (part) {
            yield { format: 'text', data: `${part}${separator}` };
          }
        }
      }

      if (buffer) {
        if (contentType === 'text/event-stream') {
          const parsed = parseSseBlock(buffer);
          if (parsed) yield parsed;
        } else if (contentType === 'application/x-ndjson') {
          yield { format: 'ndjson', data: JSON.parse(buffer) };
        } else {
          yield { format: 'text', data: buffer };
        }
      }
    } finally {
      signal?.removeEventListener('abort', cancelReader);
      reader.releaseLock();
    }
  }

  private async request(
    operation: 'generate' | 'stream',
    request: AiRequest,
    signal?: AbortSignal,
  ): Promise<Response> {
    const response = await this.fetcher(`${this.basePath}/${operation}`, {
      method: 'POST',
      credentials: 'same-origin',
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken
          ? { Authorization: `Bearer ${this.accessToken}` }
          : {}),
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw await apiError(response);
    return response;
  }
}
