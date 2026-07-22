import {
  clearPngTuberModel,
  getPngTuberModel,
  savePngTuberVideo,
} from '@/features/avatar/pngtuber-library';

describe('PNGTuber model library', () => {
  beforeEach(() => clearPngTuberModel());

  it('persists both videos and supports replacement and deletion', async () => {
    await savePngTuberVideo(
      'idle',
      new File([new Uint8Array([1])], 'idle.webm', { type: 'video/webm' }),
    );
    await savePngTuberVideo(
      'talking',
      new File([new Uint8Array([2, 3])], 'talk.mp4', { type: 'video/mp4' }),
    );
    expect(await getPngTuberModel()).toMatchObject({
      id: 'default',
      idle: { name: 'idle.webm', size: 1 },
      talking: { name: 'talk.mp4', size: 2 },
    });
    await savePngTuberVideo(
      'idle',
      new File([new Uint8Array([4, 5, 6])], 'new-idle.mp4', {
        type: 'video/mp4',
      }),
    );
    expect((await getPngTuberModel())?.idle).toMatchObject({
      name: 'new-idle.mp4',
      size: 3,
    });
    await clearPngTuberModel();
    expect(await getPngTuberModel()).toBeUndefined();
  });
});
