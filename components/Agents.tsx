import Image from "next/image";
import Reveal from "./Reveal";

const agents = [
  {
    code: "/01",
    name: "Hermes",
    role: "Lead Qualifier",
    portrait: "/images/man-portrait.png",
    pitch:
      "Risponde 24/7 a richieste, qualifica i lead con scoring automatico, prenota call sul tuo calendario.",
    use: "Ideale per agenzie, SaaS B2B, real estate, studi professionali.",
    integrations: ["WhatsApp", "Email", "HubSpot", "Cal.com", "Salesforce"],
    metrics: [
      { k: "+187%", v: "lead qualificati" },
      { k: "8 min", v: "tempo medio risposta" },
    ],
    setup: "Setup in 14 giorni",
    from: "Da €1.990 setup + €299/mese",
  },
  {
    code: "/02",
    name: "Vulcano",
    role: "Operations Engine",
    portrait: "/images/man-beard.png",
    pitch:
      "Orchestra processi back-office: ordini, fatture, ticket, reportistica. Sostituisce ore di data entry.",
    use: "Ideale per e-commerce, manifatturiero, logistica, servizi.",
    integrations: ["ERP", "Shopify", "Stripe", "Google Drive", "Slack"],
    metrics: [
      { k: "−68%", v: "tempo operativo" },
      { k: "12.5×", v: "ROI medio" },
    ],
    setup: "Setup in 21 giorni",
    from: "Da €2.490 setup + €499/mese",
  },
  {
    code: "/03",
    name: "Minerva",
    role: "Data Analyst",
    portrait: "/images/woman-portrait.png",
    pitch:
      "Interroga i tuoi dati in linguaggio naturale, genera report e insight predittivi senza un BI team.",
    use: "Ideale per founder, CFO, marketing manager, COO.",
    integrations: ["BigQuery", "PostgreSQL", "Notion", "Sheets", "Metabase"],
    metrics: [
      { k: "12×", v: "velocità reporting" },
      { k: "0", v: "data analyst richiesti" },
    ],
    setup: "Setup in 10 giorni",
    from: "Da €1.490 setup + €249/mese",
  },
  {
    code: "/04",
    name: "Custos",
    role: "Customer Care",
    portrait: "/images/woman-full.png",
    pitch:
      "Gestisce supporto, resi, FAQ e ordini con il tono della tua brand. Risolve l'80% dei ticket in autonomia.",
    use: "Ideale per e-commerce, SaaS, retail multi-store, servizi.",
    integrations: ["WhatsApp", "Intercom", "Zendesk", "Shopify", "Telegram"],
    metrics: [
      { k: "94%", v: "ticket risolti" },
      { k: "24/7", v: "operatività" },
    ],
    setup: "Setup in 14 giorni",
    from: "Da €1.790 setup + €349/mese",
  },
];

export default function Agents() {
  return (
    <section id="agents" className="section relative">
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="cross" />
                <span className="eyebrow">Gli agenti</span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="display text-4xl md:text-5xl lg:text-6xl text-ink-paper leading-[1.05] max-w-[20ch]">
                Quattro agenti pronti.{" "}
                <span className="display-italic text-ink-gold">
                  O uno costruito su misura.
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <p className="lead">
                Ogni agente è un sistema autonomo: ruolo definito, integrazioni
                native, metriche tracciate. Li attivi singolarmente o li fai
                lavorare in orchestrazione.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {agents.map((a, i) => (
            <Reveal key={a.code} delay={i * 90}>
              <article className="surface surface-hover h-full p-7 md:p-9 flex flex-col">
                <div className="flex items-start justify-between gap-6 mb-7">
                  <div>
                    <div className="font-mono text-[11px] text-ink-mute tracking-widest mb-2">
                      AGENT {a.code}
                    </div>
                    <h3 className="display text-4xl md:text-5xl text-ink-paper leading-none">
                      {a.name}
                    </h3>
                    <div className="display-italic text-ink-gold/85 text-lg mt-1.5">
                      {a.role}
                    </div>
                  </div>
                  <div className="relative w-24 h-28 md:w-32 md:h-36 shrink-0">
                    <Image
                      src={a.portrait}
                      alt={`${a.name} — ${a.role}`}
                      fill
                      sizes="160px"
                      className="object-contain engrave fade-mask-soft"
                    />
                  </div>
                </div>

                <p className="text-ink-paper/80 text-[15.5px] leading-relaxed">
                  {a.pitch}
                </p>
                <p className="mt-3 text-ink-fog text-[13.5px] italic">
                  {a.use}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {a.metrics.map((m) => (
                    <div
                      key={m.v}
                      className="border border-white/8 rounded-lg p-4 bg-white/[0.015]"
                    >
                      <div className="display text-3xl text-ink-paper">
                        {m.k}
                      </div>
                      <div className="fine mt-1">{m.v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {a.integrations.map((it) => (
                    <span
                      key={it}
                      className="font-mono text-[10.5px] text-ink-fog px-2 py-1 border border-white/8 rounded-md"
                    >
                      {it}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-7">
                  <div className="flex items-end justify-between gap-4 pt-6 border-t border-white/8">
                    <div>
                      <div className="fine">{a.setup}</div>
                      <div className="font-sans text-[14px] text-ink-paper mt-1">
                        {a.from}
                      </div>
                    </div>
                    <a
                      href="#contact"
                      className="font-sans text-[13.5px] text-ink-paper hover:text-ink-gold transition flex items-center gap-1.5"
                    >
                      Attiva {a.name}
                      <span aria-hidden>→</span>
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="mt-8 surface p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <div className="font-mono text-[11px] text-ink-mute tracking-widest mb-2">
                AGENT /00 — CUSTOM
              </div>
              <h3 className="display text-2xl md:text-3xl text-ink-paper">
                Hai un caso d&apos;uso unico?{" "}
                <span className="display-italic text-ink-gold">
                  Lo costruiamo da zero.
                </span>
              </h3>
              <p className="mt-2 text-ink-fog text-[14.5px] max-w-2xl">
                Discovery call, audit del processo, proposta tecnica e
                preventivo entro 5 giorni lavorativi.
              </p>
            </div>
            <a href="#contact" className="btn btn-primary">
              Discovery call
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
