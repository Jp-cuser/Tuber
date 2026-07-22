import { TextDecoder, TextEncoder } from 'node:util';
import {
  AiApiClient,
  AiApiError,
  parseNdjsonPayload,
  parseSsePayload,
} from '@/features/ai/client';
import type { AiRequest } from '@/features/ai/types';

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder, configurable: true },
  TextEncoder: { value: TextEncoder, configurable: true },
});

const request: AiRequest = {
  provider: 'openai',
  model: 'test-model',
  messages: [],
};

function response(options: {
  ok?: boolean;
  status?: number;
  contentType?: string;
  json?: unknown;
  chunks?: string[];
}): Response {
  const encoder = new TextEncoder();
  const chunks = [...(options.chunks ?? [])];
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: new Headers(
      options.contentType ? { 'content-type': options.contentType } : {},
    ),
    json: jest.fn().mockResolvedValue(options.json),
    body: options.chunks
      ? ({
          getReader: () => ({
            read: jest.fn(async () => {
              const value = chunks.shift();
              return value === undefined
                ? { done: true, value: undefined }
                : { done: false, value: encoder.encode(value) };
            }),
            releaseLock: jest.fn(),
          }),
        } as unknown as ReadableStream<Uint8Array>)
      : null,
  } as unknown as Response;
}

describe('AiApiClient', () => {
  it('posts generation requests and returns the result', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValue(response({ json: { text: 'generated' } }));
    const client = new AiApiClient({ fetcher, accessToken: 'access-token' });

    await expect(client.generate(request)).resolves.toEqual({
      text: 'generated',
    });
    expect(fetcher).toHaveBeenCalledWith(
      '/api/ai/generate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    );
  });

  it('normalizes safe API error envelopes', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      response({
        ok: false,
        status: 429,
        json: {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests',
            traceId: 'trace-1',
          },
        },
      }),
    );
    const client = new AiApiClient({ fetcher });

    await expect(client.generate(request)).rejects.toEqual(
      new AiApiError(429, 'RATE_LIMITED', 'Too many requests', 'trace-1'),
    );
  });

  it('parses SSE events split across network chunks', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      response({
        contentType: 'text/event-stream',
        chunks: ['event: token\ndata: hel', 'lo\n\ndata: done\n\n'],
      }),
    );
    const client = new AiApiClient({ fetcher });
    const events = [];

    for await (const event of client.stream(request)) events.push(event);

    expect(events).toEqual([
      { format: 'sse', event: 'token', data: 'hello' },
      { format: 'sse', event: undefined, data: 'done' },
    ]);
  });

  it('explicitly cancels the response reader when aborted', async () => {
    let finishRead:
      | ((value: { done: true; value: undefined }) => void)
      | undefined;
    const cancel = jest.fn(async () =>
      finishRead?.({ done: true, value: undefined }),
    );
    const reader = {
      read: jest.fn(
        () =>
          new Promise<{ done: true; value: undefined }>((resolve) => {
            finishRead = resolve;
          }),
      ),
      cancel,
      releaseLock: jest.fn(),
    };
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: { getReader: () => reader },
    } as unknown as Response);
    const client = new AiApiClient({ fetcher });
    const controller = new AbortController();
    const iterator = client.stream(request, controller.signal);
    const pending = iterator.next();
    await Promise.resolve();
    await Promise.resolve();

    controller.abort(new DOMException('cancelled', 'AbortError'));

    await expect(pending).resolves.toMatchObject({ done: true });
    expect(cancel).toHaveBeenCalledWith(controller.signal.reason);
  });
});

describe('AI stream payload parsers', () => {
  it('parses multiline SSE data and ignores comments', () => {
    expect(
      parseSsePayload(': ping\nevent: token\ndata: one\ndata: two\n\n'),
    ).toEqual([{ format: 'sse', event: 'token', data: 'one\ntwo' }]);
  });

  it('parses newline-delimited JSON', () => {
    expect(parseNdjsonPayload('{"text":"one"}\n{"done":true}\n')).toEqual([
      { format: 'ndjson', data: { text: 'one' } },
      { format: 'ndjson', data: { done: true } },
    ]);
  });
});
