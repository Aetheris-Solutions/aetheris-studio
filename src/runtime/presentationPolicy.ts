import type { MotionProfileName, MotionSnapshot } from '../motion/controller';
import { clamp01, rangeProgress } from '../motion/controller';

export const TABLET_PORTRAIT_MIN_WIDTH = 600;
export const TABLET_POSTER_HANDOFF_START_OFFSET_SECONDS = 0.72;
export const TABLET_POSTER_HANDOFF_END_OFFSET_SECONDS = 0.12;

export function isTabletPortraitPresentation(profile: MotionProfileName, viewportWidth: number): boolean {
  return profile === 'mobile' && viewportWidth >= TABLET_PORTRAIT_MIN_WIDTH;
}

export function canvasDprRange(
  profile: MotionProfileName,
  maximumTouchPoints: number
): [number, number] {
  return profile === 'mobile' || maximumTouchPoints > 0 ? [1, 1.25] : [1, 1.75];
}

export function webglPresentationOpacity(
  snapshot: Pick<MotionSnapshot, 'time' | 'duration' | 'webglOpacity'>,
  tabletPortrait: boolean
): number {
  if (!tabletPortrait) return snapshot.webglOpacity;

  const handoff = rangeProgress(
    snapshot.time,
    snapshot.duration - TABLET_POSTER_HANDOFF_START_OFFSET_SECONDS,
    snapshot.duration - TABLET_POSTER_HANDOFF_END_OFFSET_SECONDS
  );
  return snapshot.webglOpacity * (1 - handoff);
}

/**
 * Convert the sticky hero's current geometry into its sole normalized motion
 * input. The start frame is reached when the section's top meets the viewport;
 * the final frame is reached as the sticky stage is released.
 */
export function heroScrollProgress(
  heroViewportTop: number,
  heroHeight: number,
  stickyStageHeight: number
): number {
  const scrollRange = Math.max(1, heroHeight - stickyStageHeight);
  return clamp01(-heroViewportTop / scrollRange);
}
