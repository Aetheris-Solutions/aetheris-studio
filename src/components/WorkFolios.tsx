import type { CaseStudy } from '../content/proof';
import { caseStudies } from '../content/proof';

function LedgerList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function CaseLedger({ study }: { study: CaseStudy }) {
  const headingId = `${study.id}-title`;

  return (
    <div className="case-folio-copy" data-reveal>
      <p className="case-folio-index">{study.index} / {study.category}</p>
      <div className="case-verification" aria-label="Verification record">
        <span className="proof-status" data-status={study.status}>{study.status}</span>
        <span>{study.capture}</span>
      </div>
      <h3 id={headingId}>{study.name}</h3>
      <h4>{study.headline}</h4>
      <p>{study.description}</p>

      <dl className="case-proof-ledger" aria-label={`${study.name} evidence ledger`}>
        <div>
          <dt>Our role</dt>
          <dd>{study.role}</dd>
        </div>
        <div>
          <dt>Published scope</dt>
          <dd><LedgerList items={study.scope} /></dd>
        </div>
        <div>
          <dt>Evidence reviewed</dt>
          <dd><LedgerList items={study.evidence} /></dd>
        </div>
        <div>
          <dt>Verified outcome</dt>
          <dd>{study.outcome}</dd>
        </div>
        <div className="case-proof-boundary">
          <dt>Claim boundary</dt>
          <dd>{study.claimLimit}</dd>
        </div>
      </dl>

      <div className="folio-tags" aria-label={`${study.name} project scope`}>
        {study.scope.map((item) => <span key={item}>{item}</span>)}
      </div>
      {study.liveUrl ? (
        <a className="folio-link" href={study.liveUrl} target="_blank" rel="noreferrer">
          Visit the live storefront <span aria-hidden="true">↗</span>
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
        alt={study.primaryImage.alt}
        width={study.primaryImage.width}
        height={study.primaryImage.height}
        loading="lazy"
        decoding="async"
      />
      {study.secondaryImage ? (
        <img
          className="cielo-storefront"
          src={study.secondaryImage.src}
          alt={study.secondaryImage.alt}
          width={study.secondaryImage.width}
          height={study.secondaryImage.height}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <img
        className="case-folio-logo"
        src={study.logo.src}
        alt={study.logo.alt}
        width="128"
        height="128"
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <span>{study.status}</span>
        <span>{study.capture}</span>
      </figcaption>
    </figure>
  );
}

export function WorkFolios() {
  return (
    <section className="work-folios" aria-labelledby="folios-title" data-header-tone="light">
      <div className="folios-heading" data-reveal>
        <p className="section-kicker section-kicker--dark">Selected work · proof ledger</p>
        <h2 id="folios-title">Built where commerce<br /><em>meets execution.</em></h2>
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
