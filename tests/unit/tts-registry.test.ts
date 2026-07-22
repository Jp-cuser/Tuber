import { ttsEngineRegistry } from '@/features/tts/registry';
import { voiceEngines } from '@/features/tts/types';

describe('TTS engine registry', () => {
  it('describes every specified engine exactly once', () => {
    expect([...ttsEngineRegistry.keys()]).toEqual(voiceEngines);
    expect(ttsEngineRegistry.get('voicevox')).toMatchObject({
      kind: 'local',
      defaultBaseUrl: 'http://127.0.0.1:50021',
      requiresApiKey: false,
    });
  });
});
