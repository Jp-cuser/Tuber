import { z } from 'zod';

export const live2dConfigSchema = z.object({
  coreScriptUrl: z.string().min(1),
  bridgeScriptUrl: z.string().min(1),
  modelUrl: z.string().min(1),
});

export type Live2DConfig = z.infer<typeof live2dConfigSchema>;

export interface Live2DModelHandle {
  setExpression(name: string): Promise<void> | void;
  playMotion(group: string, index?: number): Promise<void> | void;
  resize(width: number, height: number): void;
  destroy(): void;
}

export interface Live2DRuntimeBridge {
  version: string;
  loadModel(
    canvas: HTMLCanvasElement,
    modelUrl: string,
  ): Promise<Live2DModelHandle>;
}

declare global {
  interface Window {
    LocalAITuberLive2D?: Live2DRuntimeBridge;
  }
}

export function validateLocalLive2DUrl(
  value: string,
  expectedSuffix: string,
  origin: string,
): string {
  const url = new URL(value, origin);
  if (url.origin !== origin)
    throw new Error('Live2D resources must use the application origin');
  if (!url.pathname.toLowerCase().endsWith(expectedSuffix))
    throw new Error(`Live2D resource must end with ${expectedSuffix}`);
  return `${url.pathname}${url.search}`;
}

export function validateLive2DConfig(
  config: Live2DConfig,
  origin: string,
): Live2DConfig {
  const parsed = live2dConfigSchema.parse(config);
  return {
    coreScriptUrl: validateLocalLive2DUrl(parsed.coreScriptUrl, '.js', origin),
    bridgeScriptUrl: validateLocalLive2DUrl(
      parsed.bridgeScriptUrl,
      '.js',
      origin,
    ),
    modelUrl: validateLocalLive2DUrl(parsed.modelUrl, '.model3.json', origin),
  };
}

export function loadLocalScript(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-live2d-source="${CSS.escape(source)}"]`,
    );
    if (existing?.dataset.loaded === 'true') return resolve();
    const script = existing ?? document.createElement('script');
    script.src = source;
    script.async = true;
    script.dataset.live2dSource = source;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => reject(new Error(`Unable to load ${source}`)),
      {
        once: true,
      },
    );
    if (!existing) document.head.append(script);
  });
}

export class Live2DAdapter {
  private model?: Live2DModelHandle;

  constructor(
    private readonly config: Live2DConfig,
    private readonly origin: string,
    private readonly scriptLoader: (
      source: string,
    ) => Promise<void> = loadLocalScript,
    private readonly runtimeProvider: () =>
      | Live2DRuntimeBridge
      | undefined = () => window.LocalAITuberLive2D,
  ) {}

  async mount(canvas: HTMLCanvasElement): Promise<Live2DModelHandle> {
    const config = validateLive2DConfig(this.config, this.origin);
    await this.scriptLoader(config.coreScriptUrl);
    await this.scriptLoader(config.bridgeScriptUrl);
    const runtime = this.runtimeProvider();
    if (!runtime) throw new Error('Live2D runtime bridge is unavailable');
    this.model = await runtime.loadModel(canvas, config.modelUrl);
    return this.model;
  }

  destroy(): void {
    this.model?.destroy();
    this.model = undefined;
  }
}
