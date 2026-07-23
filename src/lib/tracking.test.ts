import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_SCHEMA_VERSION, CONSENT_STORAGE_KEY, readConsent, type ConsentRecord } from './consent';
import { captureAttribution, trackQualificationEvent } from './tracking';

function installBrowser(analytics: boolean) {
  const values = new Map<string, string>();
  const setItem = vi.fn((key: string, value: string) => values.set(key, value));
  const removeItem = vi.fn((key: string) => values.delete(key));
  const record: ConsentRecord = {
    version: CONSENT_SCHEMA_VERSION,
    analytics,
    marketing: false,
    source: 'preferences',
    updatedAt: '2026-07-22T10:00:00.000Z',
    expiresAt: '2027-01-22T10:00:00.000Z'
  };
  if (analytics) values.set(CONSENT_STORAGE_KEY, JSON.stringify(record));

  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem,
    removeItem
  };
  const browserWindow = {
    localStorage,
    sessionStorage: {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn()
    },
    location: {
      hostname: 'aetherisstudio.com',
      href: 'https://aetherisstudio.com/?utm_source=google&email=private@example.com',
      origin: 'https://aetherisstudio.com',
      pathname: '/',
      search: '?utm_source=google&email=private@example.com'
    },
    dispatchEvent: vi.fn(),
    dataLayer: undefined as Array<Record<string, unknown>> | undefined
  };

  vi.stubGlobal('window', browserWindow);
  vi.stubGlobal('localStorage', localStorage);
  vi.stubGlobal('document', { referrer: 'https://example.com/path?private=value' });
  vi.stubGlobal('CustomEvent', class MockCustomEvent {
    constructor(public type: string, public options?: unknown) {}
  });

  return { values, setItem, removeItem, browserWindow };
}

afterEach(() => vi.unstubAllGlobals());

describe('consent-aware attribution and lifecycle tracking', () => {
  it('does not persist attribution or queue replayable events before analytics consent', () => {
    const browser = installBrowser(false);

    const attribution = captureAttribution();
    trackQualificationEvent('qualification_start', { surface: 'homepage' });

    expect(attribution.firstTouch).toEqual(attribution.currentTouch);
    expect(attribution.firstTouch).toEqual({ landingUrl: '', referrer: '', capturedAt: '' });
    expect(browser.setItem).not.toHaveBeenCalled();
    expect(browser.browserWindow.dataLayer).toBeUndefined();
    expect(browser.browserWindow.dispatchEvent).not.toHaveBeenCalled();
  });

  it('persists sanitised attribution and queues allowlisted events after consent', () => {
    const browser = installBrowser(true);

    expect(readConsent()?.analytics).toBe(true);
    const attribution = captureAttribution();
    trackQualificationEvent('qualification_start', { surface: 'homepage' });

    expect(browser.values.has('aetheris_studio_attribution_v1')).toBe(true);
    expect(attribution.firstTouch.landingUrl).toBe('https://aetherisstudio.com/');
    expect(attribution.firstTouch.referrer).toBe('https://example.com/path');
    expect(browser.browserWindow.dataLayer).toEqual([
      expect.objectContaining({ event: 'qualification_start', surface: 'homepage' })
    ]);
  });

  it('discards a first-touch attribution record older than 90 days', () => {
    const browser = installBrowser(true);
    browser.values.set('aetheris_studio_attribution_v1', JSON.stringify({
      landingUrl: 'https://aetherisstudio.com/old',
      referrer: '',
      capturedAt: '2000-01-01T00:00:00.000Z'
    }));

    const attribution = captureAttribution();

    expect(browser.removeItem).toHaveBeenCalledWith('aetheris_studio_attribution_v1');
    expect(attribution.firstTouch.landingUrl).toBe('https://aetherisstudio.com/');
  });
});
