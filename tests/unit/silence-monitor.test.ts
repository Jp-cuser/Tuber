import {
  BrowserSilenceMonitor,
  SilenceDetector,
} from '@/features/speech/silence-monitor';

describe('SilenceDetector', () => {
  it('waits for speech before counting silence and reports progress', () => {
    const onStatus = jest.fn();
    const onSilence = jest.fn();
    const detector = new SilenceDetector({
      threshold: 0.05,
      silenceTimeoutMs: 2_000,
      onStatus,
      onSilence,
    });
    detector.sample(0.01, 0);
    detector.sample(0.08, 100);
    detector.sample(0.01, 200);
    detector.sample(0.01, 1_200);
    expect(onStatus).toHaveBeenLastCalledWith({
      level: 0.01,
      silenceProgress: 0.5,
      speechDetected: true,
    });
    expect(onSilence).not.toHaveBeenCalled();
    detector.sample(0.01, 2_200);
    expect(onSilence).toHaveBeenCalledTimes(1);
  });

  it('resets the silence countdown when speech resumes', () => {
    const onStatus = jest.fn();
    const onSilence = jest.fn();
    const detector = new SilenceDetector({
      threshold: 0.05,
      silenceTimeoutMs: 1_000,
      onStatus,
      onSilence,
    });
    detector.sample(0.1, 0);
    detector.sample(0.01, 100);
    detector.sample(0.1, 800);
    detector.sample(0.01, 900);
    detector.sample(0.01, 1_500);
    expect(onSilence).not.toHaveBeenCalled();
    detector.sample(0.01, 1_900);
    expect(onSilence).toHaveBeenCalledTimes(1);
  });

  it('reports unsupported microphone level monitoring safely', async () => {
    const monitor = new BrowserSilenceMonitor({
      onStatus: jest.fn(),
      onSilence: jest.fn(),
    });
    await expect(monitor.start()).rejects.toThrow(
      'Microphone level monitoring is not supported',
    );
  });

  it('can monitor repeated speech segments in continuous mode', () => {
    const onSilence = jest.fn();
    const detector = new SilenceDetector(
      {
        threshold: 0.05,
        silenceTimeoutMs: 100,
        onStatus: jest.fn(),
        onSilence,
      },
      true,
    );
    detector.sample(0.1, 0);
    detector.sample(0.01, 10);
    detector.sample(0.01, 110);
    detector.sample(0.1, 120);
    detector.sample(0.01, 130);
    detector.sample(0.01, 230);
    expect(onSilence).toHaveBeenCalledTimes(2);
  });
});
