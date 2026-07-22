import type { VoiceEngine } from './types';

export interface TtsEngineDescriptor {
  id: VoiceEngine;
  name: string;
  kind: 'local' | 'cloud';
  defaultBaseUrl?: string;
  requiresApiKey: boolean;
}

const descriptors: TtsEngineDescriptor[] = [
  {
    id: 'voicevox',
    name: 'VOICEVOX',
    kind: 'local',
    defaultBaseUrl: 'http://127.0.0.1:50021',
    requiresApiKey: false,
  },
  { id: 'koeiromap', name: 'Koeiromap', kind: 'cloud', requiresApiKey: true },
  {
    id: 'google',
    name: 'Google Text-to-Speech',
    kind: 'cloud',
    requiresApiKey: true,
  },
  {
    id: 'stylebertvits2',
    name: 'Style-Bert-VITS2',
    kind: 'local',
    requiresApiKey: false,
  },
  {
    id: 'aivis_speech',
    name: 'AivisSpeech',
    kind: 'local',
    defaultBaseUrl: 'http://127.0.0.1:10101',
    requiresApiKey: false,
  },
  {
    id: 'aivis_cloud_api',
    name: 'Aivis Cloud API',
    kind: 'cloud',
    requiresApiKey: true,
  },
  { id: 'gsvitts', name: 'GSVI TTS', kind: 'local', requiresApiKey: false },
  { id: 'elevenlabs', name: 'ElevenLabs', kind: 'cloud', requiresApiKey: true },
  { id: 'openai', name: 'OpenAI TTS', kind: 'cloud', requiresApiKey: true },
  { id: 'azure', name: 'Azure TTS', kind: 'cloud', requiresApiKey: true },
  { id: 'cartesia', name: 'Cartesia', kind: 'cloud', requiresApiKey: true },
];

export const ttsEngineRegistry = new Map(
  descriptors.map((descriptor) => [descriptor.id, descriptor]),
);

export function getTtsEngineDescriptor(engine: VoiceEngine) {
  const descriptor = ttsEngineRegistry.get(engine);
  if (!descriptor) throw new Error(`Unknown TTS engine: ${engine}`);
  return descriptor;
}
