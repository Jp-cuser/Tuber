import { AiGateway } from '@/features/ai/gateway';
import type { AiProviderAdapter, AiRequest } from '@/features/ai/types';
import { AppError } from '@/lib/errors/app-error';

const request: AiRequest = {
  provider: 'openai',
  model: 'test-model',
  messages: [
    {
      id: 'message-1',
      role: 'user',
      content: 'hello',
      timestamp: '2026-07-22T12:00:00.000Z',
    },
  ],
};

function adapter(
  overrides: Partial<AiProviderAdapter> = {},
): AiProviderAdapter {
  return {
    validateConfig: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
    generate: jest.fn().mockResolvedValue({ text: 'ok' }),
    stream: jest.fn().mockResolvedValue({ ok: true } as Response),
    supportsMultimodal: jest.fn().mockReturnValue(false),
    supportsReasoning: jest.fn().mockReturnValue(false),
    supportsSearchGrounding: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

describe('AiGateway', () => {
  it('validates the request before resolving an adapter', async () => {
    const resolver = jest.fn();
    const gateway = new AiGateway(resolver);

    await expect(
      gateway.generate({ provider: 'openai' }),
    ).rejects.toBeInstanceOf(AppError);
    expect(resolver).not.toHaveBeenCalled();
  });

  it('resolves the selected provider and generates a response', async () => {
    const selected = adapter();
    const resolver = jest.fn().mockReturnValue(selected);
    const gateway = new AiGateway(resolver);

    await expect(gateway.generate(request)).resolves.toEqual({ text: 'ok' });
    expect(resolver).toHaveBeenCalledWith('openai');
    expect(selected.generate).toHaveBeenCalledWith(
      request,
      expect.any(AbortSignal),
    );
  });

  it('forwards caller cancellation to the provider operation', async () => {
    let receivedSignal: AbortSignal | undefined;
    const selected = adapter({
      generate: jest.fn((_request, signal) => {
        receivedSignal = signal;
        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), {
            once: true,
          });
        });
      }),
    });
    const gateway = new AiGateway(() => selected);
    const controller = new AbortController();
    const pending = gateway.generate(request, controller.signal);

    controller.abort(new DOMException('cancelled', 'AbortError'));

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(receivedSignal?.aborted).toBe(true);
  });

  it('aborts a provider operation after the configured timeout', async () => {
    jest.useFakeTimers();
    const selected = adapter({
      generate: jest.fn(
        (_request, signal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), {
              once: true,
            });
          }),
      ),
    });
    const gateway = new AiGateway(() => selected, { timeoutMs: 25 });
    const pending = gateway.generate(request);

    jest.advanceTimersByTime(25);

    await expect(pending).rejects.toMatchObject({ name: 'TimeoutError' });
    jest.useRealTimers();
  });

  it('uses the same validation and cancellation boundary for streams', async () => {
    const selected = adapter();
    const gateway = new AiGateway(() => selected);

    await gateway.stream(request);

    expect(selected.stream).toHaveBeenCalledWith(
      request,
      expect.any(AbortSignal),
    );
  });
});
