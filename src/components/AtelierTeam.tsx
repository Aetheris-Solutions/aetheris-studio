import { atelierRoles, teamMembers, teamProfilePlaceholders } from '../content/team';
import { AetherisMark } from './AetherisMark';
import { TeamPortrait } from './TeamPortrait';

export function AtelierTeam() {
  const reservedProfiles = teamProfilePlaceholders.slice(teamMembers.length);

  return (
    <section className="atelier atelier--ledger" id="studio" aria-labelledby="atelier-title" data-header-tone="light">
      <div className="atelier-copy" data-reveal>
        <p className="section-kicker section-kicker--dark">The Aetheris atelier</p>
        <h2 id="atelier-title">One accountable room.<br /><em>The craft the work requires.</em></h2>
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

      <section className="atelier-people-preview" data-reveal aria-labelledby="atelier-people-title">
        <div className="atelier-people-intro">
          <p className="atelier-people-kicker">The people behind the system</p>
          <h3 id="atelier-people-title">The hands behind the work.</h3>
          <p>
            Each portrait moves from a Renaissance interpretation to the person behind it. Profiles are released
            individually, once identity, role and image permissions are complete.
          </p>
        </div>

        <ul className="atelier-profile-grid" aria-label="Aetheris Studio people">
          {teamMembers.map((member) => (
            <li key={member.id} className="atelier-profile-grid-member">
              <TeamPortrait member={member} />
            </li>
          ))}
          {reservedProfiles.map((profile) => (
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
      </section>
    </section>
  );
}
