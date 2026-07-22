import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerTtsAdapter } from '@/features/tts/server-adapter';
import type { TtsAdapter, VoiceEngine } from '@/features/tts/types';
import { voiceEngines } from '@/features/tts/types';
import { AppError } from '@/lib/errors/app-error';
import { withApiSecurity } from '@/lib/api/handler';

const requestSchema = z.object({
  engine: z.enum(voiceEngines),
  text: z.string().trim().min(1).max(5_000),
  options: z
    .object({
      speakerId: z.string().max(100).optional(),
      model: z.string().max(200).optional(),
      speed: z.number().min(0.25).max(4).optional(),
      pitch: z.number().min(-20).max(20).optional(),
      intonation: z.number().min(0).max(4).optional(),
      style: z.string().max(200).optional(),
      speakerX: z.number().min(-10).max(10).optional(),
      speakerY: z.number().min(-10).max(10).optional(),
      languageCode: z.string().max(35).optional(),
      volumeGainDb: z.number().min(-96).max(16).optional(),
      sdpRatio: z.number().min(0).max(1).optional(),
      tempoDynamics: z.number().min(0).max(2).optional(),
      prePhonemeLength: z.number().min(0).max(10).optional(),
      postPhonemeLength: z.number().min(0).max(10).optional(),
    })
    .default({}),
});

export type TtsAdapterResolver = (engine: VoiceEngine) => TtsAdapter;

export function createSynthesizeHandler(
  resolveAdapter: TtsAdapterResolver = createServerTtsAdapter,
) {
  return async function synthesize(
    request: NextApiRequest,
    response: NextApiResponse,
  ) {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid speech request');
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.once('aborted', abort);
    try {
      const audio = await resolveAdapter(parsed.data.engine).synthesize(
        parsed.data.text,
        parsed.data.options,
        controller.signal,
      );
      response.status(200).json({
        audioBase64: Buffer.from(audio.data).toString('base64'),
        mimeType: audio.mimeType,
      });
    } finally {
      request.off('aborted', abort);
    }
  };
}

export default withApiSecurity(createSynthesizeHandler(), {
  methods: ['POST'],
  write: true,
});
