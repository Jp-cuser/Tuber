export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export interface BrowserRecognitionOptions {
  language: string;
  continuous: boolean;
  initialTimeoutMs: number;
  onTranscript: (text: string, final: boolean) => void;
  onStatus: (status: string) => void;
}

function recognitionErrorMessage(error: string): string {
  if (error === 'not-allowed' || error === 'service-not-allowed')
    return 'Microphone permission was denied';
  if (error === 'audio-capture') return 'No microphone is available';
  if (error === 'no-speech') return 'No speech was detected';
  return `Speech recognition failed: ${error}`;
}

export function browserRecognitionSupported(target: Window = window): boolean {
  return Boolean(target.SpeechRecognition ?? target.webkitSpeechRecognition);
}

export class BrowserSpeechRecognition {
  private recognition?: SpeechRecognitionLike;
  private active = false;
  private stopping = false;
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly options: BrowserRecognitionOptions,
    private readonly createRecognition: () => SpeechRecognitionLike = () => {
      const Constructor =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Constructor)
        throw new Error('Browser speech recognition is not supported');
      return new Constructor();
    },
  ) {}

  start(): void {
    if (this.active) return;
    this.stopping = false;
    this.active = true;
    this.startRecognition();
  }

  private startRecognition(): void {
    const recognition = this.createRecognition();
    this.recognition = recognition;
    recognition.lang = this.options.language;
    recognition.continuous = this.options.continuous;
    recognition.interimResults = true;
    recognition.onstart = () => this.options.onStatus('Listening');
    recognition.onresult = (event) => {
      this.clearTimeout();
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript.trim();
        if (transcript) this.options.onTranscript(transcript, result.isFinal);
      }
    };
    recognition.onerror = (event) => {
      this.options.onStatus(recognitionErrorMessage(event.error));
      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      )
        this.active = false;
    };
    recognition.onend = () => {
      this.clearTimeout();
      if (this.active && !this.stopping && this.options.continuous) {
        this.options.onStatus('Restarting microphone');
        this.startRecognition();
      } else {
        this.active = false;
        this.options.onStatus('Microphone stopped');
      }
    };
    this.timeout = setTimeout(() => {
      this.options.onStatus('Initial speech timeout');
      recognition.abort();
    }, this.options.initialTimeoutMs);
    recognition.start();
  }

  stop(): void {
    this.stopping = true;
    this.active = false;
    this.clearTimeout();
    this.recognition?.stop();
  }

  abort(): void {
    this.stopping = true;
    this.active = false;
    this.clearTimeout();
    this.recognition?.abort();
  }

  private clearTimeout(): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = undefined;
  }
}
