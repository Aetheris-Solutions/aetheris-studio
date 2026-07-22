import { agentProofs, proofIndexEntries } from '../content/proof';

function EvidenceList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function AgentEvidence() {
  return (
    <section
      className="operating-layer agent-evidence"
      id="operating-layer"
      aria-labelledby="operating-title"
      data-header-tone="dark"
    >
      <div className="operating-heading" data-reveal>
        <p className="section-kicker">Built in-house · captured in production</p>
        <h2 id="operating-title">Human judgement,<br /><em>backed by systems<br />we can show.</em></h2>
        <p>
          These are dated, read-only captures from the operating systems—not interface mockups. Facts shown below are
          limited to what each capture and its canonical source can verify.
        </p>
      </div>

      <div className="agent-evidence-list">
        {agentProofs.map((agent, index) => {
          const proofEntry = proofIndexEntries.find((entry) => entry.id === agent.id.replace('agent-', '') + '-agent')
            ?? proofIndexEntries.find((entry) => entry.href === `#${agent.id}`);
          const status = proofEntry?.status ?? 'Live system verified';
          const titleId = `${agent.id}-title`;

          return (
            <article
              className={`agent-folio${index % 2 === 1 ? ' agent-folio--reverse' : ''}`}
              id={agent.id}
              key={agent.id}
              aria-labelledby={titleId}
              data-reveal
            >
              <div className="agent-folio-copy">
                <p>{agent.index} / {agent.category}</p>
                <div className="agent-verification" aria-label="Verification record">
                  <span className="proof-status" data-status={status}>{status}</span>
                  <span>{agent.capture}</span>
                </div>
                <h3 id={titleId}>{agent.name}</h3>
                <span>{agent.description}</span>

                <dl className="agent-proof-ledger" aria-label={`${agent.name} evidence ledger`}>
                  <div>
                    <dt>Operating scope</dt>
                    <dd><EvidenceList items={agent.scope} /></dd>
                  </div>
                  <div>
                    <dt>Evidence reviewed</dt>
                    <dd><EvidenceList items={agent.evidence} /></dd>
                  </div>
                  <div>
                    <dt>Facts visible at capture</dt>
                    <dd><EvidenceList items={agent.captureFacts} /></dd>
                  </div>
                </dl>
              </div>

              <figure className="agent-evidence-media">
                <img
                  src={agent.image.src}
                  alt={agent.image.alt}
                  width={agent.image.width}
                  height={agent.image.height}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span>{status}</span>
                  <span>{agent.capture}</span>
                </figcaption>
              </figure>
            </article>
          );
        })}
      </div>

      <p className="operating-close" data-reveal>
        The systems preserve context and evidence. Named people remain accountable for every recommendation, approval
        and release.
      </p>
    </section>
  );
}
