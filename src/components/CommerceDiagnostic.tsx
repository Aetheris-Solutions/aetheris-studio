import { diagnosticStages, QUALIFICATION_URL } from '../content/home';
import { AetherisMark } from './AetherisMark';

export function CommerceDiagnostic() {
  return (
    <section
      className="diagnostic"
      id="diagnostic"
      aria-labelledby="diagnostic-title"
      data-header-tone="dark"
    >
      <AetherisMark className="diagnostic-mark" idPrefix="diagnostic" />

      <div className="diagnostic-copy" data-reveal>
        <p className="section-kicker">Start with clarity</p>
        <h2 id="diagnostic-title">Commerce Growth<br /><em>Diagnostic.</em></h2>
        <p>
          A paid, fixed-scope diagnostic that turns fragmented data into an ordered 90-day decision plan.
          Its timetable is confirmed after scope, access and data readiness.
        </p>
        <div className="diagnostic-actions">
          <a className="button-celestial" href={QUALIFICATION_URL}>
            Qualify for a Commerce Growth Call <span aria-hidden="true">↓</span>
          </a>
          <small>This is a fit call, not a free audit.</small>
        </div>
      </div>

      <div className="diagnostic-ledger" data-reveal>
        <div className="diagnostic-ledger-heading">
          <span>Fixed scope · Paid entry</span>
          <i>Diagnostic / 90-day decision plan</i>
        </div>
        <ol>
          {diagnosticStages.map((stage) => (
            <li key={stage.index}>
              <span>{stage.index}</span>
              <div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="diagnostic-output">
          <span>What leaves the room</span>
          <p>Commercial scoreboard · Opportunity map · Ordered backlog · 90-day decision plan</p>
        </div>
      </div>
    </section>
  );
}
