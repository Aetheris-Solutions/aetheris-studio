import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent
} from 'react';
import {
  captureAttribution,
  QUALIFICATION_FORM_VERSION,
  trackQualificationEvent,
  type AttributionSnapshot,
  type AttributionTouch
} from '../lib/tracking';
import { readConsent } from '../lib/consent';
import {
  qualificationRequestPayload,
  reuseOrCreateQualificationAttempt,
  type QualificationAttempt
} from '../lib/qualificationAttempt';

const BOOKING_URL = 'https://cal.com/aetherisstudio';
const PRIVACY_URL = '/privacy-policy/';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

const steps = [
  { number: 1, name: 'contact', label: 'You & the business', shortLabel: 'Business' },
  { number: 2, name: 'commerce', label: 'Commerce context', shortLabel: 'Context' },
  { number: 3, name: 'brief', label: 'The work ahead', shortLabel: 'Brief' }
] as const;

type StepName = (typeof steps)[number]['name'];
type SubmissionOutcome = 'qualified' | 'review';

type FormValues = {
  name: string;
  workEmail: string;
  role: string;
  company: string;
  storeUrl: string;
  platform: string;
  annualRevenue: string;
  monthlyAdSpend: string;
  primaryMarket: string;
  workstreams: string[];
  problem: string;
  trigger: string;
  timeline: string;
  projectBudget: string;
  ownerReadiness: string;
  constraint: string;
  privacyAccepted: boolean;
  marketingConsent: boolean;
  website: string;
};

type FieldErrors = Partial<Record<keyof FormValues | 'turnstile' | 'submit', string>>;

type TurnstileApi = {
  render(container: HTMLElement, options: {
    sitekey: string;
    theme: 'light';
    size: 'normal';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }): string;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScriptPromise: Promise<TurnstileApi> | null = null;

const initialValues: FormValues = {
  name: '',
  workEmail: '',
  role: '',
  company: '',
  storeUrl: '',
  platform: '',
  annualRevenue: '',
  monthlyAdSpend: '',
  primaryMarket: '',
  workstreams: [],
  problem: '',
  trigger: '',
  timeline: '',
  projectBudget: '',
  ownerReadiness: '',
  constraint: '',
  privacyAccepted: false,
  marketingConsent: false,
  website: ''
};

const workstreamOptions = [
  ['storefront', 'Storefront & Shopify'],
  ['measurement', 'Measurement & analytics'],
  ['demand', 'Paid growth, search & content'],
  ['conversion', 'Conversion & product discovery'],
  ['retention', 'Retention & CRM']
] as const;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-aetheris-turnstile]');
    const script = existing ?? document.createElement('script');

    const finish = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile did not initialise.'));
    };
    const fail = () => reject(new Error('Turnstile could not be loaded.'));

    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });

    if (!existing) {
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.aetherisTurnstile = 'true';
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}

function TurnstileField({
  siteKey,
  onToken,
  onError
}: {
  siteKey: string;
  onToken: (token: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'normal',
          callback: onToken,
          'expired-callback': () => onToken(''),
          'error-callback': () => {
            onToken('');
            onError('The security check needs another attempt.');
          }
        });
      })
      .catch(() => {
        if (!cancelled) onError('The security check could not load. Check your connection and try again.');
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onError, onToken, siteKey]);

  return <div className="qualification-turnstile" ref={containerRef} aria-label="Security check" />;
}

function createSubmissionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `aetheris-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function isWorkEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isStoreUrl(value: string): boolean {
  const candidate = value.trim();
  if (!candidate) return false;
  try {
    const parsed = new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
    return Boolean(parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

function validateStep(step: number, values: FormValues, turnstileToken: string): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 1) {
    if (!values.name.trim()) errors.name = 'Tell us who we are speaking with.';
    if (!isWorkEmail(values.workEmail)) errors.workEmail = 'Enter a valid work email address.';
    if (!values.role.trim()) errors.role = 'Add your role in the business.';
    if (!values.company.trim()) errors.company = 'Add the company or brand name.';
    if (!isStoreUrl(values.storeUrl)) errors.storeUrl = 'Enter a valid store or company URL.';
  }

  if (step === 2) {
    if (!values.platform) errors.platform = 'Select the current commerce platform.';
    if (!values.annualRevenue) errors.annualRevenue = 'Select the closest annual revenue range.';
    if (!values.monthlyAdSpend) errors.monthlyAdSpend = 'Select the closest monthly media spend range.';
    if (!values.primaryMarket.trim()) errors.primaryMarket = 'Add the primary market or region.';
  }

  if (step === 3) {
    if (values.workstreams.length === 0) errors.workstreams = 'Select at least one relevant workstream.';
    if (!values.problem.trim()) errors.problem = 'Describe the commercial problem you want to solve.';
    if (!values.trigger.trim()) errors.trigger = 'Tell us what has made this a priority now.';
    if (!values.timeline) errors.timeline = 'Select the intended timeline.';
    if (!values.projectBudget) errors.projectBudget = 'Select the available project budget.';
    if (!values.ownerReadiness) errors.ownerReadiness = 'Select the closest ownership and data-readiness state.';
    if (!values.constraint.trim()) errors.constraint = 'Name the constraint most likely to slow progress.';
    if (!values.privacyAccepted) errors.privacyAccepted = 'Please confirm that you have read the privacy notice.';
    if (TURNSTILE_SITE_KEY && !turnstileToken) errors.turnstile = 'Complete the security check before sending.';
  }

  return errors;
}

function submissionAttribution(snapshot: AttributionSnapshot): Omit<AttributionTouch, 'capturedAt'> {
  const { capturedAt: _capturedAt, ...attribution } = snapshot.firstTouch;
  return attribution;
}

function firstErrorMessage(errors: FieldErrors): string {
  return Object.values(errors).find(Boolean) ?? 'Review the highlighted fields.';
}

function withoutErrors(current: FieldErrors, ...fields: Array<keyof FieldErrors>): FieldErrors {
  const next = { ...current };
  for (const field of fields) delete next[field];
  return next;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <span className="qualification-field-error" id={id}>{message}</span>;
}

export function QualificationForm() {
  const idPrefix = useId();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<SubmissionOutcome | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  const attemptRef = useRef<QualificationAttempt | null>(null);

  const activeStep = steps[step - 1];
  const stepTitleId = `${idPrefix}-step-title`;
  const stepDescriptionId = `${idPrefix}-step-description`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const markViewed = () => {
      if (viewedRef.current) return;
      viewedRef.current = true;
      trackQualificationEvent('qualification_view', { surface: 'homepage' });
    };

    if (!('IntersectionObserver' in window)) {
      markViewed();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      markViewed();
      observer.disconnect();
    }, { threshold: 0.05 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const startTracking = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackQualificationEvent('qualification_start', {
      surface: 'homepage',
      step: 1,
      stepName: 'contact'
    });
  };

  const setTextValue = (field: keyof FormValues) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    attemptRef.current = null;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => withoutErrors(current, field, 'submit'));
  };

  const setBooleanValue = (field: 'privacyAccepted' | 'marketingConsent') => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    attemptRef.current = null;
    setValues((current) => ({ ...current, [field]: event.target.checked }));
    setErrors((current) => withoutErrors(current, field, 'submit'));
  };

  const toggleWorkstream = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;
    attemptRef.current = null;
    setValues((current) => ({
      ...current,
      workstreams: checked
        ? [...current.workstreams, value]
        : current.workstreams.filter((workstream) => workstream !== value)
    }));
    setErrors((current) => withoutErrors(current, 'workstreams', 'submit'));
  };

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    setErrors({});
    requestAnimationFrame(() => stepHeadingRef.current?.focus({ preventScroll: true }));
  };

  const completeStep = () => {
    const nextErrors = validateStep(step, values, turnstileToken);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    trackQualificationEvent('qualification_step_complete', {
      surface: 'homepage',
      step,
      stepName: activeStep.name
    });
    goToStep(step + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateStep(3, values, turnstileToken);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setErrors({});
    trackQualificationEvent('qualification_step_complete', {
      surface: 'homepage',
      step: 3,
      stepName: 'brief'
    });
    trackQualificationEvent('qualification_submit', {
      surface: 'homepage',
      step: 3,
      stepName: 'brief'
    });

    const analyticsConsent = readConsent();
    const analyticsGranted = analyticsConsent?.analytics === true;
    const attemptKey = JSON.stringify({ values, consent: analyticsConsent });
    const attempt = reuseOrCreateQualificationAttempt(attemptRef.current, attemptKey, () => {
      const privacyAcceptedAt = new Date().toISOString();
      return {
        submissionId: createSubmissionId(),
        ...values,
        privacyVersion: QUALIFICATION_FORM_VERSION,
        privacyAcceptedAt,
        marketingConsentAt: values.marketingConsent ? privacyAcceptedAt : '',
        marketingConsentVersion: QUALIFICATION_FORM_VERSION,
        marketingConsentSource: 'website_qualification',
        analyticsConsent: analyticsGranted,
        analyticsConsentAt: analyticsGranted ? analyticsConsent.updatedAt : '',
        analyticsConsentVersion: analyticsGranted ? String(analyticsConsent.version) : '',
        analyticsConsentSource: analyticsGranted ? analyticsConsent.source : '',
        attribution: analyticsGranted ? submissionAttribution(captureAttribution()) : null
      };
    });
    attemptRef.current = attempt;
    const payload = qualificationRequestPayload(attempt, turnstileToken);

    try {
      const response = await fetch('/api/qualification', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body: unknown = await response.json().catch(() => null);
      const status = body && typeof body === 'object' && 'status' in body
        ? (body as { status?: unknown }).status
        : null;

      if (!response.ok || (status !== 'qualified' && status !== 'review')) {
        throw new Error('Submission was not accepted.');
      }

      attemptRef.current = null;
      setOutcome(status);
      trackQualificationEvent('qualification_result', {
        surface: 'homepage',
        outcome: status,
        formVersion: QUALIFICATION_FORM_VERSION
      });
      requestAnimationFrame(() => sectionRef.current?.focus({ preventScroll: true }));
    } catch {
      setErrors({ submit: 'We could not send the brief. Check your connection and try again, or email info@aetherisstudio.com.' });
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      trackQualificationEvent('qualification_result', {
        surface: 'homepage',
        outcome: 'error',
        formVersion: QUALIFICATION_FORM_VERSION
      });
      if (TURNSTILE_SITE_KEY) {
        setTurnstileToken('');
        setTurnstileResetKey((current) => current + 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldIds = useMemo(() => ({
    name: `${idPrefix}-name`,
    workEmail: `${idPrefix}-email`,
    role: `${idPrefix}-role`,
    company: `${idPrefix}-company`,
    storeUrl: `${idPrefix}-store-url`,
    platform: `${idPrefix}-platform`,
    annualRevenue: `${idPrefix}-revenue`,
    monthlyAdSpend: `${idPrefix}-ad-spend`,
    primaryMarket: `${idPrefix}-market`,
    workstreams: `${idPrefix}-workstreams`,
    problem: `${idPrefix}-problem`,
    trigger: `${idPrefix}-trigger`,
    timeline: `${idPrefix}-timeline`,
    projectBudget: `${idPrefix}-budget`,
    ownerReadiness: `${idPrefix}-readiness`,
    constraint: `${idPrefix}-constraint`,
    privacyAccepted: `${idPrefix}-privacy`,
    marketingConsent: `${idPrefix}-marketing`,
    website: `${idPrefix}-website`
  }), [idPrefix]);

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) setErrors((current) => withoutErrors(current, 'turnstile'));
  }, []);

  const handleTurnstileError = useCallback((message: string) => {
    setErrors((current) => ({ ...current, turnstile: message }));
  }, []);

  if (outcome) {
    const qualified = outcome === 'qualified';
    return (
      <section
        className={`qualification qualification--result qualification--${outcome}`}
        id="qualification"
        data-header-tone="light"
        ref={sectionRef}
        tabIndex={-1}
        aria-labelledby="qualification-result-title"
      >
        <div className="qualification-result" role="status" aria-live="polite">
          <p className="section-kicker section-kicker--dark">Brief received</p>
          <span className="qualification-result-index" aria-hidden="true">{qualified ? '01' : '02'}</span>
          <h2 id="qualification-result-title">
            {qualified ? <>There appears to be a fit.<br /><em>Choose a time.</em></> : <>Your brief is with us.<br /><em>A person reviews it next.</em></>}
          </h2>
          <p>
            {qualified
              ? 'Your context matches the kind of commerce work we are set up to discuss. Book a 30-minute fit call with the team.'
              : 'The automated screen does not make a rejection decision. We will review the context and reply personally with the most useful next step.'}
          </p>
          {qualified ? (
            <a
              className="button-ink button-ink--large qualification-booking-link"
              href={BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackQualificationEvent('cal_booking_click', {
                surface: 'homepage',
                outcome: 'qualified',
                formVersion: QUALIFICATION_FORM_VERSION
              })}
            >
              Book the Commerce Growth Call <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p className="qualification-result-note">
              Expect a reply at your work email. If the matter is time-sensitive, write to{' '}
              <a href="mailto:info@aetherisstudio.com">info@aetherisstudio.com</a>.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="qualification"
      id="qualification"
      data-header-tone="light"
      ref={sectionRef}
      aria-labelledby="qualification-title"
    >
      <div className="qualification-intro" data-reveal>
        <p className="section-kicker section-kicker--dark">Start with fit</p>
        <h2 id="qualification-title">Bring us the constraint.<br /><em>We will tell you if we can move it.</em></h2>
        <p>
          A short commercial brief before a call. It gives both sides enough context to make the first conversation useful.
        </p>
        <div className="qualification-intro-note">
          <span>03 steps</span>
          <span>About 4 minutes</span>
          <span>Reviewed by a person</span>
        </div>
      </div>

      <div className="qualification-panel" data-reveal>
        <ol className="qualification-progress" aria-label="Qualification progress">
          {steps.map((item) => (
            <li
              key={item.number}
              data-state={item.number === step ? 'current' : item.number < step ? 'complete' : 'upcoming'}
              aria-current={item.number === step ? 'step' : undefined}
            >
              <span>{String(item.number).padStart(2, '0')}</span>
              <strong>{item.shortLabel}</strong>
            </li>
          ))}
        </ol>

        <form
          className="qualification-form"
          data-clarity-mask="true"
          noValidate
          onFocusCapture={startTracking}
          onSubmit={handleSubmit}
          aria-describedby={stepDescriptionId}
        >
          <div
            className="qualification-error-summary"
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
            hidden={!Object.values(errors).some(Boolean)}
          >
            <strong>There is something to review.</strong>
            <span>{firstErrorMessage(errors)}</span>
          </div>

          <div className="qualification-step-heading">
            <span>Step {step} of {steps.length}</span>
            <h3 id={stepTitleId} ref={stepHeadingRef} tabIndex={-1}>{activeStep.label}</h3>
            <p id={stepDescriptionId}>
              {step === 1 && 'The person and business behind the request.'}
              {step === 2 && 'A few ranges are enough. No sensitive financial documents are requested.'}
              {step === 3 && 'What needs to change, why now, and who can move the work.'}
            </p>
          </div>

          <fieldset className="qualification-fields" hidden={step !== 1} disabled={step !== 1} aria-labelledby={stepTitleId}>
            <legend className="sr-only">Your contact and company details</legend>
            <label className="qualification-field" htmlFor={fieldIds.name}>
              <span>Your name <i>Required</i></span>
              <input
                id={fieldIds.name}
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={setTextValue('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${fieldIds.name}-error` : undefined}
              />
              <FieldError id={`${fieldIds.name}-error`} message={errors.name} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.workEmail}>
              <span>Work email <i>Required</i></span>
              <input
                id={fieldIds.workEmail}
                name="workEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.workEmail}
                onChange={setTextValue('workEmail')}
                aria-invalid={Boolean(errors.workEmail)}
                aria-describedby={errors.workEmail ? `${fieldIds.workEmail}-error` : undefined}
              />
              <FieldError id={`${fieldIds.workEmail}-error`} message={errors.workEmail} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.role}>
              <span>Your role <i>Required</i></span>
              <input
                id={fieldIds.role}
                name="role"
                type="text"
                autoComplete="organization-title"
                value={values.role}
                onChange={setTextValue('role')}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? `${fieldIds.role}-error` : undefined}
              />
              <FieldError id={`${fieldIds.role}-error`} message={errors.role} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.company}>
              <span>Company or brand <i>Required</i></span>
              <input
                id={fieldIds.company}
                name="company"
                type="text"
                autoComplete="organization"
                value={values.company}
                onChange={setTextValue('company')}
                aria-invalid={Boolean(errors.company)}
                aria-describedby={errors.company ? `${fieldIds.company}-error` : undefined}
              />
              <FieldError id={`${fieldIds.company}-error`} message={errors.company} />
            </label>

            <label className="qualification-field qualification-field--wide" htmlFor={fieldIds.storeUrl}>
              <span>Store or company URL <i>Required</i></span>
              <input
                id={fieldIds.storeUrl}
                name="storeUrl"
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="yourbrand.com"
                value={values.storeUrl}
                onChange={setTextValue('storeUrl')}
                aria-invalid={Boolean(errors.storeUrl)}
                aria-describedby={errors.storeUrl ? `${fieldIds.storeUrl}-error` : undefined}
              />
              <FieldError id={`${fieldIds.storeUrl}-error`} message={errors.storeUrl} />
            </label>
          </fieldset>

          <fieldset className="qualification-fields" hidden={step !== 2} disabled={step !== 2} aria-labelledby={stepTitleId}>
            <legend className="sr-only">Your commerce context</legend>
            <label className="qualification-field" htmlFor={fieldIds.platform}>
              <span>Commerce platform <i>Required</i></span>
              <select
                id={fieldIds.platform}
                name="platform"
                value={values.platform}
                onChange={setTextValue('platform')}
                aria-invalid={Boolean(errors.platform)}
                aria-describedby={errors.platform ? `${fieldIds.platform}-error` : undefined}
              >
                <option value="">Select one</option>
                <option value="shopify">Shopify</option>
                <option value="shopify-plus">Shopify Plus</option>
                <option value="headless">Headless commerce</option>
                <option value="woocommerce">WooCommerce</option>
                <option value="adobe-commerce">Adobe Commerce</option>
                <option value="custom">Custom or other</option>
                <option value="not-sure">Not sure</option>
              </select>
              <FieldError id={`${fieldIds.platform}-error`} message={errors.platform} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.annualRevenue}>
              <span>Annual business revenue <i>Required</i></span>
              <select
                id={fieldIds.annualRevenue}
                name="annualRevenue"
                value={values.annualRevenue}
                onChange={setTextValue('annualRevenue')}
                aria-invalid={Boolean(errors.annualRevenue)}
                aria-describedby={errors.annualRevenue ? `${fieldIds.annualRevenue}-error` : `${fieldIds.annualRevenue}-hint`}
              >
                <option value="">Select a range</option>
                <option value="under-500k">Under €500k</option>
                <option value="500k-1m">€500k–€1m</option>
                <option value="1m-5m">€1m–€5m</option>
                <option value="5m-20m">€5m–€20m</option>
                <option value="20m-plus">€20m+</option>
                <option value="confidential">Prefer not to say</option>
              </select>
              <small id={`${fieldIds.annualRevenue}-hint`}>Online and retail combined.</small>
              <FieldError id={`${fieldIds.annualRevenue}-error`} message={errors.annualRevenue} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.monthlyAdSpend}>
              <span>Monthly paid-media spend <i>Required</i></span>
              <select
                id={fieldIds.monthlyAdSpend}
                name="monthlyAdSpend"
                value={values.monthlyAdSpend}
                onChange={setTextValue('monthlyAdSpend')}
                aria-invalid={Boolean(errors.monthlyAdSpend)}
                aria-describedby={errors.monthlyAdSpend ? `${fieldIds.monthlyAdSpend}-error` : undefined}
              >
                <option value="">Select a range</option>
                <option value="none">None today</option>
                <option value="under-1k">Under €1k</option>
                <option value="1k-5k">€1k–€5k</option>
                <option value="5k-20k">€5k–€20k</option>
                <option value="20k-50k">€20k–€50k</option>
                <option value="50k-plus">€50k+</option>
              </select>
              <FieldError id={`${fieldIds.monthlyAdSpend}-error`} message={errors.monthlyAdSpend} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.primaryMarket}>
              <span>Primary market or region <i>Required</i></span>
              <input
                id={fieldIds.primaryMarket}
                name="primaryMarket"
                type="text"
                autoComplete="country-name"
                placeholder="e.g. Italy, DACH, EU"
                value={values.primaryMarket}
                onChange={setTextValue('primaryMarket')}
                aria-invalid={Boolean(errors.primaryMarket)}
                aria-describedby={errors.primaryMarket ? `${fieldIds.primaryMarket}-error` : undefined}
              />
              <FieldError id={`${fieldIds.primaryMarket}-error`} message={errors.primaryMarket} />
            </label>
          </fieldset>

          <fieldset className="qualification-fields qualification-fields--brief" hidden={step !== 3} disabled={step !== 3} aria-labelledby={stepTitleId}>
            <legend className="sr-only">The work ahead</legend>
            <fieldset
              className="qualification-choice-group qualification-field--wide"
              aria-describedby={errors.workstreams ? `${fieldIds.workstreams}-error` : `${fieldIds.workstreams}-hint`}
            >
              <legend>Relevant workstreams <i>Choose all that apply</i></legend>
              <small id={`${fieldIds.workstreams}-hint`}>This does not lock the eventual scope.</small>
              <div className="qualification-check-grid">
                {workstreamOptions.map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="checkbox"
                      name="workstreams"
                      value={value}
                      checked={values.workstreams.includes(value)}
                      onChange={toggleWorkstream}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <FieldError id={`${fieldIds.workstreams}-error`} message={errors.workstreams} />
            </fieldset>

            <label className="qualification-field qualification-field--wide" htmlFor={fieldIds.problem}>
              <span>The commercial problem <i>Required</i></span>
              <textarea
                id={fieldIds.problem}
                name="problem"
                rows={4}
                maxLength={800}
                placeholder="What is happening, and what should be happening instead?"
                value={values.problem}
                onChange={setTextValue('problem')}
                aria-invalid={Boolean(errors.problem)}
                aria-describedby={errors.problem
                  ? `${fieldIds.problem}-privacy-hint ${fieldIds.problem}-error`
                  : `${fieldIds.problem}-privacy-hint`}
              />
              <small id={`${fieldIds.problem}-privacy-hint`}>Do not include payment data, health or criminal-offence data, or confidential personal information about other people.</small>
              <FieldError id={`${fieldIds.problem}-error`} message={errors.problem} />
            </label>

            <label className="qualification-field qualification-field--wide" htmlFor={fieldIds.trigger}>
              <span>Why now? <i>Required</i></span>
              <textarea
                id={fieldIds.trigger}
                name="trigger"
                rows={3}
                maxLength={240}
                placeholder="A launch, plateau, change of team, missed target, new market…"
                value={values.trigger}
                onChange={setTextValue('trigger')}
                aria-invalid={Boolean(errors.trigger)}
                aria-describedby={errors.trigger ? `${fieldIds.trigger}-error` : undefined}
              />
              <FieldError id={`${fieldIds.trigger}-error`} message={errors.trigger} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.timeline}>
              <span>Intended start <i>Required</i></span>
              <select
                id={fieldIds.timeline}
                name="timeline"
                value={values.timeline}
                onChange={setTextValue('timeline')}
                aria-invalid={Boolean(errors.timeline)}
                aria-describedby={errors.timeline ? `${fieldIds.timeline}-error` : undefined}
              >
                <option value="">Select one</option>
                <option value="now">As soon as possible</option>
                <option value="this-month">Within 30 days</option>
                <option value="this-quarter">Within 90 days</option>
                <option value="six-months">Within six months</option>
                <option value="research">Researching for later</option>
              </select>
              <FieldError id={`${fieldIds.timeline}-error`} message={errors.timeline} />
            </label>

            <label className="qualification-field" htmlFor={fieldIds.projectBudget}>
              <span>Available project budget <i>Required</i></span>
              <select
                id={fieldIds.projectBudget}
                name="projectBudget"
                value={values.projectBudget}
                onChange={setTextValue('projectBudget')}
                aria-invalid={Boolean(errors.projectBudget)}
                aria-describedby={errors.projectBudget ? `${fieldIds.projectBudget}-error` : undefined}
              >
                <option value="">Select a range</option>
                <option value="under-5k">Under €5k</option>
                <option value="5k-10k">€5k–€10k</option>
                <option value="10k-15k">€10k–€15k</option>
                <option value="15k-30k">€15k–€30k</option>
                <option value="30k-plus">€30k+</option>
                <option value="unsure">Not defined yet</option>
              </select>
              <FieldError id={`${fieldIds.projectBudget}-error`} message={errors.projectBudget} />
            </label>

            <label className="qualification-field qualification-field--wide" htmlFor={fieldIds.ownerReadiness}>
              <span>Ownership & data readiness <i>Required</i></span>
              <select
                id={fieldIds.ownerReadiness}
                name="ownerReadiness"
                value={values.ownerReadiness}
                onChange={setTextValue('ownerReadiness')}
                aria-invalid={Boolean(errors.ownerReadiness)}
                aria-describedby={errors.ownerReadiness ? `${fieldIds.ownerReadiness}-error` : undefined}
              >
                <option value="">Select the closest state</option>
                <option value="decision-maker">I own the decision and can arrange access to the data</option>
                <option value="budget-owner">I own or control the budget; access can be arranged</option>
                <option value="sponsor-access">I have an internal sponsor and can involve the owner</option>
                <option value="exploring">I am exploring before ownership or access is confirmed</option>
              </select>
              <FieldError id={`${fieldIds.ownerReadiness}-error`} message={errors.ownerReadiness} />
            </label>

            <label className="qualification-field qualification-field--wide" htmlFor={fieldIds.constraint}>
              <span>The likely constraint <i>Required</i></span>
              <textarea
                id={fieldIds.constraint}
                name="constraint"
                rows={3}
                maxLength={1200}
                placeholder="Data quality, internal time, platform debt, stakeholder alignment…"
                value={values.constraint}
                onChange={setTextValue('constraint')}
                aria-invalid={Boolean(errors.constraint)}
                aria-describedby={errors.constraint ? `${fieldIds.constraint}-error` : undefined}
              />
              <FieldError id={`${fieldIds.constraint}-error`} message={errors.constraint} />
            </label>

            <div className="qualification-consents qualification-field--wide">
              <label htmlFor={fieldIds.privacyAccepted}>
                <input
                  id={fieldIds.privacyAccepted}
                  name="privacyAccepted"
                  type="checkbox"
                  checked={values.privacyAccepted}
                  onChange={setBooleanValue('privacyAccepted')}
                  aria-invalid={Boolean(errors.privacyAccepted)}
                  aria-describedby={errors.privacyAccepted ? `${fieldIds.privacyAccepted}-error` : undefined}
                />
                <span>
                  I have read the <a href={PRIVACY_URL} target="_blank" rel="noreferrer">privacy notice</a>. I understand that the information marked “Required” is needed to assess and answer my enquiry; without it, this form cannot be submitted. This acknowledgement is not consent to marketing. <i>Required</i>
                </span>
              </label>
              <FieldError id={`${fieldIds.privacyAccepted}-error`} message={errors.privacyAccepted} />

              <label htmlFor={fieldIds.marketingConsent}>
                <input
                  id={fieldIds.marketingConsent}
                  name="marketingConsent"
                  type="checkbox"
                  checked={values.marketingConsent}
                  onChange={setBooleanValue('marketingConsent')}
                />
                <span>Yes, I would like to receive occasional Aetheris Studio commerce research, service updates and event invitations by email. This is optional; a separate email confirmation is required before subscription, and I can unsubscribe at any time. <i>Optional</i></span>
              </label>
            </div>

            <div
              className="qualification-honeypot"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
            >
              <label htmlFor={fieldIds.website}>Leave this field empty</label>
              <input
                id={fieldIds.website}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={setTextValue('website')}
              />
            </div>

            {TURNSTILE_SITE_KEY && (
              <div className="qualification-security qualification-field--wide">
                <TurnstileField
                  key={turnstileResetKey}
                  siteKey={TURNSTILE_SITE_KEY}
                  onToken={handleTurnstileToken}
                  onError={handleTurnstileError}
                />
                <FieldError id={`${idPrefix}-turnstile-error`} message={errors.turnstile} />
              </div>
            )}
          </fieldset>

          <div className="qualification-actions">
            {step > 1 && (
              <button className="qualification-back" type="button" onClick={() => goToStep(step - 1)} disabled={submitting}>
                <span aria-hidden="true">←</span> Back
              </button>
            )}
            {step < 3 ? (
              <button
                key="qualification-next"
                className="button-ink qualification-next"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  completeStep();
                }}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                key="qualification-submit"
                className="button-ink qualification-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Send the commercial brief'} <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          <FieldError id={`${idPrefix}-submit-error`} message={errors.submit} />
          <p className="qualification-privacy-note">
            Your details are used to assess this request and coordinate a response. They are never sent to analytics.
          </p>
        </form>
      </div>
    </section>
  );
}
