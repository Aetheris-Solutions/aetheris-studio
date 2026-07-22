import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoices,
  type ConsentSource
} from '../lib/consent';

const DENIED_CHOICES: ConsentChoices = { analytics: false, marketing: false };
const GRANTED_CHOICES: ConsentChoices = { analytics: true, marketing: false };

export function ConsentManager() {
  const initialRecord = readConsent();
  const [isOpen, setIsOpen] = useState(initialRecord === null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>(() => initialRecord ?? DENIED_CHOICES);
  const [status, setStatus] = useState('');
  const headingId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openPreferences = useCallback((returnFocus?: HTMLElement | null) => {
    const stored = readConsent();
    setChoices(stored ?? DENIED_CHOICES);
    setStatus('');
    setShowPreferences(true);
    setIsOpen(true);
    returnFocusRef.current = returnFocus ?? document.activeElement as HTMLElement | null;
  }, []);

  useEffect(() => {
    const handleOpen = () => openPreferences(document.activeElement as HTMLElement | null);
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, [openPreferences]);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash !== '#cookie-choices') return;
      openPreferences(document.activeElement as HTMLElement | null);
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`
      );
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [openPreferences]);

  useEffect(() => {
    if (!isOpen || !showPreferences) return;
    const outsideRegions = Array.from(document.querySelectorAll<HTMLElement>('.site-header, main'));
    outsideRegions.forEach((region) => { region.inert = true; });
    panelRef.current?.querySelector<HTMLElement>('input, button, a')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && readConsent()) {
        event.preventDefault();
        setIsOpen(false);
        setShowPreferences(false);
        window.setTimeout(() => returnFocusRef.current?.focus(), 0);
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      outsideRegions.forEach((region) => { region.inert = false; });
    };
  }, [isOpen, showPreferences]);

  const applyChoices = (nextChoices: ConsentChoices, source: ConsentSource) => {
    const { requiresReload } = saveConsent(nextChoices, source);
    setChoices(nextChoices);
    setStatus(
      nextChoices.analytics || nextChoices.marketing
        ? 'Privacy preferences saved.'
        : 'Optional technologies rejected.'
    );
    setIsOpen(false);
    setShowPreferences(false);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);

    if (requiresReload) {
      // Give assistive technology a moment to announce the saved choice before
      // reloading to tear down any previously active tag runtime.
      window.setTimeout(() => window.location.reload(), 180);
    }
  };

  if (!isOpen) {
    return <p className="sr-only" role="status" aria-live="polite">{status}</p>;
  }

  return (
    <aside
      ref={panelRef}
      className={`consent-panel${showPreferences ? ' consent-panel--expanded' : ''}`}
      role={showPreferences ? 'dialog' : 'region'}
      aria-modal={showPreferences ? 'true' : undefined}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      {!initialRecord && (
        <button
          className="consent-panel__close"
          type="button"
          aria-label="Close privacy choices and reject optional technologies"
          onClick={() => applyChoices(DENIED_CHOICES, 'banner')}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
      <div className="consent-panel__intro">
        <p className="consent-panel__kicker">Privacy controls</p>
        <h2 id={headingId}>{showPreferences ? 'Choose what may run' : 'Your privacy, by design.'}</h2>
        <p id={descriptionId}>
          Essential site functions are always available. Google Analytics and Microsoft Clarity remain off unless you
          choose to activate analytics. Advertising technologies are not active.
        </p>
        <a href="/cookies-policy/">Read the cookies notice</a>
      </div>

      {showPreferences && (
        <div className="consent-preferences" aria-label="Optional technology preferences">
          <div className="consent-preference consent-preference--essential">
            <div>
              <strong>Essential</strong>
              <span>Security, navigation and the protected qualification form.</span>
            </div>
            <span aria-label="Essential technologies always active">Always active</span>
          </div>

          <label className="consent-preference">
            <span>
              <strong>Analytics</strong>
              <span>Helps us understand aggregate journeys and improve the site.</span>
            </span>
            <input
              type="checkbox"
              checked={choices.analytics}
              onChange={(event) => setChoices((current) => ({ ...current, analytics: event.target.checked }))}
            />
            <i aria-hidden="true" />
          </label>

          <div className="consent-preference consent-preference--essential">
            <div>
              <strong>Marketing</strong>
              <span>No advertising or personalisation technology is active.</span>
            </div>
            <span aria-label="Marketing technologies inactive">Inactive</span>
          </div>
        </div>
      )}

      <div className="consent-panel__actions">
        <button
          className="consent-action consent-action--decision"
          type="button"
          onClick={() => applyChoices(DENIED_CHOICES, showPreferences ? 'preferences' : 'banner')}
        >
          Reject non-essential
        </button>
        {showPreferences ? (
          <button
            className="consent-action consent-action--secondary"
            type="button"
            onClick={() => applyChoices(choices, 'preferences')}
          >
            Save choices
          </button>
        ) : (
          <button
            className="consent-action consent-action--secondary"
            type="button"
            onClick={(event) => openPreferences(event.currentTarget)}
          >
            Preferences
          </button>
        )}
        <button
          className="consent-action consent-action--decision"
          type="button"
          onClick={() => applyChoices(GRANTED_CHOICES, 'banner')}
        >
          Accept analytics
        </button>
      </div>
    </aside>
  );
}
