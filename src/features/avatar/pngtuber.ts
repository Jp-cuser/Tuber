export const MAX_PNGTUBER_VIDEO_BYTES = 200 * 1024 * 1024;
export const PNGTUBER_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const;

export type PngTuberState = 'idle' | 'talking';

export function validatePngTuberVideo(
  file: Pick<File, 'name' | 'size' | 'type'>,
): void {
  const extension = file.name.toLowerCase().split('.').pop();
  if (
    !PNGTUBER_VIDEO_TYPES.includes(
      file.type as (typeof PNGTUBER_VIDEO_TYPES)[number],
    ) ||
    !['mp4', 'webm'].includes(extension ?? '')
  )
    throw new Error('Select an MP4 or WebM video');
  if (file.size <= 0) throw new Error('The PNGTuber video is empty');
  if (file.size > MAX_PNGTUBER_VIDEO_BYTES)
    throw new Error('The PNGTuber video exceeds the 200 MB limit');
}

export function selectPngTuberState(
  activityLevel: number,
  sensitivity: number,
): PngTuberState {
  const safeLevel = Math.min(1, Math.max(0, activityLevel));
  const safeSensitivity = Math.min(1, Math.max(0, sensitivity));
  return safeLevel >= 1 - safeSensitivity ? 'talking' : 'idle';
}
