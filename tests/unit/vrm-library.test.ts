import 'fake-indexeddb/auto';
import {
  deleteVrmModel,
  getVrmModel,
  listVrmModels,
  readSelectedVrmModelId,
  saveVrmModel,
  writeSelectedVrmModelId,
} from '@/features/avatar/vrm-library';

describe('VRM model library', () => {
  beforeEach(async () => {
    localStorage.clear();
    const models = await listVrmModels();
    await Promise.all(models.map((model) => deleteVrmModel(model.id)));
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: jest.fn(() => '00000000-0000-4000-8000-000000000001'),
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('persists, lists, reads, and deletes a user supplied model', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'avatar.vrm');
    const saved = await saveVrmModel(file);

    expect(saved).toMatchObject({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'avatar.vrm',
      size: 3,
    });
    expect(await listVrmModels()).toEqual([
      expect.objectContaining({
        id: '00000000-0000-4000-8000-000000000001',
        name: 'avatar.vrm',
        size: 3,
      }),
    ]);
    expect((await getVrmModel(saved.id))?.data.byteLength).toBe(3);

    await deleteVrmModel(saved.id);
    expect(await listVrmModels()).toEqual([]);
  });

  it('persists and clears the selected model id', () => {
    writeSelectedVrmModelId('00000000-0000-4000-8000-000000000001');
    expect(readSelectedVrmModelId()).toBe(
      '00000000-0000-4000-8000-000000000001',
    );
    writeSelectedVrmModelId();
    expect(readSelectedVrmModelId()).toBeUndefined();
  });
});
