export const avatarPoses = ['neutral', 'wave', 'confident'] as const;
export const avatarMotions = ['still', 'idle'] as const;
export const avatarEmotions = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'surprised',
] as const;

export type AvatarPose = (typeof avatarPoses)[number];
export type AvatarMotion = (typeof avatarMotions)[number];
export type AvatarEmotion = (typeof avatarEmotions)[number];
export type AvatarBone =
  | 'hips'
  | 'chest'
  | 'head'
  | 'leftUpperArm'
  | 'leftLowerArm'
  | 'rightUpperArm'
  | 'rightLowerArm';

export interface AvatarControlState {
  pose: AvatarPose;
  motion: AvatarMotion;
  emotion: AvatarEmotion;
  thinking: boolean;
}

export interface AvatarFrame {
  bones: Partial<Record<AvatarBone, readonly [number, number, number]>>;
  blink: number;
}

export function computeLipSync(
  speaking: boolean,
  elapsedSeconds: number,
): number {
  if (!speaking) return 0;
  const primary = Math.sin(elapsedSeconds * 13) * 0.24;
  const secondary = Math.sin(elapsedSeconds * 7.3) * 0.12;
  return Math.min(1, Math.max(0.08, 0.42 + primary + secondary));
}

export function pointerToLookTarget(
  clientX: number,
  clientY: number,
  width: number,
  height: number,
): readonly [number, number, number] {
  const normalizedX = Math.min(
    1,
    Math.max(-1, (clientX / Math.max(width, 1)) * 2 - 1),
  );
  const normalizedY = Math.min(
    1,
    Math.max(-1, 1 - (clientY / Math.max(height, 1)) * 2),
  );
  return [normalizedX * 1.5, 1.35 + normalizedY, 3];
}

export function computeAvatarFrame(
  control: AvatarControlState,
  elapsedSeconds: number,
): AvatarFrame {
  const idle = control.motion === 'idle' ? Math.sin(elapsedSeconds * 1.6) : 0;
  const bones: AvatarFrame['bones'] = {
    hips: [0, 0, idle * 0.015],
    chest: [idle * 0.012, 0, -idle * 0.018],
    head: [0, idle * 0.025, 0],
    leftUpperArm: [0, 0, 1.25],
    rightUpperArm: [0, 0, -1.25],
  };

  if (control.thinking) {
    bones.head = [0.08, -0.14 + idle * 0.015, 0.1];
    bones.chest = [0.04, 0.05, -idle * 0.018];
    bones.rightUpperArm = [0.25, -0.2, -1.35];
    bones.rightLowerArm = [-0.15, 0.2, -1.8];
    bones.leftUpperArm = [0.1, 0, 1.05];
    bones.leftLowerArm = [0, 0, 1.15];
  } else if (control.pose === 'wave') {
    bones.rightUpperArm = [0.15, 0, -2.35];
    bones.rightLowerArm = [0, 0, -0.45 + Math.sin(elapsedSeconds * 5) * 0.25];
  } else if (control.pose === 'confident') {
    bones.leftUpperArm = [0.1, 0.1, 0.95];
    bones.rightUpperArm = [0.1, -0.1, -0.95];
    bones.leftLowerArm = [0, 0, 1.45];
    bones.rightLowerArm = [0, 0, -1.45];
    bones.chest = [-0.08, 0, -idle * 0.018];
  }

  const blinkPhase = elapsedSeconds % 4;
  const blink =
    control.motion === 'idle' && blinkPhase > 3.82
      ? Math.sin(((blinkPhase - 3.82) / 0.18) * Math.PI)
      : 0;
  return { bones, blink };
}
