import {
  MAX_PNGTUBER_VIDEO_BYTES,
  selectPngTuberState,
  validatePngTuberVideo,
} from '@/features/avatar/pngtuber';

describe('MotionPNGTuber compatibility', () => {
  it.each([
    { name: 'idle.mp4', type: 'video/mp4', size: 10 },
    { name: 'talk.WEBM', type: 'video/webm', size: 10 },
  ])('accepts a supported video: $name', (file) => {
    expect(() => validatePngTuberVideo(file)).not.toThrow();
  });

  it.each([
    [{ name: 'avatar.mov', type: 'video/quicktime', size: 10 }, 'MP4 or WebM'],
    [{ name: 'avatar.mp4', type: 'video/mp4', size: 0 }, 'empty'],
    [
      {
        name: 'avatar.webm',
        type: 'video/webm',
        size: MAX_PNGTUBER_VIDEO_BYTES + 1,
      },
      '200 MB',
    ],
  ] as const)('rejects invalid video input %#', (file, message) => {
    expect(() => validatePngTuberVideo(file)).toThrow(message);
  });

  it('switches videos using a clamped sensitivity threshold', () => {
    expect(selectPngTuberState(0, 0.5)).toBe('idle');
    expect(selectPngTuberState(0.5, 0.5)).toBe('talking');
    expect(selectPngTuberState(0.2, 1)).toBe('talking');
    expect(selectPngTuberState(-1, -1)).toBe('idle');
  });
});
