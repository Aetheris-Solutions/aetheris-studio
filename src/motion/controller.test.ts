import { describe, expect, it } from 'vitest';
import {
  advanceTimelineState,
  getMotionProfile,
  rangeProgress,
  sampleTimeline,
  settledSnapshot,
  smootherstep
} from './controller';

describe('hero motion controller', () => {
  it('uses a zero-velocity smootherstep with clamped endpoints', () => {
    expect(smootherstep(-1)).toBe(0);
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 8);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(2)).toBe(1);
    expect(rangeProgress(0.5, 0, 1)).toBeCloseTo(0.5, 8);
  });

  it('keeps the canonical mark uniformly scaled through both fidelity gates', () => {
    const desktop = sampleTimeline('desktop', 1.78);
    const mobile = sampleTimeline('mobile', 1.48);

    for (const snapshot of [desktop, mobile]) {
      expect(snapshot.isExactGeometry).toBe(true);
      expect(snapshot.logoRotationDeg).toBe(-90);
      expect(snapshot.logoScale).toBe(1);
      expect(snapshot.logoOpacity).toBe(1);
    }
  });

  it('starts architectural depth only after the exact gate', () => {
    const before = sampleTimeline('desktop', 1.779);
    const after = sampleTimeline('desktop', 1.9);

    expect(before.logoScale).toBe(1);
    expect(before.webglOpacity).toBe(0);
    expect(after.isExactGeometry).toBe(false);
    expect(after.logoScale).toBeGreaterThan(1);
    expect(after.webglOpacity).toBeGreaterThan(0);
  });

  it('resolves authored desktop and mobile durations independently', () => {
    expect(settledSnapshot('desktop').duration).toBe(4.8);
    expect(settledSnapshot('mobile').duration).toBe(4);
    expect(getMotionProfile(0.6)).toBe('mobile');
    expect(getMotionProfile(1)).toBe('desktop');
  });

  it('reveals live copy in the authored order', () => {
    const lcpAnchor = sampleTimeline('desktop', 1.72).copy;
    expect(lcpAnchor.titlePrimary).toBe(1);
    expect(lcpAnchor.titleSecondary).toBe(0);
    expect(lcpAnchor.body).toBe(0);

    const early = sampleTimeline('desktop', 3.14).copy;
    expect(early.eyebrow).toBeGreaterThan(early.body);
    expect(early.titlePrimary).toBeGreaterThan(early.actions);

    const final = settledSnapshot('mobile').copy;
    expect(Object.values(final).every((value) => value === 1)).toBe(true);
  });

  it('clamps deterministic timeline advancement at completion', () => {
    expect(advanceTimelineState({ elapsed: 4.7, complete: false }, 2, 'desktop')).toEqual({
      elapsed: 4.8,
      complete: true
    });
  });
});
