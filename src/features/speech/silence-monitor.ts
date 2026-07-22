export interface SilenceMonitorStatus {
  level: number;
  silenceProgress: number;
  speechDetected: boolean;
}

export interface SilenceMonitorOptions {
  threshold?: number;
  silenceTimeoutMs?: number;
  sampleIntervalMs?: number;
  repeat?: boolean;
  onStatus: (status: SilenceMonitorStatus) => void;
  onSilence: () => void;
}

export class SilenceDetector {
  private speechDetected = false;
  private silentSince?: number;
  private completed = false;

  constructor(
    private readonly options: Required<
      Pick<SilenceMonitorOptions, 'threshold' | 'silenceTimeoutMs'>
    > &
      Pick<SilenceMonitorOptions, 'onStatus' | 'onSilence'>,
    private readonly repeat = false,
  ) {}

  sample(level: number, now: number): void {
    if (this.completed) return;
    if (level >= this.options.threshold) {
      this.speechDetected = true;
      this.silentSince = undefined;
    } else if (this.speechDetected) {
      this.silentSince ??= now;
    }
    const elapsed = this.silentSince === undefined ? 0 : now - this.silentSince;
    const silenceProgress = Math.min(
      1,
      elapsed / this.options.silenceTimeoutMs,
    );
    this.options.onStatus({
      level,
      silenceProgress,
      speechDetected: this.speechDetected,
    });
    if (silenceProgress >= 1) {
      this.options.onSilence();
      if (this.repeat) {
        this.speechDetected = false;
        this.silentSince = undefined;
      } else {
        this.completed = true;
      }
    }
  }
}

export class BrowserSilenceMonitor {
  private stream?: MediaStream;
  private context?: AudioContext;
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly options: SilenceMonitorOptions) {}

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error('Microphone level monitoring is not supported');
    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new AudioContext();
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 512;
    this.context.createMediaStreamSource(this.stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    const detector = new SilenceDetector(
      {
        threshold: this.options.threshold ?? 0.035,
        silenceTimeoutMs: this.options.silenceTimeoutMs ?? 2_000,
        onStatus: this.options.onStatus,
        onSilence: this.options.onSilence,
      },
      this.options.repeat,
    );
    this.timer = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }
      detector.sample(Math.sqrt(sum / samples.length), performance.now());
    }, this.options.sampleIntervalMs ?? 100);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (this.context) void this.context.close();
    this.context = undefined;
  }
}
