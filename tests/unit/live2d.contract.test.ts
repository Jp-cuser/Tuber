import {
  Live2DAdapter,
  validateLive2DConfig,
  type Live2DModelHandle,
} from '@/features/avatar/live2d';

const config = {
  coreScriptUrl: '/live2d/live2dcubismcore.min.js',
  bridgeScriptUrl: '/live2d/runtime.js',
  modelUrl: '/live2d/avatar/avatar.model3.json',
};

describe('Live2D runtime bridge contract', () => {
  it('loads licensed local scripts in order and owns model disposal', async () => {
    const scripts: string[] = [];
    const model: Live2DModelHandle = {
      setExpression: jest.fn(),
      playMotion: jest.fn(),
      resize: jest.fn(),
      destroy: jest.fn(),
    };
    const adapter = new Live2DAdapter(
      config,
      'https://app.example',
      async (source) => {
        scripts.push(source);
      },
      () => ({
        version: 'fixture-1',
        loadModel: jest.fn(async () => model),
      }),
    );
    await expect(adapter.mount(document.createElement('canvas'))).resolves.toBe(
      model,
    );
    expect(scripts).toEqual([
      '/live2d/live2dcubismcore.min.js',
      '/live2d/runtime.js',
    ]);
    adapter.destroy();
    expect(model.destroy).toHaveBeenCalledTimes(1);
    await model.setExpression('happy');
    await model.playMotion('TapBody', 2);
    expect(model.setExpression).toHaveBeenCalledWith('happy');
    expect(model.playMotion).toHaveBeenCalledWith('TapBody', 2);
  });

  it.each([
    [
      { ...config, modelUrl: 'https://evil.example/a.model3.json' },
      'application origin',
    ],
    [{ ...config, modelUrl: '/live2d/avatar/model.json' }, '.model3.json'],
    [{ ...config, coreScriptUrl: '/live2d/core.txt' }, '.js'],
  ] as const)(
    'rejects unsafe or incompatible resources %#',
    (value, message) => {
      expect(() => validateLive2DConfig(value, 'https://app.example')).toThrow(
        message,
      );
    },
  );

  it('fails safely when the user-supplied runtime is missing', async () => {
    const adapter = new Live2DAdapter(
      config,
      'https://app.example',
      async () => undefined,
      () => undefined,
    );
    await expect(
      adapter.mount(document.createElement('canvas')),
    ).rejects.toThrow('runtime bridge is unavailable');
  });
});
