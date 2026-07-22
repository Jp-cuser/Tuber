import { computeAvatarFrame } from '@/features/avatar/control';

describe('avatar control', () => {
  it('keeps the neutral still pose deterministic', () => {
    expect(
      computeAvatarFrame(
        { pose: 'neutral', motion: 'still', emotion: 'neutral' },
        10,
      ),
    ).toMatchObject({
      bones: { hips: [0, 0, 0], head: [0, 0, 0] },
      blink: 0,
    });
  });

  it('animates a wave using the upper and lower right arm', () => {
    const frame = computeAvatarFrame(
      { pose: 'wave', motion: 'idle', emotion: 'happy' },
      1,
    );
    expect(frame.bones.rightUpperArm?.[2]).toBe(-2.35);
    expect(frame.bones.rightLowerArm?.[2]).not.toBe(-0.45);
  });

  it('generates a bounded automatic blink during idle motion', () => {
    const frame = computeAvatarFrame(
      { pose: 'neutral', motion: 'idle', emotion: 'neutral' },
      3.91,
    );
    expect(frame.blink).toBeGreaterThan(0);
    expect(frame.blink).toBeLessThanOrEqual(1);
  });
});
