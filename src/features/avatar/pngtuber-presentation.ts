import { z } from 'zod';

const STORAGE_KEY = 'local-ai-tuber-pngtuber-presentation';

export const pngTuberPresentationSchema = z.object({
  sensitivity: z.number().min(0).max(1),
  chromaEnabled: z.boolean(),
  chromaColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  chromaTolerance: z.number().min(0).max(1),
  scale: z.number().min(0.25).max(3),
  offsetX: z.number().min(-500).max(500),
  offsetY: z.number().min(-500).max(500),
});

export type PngTuberPresentation = z.infer<typeof pngTuberPresentationSchema>;

export const defaultPngTuberPresentation: PngTuberPresentation = {
  sensitivity: 0.5,
  chromaEnabled: false,
  chromaColor: '#00b140',
  chromaTolerance: 0.2,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export function readPngTuberPresentation(): PngTuberPresentation {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPngTuberPresentation;
  try {
    const result = pngTuberPresentationSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : defaultPngTuberPresentation;
  } catch {
    return defaultPngTuberPresentation;
  }
}

export function writePngTuberPresentation(value: PngTuberPresentation): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(pngTuberPresentationSchema.parse(value)),
  );
}

export function hexToRgb(color: string): readonly [number, number, number] {
  const parsed = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (!parsed) throw new Error('Invalid chroma-key color');
  return [
    Number.parseInt(parsed[1], 16),
    Number.parseInt(parsed[2], 16),
    Number.parseInt(parsed[3], 16),
  ];
}

export function applyChromaKey(
  pixels: Uint8ClampedArray,
  color: readonly [number, number, number],
  tolerance: number,
): void {
  const threshold =
    Math.min(1, Math.max(0, tolerance)) * Math.sqrt(3 * 255 ** 2);
  for (let index = 0; index < pixels.length; index += 4) {
    const distance = Math.hypot(
      pixels[index] - color[0],
      pixels[index + 1] - color[1],
      pixels[index + 2] - color[2],
    );
    if (distance <= threshold) pixels[index + 3] = 0;
  }
}
