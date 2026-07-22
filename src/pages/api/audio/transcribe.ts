import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createServerWhisperAdapter,
  transcriptionRequestSchema,
  type WhisperAdapter,
} from '@/features/speech/whisper';
import { AppError } from '@/lib/errors/app-error';
import { withApiSecurity } from '@/lib/api/handler';

export function createTranscribeHandler(
  resolveAdapter: () => Pick<
    WhisperAdapter,
    'transcribe'
  > = createServerWhisperAdapter,
) {
  return async function transcribe(
    request: NextApiRequest,
    response: NextApiResponse,
  ) {
    const parsed = transcriptionRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid transcription request');
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.once('aborted', abort);
    try {
      response
        .status(200)
        .json(
          await resolveAdapter().transcribe(parsed.data, controller.signal),
        );
    } finally {
      request.off('aborted', abort);
    }
  };
}

export default withApiSecurity(createTranscribeHandler(), {
  methods: ['POST'],
  write: true,
});
