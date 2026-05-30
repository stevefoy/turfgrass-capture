interface Vector3 {
  x?: number | null;
  y?: number | null;
  z?: number | null;
}

export interface MotionSample {
  acceleration?: Vector3 | null;
  rotation?: {
    alpha?: number | null;
    beta?: number | null;
    gamma?: number | null;
  } | null;
}

export interface MotionSummary {
  pitch: number | null;
  roll: number | null;
  yaw: number | null;
  motionRms: number | null;
  sampleCount: number;
}

function toDegrees(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value)
    ? (value * 180) / Math.PI
    : null;
}

function magnitude(vector?: Vector3 | null) {
  if (
    typeof vector?.x !== 'number' ||
    typeof vector.y !== 'number' ||
    typeof vector.z !== 'number'
  ) {
    return null;
  }

  return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

export function summarizeMotion(samples: MotionSample[]): MotionSummary {
  const lastSample = samples.at(-1);
  const magnitudes = samples
    .map((sample) => magnitude(sample.acceleration))
    .filter((value): value is number => value !== null);

  const motionRms =
    magnitudes.length > 0
      ? Math.sqrt(
          magnitudes.reduce((sum, value) => sum + value ** 2, 0) /
            magnitudes.length,
        )
      : null;

  return {
    pitch: toDegrees(lastSample?.rotation?.beta),
    roll: toDegrees(lastSample?.rotation?.gamma),
    yaw: toDegrees(lastSample?.rotation?.alpha),
    motionRms,
    sampleCount: samples.length,
  };
}

export function isCaptureStable(summary: MotionSummary) {
  return summary.motionRms === null || summary.motionRms < 0.45;
}
