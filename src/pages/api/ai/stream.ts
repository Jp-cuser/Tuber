import type { NextApiRequest, NextApiResponse } from 'next';
import { createAiAdapter } from '@/features/ai/factory';
import { AiGateway } from '@/features/ai/gateway';
import { createServerAiAdapter } from '@/features/ai/server-adapter';
import type { AiProvider } from '@/features/ai/types';
import { withApiSecurity } from '@/lib/api/handler';
import { AppError } from '@/lib/errors/app-error';

type AiAdapterResolver = (
  provider: AiProvider,
) => ReturnType<typeof createAiAdapter>;

const allowedContentTypes = new Set([
  'text/event-stream',
  'application/json',
  'application/x-ndjson',
]);

function safeContentType(upstream: Response): string {
  const value = upstream.headers.get('content-type')?.split(';')[0].trim();
  return value && allowedContentTypes.has(value)
    ? value
    : 'application/octet-stream';
}

export function createStreamHandler(
  resolveAdapter: AiAdapterResolver = (provider) =>
    createServerAiAdapter(provider),
) {
  return async function stream(
    request: NextApiRequest,
    response: NextApiResponse,
  ): Promise<void> {
    const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60_000);
    const gateway = new AiGateway(resolveAdapter, { timeoutMs });
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const abort = () => {
      controller.abort();
      void reader?.cancel('Client disconnected');
    };
    request.once('aborted', abort);

    const timeout = setTimeout(() => {
      controller.abort(new DOMException('AI stream timed out', 'TimeoutError'));
      void reader?.cancel('AI stream timed out');
    }, timeoutMs);

    try {
      const upstream = await gateway.stream(request.body, controller.signal);
      if (!upstream.body) {
        throw new AppError(
          'INTERNAL_ERROR',
          502,
          'AI provider returned no stream',
        );
      }

      response.status(200);
      response.setHeader('Content-Type', safeContentType(upstream));
      response.setHeader('Cache-Control', 'no-cache, no-transform');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      reader = upstream.body.getReader();

      while (!controller.signal.aborted) {
        const chunk = await reader.read();
        if (chunk.done) break;
        response.write(Buffer.from(chunk.value));
      }
      response.end();
    } finally {
      clearTimeout(timeout);
      request.off('aborted', abort);
      reader?.releaseLock();
    }
  };
}

export default withApiSecurity(createStreamHandler(), {
  methods: ['POST'],
  write: true,
});
