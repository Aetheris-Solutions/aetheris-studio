import Image from "next/image";
import Reveal from "./Reveal";

const agents = [
  {
    n: "01",
    title: "Agente Commerciale",
    italic: "Orator",
    desc: "Qualifica lead, risponde a richieste, prenota appuntamenti. Integrato con CRM, email e calendari — 24 ore su 24.",
    points: [
      "Qualifica e scoring automatico",
      "Conversazione multicanale (chat, email, WhatsApp)",
      "Hand-off fluido al team umano",
    ],
  },
  {
    n: "02",
    title: "Agente Operations",
    italic: "Artifex",
    desc: "Orchestra flussi di lavoro tra i tuoi strumenti: ordini, fatture, logistica, reporting. Elimina data-entry e errori manuali.",
    points: [
      "Orchestrazione multi-tool (ERP, CRM, cloud)",
      "Automazione end-to-end dei processi",
      "Riduzione costi operativi misurabile",
    ],
  },
  {
    n: "03",
    title: "Agente Analista",
    italic: "Augur",
    desc: "Interroga i tuoi dati in linguaggio naturale, genera report e individua pattern nascosti. Il tuo BI analyst on-demand.",
    points: [
      "Query in linguaggio naturale",
      "Report e dashboard automatiche",
      "Insight predittivi sui KPI",
    ],
  },
  {
    n: "04",
    title: "Agente Customer Care",
    italic: "Custos",
    desc: "Gestisce richieste, resi, FAQ e supporto tecnico con il tono della tua brand. Risolve in autonomia l'80% dei ticket.",
    points: [
      "Risposte con tono brand-aware",
      "Multi-lingua nativo",
      "Escalation intelligente al team",
    ],
  },
];

export default function Agents() {
  const portraits = [
    "/images/man-portrait.png",
    "/images/woman-portrait.png",
    "/images/man-beard.png",
    "/images/woman-portrait.png",
  ];

  return (
    <section id="agents" className="relative py-32 md:py-48">
      <div className="container-narrow">
        <Reveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-10 bg-ink-gold/60" />
            <span className="eyebrow">II · Gli Agenti</span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="display text-4xl md:text-6xl text-ink-paper max-w-[18ch] leading-[1.05]">
            Quattro figure.
            <br />
            Una{" "}
            <em className="text-ink-gold">intelligenza</em> al servizio del tuo
            business.
          </h2>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-6 max-w-2xl text-lg text-ink-paper/70">
            Ogni agente è un sistema autonomo, addestrato sul tuo contesto,
            integrato con i tuoi strumenti. Li combini come preferisci — o
            li facciamo lavorare insieme.
          </p>
        </Reveal>

        <div className="mt-20 md:mt-28 flex flex-col gap-28 md:gap-40">
          {agents.map((a, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={a.n}
                className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center"
              >
                {/* Image */}
                <div
                  className={`md:col-span-5 ${
                    reverse ? "md:order-2" : ""
                  } relative`}
                >
                  <Reveal>
                    <div className="relative aspect-[4/5] w-full max-w-sm mx-auto">
                      <Image
                        src={portraits[i]}
                        alt={`${a.title} — ${a.italic}`}
                        fill
                        sizes="(max-width: 768px) 80vw, 35vw"
                        className="object-contain engrave fade-mask"
                      />
                    </div>
                    <div className="absolute -top-6 left-0 md:left-4 display italic text-7xl md:text-8xl text-ink-paper/10 select-none pointer-events-none">
                      {a.n}
                    </div>
                  </Reveal>
                </div>

                {/* Text */}
                <div className={`md:col-span-7 ${reverse ? "md:order-1" : ""}`}>
                  <Reveal delay={120}>
                    <div className="smallcaps text-[10px] text-ink-fog mb-3">
                      Agente · {a.n}
                    </div>
                    <h3 className="display text-3xl md:text-5xl text-ink-paper leading-tight">
                      {a.title}
                      <span className="block text-ink-gold/80 not-italic font-display text-base md:text-lg tracking-[0.32em] uppercase mt-3">
                        {a.italic}
                      </span>
                    </h3>
                  </Reveal>

                  <Reveal delay={240}>
                    <p className="mt-6 text-lg text-ink-paper/75 max-w-xl leading-relaxed">
                      {a.desc}
                    </p>
                  </Reveal>

                  <Reveal delay={360}>
                    <ul className="mt-8 space-y-3 max-w-xl">
                      {a.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-4 text-ink-paper/85"
                        >
                          <span className="mt-[0.6em] inline-block h-px w-6 bg-ink-gold/70 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
