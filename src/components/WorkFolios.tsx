import type { CaseStudy } from '../content/proof';
import { caseStudies } from '../content/proof';
import { translate as t } from '../i18n';

function LedgerList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{t(item)}</li>)}
    </ul>
  );
}

function CaseLedger({ study }: { study: CaseStudy }) {
  const headingId = `${study.id}-title`;

  return (
    <div className="case-folio-copy" data-reveal>
      <p className="case-folio-index">{study.index} / {t(study.category)}</p>
      <div className="case-verification" aria-label={t('Verification record')}>
        <span className="proof-status" data-status={study.status}>{t(study.status)}</span>
        <span>{t(study.capture)}</span>
      </div>
      <h3 id={headingId}>{study.name}</h3>
      <h4>{t(study.headline)}</h4>
      <p>{t(study.description)}</p>

      <dl className="case-proof-ledger" aria-label={`${study.name} ${t('evidence ledger')}`}>
        <div>
          <dt>{t('Our role')}</dt>
          <dd>{t(study.role)}</dd>
        </div>
        <div>
          <dt>{t('Published scope')}</dt>
          <dd><LedgerList items={study.scope} /></dd>
        </div>
        <div>
          <dt>{t('Evidence reviewed')}</dt>
          <dd><LedgerList items={study.evidence} /></dd>
        </div>
        <div>
          <dt>{t('Verified outcome')}</dt>
          <dd>{t(study.outcome)}</dd>
        </div>
        <div className="case-proof-boundary">
          <dt>{t('Claim boundary')}</dt>
          <dd>{t(study.claimLimit)}</dd>
        </div>
      </dl>

      <div className="folio-tags" aria-label={`${study.name} ${t('project scope')}`}>
        {study.scope.map((item) => <span key={item}>{t(item)}</span>)}
      </div>
      {study.liveUrl ? (
        <a className="folio-link" href={study.liveUrl} target="_blank" rel="noreferrer">
          {t('Visit the live storefront')} <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}

function CaseMedia({ study }: { study: CaseStudy }) {
  const modifier = study.id.replace('case-', '');

  return (
    <figure className={`case-folio-media case-folio-media--${modifier}`} data-reveal>
      <img
        className={modifier === 'cielo' ? 'cielo-watch' : undefined}
        src={study.primaryImage.src}
        alt={t(study.primaryImage.alt)}
        width={study.primaryImage.width}
        height={study.primaryImage.height}
        loading="lazy"
        decoding="async"
      />
      {study.secondaryImage ? (
        <img
          className="cielo-storefront"
          src={study.secondaryImage.src}
          alt={t(study.secondaryImage.alt)}
          width={study.secondaryImage.width}
          height={study.secondaryImage.height}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <img
        className="case-folio-logo"
        src={study.logo.src}
        alt={t(study.logo.alt)}
        width="128"
        height="128"
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <span>{t(study.status)}</span>
        <span>{t(study.capture)}</span>
      </figcaption>
    </figure>
  );
}

export function WorkFolios() {
  return (
    <section className="work-folios" aria-labelledby="folios-title" data-header-tone="light">
      <div className="folios-heading" data-reveal>
        <p className="section-kicker section-kicker--dark">{t('Selected work · proof ledger')}</p>
        <h2 id="folios-title">{t('Built where commerce')}<br /><em>{t('meets execution.')}</em></h2>
      </div>

      {caseStudies.map((study) => {
        const modifier = study.id.replace('case-', '');
        const media = <CaseMedia study={study} />;
        const ledger = <CaseLedger study={study} />;

        return (
          <article
            className={`case-folio case-folio--${modifier}`}
            id={study.id}
            key={study.id}
            aria-labelledby={`${study.id}-title`}
          >
            {modifier === 'cielo' ? ledger : media}
            {modifier === 'cielo' ? media : ledger}
          </article>
        );
      })}
    </section>
  );
}
