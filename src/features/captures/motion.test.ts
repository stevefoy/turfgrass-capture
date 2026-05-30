import { isCaptureStable, summarizeMotion } from './motion';
import { describe, expect, it } from 'vitest';

describe('summarizeMotion', () => {
  it('returns a stable empty summary when motion data is unavailable', () => {
    const summary = summarizeMotion([]);

    expect(summary).toEqual({
      pitch: null,
      roll: null,
      yaw: null,
      motionRms: null,
      sampleCount: 0,
    });
    expect(isCaptureStable(summary)).toBe(true);
  });

  it('converts the last orientation sample to degrees', () => {
    const summary = summarizeMotion([
      {
        acceleration: { x: 0.1, y: 0.2, z: 0.1 },
        rotation: {
          alpha: Math.PI,
          beta: Math.PI / 2,
          gamma: Math.PI / 4,
        },
      },
    ]);

    expect(summary.pitch).toBeCloseTo(90);
    expect(summary.roll).toBeCloseTo(45);
    expect(summary.yaw).toBeCloseTo(180);
  });

  it('flags a moving camera', () => {
    const summary = summarizeMotion([
      { acceleration: { x: 1, y: 1, z: 1 } },
      { acceleration: { x: 0.8, y: 1.2, z: 1 } },
    ]);

    expect(isCaptureStable(summary)).toBe(false);
  });
});
