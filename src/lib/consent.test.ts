import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_SCHEMA_VERSION,
  CONSENT_STORAGE_KEY,
  GOOGLE_TAG_MANAGER_ID,
  initialiseConsentManagement,
  readConsent,
  saveConsent,
  type ConsentRecord,
  type DataLayerEntry
} from './consent';

type MockScript = {
  id: string;
  async: boolean;
  src: string;
  referrerPolicy: string;
  remove: () => void;
};

function futureRecord(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    version: CONSENT_SCHEMA_VERSION,
    analytics: false,
    marketing: false,
    source: 'preferences',
    updatedAt: '2026-07-22T10:00:00.000Z',
    expiresAt: '2027-01-22T10:00:00.000Z',
    ...overrides
  };
}

function command(entry: DataLayerEntry): unknown[] {
  return Array.from(entry as IArguments);
}

function installBrowser() {
  const values = new Map<string, string>();
  const getItem = vi.fn((key: string) => values.get(key) ?? null);
  const setItem = vi.fn((key: string, value: string) => values.set(key, value));
  const removeItem = vi.fn((key: string) => values.delete(key));
  const sessionValues = new Map<string, string>();
  const sessionGetItem = vi.fn((key: string) => sessionValues.get(key) ?? null);
  const sessionSetItem = vi.fn((key: string, value: string) => sessionValues.set(key, value));
  const sessionRemoveItem = vi.fn((key: string) => sessionValues.delete(key));
  const listeners = new Map<string, Set<(event: StorageEvent) => void>>();
  const scripts = new Map<string, MockScript>();
  const appendChild = vi.fn((script: MockScript) => {
    scripts.set(script.id, script);
    return script;
  });
  const cookieWrites: string[] = [];
  let cookieValue = '_ga=analytics; _clck=clarity; _gcl_aw=marketing';

  const location = {
    hostname: 'aetherisstudio.com',
    href: 'https://aetherisstudio.com/?utm_source=test&email=private@example.com#unsafe',
    origin: 'https://aetherisstudio.com',
    pathname: '/',
    search: '?utm_source=test&email=private@example.com',
    hash: '#unsafe',
    reload: vi.fn()
  };
  const history = {
    state: null,
    replaceState: vi.fn((_state: unknown, _title: string, nextUrl: string) => {
      const parsed = new URL(nextUrl, location.origin);
      location.href = parsed.href;
      location.pathname = parsed.pathname;
      location.search = parsed.search;
      location.hash = parsed.hash;
    })
  };

  const browserWindow = {
    localStorage: {
      getItem,
      setItem,
      removeItem
    },
    sessionStorage: {
      getItem: sessionGetItem,
      setItem: sessionSetItem,
      removeItem: sessionRemoveItem
    },
    location,
    history,
    addEventListener: vi.fn((type: string, listener: (event: StorageEvent) => void) => {
      const registered = listeners.get(type) ?? new Set();
      registered.add(listener);
      listeners.set(type, registered);
    }),
    dispatchEvent: vi.fn(),
    setTimeout,
    dataLayer: undefined as DataLayerEntry[] | undefined,
    gtag: undefined,
    clarity: undefined as ((...arguments_: unknown[]) => void) | undefined,
    __aetherisConsentDefaulted: undefined,
    __aetherisGtmLoaded: undefined
  };

  const browserDocument = {
    referrer: '',
    head: { appendChild },
    createElement: vi.fn(() => {
      const script: MockScript = {
        id: '',
        async: false,
        src: '',
        referrerPolicy: '',
        remove: () => scripts.delete(script.id)
      };
      return script;
    }),
    getElementById: (id: string) => scripts.get(id) ?? null,
    get cookie() {
      return cookieValue;
    },
    set cookie(value: string) {
      cookieWrites.push(value);
      cookieValue = value;
    }
  };

  vi.stubGlobal('window', browserWindow);
  vi.stubGlobal('document', browserDocument);
  vi.stubGlobal('CustomEvent', class MockCustomEvent<T> {
    type: string;
    detail?: T;
    constructor(type: string, options?: { detail?: T }) {
      this.type = type;
      this.detail = options?.detail;
    }
  });

  return {
    values,
    getItem,
    setItem,
    removeItem,
    sessionValues,
    sessionGetItem,
    sessionSetItem,
    sessionRemoveItem,
    listeners,
    appendChild,
    scripts,
    cookieWrites,
    browserWindow,
    history
  };
}

describe('consent management', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-22T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('queues denied defaults without requesting Google or Clarity before a choice', () => {
    const browser = installBrowser();

    expect(initialiseConsentManagement()).toBeNull();
    expect(browser.appendChild).not.toHaveBeenCalled();
    expect(browser.browserWindow.dataLayer).toHaveLength(1);

    const [action, mode, payload] = command(browser.browserWindow.dataLayer![0]);
    expect([action, mode]).toEqual(['consent', 'default']);
    expect(payload).toMatchObject({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  });

  it('loads GTM only after analytics consent and keeps every advertising signal denied', () => {
    const browser = installBrowser();
    initialiseConsentManagement();

    const { record } = saveConsent({ analytics: true, marketing: true }, 'preferences');
    const entries = browser.browserWindow.dataLayer!;
    const updateEntry = entries.find((entry) => {
      const [action, mode] = command(entry);
      return action === 'consent' && mode === 'update';
    });
    const [, , update] = command(updateEntry!);

    expect(record.analytics).toBe(true);
    expect(record.marketing).toBe(false);
    expect(record.expiresAt).toBe('2027-01-22T10:00:00.000Z');
    expect(update).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    expect(entries.find((entry) => !('length' in entry) && entry.event === 'gtm.js')).toMatchObject({ event: 'gtm.js' });
    expect(browser.appendChild).toHaveBeenCalledTimes(1);
    expect([...browser.scripts.values()][0]?.src).toBe(
      `https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_MANAGER_ID}`
    );
    expect(browser.history.replaceState).toHaveBeenCalled();
    expect(browser.browserWindow.location.search).toBe('');
    expect(browser.browserWindow.location.hash).toBe('');
    expect(JSON.parse(browser.values.get('aetheris_studio_attribution_v1') || '{}')).toMatchObject({
      utmSource: 'test',
      landingUrl: 'https://aetherisstudio.com/'
    });
    expect(browser.values.get('aetheris_studio_attribution_v1')).not.toContain('private@example.com');
  });

  it('expires a saved choice after six months and asks again', () => {
    const browser = installBrowser();
    browser.values.set(
      CONSENT_STORAGE_KEY,
      JSON.stringify(futureRecord({ expiresAt: '2026-07-22T09:59:59.000Z' }))
    );
    browser.values.set('aetheris_studio_attribution_v1', '{"first":true}');

    expect(readConsent()).toBeNull();
    expect(browser.removeItem).toHaveBeenCalledWith(CONSENT_STORAGE_KEY);
    expect(browser.removeItem).toHaveBeenCalledWith('aetheris_studio_attribution_v1');
  });

  it('drops incompatible consent and attribution records instead of reusing them', () => {
    const browser = installBrowser();
    browser.values.set(CONSENT_STORAGE_KEY, '{"version":0,"analytics":true}');
    browser.values.set('aetheris_studio_attribution_v1', '{"first":true}');

    expect(readConsent()).toBeNull();
    expect(browser.removeItem).toHaveBeenCalledWith(CONSENT_STORAGE_KEY);
    expect(browser.removeItem).toHaveBeenCalledWith('aetheris_studio_attribution_v1');
  });

  it('revokes an active runtime, clears attribution and requires a clean reload', () => {
    const browser = installBrowser();
    initialiseConsentManagement();
    saveConsent({ analytics: true, marketing: false }, 'banner');
    browser.values.set('aetheris_studio_attribution_v1', '{"first":true}');

    const result = saveConsent({ analytics: false, marketing: false }, 'preferences');

    expect(result.requiresReload).toBe(true);
    expect(browser.removeItem).toHaveBeenCalledWith('aetheris_studio_attribution_v1');
    expect(browser.scripts.size).toBe(0);
    expect(browser.browserWindow.__aetherisGtmLoaded).toBe(false);
  });

  it('expires analytics cookies on the project-scoped Cloudflare Pages parent domain', () => {
    const browser = installBrowser();
    browser.browserWindow.location.hostname = '59c04be7.aetheris-studio.pages.dev';
    initialiseConsentManagement();

    saveConsent({ analytics: false, marketing: false }, 'preferences');

    const pagesExpiry = browser.cookieWrites.find((write) => (
      write.includes('Domain=.aetheris-studio.pages.dev') && write.startsWith('_ga=')
    ));
    expect(pagesExpiry, browser.cookieWrites.join('\n')).toBe(
      '_ga=; Max-Age=0; Path=/; Domain=.aetheris-studio.pages.dev; SameSite=Lax'
    );
  });

  it('falls through to a valid local choice when session storage is blocked', () => {
    const browser = installBrowser();
    browser.values.set(CONSENT_STORAGE_KEY, JSON.stringify(futureRecord({ analytics: true })));
    browser.sessionGetItem.mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(readConsent()?.analytics).toBe(true);
    expect(browser.values.has(CONSENT_STORAGE_KEY)).toBe(true);
  });

  it('stops an active Clarity runtime without reloading into an unverifiable stored grant', () => {
    const browser = installBrowser();
    initialiseConsentManagement();
    saveConsent({ analytics: true, marketing: false }, 'banner');
    const clarity = vi.fn();
    browser.browserWindow.clarity = clarity;
    browser.getItem.mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    browser.setItem.mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    browser.sessionGetItem.mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    browser.sessionSetItem.mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    const result = saveConsent({ analytics: false, marketing: false }, 'preferences');

    expect(result.requiresReload).toBe(false);
    expect(clarity).toHaveBeenCalledWith('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: 'denied'
    });
    expect(clarity).toHaveBeenCalledWith('consent', false);
    expect(browser.scripts.size).toBe(0);
  });

  it('tears down and safely reloads an active runtime after cross-tab withdrawal', () => {
    const browser = installBrowser();
    initialiseConsentManagement();
    saveConsent({ analytics: true, marketing: false }, 'banner');
    const clarity = vi.fn();
    browser.browserWindow.clarity = clarity;
    const denial = futureRecord({ analytics: false, updatedAt: '2026-07-22T10:01:00.000Z' });
    const serializedDenial = JSON.stringify(denial);
    browser.values.set(CONSENT_STORAGE_KEY, serializedDenial);

    const storageListener = [...(browser.listeners.get('storage') ?? [])][0];
    storageListener?.({ key: CONSENT_STORAGE_KEY, newValue: serializedDenial } as StorageEvent);

    expect(clarity).toHaveBeenCalledWith('consent', false);
    expect(browser.scripts.size).toBe(0);
    expect(browser.browserWindow.location.reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload on a cross-tab denial when no analytics runtime is active', () => {
    const browser = installBrowser();
    initialiseConsentManagement();
    const denial = futureRecord({ analytics: false, updatedAt: '2026-07-22T10:01:00.000Z' });
    const serializedDenial = JSON.stringify(denial);
    browser.values.set(CONSENT_STORAGE_KEY, serializedDenial);

    const storageListener = [...(browser.listeners.get('storage') ?? [])][0];
    storageListener?.({ key: CONSENT_STORAGE_KEY, newValue: serializedDenial } as StorageEvent);

    expect(browser.browserWindow.location.reload).not.toHaveBeenCalled();
    expect(browser.appendChild).not.toHaveBeenCalled();
  });
});
