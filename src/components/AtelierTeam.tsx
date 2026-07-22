import { atelierRoles, teamProfilePlaceholders } from '../content/team';
import { AetherisMark } from './AetherisMark';

export function AtelierTeam() {
  return (
    <section className="atelier atelier--ledger" id="studio" aria-labelledby="atelier-title" data-header-tone="light">
      <div className="atelier-copy" data-reveal>
        <p className="section-kicker section-kicker--dark">The Aetheris atelier</p>
        <h2 id="atelier-title">One accountable room.<br /><em>Six forms of craft.</em></h2>
        <p>
          Each engagement is assembled around the commercial constraint, with a named lead and explicit ownership
          for every discipline in scope.
        </p>
        <strong>The craft is human. The system preserves its continuity.</strong>
      </div>

      <div className="atelier-ledger" data-reveal>
        <div className="atelier-ledger-seal" aria-hidden="true">
          <AetherisMark idPrefix="atelier-ledger" />
          <span>Aetheris<br />Studio</span>
        </div>
        <ol aria-label="Disciplines and ownership inside the Aetheris atelier">
          {atelierRoles.map((role) => (
            <li key={role.index}>
              <span className="atelier-ledger-index">{role.index}</span>
              <div className="atelier-ledger-copy">
                <h3>{role.role}</h3>
                <p>{role.responsibility}</p>
              </div>
              <ul aria-label={`${role.role} outputs`}>
                {role.outputs.map((output) => <li key={output}>{output}</li>)}
              </ul>
            </li>
          ))}
        </ol>
        <p className="atelier-ledger-note">
          Every engagement scope names the people involved, their decision rights and the capacity reserved.
        </p>
      </div>

      <div className="atelier-people-preview" data-reveal aria-labelledby="atelier-people-title">
        <div className="atelier-people-intro">
          <p className="atelier-people-kicker">People layer · reserved</p>
          <h3 id="atelier-people-title">The portrait frieze arrives in the final team pass.</h3>
          <p>
            These niches reserve the composition only. Portraits, names and engagement roles will appear after
            individual approval; no slot below represents a published team member or discipline assignment.
          </p>
        </div>

        <ul className="atelier-profile-grid" aria-label="Reserved team profile slots">
          {teamProfilePlaceholders.map((profile) => (
            <li key={profile.slot}>
              <div className="atelier-profile-medallion" aria-hidden="true">
                <span className="atelier-profile-orbit" />
                <span className="atelier-profile-silhouette" />
                <span className="atelier-profile-slot">{profile.slot}</span>
              </div>
              <div className="atelier-profile-caption">
                <span>{profile.label}</span>
                <strong>{profile.note}</strong>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
