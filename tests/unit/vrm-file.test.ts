import {
  MAX_VRM_FILE_BYTES,
  validateVrmFile,
} from '@/features/avatar/vrm-file';

describe('VRM file validation', () => {
  it('accepts a non-empty VRM file case-insensitively', () => {
    expect(() =>
      validateVrmFile({ name: 'Avatar.VRM', size: 1024 }),
    ).not.toThrow();
  });

  it.each([
    [{ name: 'avatar.glb', size: 1024 }, 'Select a .vrm model file'],
    [{ name: 'avatar.vrm', size: 0 }, 'empty'],
    [{ name: 'avatar.vrm', size: MAX_VRM_FILE_BYTES + 1 }, '100 MB limit'],
  ] as const)('rejects unsafe input %#', (file, message) => {
    expect(() => validateVrmFile(file)).toThrow(message);
  });
});
