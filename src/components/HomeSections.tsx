import { memo, useEffect, useRef } from 'react';
import { disciplines, engagementActs, QUALIFICATION_URL } from '../content/home';
import { AgentEvidence } from './AgentEvidence';
import { AetherisMark } from './AetherisMark';
import { AtelierTeam } from './AtelierTeam';
import { CommerceDiagnostic } from './CommerceDiagnostic';
import { ProofIndex } from './ProofIndex';
import { QualificationForm } from './QualificationForm';
import { WorkFolios } from './WorkFolios';
import { requestConsentPreferences } from '../lib/consent';
import { localizedPath, translate as t } from '../i18n';

function useScrollReveal() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.dataset.visible = 'true');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = 'true';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return rootRef;
}

export const HomeSections = memo(function HomeSections() {
  const rootRef = useScrollReveal();

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    let cancelled = false;
    const restore = () => {
      const target = document.getElementById(id);
      if (cancelled || !target) return;

      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo(0, Math.max(0, top));
      root.style.scrollBehavior = previousBehavior;
    };
    // Vite injects the section stylesheet during the initial client boot, and
    // lazy proof media can still settle after the first effect. Re-anchoring
    // over this short window prevents direct #work/#qualification links from
    // landing several sections early as the document gains its final height.
    const timers = [180, 650, 1450].map((delay) => window.setTimeout(restore, delay));
    document.fonts?.ready.then(restore).catch(() => {});

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div ref={rootRef} className="home-sections">
      <div className="architectural-threshold" aria-hidden="true">
        <span className="threshold-cornice" />
        <span className="threshold-inlay" />
      </div>

      <ProofIndex />

      <section className="fragmentation" aria-labelledby="fragmentation-title" data-header-tone="dark">
        <div className="fragmentation-thread" aria-hidden="true">
          <svg viewBox="0 0 1440 760" preserveAspectRatio="none">
            <path d="M-20 590 C210 590 246 305 480 305 S742 564 920 450 S1130 162 1460 162" />
          </svg>
        </div>
        <div className="fragmentation-heading" data-reveal>
          <p className="section-kicker">{t('The fragmentation tax')}</p>
          <h2 id="fragmentation-title">{t('Your customer sees one brand.')}<br /><em>{t('Your operation behaves like six.')}</em></h2>
        </div>
        <div className="fragmentation-ledger">
          <article data-reveal>
            <span>01</span>
            <h3>{t('Untrusted measurement')}</h3>
            <p>{t('When every team reads a different number, prioritisation becomes opinion.')}</p>
          </article>
          <article data-reveal>
            <span>02</span>
            <h3>{t('Disconnected execution')}</h3>
            <p>{t('Storefront, media and content optimise their own outputs instead of one commercial outcome.')}</p>
          </article>
          <article data-reveal>
            <span>03</span>
            <h3>{t('Slow learning loops')}</h3>
            <p>{t('Signals arrive after the moment to act—and the same problems return in the next cycle.')}</p>
          </article>
        </div>
        <p className="fragmentation-conclusion" data-reveal>
          {t('The problem is rarely a lack of activity. It is the absence of one operating system.')}
        </p>
      </section>

      <section className="commerce-system" id="system" aria-labelledby="system-title" data-header-tone="dark">
        <div className="commerce-system-intro" data-reveal>
          <p className="section-kicker">{t('One connected system')}</p>
          <h2 id="system-title">{t('Five disciplines.')}<br /><em>{t('One commercial view.')}</em></h2>
          <p>
            {t('We diagnose commerce as a whole, then focus the team on the workstreams with the clearest commercial rationale.')}
          </p>
        </div>

        <div className="discipline-ledger">
          <div className="discipline-thread" aria-hidden="true"><span /></div>
          {disciplines.map((discipline) => (
            <article className="discipline-row" key={discipline.index} data-reveal>
              <span className="discipline-number">{discipline.index}</span>
              <div>
                <h3>{t(discipline.name)}</h3>
                <p>{t(discipline.description)}</p>
              </div>
              <div className="discipline-outputs" aria-label={`${t(discipline.name)} ${t('capabilities')}`}>
                {discipline.outputs.map((output) => <span key={output}>{t(output)}</span>)}
              </div>
            </article>
          ))}
        </div>
        <div className="system-diagnostic-bridge" data-reveal>
          <div>
            <span>{t('Start with clarity')}</span>
            <strong>{t('Find the constraint before adding more activity.')}</strong>
          </div>
          <p>{t('The Commerce Growth Diagnostic turns the five-discipline view into one ordered commercial plan.')}</p>
          <a href="#diagnostic">{t('See the Diagnostic')} <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <WorkFolios />

      <CommerceDiagnostic />

      <section className="engagement" id="engagement" aria-labelledby="engagement-title" data-header-tone="light">
        <div className="engagement-heading" data-reveal>
          <p className="section-kicker section-kicker--dark">{t('The flagship engagement')}</p>
          <h2 id="engagement-title">{t('Build the growth system')}<br /><em>{t('your next stage requires.')}</em></h2>
          <p>
            {t('A focused 90-day engagement implementing the two to four priority workstreams selected through the Commerce Growth Diagnostic.')}
          </p>
        </div>
        <ol className="engagement-timeline">
          {engagementActs.map((act, index) => (
            <li key={act.range} data-reveal>
              <div className="timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
              <small>{t(act.range)}</small>
              <h3>{t(act.title)}</h3>
              <p>{t(act.description)}</p>
            </li>
          ))}
        </ol>
        <div className="engagement-outcome" data-reveal>
          <div>
            <span>{t('What remains after 90 days')}</span>
            <p>{t('One accountable roadmap · A shared commercial scoreboard · An ordered backlog · Defined owners and decision cadence.')}</p>
          </div>
          <a className="button-ink" href={QUALIFICATION_URL}>
            {t('Discuss the 90-day system')} <span aria-hidden="true">↓</span>
          </a>
          <small>{t('Qualification first. The call is reserved for plausible mutual fit.')}</small>
        </div>
      </section>

      <AgentEvidence />
      <AtelierTeam />
      <QualificationForm />

      <footer className="site-footer" data-header-tone="dark">
        <div className="footer-brand">
          <AetherisMark idPrefix="footer" />
          <div><strong>Aetheris Studio</strong><span>{t('Integrated commerce growth · Europe')}</span></div>
        </div>
        <nav className="footer-nav" aria-label={t('Footer navigation')}>
          <div>
            <span>{t('Explore')}</span>
            <a href="#work">{t('Selected work')}</a>
            <a href="#system">{t('The system')}</a>
            <a href="#diagnostic">{t('The Diagnostic')}</a>
            <a href="#operating-layer">{t('In-house systems')}</a>
            <a href="#studio">{t('Atelier')}</a>
          </div>
          <div>
            <span>{t('Connect')}</span>
            <a href="#qualification">{t('Qualify a project')}</a>
            <a href="mailto:info@aetherisstudio.com">{t('Email')}</a>
            <a href="https://www.linkedin.com/company/aetherisstudio" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/aetherisstudio/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
          <div>
            <span>{t('Legal')}</span>
            <a href={localizedPath('/privacy-policy/')}>{t('Privacy')}</a>
            <a href={localizedPath('/cookies-policy/')}>{t('Cookies')}</a>
            <button className="footer-consent-button" type="button" onClick={requestConsentPreferences}>
              {t('Cookie choices')}
            </button>
          </div>
        </nav>
        <div className="footer-base">
          <span className="footer-company-details">
            © 2026 Aetheris Studio · {t('Aetheris Solutions S.r.l. · Registered office Via Giovanni Pastorelli 4/D, 20143 Milan, Italy · Milan Monza Brianza Lodi Companies Register / VAT and tax no. 14468170965 · REA MI-2786509 · Share capital €10,000 fully paid · Sole shareholder company')}
          </span>
          <a href="#top">{t('Back to the oculus')} <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </div>
  );
});
