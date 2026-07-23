export const CONSENT_STORAGE_KEY = 'aetheris_consent_v1';
export const CONSENT_SCHEMA_VERSION = 1;
export const GOOGLE_TAG_MANAGER_ID = 'GTM-5553RFJZ';
export const CONSENT_CHANGE_EVENT = 'aetheris:consentchange';
export const CONSENT_OPEN_EVENT = 'aetheris:open-consent';

const GTM_SCRIPT_ID = 'aetheris-google-tag-manager';
const ATTRIBUTION_STORAGE_KEY = 'aetheris_studio_attribution_v1';
const CONSENT_SESSION_OVERRIDE_KEY = 'aetheris_consent_session_override_v1';
const ATTRIBUTION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1_000;
const SAFE_FRAGMENT_IDS = new Set([
  '#top',
  '#hero-copy',
  '#proof',
  '#work',
  '#system',
  '#diagnostic',
  '#engagement',
  '#operating-layer',
  '#studio',
  '#atelier',
  '#team',
  '#qualification',
  '#contact',
  '#cookie-choices',
  '#case-thats-it',
  '#case-cielo',
  '#agent-google',
  '#agent-social',
  '#agent-lead-gen'
]);

export type ConsentChoices = {
  analytics: boolean;
  marketing: boolean;
};

export type ConsentSource = 'banner' | 'preferences';

export type ConsentRecord = ConsentChoices & {
  version: typeof CONSENT_SCHEMA_VERSION;
  updatedAt: string;
  expiresAt: string;
  source: ConsentSource;
};

type ConsentState = 'granted' | 'denied';

type GoogleConsentPayload = {
  analytics_storage: ConsentState;
  ad_storage: ConsentState;
  ad_user_data: ConsentState;
  ad_personalization: ConsentState;
  functionality_storage: ConsentState;
  personalization_storage: ConsentState;
  security_storage: ConsentState;
};

export type DataLayerEntry = Record<string, unknown> | IArguments;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: (...arguments_: unknown[]) => void;
    clarity?: (...arguments_: unknown[]) => void;
    __aetherisConsentDefaulted?: boolean;
    __aetherisGtmLoaded?: boolean;
    __aetherisConsentStorageListenerInstalled?: boolean;
  }
}

const DEFAULT_DENIED: GoogleConsentPayload = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  // Security storage is reserved for fraud prevention and does not activate a
  // Google tag. GTM itself is not requested until an optional purpose is granted.
  security_storage: 'granted'
};
const DENIED_CHOICES: ConsentChoices = { analytics: false, marketing: false };

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isCloudflarePagesPreviewHostname(hostname: string): boolean {
  const candidate = hostname.trim().toLowerCase();
  return candidate === 'aetheris-studio.pages.dev'
    || candidate.endsWith('.aetheris-studio.pages.dev');
}

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ConsentRecord>;
  return candidate.version === CONSENT_SCHEMA_VERSION
    && typeof candidate.analytics === 'boolean'
    && typeof candidate.marketing === 'boolean'
    && typeof candidate.updatedAt === 'string'
    && typeof candidate.expiresAt === 'string'
    && Number.isFinite(Date.parse(candidate.expiresAt))
    && (candidate.source === 'banner' || candidate.source === 'preferences');
}

function sixMonthsAfter(date: Date): string {
  const expiry = new Date(date);
  const originalDay = expiry.getUTCDate();
  expiry.setUTCDate(1);
  expiry.setUTCMonth(expiry.getUTCMonth() + 6);
  const lastDayOfTargetMonth = new Date(Date.UTC(
    expiry.getUTCFullYear(),
    expiry.getUTCMonth() + 1,
    0
  )).getUTCDate();
  expiry.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));
  return expiry.toISOString();
}

export function readConsent(): ConsentRecord | null {
  if (!isBrowser()) return null;

  let sessionOverride: string | null = null;
  try {
    sessionOverride = window.sessionStorage.getItem(CONSENT_SESSION_OVERRIDE_KEY);
  } catch {
    // A partitioned or blocked session store must not prevent a valid durable
    // local choice from being read.
  }

  if (sessionOverride) {
    try {
      const parsedOverride: unknown = JSON.parse(sessionOverride);
      if (isConsentRecord(parsedOverride) && Date.parse(parsedOverride.expiresAt) > Date.now()) {
        return { ...parsedOverride, marketing: false };
      }
    } catch {
      // Remove the malformed override below and continue to the durable store.
    }
    try {
      window.sessionStorage.removeItem(CONSENT_SESSION_OVERRIDE_KEY);
    } catch {
      // The malformed/expired override is ignored for this page even if the
      // browser will not allow it to be removed.
    }
  }

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    // Storage access failure is fail-closed without destroying another store.
    return null;
  }

  if (!stored) {
    try {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    } catch {
      // Optional attribution cleanup is best effort when storage is blocked.
    }
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    parsed = null;
  }

  if (!isConsentRecord(parsed) || Date.parse(parsed.expiresAt) <= Date.now()) {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    } catch {
      // The in-memory state still falls back to denied.
    }
    purgeAnalyticsStorage();
    purgeMarketingStorage();
    return null;
  }

  // Marketing is hard-disabled in the current release even if a stored value
  // was manually altered or came from a future/experimental UI.
  return { ...parsed, marketing: false };
}

function setAndVerify(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return storage.getItem(key) === value;
  } catch {
    return false;
  }
}

function removeAndVerify(storage: Storage, key: string): boolean {
  try {
    storage.removeItem(key);
    return storage.getItem(key) === null;
  } catch {
    return false;
  }
}

/**
 * Persist the same authority across local and tab-scoped storage. A denial is
 * reload-safe only when neither backend can resurrect an older grant.
 */
function persistConsentRecord(record: ConsentRecord): boolean {
  const serializedRecord = JSON.stringify(record);
  const localMatches = setAndVerify(window.localStorage, CONSENT_STORAGE_KEY, serializedRecord);
  const localSafe = localMatches
    || (!record.analytics && removeAndVerify(window.localStorage, CONSENT_STORAGE_KEY));

  if (localMatches) {
    const sessionSafe = removeAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY)
      || setAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY, serializedRecord);
    return sessionSafe;
  }

  const sessionMatches = setAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY, serializedRecord);
  if (record.analytics) return sessionMatches;

  const sessionSafe = sessionMatches
    || removeAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY);
  return localSafe && sessionSafe;
}

function parseCurrentConsent(serialized: string | null): ConsentRecord | null {
  if (!serialized) return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isConsentRecord(parsed) || Date.parse(parsed.expiresAt) <= Date.now()) return null;
    return { ...parsed, marketing: false };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return false;
}

function consentPayload(choices: ConsentChoices): GoogleConsentPayload {
  const analytics = choices.analytics ? 'granted' : 'denied';

  return {
    analytics_storage: analytics,
    // The current container contains GA4 and Microsoft Clarity only. No
    // advertising purpose is active, so every advertising signal remains denied.
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  };
}

function ensureGoogleQueue(): void {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag(..._arguments: unknown[]) {
    // Google Consent Mode expects the Arguments object, rather than a nested
    // array, in the data layer queue.
    window.dataLayer?.push(arguments);
  };
}

function setDefaultDenied(): void {
  if (!isBrowser() || window.__aetherisConsentDefaulted) return;
  ensureGoogleQueue();
  window.gtag?.('consent', 'default', DEFAULT_DENIED);
  window.__aetherisConsentDefaulted = true;
}

function updateGoogleConsent(choices: ConsentChoices): void {
  setDefaultDenied();
  window.gtag?.('consent', 'update', consentPayload(choices));
}

function sanitiseBrowserUrl(value: string, fallback = ''): string {
  if (!value) return fallback;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return fallback;
    return `${parsed.origin}${parsed.pathname}`.slice(0, 500);
  } catch {
    return fallback;
  }
}

function recognisedParameter(parameters: URLSearchParams, name: string, maximum = 240): string | undefined {
  const value = parameters.get(name)?.trim();
  return value ? value.slice(0, maximum) : undefined;
}

/**
 * Preserve the recognised first-touch fields locally before the address bar is
 * scrubbed. This runs only after a valid analytics choice exists, and never
 * overwrites a still-valid first touch.
 */
function preserveAttributionBeforeAnalytics(): void {
  try {
    const existing = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as { capturedAt?: unknown };
      const capturedAt = typeof parsed?.capturedAt === 'string' ? Date.parse(parsed.capturedAt) : Number.NaN;
      if (Number.isFinite(capturedAt) && Date.now() - capturedAt <= ATTRIBUTION_MAX_AGE_MS) return;
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    }

    const parameters = new URLSearchParams(window.location.search);
    const touch = {
      utmSource: recognisedParameter(parameters, 'utm_source', 180),
      utmMedium: recognisedParameter(parameters, 'utm_medium', 180),
      utmCampaign: recognisedParameter(parameters, 'utm_campaign'),
      utmContent: recognisedParameter(parameters, 'utm_content'),
      utmTerm: recognisedParameter(parameters, 'utm_term'),
      gclid: recognisedParameter(parameters, 'gclid', 256),
      wbraid: recognisedParameter(parameters, 'wbraid', 256),
      gbraid: recognisedParameter(parameters, 'gbraid', 256),
      landingUrl: sanitiseBrowserUrl(
        window.location.href,
        `${window.location.origin}${window.location.pathname}`
      ),
      referrer: sanitiseBrowserUrl(document.referrer),
      capturedAt: new Date().toISOString()
    };
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // Attribution is optional and must never prevent the consent choice.
  }
}

/**
 * Tags must never inherit arbitrary query values or fragments. Recognised
 * campaign fields have already been preserved above; only known in-page
 * anchors are allowed to remain in the visible URL.
 */
function prepareSafeAnalyticsContext(): void {
  const pageLocation = `${window.location.origin}${window.location.pathname}`;
  const pageReferrer = sanitiseBrowserUrl(document.referrer);
  ensureGoogleQueue();
  window.gtag?.('set', { page_location: pageLocation, page_referrer: pageReferrer });

  const safeHash = SAFE_FRAGMENT_IDS.has(window.location.hash) ? window.location.hash : '';
  if (window.location.search || window.location.hash !== safeHash) {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${safeHash}`);
  }
}

function loadTagManager(): void {
  if (
    !isBrowser()
    || isCloudflarePagesPreviewHostname(window.location.hostname)
    || window.__aetherisGtmLoaded
    || document.getElementById(GTM_SCRIPT_ID)
  ) return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js'
  });

  const script = document.createElement('script');
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GOOGLE_TAG_MANAGER_ID)}`;
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  document.head.appendChild(script);
  window.__aetherisGtmLoaded = true;
}

function expireCookie(name: string): void {
  const encodedName = encodeURIComponent(name);
  const hosts = new Set<string | null>([null]);
  const hostname = window.location.hostname;

  if (hostname && hostname !== 'localhost') {
    hosts.add(hostname);
    if (hostname === 'aetherisstudio.com' || hostname.endsWith('.aetherisstudio.com')) {
      hosts.add('.aetherisstudio.com');
    }
    if (isCloudflarePagesPreviewHostname(hostname)) {
      hosts.add('.aetheris-studio.pages.dev');
    }
  }

  for (const domain of hosts) {
    const domainAttribute = domain ? `; Domain=${domain}` : '';
    document.cookie = `${encodedName}=; Max-Age=0; Path=/${domainAttribute}; SameSite=Lax`;
  }
}

function purgeCookies(patterns: RegExp[]): void {
  const names = document.cookie
    .split(';')
    .map((part) => part.trim().split('=')[0])
    .filter(Boolean)
    .map((name) => {
      try {
        return decodeURIComponent(name);
      } catch {
        return name;
      }
    });

  for (const name of names) {
    if (patterns.some((pattern) => pattern.test(name))) expireCookie(name);
  }
}

function purgeAnalyticsStorage(): void {
  try {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Revocation remains effective for Google even if browser storage is blocked.
  }

  purgeCookies([
    /^_ga(?:$|_)/,
    /^_gid$/,
    /^_gat(?:$|_)/,
    /^_gac_/,
    /^AMP_TOKEN$/,
    /^_clck$/,
    /^_clsk$/
  ]);
}

function purgeMarketingStorage(): void {
  purgeCookies([/^_gcl_/, /^_gcl_aw$/, /^_gcl_dc$/, /^_fbp$/, /^_fbc$/]);
}

function removeTagManagerScript(): void {
  document.getElementById(GTM_SCRIPT_ID)?.remove();
  window.__aetherisGtmLoaded = false;
}

function hasActiveAnalyticsRuntime(): boolean {
  return Boolean(window.__aetherisGtmLoaded || document.getElementById(GTM_SCRIPT_ID));
}

/**
 * Clarity is loaded by GTM and therefore outlives the loader element. Notify its
 * current API and its explicit cookie-erasure fallback before any reload choice.
 */
function stopClarityBestEffort(): void {
  if (typeof window.clarity !== 'function') return;
  try {
    window.clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: 'denied'
    });
  } catch {
    // Continue to the explicit revocation fallback below.
  }
  try {
    window.clarity('consent', false);
  } catch {
    // Google is denied independently and the page will reload when safe.
  }
}

function synchroniseSessionForExternalDenial(record: ConsentRecord | null): boolean {
  if (record) {
    const serializedRecord = JSON.stringify({ ...record, analytics: false, marketing: false });
    return setAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY, serializedRecord)
      || removeAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY);
  }
  return removeAndVerify(window.sessionStorage, CONSENT_SESSION_OVERRIDE_KEY);
}

function handleConsentStorageChange(event: StorageEvent): void {
  if (event.key !== CONSENT_STORAGE_KEY && event.key !== null) return;

  const incoming = parseCurrentConsent(event.newValue);
  if (incoming?.analytics) return;

  const hadActiveRuntime = hasActiveAnalyticsRuntime();
  const reloadIsSafe = synchroniseSessionForExternalDenial(incoming);

  updateGoogleConsent(DENIED_CHOICES);
  stopClarityBestEffort();
  purgeAnalyticsStorage();
  purgeMarketingStorage();
  removeTagManagerScript();

  // Storage events never fire in the tab that made the write, and a reload does
  // not write consent, so this cannot create a cross-tab reload loop.
  if (hadActiveRuntime && reloadIsSafe) window.location.reload();
}

function installConsentStorageListener(): void {
  if (window.__aetherisConsentStorageListenerInstalled) return;
  window.addEventListener('storage', handleConsentStorageChange);
  window.__aetherisConsentStorageListenerInstalled = true;
}

export type ConsentUpdateResult = {
  record: ConsentRecord;
  requiresReload: boolean;
};

export function saveConsent(choices: ConsentChoices, source: ConsentSource): ConsentUpdateResult {
  const effectiveChoices: ConsentChoices = {
    analytics: choices.analytics,
    marketing: false
  };

  if (!isBrowser()) {
    const updatedAt = new Date();
    const record: ConsentRecord = {
      ...effectiveChoices,
      version: CONSENT_SCHEMA_VERSION,
      updatedAt: updatedAt.toISOString(),
      expiresAt: sixMonthsAfter(updatedAt),
      source
    };
    return { record, requiresReload: false };
  }

  const previous = readConsent();
  const hadLoadedTagManager = hasActiveAnalyticsRuntime();
  const updatedAt = new Date();
  const record: ConsentRecord = {
    analytics: effectiveChoices.analytics,
    marketing: false,
    version: CONSENT_SCHEMA_VERSION,
    updatedAt: updatedAt.toISOString(),
    expiresAt: sixMonthsAfter(updatedAt),
    source
  };

  const choiceSurvivesReload = persistConsentRecord(record);

  if (effectiveChoices.analytics) {
    preserveAttributionBeforeAnalytics();
    prepareSafeAnalyticsContext();
  }
  updateGoogleConsent(effectiveChoices);

  const analyticsRevoked = Boolean(previous?.analytics && !effectiveChoices.analytics);
  const marketingRevoked = Boolean(previous?.marketing);
  if (analyticsRevoked || !effectiveChoices.analytics) purgeAnalyticsStorage();
  purgeMarketingStorage();

  if (effectiveChoices.analytics) {
    loadTagManager();
  } else {
    if (hadLoadedTagManager) stopClarityBestEffort();
    removeTagManagerScript();
  }

  window.dispatchEvent(new CustomEvent<ConsentRecord>(CONSENT_CHANGE_EVENT, { detail: record }));

  return {
    record,
    // A reload tears down tag instances already running in memory. On the next
    // boot the denied defaults and saved choices precede any possible GTM load.
    requiresReload: choiceSurvivesReload
      && hadLoadedTagManager
      && (!effectiveChoices.analytics || analyticsRevoked || marketingRevoked)
  };
}

/**
 * Must run before React mounts. It queues denied defaults first, restores a
 * valid choice second, and only then may append the GTM network script.
 */
export function initialiseConsentManagement(): ConsentRecord | null {
  if (!isBrowser()) return null;
  setDefaultDenied();
  installConsentStorageListener();

  const stored = readConsent();
  if (!stored) return null;

  if (stored.analytics) {
    preserveAttributionBeforeAnalytics();
    prepareSafeAnalyticsContext();
  }
  updateGoogleConsent(stored);
  if (stored.analytics) loadTagManager();
  return stored;
}

export function requestConsentPreferences(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
