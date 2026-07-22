import { AppError } from '@/lib/errors/app-error';
import { aiRequestSchema } from './schemas';
import type { AiProviderAdapter, AiRequest, AiResult } from './types';

export type AiAdapterResolver = (
  provider: AiRequest['provider'],
) => AiProviderAdapter;

export interface AiGatewayOptions {
  timeoutMs?: number;
}

export class AiGateway {
  private readonly timeoutMs: number;

  constructor(
    private readonly resolveAdapter: AiAdapterResolver,
    options: AiGatewayOptions = {},
  ) {
    this.timeoutMs = options.timeoutMs ?? 60_000;

    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1) {
      throw new Error('AI gateway timeout must be a positive integer');
    }
  }

  generate(request: unknown, signal?: AbortSignal): Promise<AiResult> {
    return this.execute(request, signal, (adapter, parsed, requestSignal) =>
      adapter.generate(parsed, requestSignal),
    );
  }

  stream(request: unknown, signal?: AbortSignal): Promise<Response> {
    return this.execute(request, signal, (adapter, parsed, requestSignal) =>
      adapter.stream(parsed, requestSignal),
    );
  }

  private async execute<T>(
    request: unknown,
    externalSignal: AbortSignal | undefined,
    operation: (
      adapter: AiProviderAdapter,
      request: AiRequest,
      signal: AbortSignal,
    ) => Promise<T>,
  ): Promise<T> {
    const parsed = aiRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new AppError(
        'BAD_REQUEST',
        400,
        parsed.error.issues.map((issue) => issue.message).join('; '),
      );
    }

    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(externalSignal?.reason);

    if (externalSignal?.aborted) {
      abortFromCaller();
    } else {
      externalSignal?.addEventListener('abort', abortFromCaller, {
        once: true,
      });
    }

    const timeout = setTimeout(() => {
      controller.abort(
        new DOMException('AI request timed out', 'TimeoutError'),
      );
    }, this.timeoutMs);

    try {
      const adapter = this.resolveAdapter(parsed.data.provider);
      return await operation(adapter, parsed.data, controller.signal);
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener('abort', abortFromCaller);
    }
  }
}
