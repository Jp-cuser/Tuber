export const voiceEngines = [
  'voicevox',
  'koeiromap',
  'google',
  'stylebertvits2',
  'aivis_speech',
  'aivis_cloud_api',
  'gsvitts',
  'elevenlabs',
  'openai',
  'azure',
  'cartesia',
] as const;

export type VoiceEngine = (typeof voiceEngines)[number];

export interface TtsOptions {
  speakerId?: string;
  model?: string;
  speed?: number;
  pitch?: number;
  intonation?: number;
  style?: string;
  speakerX?: number;
  speakerY?: number;
  languageCode?: string;
  volumeGainDb?: number;
  sdpRatio?: number;
  tempoDynamics?: number;
  prePhonemeLength?: number;
  postPhonemeLength?: number;
  styleId?: number;
  styleName?: string;
}

export interface AudioPayload {
  data: Uint8Array;
  mimeType: string;
}

export interface VoiceDefinition {
  id: string;
  name: string;
  styles?: Array<{ id: string; name: string }>;
}

export interface TtsAdapter {
  synthesize(
    text: string,
    options: TtsOptions,
    signal?: AbortSignal,
  ): Promise<AudioPayload>;
  listVoices?(signal?: AbortSignal): Promise<VoiceDefinition[]>;
}
