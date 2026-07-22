import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { DraggablePanel } from '@/components/common/DraggablePanel';
import { detectLanguage } from '@/features/i18n/i18n';
import { AiApiClient, AiApiError } from '@/features/ai/client';
import type { Message } from '@/features/ai/types';
import { presets, type BackgroundMode } from '@/features/settings/types';
import { useSettingsStore } from '@/features/settings/store';
import { MediaBackground } from './MediaBackground';
import { SettingsPanel } from './SettingsPanel';

const themeClasses = {
  default: 'theme-default',
  cool: 'theme-cool',
  mono: 'theme-mono',
  ocean: 'theme-ocean',
  forest: 'theme-forest',
  sunset: 'theme-sunset',
} as const;

export function Studio() {
  const { t, i18n } = useTranslation();
  const settings = useSettingsStore();
  const [showIntro, setShowIntro] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'local-preview',
      role: 'assistant',
      content: t('localPreview'),
      timestamp: new Date().toISOString(),
      status: 'complete',
    },
  ]);
  const [generationError, setGenerationError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [mediaSource, setMediaSource] = useState<string>();
  const [overlaySource, setOverlaySource] = useState<string>();
  const mediaInput = useRef<HTMLInputElement>(null);
  const overlayInput = useRef<HTMLInputElement>(null);
  const generationController = useRef<AbortController>();
  const preset =
    presets.find((item) => item.id === settings.selectedPreset) ?? presets[0];

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE &&
      !localStorage.getItem('local-ai-tuber-settings')
    ) {
      settings.update('language', detectLanguage());
    }
    // Automatic language detection runs only on the first browser visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void i18n.changeLanguage(settings.language);
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [i18n, settings.language]);
  useEffect(
    () => () => {
      if (mediaSource) URL.revokeObjectURL(mediaSource);
      if (overlaySource) URL.revokeObjectURL(overlaySource);
    },
    [mediaSource, overlaySource],
  );

  const chooseFile = (
    event: ChangeEvent<HTMLInputElement>,
    overlay = false,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const source = URL.createObjectURL(file);
    if (overlay) setOverlaySource(source);
    else setMediaSource(source);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || generating || !settings.aiModel.trim()) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'complete',
    };
    const requestMessages = [
      ...messages.filter((message) => message.id !== 'local-preview'),
      userMessage,
    ];
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setGenerationError('');
    setGenerating(true);
    const controller = new AbortController();
    generationController.current = controller;
    try {
      const result = await new AiApiClient().generate(
        {
          provider: settings.aiProvider,
          model: settings.aiModel.trim(),
          systemPrompt: preset.prompt,
          messages: requestMessages,
        },
        controller.signal,
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.text,
          reasoning: result.reasoning,
          timestamp: new Date().toISOString(),
          status: 'complete',
        },
      ]);
    } catch (error) {
      if (controller.signal.aborted) {
        setGenerationError('Generation cancelled');
      } else {
        setGenerationError(
          error instanceof AiApiError ? error.message : 'AI generation failed',
        );
      }
    } finally {
      if (generationController.current === controller) {
        generationController.current = undefined;
        setGenerating(false);
      }
    }
  };
  const fullscreen = () => {
    if (!document.fullscreenElement)
      void document.documentElement.requestFullscreen();
    else void document.exitFullscreen();
  };

  if (showIntro)
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white ${themeClasses[settings.theme]}`}
      >
        <section className="max-w-xl rounded-[2rem] border border-white/15 bg-white/5 p-10 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-cyan-400/15 text-4xl">
            ✦
          </div>
          <h1 className="text-4xl font-black">{t('introTitle')}</h1>
          <p className="mt-4 leading-7 text-white/70">{t('introBody')}</p>
          <button
            className="mt-8 rounded-full bg-cyan-300 px-8 py-3 font-bold text-slate-950 hover:bg-cyan-200"
            onClick={() => setShowIntro(false)}
          >
            {t('start')}
          </button>
        </section>
      </main>
    );

  return (
    <main
      className={`relative min-h-screen overflow-hidden text-white ${themeClasses[settings.theme]}`}
    >
      <MediaBackground
        mode={settings.videoVisible ? settings.backgroundMode : 'gradient'}
        source={mediaSource}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />
      <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between p-5">
        <div>
          {settings.characterNameVisible && (
            <h1 className="text-lg font-bold drop-shadow">
              {settings.characterName}
            </h1>
          )}
          <p className="text-xs text-emerald-300">● {t('connectionReady')}</p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label={t('fullscreen')}
            className="control-button"
            onClick={fullscreen}
          >
            ⛶
          </button>
          <button
            aria-label={t('settings')}
            className="control-button"
            onClick={() => setShowSettings(true)}
          >
            ⚙
          </button>
        </div>
      </header>
      <section
        className="absolute inset-0 z-10 grid place-items-center"
        aria-label="character stage"
      >
        <div className="grid h-64 w-64 place-items-center rounded-full border border-white/10 bg-white/5 text-center shadow-[0_0_100px_rgba(34,211,238,.12)] backdrop-blur-sm">
          <div>
            <div className="text-7xl">◉</div>
            <p className="mt-4 text-sm text-white/55">
              Character renderer
              <br />
              Phase 3
            </p>
          </div>
        </div>
      </section>
      {settings.assistantVisible && (
        <div
          className={`absolute left-1/2 top-24 z-30 max-w-xl -translate-x-1/2 px-6 py-4 text-center ${settings.assistantStyle === 'bubble' ? 'rounded-2xl border border-white/15 bg-slate-950/70 shadow-xl backdrop-blur' : 'text-lg font-semibold drop-shadow-lg'}`}
          role="status"
        >
          {messages.at(-1)?.content as string}
        </div>
      )}
      {settings.controlsVisible && (
        <DraggablePanel>
          <h2 className="font-bold">{t('controls')}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="panel-button"
              onClick={() =>
                settings.update('presentationMode', !settings.presentationMode)
              }
            >
              {t('presentation')}
            </button>
            <button
              className="panel-button"
              onClick={() =>
                settings.update('videoVisible', !settings.videoVisible)
              }
            >
              {t('show')}
            </button>
            <select
              aria-label={t('background')}
              className="panel-button col-span-2"
              value={settings.backgroundMode}
              onChange={(event) =>
                settings.update(
                  'backgroundMode',
                  event.target.value as BackgroundMode,
                )
              }
            >
              <option value="gradient">{t('gradient')}</option>
              <option value="image">{t('image')}</option>
              <option value="video">{t('video')}</option>
              <option value="webcam">{t('webcam')}</option>
              <option value="capture">{t('capture')}</option>
              <option value="green">{t('green')}</option>
            </select>
            <button
              className="panel-button col-span-2"
              onClick={() => mediaInput.current?.click()}
            >
              {t('uploadMedia')}
            </button>
            <button
              className="panel-button col-span-2"
              onClick={() => overlayInput.current?.click()}
            >
              {t('overlay')}
            </button>
          </div>
        </DraggablePanel>
      )}
      {settings.chatVisible && (
        <section
          className={`absolute bottom-24 z-30 flex max-h-[52vh] flex-col overflow-hidden rounded-2xl border border-white/15 shadow-2xl ${settings.chatDesign === 'glass' ? 'bg-slate-950/60 backdrop-blur-xl' : 'bg-slate-950'}`}
          style={{
            width: settings.chatWidth,
            [settings.chatSide]: settings.edgeOffset,
          }}
          aria-label={t('chat')}
        >
          <div className="overflow-y-auto p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
              {t('chat')}
            </h2>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`mb-2 rounded-xl px-3 py-2 text-sm ${message.role === 'user' ? 'ms-8 bg-cyan-400/20' : 'me-8 bg-white/10'}`}
              >
                <strong className="me-2">
                  {message.role === 'user'
                    ? settings.userName
                    : settings.characterName}
                </strong>
                {typeof message.content === 'string'
                  ? message.content
                  : message.content
                      .filter((item) => item.type === 'text')
                      .map((item) => item.text)
                      .join('')}
              </div>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-2">
            {preset.questions.map((question) => (
              <button
                key={question}
                className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs"
                onClick={() => setInput(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      )}
      {!settings.presentationMode && (
        <form
          onSubmit={(event) => void submit(event)}
          className="absolute inset-x-0 bottom-5 z-40 mx-auto flex max-w-2xl gap-2 px-5"
        >
          <input
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-slate-950/75 px-5 py-3 backdrop-blur"
            placeholder={t('inputPlaceholder')}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button
            className="rounded-full bg-cyan-300 px-6 font-bold text-slate-950"
            type="submit"
            disabled={generating || !settings.aiModel.trim()}
          >
            {t('send')}
          </button>
          {generating && (
            <button
              className="rounded-full bg-rose-300 px-5 font-bold text-slate-950"
              type="button"
              onClick={() => generationController.current?.abort()}
            >
              Cancel
            </button>
          )}
        </form>
      )}
      {generationError && (
        <p
          className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-rose-950/90 px-4 py-2 text-sm text-rose-100"
          role="alert"
        >
          {generationError}
        </p>
      )}
      {overlaySource && settings.overlayMode !== 'hidden' && (
        <button
          className={
            settings.overlayMode === 'modal'
              ? 'fixed inset-0 z-[60] grid place-items-center bg-black/80 p-10'
              : 'absolute bottom-28 left-1/2 z-30 -translate-x-1/2'
          }
          onClick={() =>
            settings.update(
              'overlayMode',
              settings.overlayMode === 'modal' ? 'placed' : 'modal',
            )
          }
          aria-label={t('overlay')}
        >
          {/* Blob URLs are user-selected local media and cannot use Next Image optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={overlaySource}
            alt="Overlay"
            className={
              settings.overlayMode === 'modal'
                ? 'max-h-full max-w-full rounded-xl object-contain'
                : 'max-h-48 max-w-sm rounded-xl object-contain shadow-2xl'
            }
          />
        </button>
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <input
        ref={mediaInput}
        className="hidden"
        type="file"
        accept="image/*,video/*"
        onChange={(event) => chooseFile(event)}
      />
      <input
        ref={overlayInput}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(event) => {
          chooseFile(event, true);
          settings.update('overlayMode', 'placed');
        }}
      />
    </main>
  );
}
