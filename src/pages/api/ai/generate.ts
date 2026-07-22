import type { NextApiRequest, NextApiResponse } from 'next';
import { createAiAdapter } from '@/features/ai/factory';
import { AiGateway } from '@/features/ai/gateway';
import { getAiProviderConfig } from '@/features/ai/server-config';
import type { AiProvider, AiResult } from '@/features/ai/types';
import { withApiSecurity } from '@/lib/api/handler';

export type AiAdapterResolver = (
  provider: AiProvider,
) => ReturnType<typeof createAiAdapter>;

export function createGenerateHandler(
  resolveAdapter: AiAdapterResolver = (provider) =>
    createAiAdapter(getAiProviderConfig(provider)),
) {
  return async function generate(
    request: NextApiRequest,
    response: NextApiResponse<AiResult>,
  ): Promise<void> {
    const gateway = new AiGateway(resolveAdapter, {
      timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60_000),
    });
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.once('aborted', abort);

    try {
      const result = await gateway.generate(request.body, controller.signal);
      response.status(200).json(result);
    } finally {
      request.off('aborted', abort);
    }
  };
}

export default withApiSecurity(createGenerateHandler(), {
  methods: ['POST'],
  write: true,
});
