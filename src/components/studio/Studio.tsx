import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { DraggablePanel } from '@/components/common/DraggablePanel';
import { detectLanguage } from '@/features/i18n/i18n';
import { AiApiClient, AiApiError } from '@/features/ai/client';
import { extractAiStreamDelta } from '@/features/ai/stream-delta';
import { trimConversationHistory } from '@/features/ai/history';
import {
  readImageAttachment,
  type ImageAttachment,
} from '@/features/ai/image-attachment';
import type { Message } from '@/features/ai/types';
import { presets, type BackgroundMode } from '@/features/settings/types';
import { useSettingsStore } from '@/features/settings/store';
import { MediaBackground, type MediaBackgroundHandle } from './MediaBackground';
import { SettingsPanel } from './SettingsPanel';
import { validateVrmFile } from '@/features/avatar/vrm-file';
import {
  selectPngTuberState,
  validatePngTuberVideo,
} from '@/features/avatar/pngtuber';
import { PngTuberRenderer } from './PngTuberRenderer';
import {
  clearPngTuberModel,
  getPngTuberModel,
  savePngTuberVideo,
  type StoredPngTuberModel,
} from '@/features/avatar/pngtuber-library';
import {
  deleteVrmModel,
  getVrmModel,
  listVrmModels,
  readSelectedVrmModelId,
  saveVrmModel,
  writeSelectedVrmModelId,
  type VrmModelSummary,
} from '@/features/avatar/vrm-library';
import {
  avatarEmotions,
  avatarMotions,
  avatarPoses,
  type AvatarControlState,
} from '@/features/avatar/control';
import {
  defaultAvatarPresentation,
  readAvatarPresentation,
  writeAvatarPresentation,
  type AvatarPresentation,
} from '@/features/avatar/presentation';

const VrmRenderer = dynamic(
  () => import('./VrmRenderer').then((module) => module.VrmRenderer),
  { ssr: false },
);

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
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment>();
  const [mediaSource, setMediaSource] = useState<string>();
  const [overlaySource, setOverlaySource] = useState<string>();
  const [vrmSource, setVrmSource] = useState<string>();
  const [vrmModels, setVrmModels] = useState<VrmModelSummary[]>([]);
  const [selectedVrmId, setSelectedVrmId] = useState('');
  const [avatarControl, setAvatarControl] = useState<AvatarControlState>({
    pose: 'neutral',
    motion: 'idle',
    emotion: 'neutral',
    thinking: false,
  });
  const [avatarPresentation, setAvatarPresentation] =
    useState<AvatarPresentation>(defaultAvatarPresentation);
  const [vrmStatus, setVrmStatus] = useState('No VRM model selected');
  const [avatarMode, setAvatarMode] = useState<'vrm' | 'pngtuber'>('vrm');
  const [pngTuberIdleSource, setPngTuberIdleSource] = useState<string>();
  const [pngTuberTalkingSource, setPngTuberTalkingSource] = useState<string>();
  const [pngTuberStatus, setPngTuberStatus] = useState(
    'Select idle and talking videos',
  );
  const [pngTuberSensitivity, setPngTuberSensitivity] = useState(0.5);
  const applyPngTuberModel = useCallback((model?: StoredPngTuberModel) => {
    const apply = (
      video: StoredPngTuberModel['idle'],
      update: typeof setPngTuberIdleSource,
    ) => {
      const source = video
        ? URL.createObjectURL(new Blob([video.data], { type: video.type }))
        : undefined;
      update((current) => {
        if (current) URL.revokeObjectURL(current);
        return source;
      });
    };
    apply(model?.idle, setPngTuberIdleSource);
    apply(model?.talking, setPngTuberTalkingSource);
    setPngTuberStatus(
      model?.idle && model.talking
        ? 'Idle and talking videos ready'
        : 'Select idle and talking videos',
    );
  }, []);
  const handleVrmLoaded = useCallback(
    () => setVrmStatus('VRM model ready'),
    [],
  );
  const handleVrmError = useCallback(
    (message: string) => setVrmStatus(message),
    [],
  );
  const mediaInput = useRef<HTMLInputElement>(null);
  const overlayInput = useRef<HTMLInputElement>(null);
  const imageAttachmentInput = useRef<HTMLInputElement>(null);
  const vrmInput = useRef<HTMLInputElement>(null);
  const pngTuberIdleInput = useRef<HTMLInputElement>(null);
  const pngTuberTalkingInput = useRef<HTMLInputElement>(null);
  const generationController = useRef<AbortController>();
  const backgroundRef = useRef<MediaBackgroundHandle>(null);
  const preset =
    presets.find((item) => item.id === settings.selectedPreset) ?? presets[0];
  const limitVisibleHistory = (current: Message[]) => {
    const preview = current.find((message) => message.id === 'local-preview');
    const conversation = trimConversationHistory(
      current.filter((message) => message.id !== 'local-preview'),
      settings.historyLimit,
    );
    return preview ? [preview, ...conversation] : conversation;
  };

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
  useEffect(() => setAvatarPresentation(readAvatarPresentation()), []);
  useEffect(() => {
    void getPngTuberModel()
      .then(applyPngTuberModel)
      .catch(() => setPngTuberStatus('Unable to open PNGTuber storage'));
  }, [applyPngTuberModel]);
  const updateAvatarPresentation = <Key extends keyof AvatarPresentation>(
    key: Key,
    value: AvatarPresentation[Key],
  ) => {
    setAvatarPresentation((current) => {
      const next = { ...current, [key]: value };
      writeAvatarPresentation(next);
      return next;
    });
  };
  const selectVrm = useCallback(async (id: string) => {
    if (!id) {
      setSelectedVrmId('');
      setVrmSource(undefined);
      setVrmStatus('No VRM model selected');
      writeSelectedVrmModelId();
      return;
    }
    const model = await getVrmModel(id);
    if (!model) throw new Error('The selected VRM model no longer exists');
    const source = URL.createObjectURL(
      new Blob([model.data], { type: 'model/gltf-binary' }),
    );
    setVrmSource((current) => {
      if (current) URL.revokeObjectURL(current);
      return source;
    });
    setSelectedVrmId(id);
    writeSelectedVrmModelId(id);
    setVrmStatus(`Loading ${model.name}`);
  }, []);
  useEffect(() => {
    void listVrmModels()
      .then(async (models) => {
        setVrmModels(models);
        const selected = readSelectedVrmModelId();
        if (selected && models.some((model) => model.id === selected))
          await selectVrm(selected);
      })
      .catch(() => setVrmStatus('Unable to open VRM model storage'));
  }, [selectVrm]);
  useEffect(
    () => () => {
      if (mediaSource) URL.revokeObjectURL(mediaSource);
      if (overlaySource) URL.revokeObjectURL(overlaySource);
      if (vrmSource) URL.revokeObjectURL(vrmSource);
      if (pngTuberIdleSource) URL.revokeObjectURL(pngTuberIdleSource);
      if (pngTuberTalkingSource) URL.revokeObjectURL(pngTuberTalkingSource);
    },
    [
      mediaSource,
      overlaySource,
      vrmSource,
      pngTuberIdleSource,
      pngTuberTalkingSource,
    ],
  );

  const choosePngTuberVideo = (
    event: ChangeEvent<HTMLInputElement>,
    kind: 'idle' | 'talking',
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      validatePngTuberVideo(file);
      setPngTuberStatus(`Saving ${kind} video`);
      void savePngTuberVideo(kind, file)
        .then(applyPngTuberModel)
        .catch((error: unknown) =>
          setPngTuberStatus(
            error instanceof Error
              ? error.message
              : 'Unable to save PNGTuber video',
          ),
        );
    } catch (error) {
      setPngTuberStatus(
        error instanceof Error ? error.message : 'Invalid PNGTuber video',
      );
    }
  };

  const chooseVrm = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      validateVrmFile(file);
      setVrmStatus(`Saving ${file.name}`);
      void saveVrmModel(file)
        .then(async (model) => {
          setVrmModels(await listVrmModels());
          await selectVrm(model.id);
        })
        .catch((error: unknown) =>
          setVrmStatus(
            error instanceof Error ? error.message : 'Unable to save VRM model',
          ),
        );
    } catch (error) {
      setVrmStatus(
        error instanceof Error ? error.message : 'Invalid VRM model',
      );
    }
  };
  const removeSelectedVrm = () => {
    if (!selectedVrmId) return;
    void deleteVrmModel(selectedVrmId)
      .then(async () => {
        await selectVrm('');
        setVrmModels(await listVrmModels());
      })
      .catch(() => setVrmStatus('Unable to delete the VRM model'));
  };

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
  const chooseImageAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void readImageAttachment(file)
      .then((attachment) => {
        setImageAttachment(attachment);
        setGenerationError('');
      })
      .catch((error: unknown) =>
        setGenerationError(
          error instanceof Error ? error.message : 'Unable to attach image',
        ),
      );
  };
  const captureBackgroundFrame = () => {
    void backgroundRef.current
      ?.captureFrame()
      .then((attachment) => {
        setImageAttachment(attachment);
        setGenerationError('');
      })
      .catch((error: unknown) =>
        setGenerationError(
          error instanceof Error ? error.message : 'Unable to capture frame',
        ),
      );
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text =
      input.trim() || (imageAttachment ? 'Describe this image.' : '');
    if (!text || generating || !settings.aiModel.trim()) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: imageAttachment
        ? [
            { type: 'text', text } as const,
            {
              type: 'image',
              data: imageAttachment.data,
              mimeType: imageAttachment.mimeType,
            } as const,
          ]
        : text,
      timestamp: new Date().toISOString(),
      status: 'complete',
    };
    const requestMessages = [
      ...messages.filter((message) => message.id !== 'local-preview'),
      userMessage,
    ].slice(-settings.historyLimit);
    const assistantId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
    };
    setMessages((current) =>
      limitVisibleHistory([...current, userMessage, assistantMessage]),
    );
    setInput('');
    setImageAttachment(undefined);
    setGenerationError('');
    setGenerating(true);
    const controller = new AbortController();
    generationController.current = controller;
    try {
      const stream = new AiApiClient().stream(
        {
          provider: settings.aiProvider,
          model: settings.aiModel.trim(),
          systemPrompt: preset.prompt,
          messages: requestMessages,
          reasoning: {
            enabled: settings.reasoningEnabled,
            effort: settings.reasoningEffort,
            tokenBudget: settings.reasoningTokenBudget,
          },
          searchGrounding: {
            enabled: settings.searchGroundingEnabled,
            dynamicThreshold: settings.searchGroundingDynamicThreshold,
          },
        },
        controller.signal,
      );
      let receivedText = false;
      for await (const chunk of stream) {
        const delta = extractAiStreamDelta(settings.aiProvider, chunk);
        if (delta.text) receivedText = true;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: `${message.content as string}${delta.text ?? ''}`,
                  reasoning:
                    `${message.reasoning ?? ''}${delta.reasoning ?? ''}` ||
                    undefined,
                }
              : message,
          ),
        );
      }
      if (!receivedText) throw new Error('AI stream returned no text');
      setMessages((current) =>
        limitVisibleHistory(
          current.map((message) =>
            message.id === assistantId
              ? { ...message, status: 'complete' }
              : message,
          ),
        ),
      );
    } catch (error) {
      if (controller.signal.aborted) {
        setGenerationError('Generation cancelled');
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, status: 'cancelled' }
              : message,
          ),
        );
      } else {
        setGenerationError(
          error instanceof AiApiError ? error.message : 'AI generation failed',
        );
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, status: 'error' }
              : message,
          ),
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
        ref={backgroundRef}
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
        {avatarMode === 'pngtuber' &&
        pngTuberIdleSource &&
        pngTuberTalkingSource ? (
          <div className="h-[80vh] w-full max-w-3xl">
            <PngTuberRenderer
              idleSource={pngTuberIdleSource}
              talkingSource={pngTuberTalkingSource}
              state={selectPngTuberState(
                generating && messages.at(-1)?.content !== '' ? 1 : 0,
                pngTuberSensitivity,
              )}
            />
          </div>
        ) : avatarMode === 'vrm' && vrmSource ? (
          <div className="h-[80vh] w-full max-w-3xl" aria-label="VRM renderer">
            <VrmRenderer
              source={vrmSource}
              control={{ ...avatarControl, thinking: generating }}
              presentation={avatarPresentation}
              speaking={generating && messages.at(-1)?.content !== ''}
              onLoaded={handleVrmLoaded}
              onError={handleVrmError}
            />
          </div>
        ) : (
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
        )}
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
            <select
              className="panel-button col-span-2"
              aria-label="Avatar mode"
              value={avatarMode}
              onChange={(event) =>
                setAvatarMode(event.target.value as 'vrm' | 'pngtuber')
              }
            >
              <option value="vrm">VRM</option>
              <option value="pngtuber">MotionPNGTuber</option>
            </select>
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
            <p
              className="col-span-2 text-xs text-white/60"
              data-testid="thinking-pose-state"
            >
              Thinking pose: {generating ? 'active' : 'idle'}
            </p>
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
            <button
              className="panel-button col-span-2"
              onClick={() => vrmInput.current?.click()}
            >
              Load VRM
            </button>
            <select
              className="panel-button col-span-2"
              aria-label="VRM model"
              value={selectedVrmId}
              onChange={(event) =>
                void selectVrm(event.target.value).catch((error: unknown) =>
                  setVrmStatus(
                    error instanceof Error
                      ? error.message
                      : 'Unable to select VRM model',
                  ),
                )
              }
            >
              <option value="">No VRM model</option>
              {vrmModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button
              className="panel-button col-span-2"
              disabled={!selectedVrmId}
              onClick={removeSelectedVrm}
            >
              Delete selected VRM
            </button>
            <select
              className="panel-button"
              aria-label="Avatar pose"
              value={avatarControl.pose}
              onChange={(event) =>
                setAvatarControl((current) => ({
                  ...current,
                  pose: event.target.value as AvatarControlState['pose'],
                }))
              }
            >
              {avatarPoses.map((pose) => (
                <option key={pose}>{pose}</option>
              ))}
            </select>
            <select
              className="panel-button"
              aria-label="Avatar motion"
              value={avatarControl.motion}
              onChange={(event) =>
                setAvatarControl((current) => ({
                  ...current,
                  motion: event.target.value as AvatarControlState['motion'],
                }))
              }
            >
              {avatarMotions.map((motion) => (
                <option key={motion}>{motion}</option>
              ))}
            </select>
            <select
              className="panel-button col-span-2"
              aria-label="Avatar emotion"
              value={avatarControl.emotion}
              onChange={(event) =>
                setAvatarControl((current) => ({
                  ...current,
                  emotion: event.target.value as AvatarControlState['emotion'],
                }))
              }
            >
              {avatarEmotions.map((emotion) => (
                <option key={emotion}>{emotion}</option>
              ))}
            </select>
            <label className="col-span-2 text-xs text-white/70">
              Position X: {avatarPresentation.positionX.toFixed(1)}
              <input
                className="w-full"
                aria-label="Avatar position X"
                type="range"
                min="-3"
                max="3"
                step="0.1"
                disabled={avatarPresentation.fixedPosition}
                value={avatarPresentation.positionX}
                onChange={(event) =>
                  updateAvatarPresentation(
                    'positionX',
                    event.target.valueAsNumber,
                  )
                }
              />
            </label>
            <label className="col-span-2 text-xs text-white/70">
              Position Y: {avatarPresentation.positionY.toFixed(1)}
              <input
                className="w-full"
                aria-label="Avatar position Y"
                type="range"
                min="-3"
                max="3"
                step="0.1"
                disabled={avatarPresentation.fixedPosition}
                value={avatarPresentation.positionY}
                onChange={(event) =>
                  updateAvatarPresentation(
                    'positionY',
                    event.target.valueAsNumber,
                  )
                }
              />
            </label>
            <label className="col-span-2 text-xs text-white/70">
              Rotation: {avatarPresentation.rotationY.toFixed(2)}
              <input
                className="w-full"
                aria-label="Avatar rotation"
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.05"
                disabled={avatarPresentation.fixedPosition}
                value={avatarPresentation.rotationY}
                onChange={(event) =>
                  updateAvatarPresentation(
                    'rotationY',
                    event.target.valueAsNumber,
                  )
                }
              />
            </label>
            <label className="col-span-2 text-xs text-white/70">
              Scale: {avatarPresentation.scale.toFixed(2)}
              <input
                className="w-full"
                aria-label="Avatar scale"
                type="range"
                min="0.25"
                max="3"
                step="0.05"
                disabled={avatarPresentation.fixedPosition}
                value={avatarPresentation.scale}
                onChange={(event) =>
                  updateAvatarPresentation('scale', event.target.valueAsNumber)
                }
              />
            </label>
            <label className="col-span-2 text-xs text-white/70">
              Ambient light: {avatarPresentation.ambientIntensity.toFixed(1)}
              <input
                className="w-full"
                aria-label="Avatar ambient light"
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={avatarPresentation.ambientIntensity}
                onChange={(event) =>
                  updateAvatarPresentation(
                    'ambientIntensity',
                    event.target.valueAsNumber,
                  )
                }
              />
            </label>
            <label className="col-span-2 text-xs text-white/70">
              Key light: {avatarPresentation.keyIntensity.toFixed(1)}
              <input
                className="w-full"
                aria-label="Avatar key light"
                type="range"
                min="0"
                max="8"
                step="0.1"
                value={avatarPresentation.keyIntensity}
                onChange={(event) =>
                  updateAvatarPresentation(
                    'keyIntensity',
                    event.target.valueAsNumber,
                  )
                }
              />
            </label>
            <label className="col-span-2 flex items-center gap-2 text-xs text-white/70">
              <input
                aria-label="Lock avatar position"
                type="checkbox"
                checked={avatarPresentation.fixedPosition}
                onChange={(event) =>
                  updateAvatarPresentation(
                    'fixedPosition',
                    event.target.checked,
                  )
                }
              />
              Lock transform position
            </label>
            <p className="col-span-2 text-xs text-white/60" aria-live="polite">
              {vrmStatus}
            </p>
            {avatarMode === 'pngtuber' && (
              <>
                <button
                  className="panel-button"
                  onClick={() => pngTuberIdleInput.current?.click()}
                >
                  Idle video
                </button>
                <button
                  className="panel-button"
                  onClick={() => pngTuberTalkingInput.current?.click()}
                >
                  Talking video
                </button>
                <label className="col-span-2 text-xs text-white/70">
                  Sensitivity: {pngTuberSensitivity.toFixed(2)}
                  <input
                    className="w-full"
                    aria-label="PNGTuber sensitivity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={pngTuberSensitivity}
                    onChange={(event) =>
                      setPngTuberSensitivity(event.target.valueAsNumber)
                    }
                  />
                </label>
                <p
                  className="col-span-2 text-xs text-white/60"
                  aria-live="polite"
                >
                  {pngTuberStatus}
                </p>
                <button
                  className="panel-button col-span-2"
                  disabled={!pngTuberIdleSource && !pngTuberTalkingSource}
                  onClick={() =>
                    void clearPngTuberModel()
                      .then(() => applyPngTuberModel())
                      .catch(() =>
                        setPngTuberStatus('Unable to clear PNGTuber videos'),
                      )
                  }
                >
                  Clear PNGTuber videos
                </button>
              </>
            )}
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
                {typeof message.content !== 'string' &&
                  message.content
                    .filter((item) => item.type === 'image')
                    .map((item, imageIndex) => (
                      // User-provided data URLs cannot use Next Image optimization.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${message.id}-image-${imageIndex}`}
                        src={item.data}
                        alt="Attached image"
                        className="mt-2 max-h-32 rounded-lg object-contain"
                      />
                    ))}
                {settings.reasoningVisible && message.reasoning && (
                  <details className="mt-2 rounded-lg bg-black/20 p-2 text-xs text-white/65">
                    <summary className="cursor-pointer font-semibold">
                      Reasoning
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap font-sans">
                      {message.reasoning}
                    </pre>
                  </details>
                )}
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
          {imageAttachment && (
            <button
              type="button"
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/20"
              aria-label="Remove attached image"
              onClick={() => setImageAttachment(undefined)}
            >
              {/* User-provided data URLs cannot use Next Image optimization. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageAttachment.data}
                alt={imageAttachment.name}
                className="h-full w-full object-cover"
              />
            </button>
          )}
          <button
            className="rounded-full bg-white/10 px-4 font-bold"
            type="button"
            aria-label="Attach image"
            onClick={() => imageAttachmentInput.current?.click()}
            disabled={generating}
          >
            +Image
          </button>
          {settings.videoVisible &&
            (settings.backgroundMode === 'webcam' ||
              settings.backgroundMode === 'capture') && (
              <button
                className="rounded-full bg-white/10 px-4 font-bold"
                type="button"
                aria-label="Capture current frame"
                onClick={captureBackgroundFrame}
                disabled={generating}
              >
                +Frame
              </button>
            )}
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
        ref={pngTuberIdleInput}
        className="hidden"
        type="file"
        accept="video/mp4,video/webm"
        onChange={(event) => choosePngTuberVideo(event, 'idle')}
      />
      <input
        ref={pngTuberTalkingInput}
        className="hidden"
        type="file"
        accept="video/mp4,video/webm"
        onChange={(event) => choosePngTuberVideo(event, 'talking')}
      />
      <input
        ref={vrmInput}
        className="hidden"
        type="file"
        accept=".vrm,model/gltf-binary"
        onChange={chooseVrm}
      />
      <input
        ref={imageAttachmentInput}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={chooseImageAttachment}
      />
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
