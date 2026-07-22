import {
  applyChromaKey,
  defaultPngTuberPresentation,
  hexToRgb,
  readPngTuberPresentation,
  writePngTuberPresentation,
} from '@/features/avatar/pngtuber-presentation';

describe('PNGTuber presentation', () => {
  beforeEach(() => localStorage.clear());

  it('removes pixels within the chroma-key tolerance', () => {
    const pixels = new Uint8ClampedArray([0, 177, 64, 255, 255, 0, 0, 255]);
    applyChromaKey(pixels, hexToRgb('#00b140'), 0.05);
    expect([...pixels]).toEqual([0, 177, 64, 0, 255, 0, 0, 255]);
  });

  it('persists validated sensitivity, chroma key, and transforms', () => {
    const value = {
      ...defaultPngTuberPresentation,
      sensitivity: 0.8,
      chromaEnabled: true,
      chromaColor: '#ff00aa',
      chromaTolerance: 0.3,
      scale: 1.5,
      offsetX: 40,
      offsetY: -20,
    };
    writePngTuberPresentation(value);
    expect(readPngTuberPresentation()).toEqual(value);
  });

  it('falls back when stored settings are malformed or unsafe', () => {
    localStorage.setItem(
      'local-ai-tuber-pngtuber-presentation',
      JSON.stringify({ ...defaultPngTuberPresentation, scale: 100 }),
    );
    expect(readPngTuberPresentation()).toEqual(defaultPngTuberPresentation);
  });
});
