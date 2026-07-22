import {
  defaultAvatarPresentation,
  readAvatarPresentation,
  writeAvatarPresentation,
} from '@/features/avatar/presentation';

describe('avatar presentation settings', () => {
  beforeEach(() => localStorage.clear());

  it('persists validated transforms, lighting, and the position lock', () => {
    const value = {
      ...defaultAvatarPresentation,
      positionX: 1.25,
      rotationY: 0.5,
      scale: 1.4,
      ambientIntensity: 2,
      keyIntensity: 4,
      fixedPosition: true,
    };
    writeAvatarPresentation(value);
    expect(readAvatarPresentation()).toEqual(value);
  });

  it.each([
    '{bad json}',
    JSON.stringify({ ...defaultAvatarPresentation, scale: 99 }),
    JSON.stringify({ ...defaultAvatarPresentation, fixedPosition: 'yes' }),
  ])('falls back safely for invalid stored settings: %s', (stored) => {
    localStorage.setItem('local-ai-tuber-vrm-presentation', stored);
    expect(readAvatarPresentation()).toEqual(defaultAvatarPresentation);
  });
});
