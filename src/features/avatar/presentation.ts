import { z } from 'zod';

const STORAGE_KEY = 'local-ai-tuber-vrm-presentation';

export const avatarPresentationSchema = z.object({
  positionX: z.number().min(-3).max(3),
  positionY: z.number().min(-3).max(3),
  rotationY: z.number().min(-Math.PI).max(Math.PI),
  scale: z.number().min(0.25).max(3),
  ambientIntensity: z.number().min(0).max(5),
  keyIntensity: z.number().min(0).max(8),
  fixedPosition: z.boolean(),
});

export type AvatarPresentation = z.infer<typeof avatarPresentationSchema>;

export const defaultAvatarPresentation: AvatarPresentation = {
  positionX: 0,
  positionY: 0,
  rotationY: 0,
  scale: 1,
  ambientIntensity: 1.5,
  keyIntensity: 2.5,
  fixedPosition: false,
};

export function readAvatarPresentation(): AvatarPresentation {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAvatarPresentation;
  try {
    const result = avatarPresentationSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : defaultAvatarPresentation;
  } catch {
    return defaultAvatarPresentation;
  }
}

export function writeAvatarPresentation(value: AvatarPresentation): void {
  const parsed = avatarPresentationSchema.parse(value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
}
