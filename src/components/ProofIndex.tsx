import { agentProofs, caseStudies, proofIndexEntries } from '../content/proof';
import { translate as t } from '../i18n';

function captureFor(id: string) {
  const caseStudy = caseStudies.find((entry) => entry.id === `case-${id}`);
  if (caseStudy) return caseStudy.capture;

  return agentProofs.find((entry) => entry.id === `agent-${id.replace('-agent', '')}`)?.capture;
}

export function ProofIndex() {
  return (
    <section className="proof-index" id="work" aria-labelledby="proof-index-title" data-header-tone="light">
      <div className="proof-index-intro" data-reveal>
        <p className="section-kicker section-kicker--dark">{t('Selected work & systems')}</p>
        <h2 id="proof-index-title">{t('Evidence')}<br /><em>{t('before theatre.')}</em></h2>
        <p className="section-lede">
          {t('Live storefronts, operating archives and in-house systems. Every entry states what was verified—and what it does not attempt to prove.')}
        </p>
      </div>

      <div className="proof-index-list" aria-label={t('Verified work and systems')}>
        {proofIndexEntries.map((entry) => {
          const descriptionId = `${entry.id}-proof-summary`;
          const capture = captureFor(entry.id);

          return (
            <a
              className="proof-index-row"
              href={entry.href}
              key={entry.id}
              aria-describedby={descriptionId}
              data-reveal
            >
              <span className="proof-index-number" aria-hidden="true">{entry.index}</span>
              <span className="proof-index-copy">
                <small>{t(entry.category)}</small>
                <strong>{entry.name}</strong>
                <span id={descriptionId}>{t(entry.summary)}</span>
                <span className="proof-index-verification">
                  <span className="proof-status" data-status={entry.status}>{t(entry.status)}</span>
                  {capture ? <span className="proof-capture-date">{t(capture)}</span> : null}
                </span>
              </span>
              <span className="proof-index-visual" aria-hidden="true">
                <img
                  src={entry.image.src}
                  alt=""
                  width={entry.image.width}
                  height={entry.image.height}
                  loading="lazy"
                  decoding="async"
                />
                {entry.logo ? (
                  <img className="proof-index-logo" src={entry.logo.src} alt="" width="96" height="96" loading="lazy" />
                ) : null}
              </span>
              <span className="proof-index-arrow" aria-hidden="true">↘</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
