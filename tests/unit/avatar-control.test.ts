import {
  computeAvatarFrame,
  computeLipSync,
  pointerToLookTarget,
} from '@/features/avatar/control';

describe('avatar control', () => {
  it('keeps the neutral still pose deterministic', () => {
    expect(
      computeAvatarFrame(
        {
          pose: 'neutral',
          motion: 'still',
          emotion: 'neutral',
          thinking: false,
        },
        10,
      ),
    ).toMatchObject({
      bones: { hips: [0, 0, 0], head: [0, 0, 0] },
      blink: 0,
    });
  });

  it('animates a wave using the upper and lower right arm', () => {
    const frame = computeAvatarFrame(
      { pose: 'wave', motion: 'idle', emotion: 'happy', thinking: false },
      1,
    );
    expect(frame.bones.rightUpperArm?.[2]).toBe(-2.35);
    expect(frame.bones.rightLowerArm?.[2]).not.toBe(-0.45);
  });

  it('generates a bounded automatic blink during idle motion', () => {
    const frame = computeAvatarFrame(
      {
        pose: 'neutral',
        motion: 'idle',
        emotion: 'neutral',
        thinking: false,
      },
      3.91,
    );
    expect(frame.blink).toBeGreaterThan(0);
    expect(frame.blink).toBeLessThanOrEqual(1);
  });

  it('temporarily overrides the selected pose while thinking', () => {
    const frame = computeAvatarFrame(
      { pose: 'wave', motion: 'idle', emotion: 'neutral', thinking: true },
      1,
    );
    expect(frame.bones.head).toEqual([
      0.08,
      expect.closeTo(-0.14 + Math.sin(1.6) * 0.015),
      0.1,
    ]);
    expect(frame.bones.rightLowerArm).toEqual([-0.15, 0.2, -1.8]);
    expect(frame.bones.rightUpperArm?.[2]).not.toBe(-2.35);
  });

  it('drives the aa lip-sync weight only while speaking', () => {
    expect(computeLipSync(false, 1)).toBe(0);
    expect(computeLipSync(true, 1)).toBeGreaterThan(0);
    expect(computeLipSync(true, 1)).toBeLessThanOrEqual(1);
  });

  it('maps and clamps pointer positions to a safe look-at target', () => {
    expect(pointerToLookTarget(50, 25, 100, 100)).toEqual([0, 1.85, 3]);
    expect(pointerToLookTarget(1000, -1000, 100, 100)).toEqual([1.5, 2.35, 3]);
  });
});
