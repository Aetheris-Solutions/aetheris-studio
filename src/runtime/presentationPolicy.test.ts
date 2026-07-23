import { describe, expect, it } from 'vitest';
import {
  canvasDprRange,
  heroScrollProgress,
  isTabletPortraitPresentation,
  webglPresentationOpacity
} from './presentationPolicy';

describe('presentation policy', () => {
  it('keeps the phone poster composition and identifies portrait tablets', () => {
    expect(isTabletPortraitPresentation('mobile', 430)).toBe(false);
    expect(isTabletPortraitPresentation('mobile', 820)).toBe(true);
    expect(isTabletPortraitPresentation('desktop', 1024)).toBe(false);
  });

  it('caps touch hardware at the mobile DPR budget in every orientation', () => {
    expect(canvasDprRange('mobile', 0)).toEqual([1, 1.25]);
    expect(canvasDprRange('desktop', 5)).toEqual([1, 1.25]);
    expect(canvasDprRange('desktop', 0)).toEqual([1, 1.75]);
  });

  it('hands a portrait tablet smoothly to its poster before the settled frame', () => {
    const base = { duration: 4, webglOpacity: 1 };
    expect(webglPresentationOpacity({ ...base, time: 3.2 }, true)).toBe(1);
    expect(webglPresentationOpacity({ ...base, time: 3.55 }, true)).toBeGreaterThan(0);
    expect(webglPresentationOpacity({ ...base, time: 3.55 }, true)).toBeLessThan(1);
    expect(webglPresentationOpacity({ ...base, time: 3.9 }, true)).toBe(0);
    expect(webglPresentationOpacity({ ...base, time: 4 }, false)).toBe(1);
  });

  it('normalizes sticky hero geometry across the complete scroll range', () => {
    expect(heroScrollProgress(0, 2340, 900)).toBe(0);
    expect(heroScrollProgress(-720, 2340, 900)).toBe(0.5);
    expect(heroScrollProgress(-1440, 2340, 900)).toBe(1);
    expect(heroScrollProgress(120, 2340, 900)).toBe(0);
    expect(heroScrollProgress(-4000, 2340, 900)).toBe(1);
  });
});
