import {
  BrowserSpeechRecognition,
  type SpeechRecognitionLike,
} from '@/features/speech/browser-recognition';

function fakeRecognition(): SpeechRecognitionLike {
  return {
    lang: '',
    continuous: false,
    interimResults: false,
    onstart: null,
    onresult: null,
    onerror: null,
    onend: null,
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
  };
}

describe('browser speech recognition contract', () => {
  jest.useFakeTimers();
  afterEach(() => jest.clearAllTimers());

  it('configures recognition and forwards interim and final transcripts', () => {
    const recognition = fakeRecognition();
    const transcripts = jest.fn();
    const statuses = jest.fn();
    const adapter = new BrowserSpeechRecognition(
      {
        language: 'ja-JP',
        continuous: false,
        initialTimeoutMs: 5000,
        onTranscript: transcripts,
        onStatus: statuses,
      },
      () => recognition,
    );
    adapter.start();
    expect(recognition).toMatchObject({
      lang: 'ja-JP',
      continuous: false,
      interimResults: true,
    });
    recognition.onstart?.();
    recognition.onresult?.({
      resultIndex: 0,
      results: [
        { 0: { transcript: '途中' }, isFinal: false },
        { 0: { transcript: '確定' }, isFinal: true },
      ],
    });
    expect(statuses).toHaveBeenCalledWith('Listening');
    expect(transcripts).toHaveBeenNthCalledWith(1, '途中', false);
    expect(transcripts).toHaveBeenNthCalledWith(2, '確定', true);
  });

  it('aborts on the initial speech timeout', () => {
    const recognition = fakeRecognition();
    const statuses = jest.fn();
    const adapter = new BrowserSpeechRecognition(
      {
        language: 'en-US',
        continuous: false,
        initialTimeoutMs: 1000,
        onTranscript: jest.fn(),
        onStatus: statuses,
      },
      () => recognition,
    );
    adapter.start();
    jest.advanceTimersByTime(1000);
    expect(recognition.abort).toHaveBeenCalledTimes(1);
    expect(statuses).toHaveBeenCalledWith('Initial speech timeout');
  });

  it('restarts continuous recognition but stops explicitly', () => {
    const recognitions = [fakeRecognition(), fakeRecognition()];
    const adapter = new BrowserSpeechRecognition(
      {
        language: 'en-US',
        continuous: true,
        initialTimeoutMs: 5000,
        onTranscript: jest.fn(),
        onStatus: jest.fn(),
      },
      () => recognitions.shift() as SpeechRecognitionLike,
    );
    adapter.start();
    const first = adapter['recognition'] as SpeechRecognitionLike;
    first.onend?.();
    const second = adapter['recognition'] as SpeechRecognitionLike;
    expect(second.start).toHaveBeenCalledTimes(1);
    adapter.stop();
    expect(second.stop).toHaveBeenCalledTimes(1);
  });

  it('reports permission errors without exposing browser details', () => {
    const recognition = fakeRecognition();
    const statuses = jest.fn();
    const adapter = new BrowserSpeechRecognition(
      {
        language: 'en-US',
        continuous: false,
        initialTimeoutMs: 5000,
        onTranscript: jest.fn(),
        onStatus: statuses,
      },
      () => recognition,
    );
    adapter.start();
    recognition.onerror?.({ error: 'not-allowed' });
    expect(statuses).toHaveBeenCalledWith('Microphone permission was denied');
  });
});
