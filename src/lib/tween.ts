// Simple interpolation utility for step animation.

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function createStepTween(durationMs: number): {
  start: () => void;
  getProgress: () => number;
  isDone: () => boolean;
} {
  let startTime = 0;

  return {
    start() {
      startTime = performance.now();
    },
    getProgress() {
      if (startTime === 0) return 1;
      const elapsed = performance.now() - startTime;
      return easeOutQuad(Math.min(1, elapsed / durationMs));
    },
    isDone() {
      if (startTime === 0) return true;
      return performance.now() - startTime >= durationMs;
    },
  };
}
