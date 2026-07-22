export const QUALIFICATION_FORM_VERSION = '2026-07-22';

export type QualificationEventName =
  | 'qualification_view'
  | 'qualification_start'
  | 'qualification_step_complete'
  | 'qualification_submit'
  | 'qualification_result'
  | 'cal_booking_click';

type SafeTrackingValue = string | number | boolean;

export type QualificationEventPayload = {
  surface?: 'homepage';
  step?: number;
  stepName?: 'contact' | 'commerce' | 'brief';
  outcome?: 'qualified' | 'review' | 'error';
  formVersion?: string;
};

export type AttributionTouch = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
  landingUrl: string;
  referrer: string;
  capturedAt: string;
};

export type AttributionSnapshot = {
  firstTouch: AttributionTouch;
  currentTouch: AttributionTouch;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, SafeTrackingValue>>;
  }
}

const ATTRIBUTION_STORAGE_KEY = 'aetheris_studio_attribution_v1';
const TRACKING_KEYS = new Set<keyof QualificationEventPayload>([
  'surface',
  'step',
  'stepName',
  'outcome',
  'formVersion'
]);

function truncate(value: string, maximum = 240): string {
  return value.trim().slice(0, maximum);
}

function knownSearchParameter(parameters: URLSearchParams, name: string): string | undefined {
  const value = parameters.get(name);
  return value ? truncate(value) : undefined;
}

/**
 * Attribution URLs intentionally omit query strings and fragments. Campaign
 * identifiers are captured separately; arbitrary query values can contain PII.
 */
function sanitiseUrl(value: string, fallback = ''): string {
  if (!value) return fallback;

  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return fallback;
    return `${parsed.origin}${parsed.pathname}`.slice(0, 500);
  } catch {
    return fallback;
  }
}

function currentTouch(): AttributionTouch {
  const parameters = new URLSearchParams(window.location.search);

  return {
    utmSource: knownSearchParameter(parameters, 'utm_source'),
    utmMedium: knownSearchParameter(parameters, 'utm_medium'),
    utmCampaign: knownSearchParameter(parameters, 'utm_campaign'),
    utmContent: knownSearchParameter(parameters, 'utm_content'),
    utmTerm: knownSearchParameter(parameters, 'utm_term'),
    gclid: knownSearchParameter(parameters, 'gclid'),
    wbraid: knownSearchParameter(parameters, 'wbraid'),
    gbraid: knownSearchParameter(parameters, 'gbraid'),
    landingUrl: sanitiseUrl(window.location.href, `${window.location.origin}${window.location.pathname}`),
    referrer: sanitiseUrl(document.referrer),
    capturedAt: new Date().toISOString()
  };
}

function isAttributionTouch(value: unknown): value is AttributionTouch {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AttributionTouch>;
  return typeof candidate.landingUrl === 'string'
    && typeof candidate.referrer === 'string'
    && typeof candidate.capturedAt === 'string';
}

function readFirstTouch(): AttributionTouch | null {
  try {
    const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isAttributionTouch(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function rememberFirstTouch(touch: AttributionTouch): void {
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // Attribution is useful context, never a form dependency.
  }
}

export function captureAttribution(): AttributionSnapshot {
  const touch = currentTouch();
  const storedFirstTouch = readFirstTouch();
  const firstTouch = storedFirstTouch ?? touch;
  if (!storedFirstTouch) rememberFirstTouch(firstTouch);

  return { firstTouch, currentTouch: touch };
}

/**
 * Pushes only an explicit, non-PII allowlist to the analytics layer. Contact,
 * company, URL, brief and campaign values must stay in the CRM submission.
 */
export function trackQualificationEvent(
  event: QualificationEventName,
  payload: QualificationEventPayload = {}
): void {
  if (typeof window === 'undefined') return;

  const safePayload: Record<string, SafeTrackingValue> = {
    event,
    form_version: QUALIFICATION_FORM_VERSION
  };

  for (const [key, value] of Object.entries(payload)) {
    if (!TRACKING_KEYS.has(key as keyof QualificationEventPayload)) continue;
    if (value === undefined || (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')) {
      continue;
    }
    safePayload[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] =
      typeof value === 'string' ? truncate(value, 80) : value;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(safePayload);
  window.dispatchEvent(new CustomEvent('aetheris:qualification', { detail: safePayload }));
}
