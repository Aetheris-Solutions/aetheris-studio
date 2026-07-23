import { atelierRoles, teamMembers, teamProfilePlaceholders } from '../content/team';
import { translate as t } from '../i18n';
import { AetherisMark } from './AetherisMark';
import { TeamPortrait } from './TeamPortrait';

export function AtelierTeam() {
  const reservedProfiles = teamProfilePlaceholders.slice(teamMembers.length);

  return (
    <section className="atelier atelier--ledger" id="studio" aria-labelledby="atelier-title" data-header-tone="light">
      <div className="atelier-copy" data-reveal>
        <p className="section-kicker section-kicker--dark">{t('The Aetheris atelier')}</p>
        <h2 id="atelier-title">{t('One accountable room.')}<br /><em>{t('The craft the work requires.')}</em></h2>
        <p>
          {t('Each engagement is assembled around the commercial constraint, with a named lead and explicit ownership for every discipline in scope.')}
        </p>
        <strong>{t('The craft is human. The system preserves its continuity.')}</strong>
      </div>

      <div className="atelier-ledger" data-reveal>
        <div className="atelier-ledger-seal" aria-hidden="true">
          <AetherisMark idPrefix="atelier-ledger" />
          <span>Aetheris<br />Studio</span>
        </div>
        <ol aria-label={t('Disciplines and ownership inside the Aetheris atelier')}>
          {atelierRoles.map((role) => (
            <li key={role.index}>
              <span className="atelier-ledger-index">{role.index}</span>
              <div className="atelier-ledger-copy">
                <h3>{t(role.role)}</h3>
                <p>{t(role.responsibility)}</p>
              </div>
              <ul aria-label={`${t(role.role)} output`}>
                {role.outputs.map((output) => <li key={output}>{t(output)}</li>)}
              </ul>
            </li>
          ))}
        </ol>
        <p className="atelier-ledger-note">
          {t('Every engagement scope names the people involved, their decision rights and the capacity reserved.')}
        </p>
      </div>

      <section className="atelier-people-preview" data-reveal aria-labelledby="atelier-people-title">
        <div className="atelier-people-intro">
          <p className="atelier-people-kicker">{t('The people behind the system')}</p>
          <h3 id="atelier-people-title">{t('The hands behind the work.')}</h3>
          <p>
            {t('Each portrait moves from a Renaissance interpretation to the person behind it. Profiles are released individually, once identity, role and image permissions are complete.')}
          </p>
        </div>

        <ul className="atelier-profile-grid" aria-label={t('Aetheris Studio people')}>
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
                <span>{t(profile.label)}</span>
                <strong>{t(profile.note)}</strong>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
