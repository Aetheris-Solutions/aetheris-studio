import Reveal from "./Reveal";

const tiers = [
  {
    name: "Starter",
    sub: "Un agente, un caso d'uso",
    setup: "€1.490",
    monthly: "€249",
    bestFor: "Founder solo, freelance, micro-PMI",
    deploy: "Live in 10 giorni",
    features: [
      "1 agente preconfigurato (Hermes / Minerva / Custos)",
      "Integrazioni standard (WhatsApp, email, Sheets)",
      "1.000 conversazioni/mese incluse",
      "Dashboard ROI base",
      "Support email · 48h",
    ],
    highlighted: false,
    cta: "Inizia con Starter",
  },
  {
    name: "Business",
    sub: "Multi-agente o uso intensivo",
    setup: "€2.990",
    monthly: "€599",
    bestFor: "PMI 10–80 dipendenti, e-commerce in crescita",
    deploy: "Live in 14 giorni",
    features: [
      "Fino a 3 agenti orchestrati",
      "Integrazioni custom (CRM, ERP, gestionali)",
      "10.000 conversazioni/mese",
      "Dashboard ROI completa + report mensile",
      "Review settimanale + iterazione continua",
      "Support priority · 8h",
    ],
    highlighted: true,
    cta: "Scegli Business",
  },
  {
    name: "Enterprise",
    sub: "Custom development & on-premise",
    setup: "Custom",
    monthly: "Custom",
    bestFor: "Aziende 80+ dipendenti, settori regolati",
    deploy: "Live in 30–60 giorni",
    features: [
      "Agenti custom da zero su tuoi processi",
      "Deploy on-premise o cloud privato",
      "Conversazioni illimitate",
      "Fine-tuning su modelli proprietari",
      "DPA, ISO 27001, audit log completo",
      "Account manager dedicato · SLA 99.5%",
    ],
    highlighted: false,
    cta: "Parla con noi",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="section relative border-t border-white/5"
    >
      <div className="container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="cross" />
                <span className="eyebrow">Pricing</span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="display text-4xl md:text-5xl lg:text-6xl text-ink-paper leading-[1.05] max-w-[20ch]">
                Prezzi pubblici.{" "}
                <span className="display-italic text-ink-gold">
                  Niente sorprese.
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <p className="lead">
                Tre pacchetti per coprire dal solo founder all&apos;azienda
                strutturata. Tutti includono il setup completo, l&apos;agente
                in produzione e il monitoraggio ROI.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <article
                className={`h-full p-7 md:p-8 flex flex-col rounded-2xl border ${
                  t.highlighted
                    ? "border-ink-gold/55 bg-gradient-to-b from-ink-gold/[0.06] to-transparent shadow-[0_0_60px_rgba(212,184,150,0.08)]"
                    : "border-white/8 bg-white/[0.012]"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-[11px] text-ink-mute tracking-widest">
                    / 0{i + 1}
                  </span>
                  {t.highlighted && (
                    <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-ink-gold text-black">
                      Più scelto
                    </span>
                  )}
                </div>

                <h3 className="display text-4xl text-ink-paper">{t.name}</h3>
                <div className="display-italic text-ink-gold/85 text-base mt-1">
                  {t.sub}
                </div>

                <div className="mt-7 pb-7 border-b border-white/8">
                  <div className="flex items-baseline gap-2">
                    <span className="display text-5xl text-ink-paper">
                      {t.setup}
                    </span>
                    <span className="fine">setup</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-sans text-xl text-ink-paper/90">
                      + {t.monthly}
                    </span>
                    <span className="fine">/ mese</span>
                  </div>
                  <div className="fine mt-3">{t.deploy}</div>
                </div>

                <div className="mt-6 fine">{t.bestFor}</div>

                <ul className="mt-6 flex flex-col gap-3">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-3 text-[14.5px] text-ink-paper/85 leading-snug"
                    >
                      <span className="mt-[0.55em] inline-block h-px w-3 bg-ink-gold/70 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`btn mt-8 w-full justify-center ${
                    t.highlighted ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {t.cta}
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <p className="fine mt-8 text-center">
            Tutti i prezzi sono IVA esclusa · Contratto mensile o annuale (−15%)
            · Pagamento bonifico o carta · Fatturazione italiana
          </p>
        </Reveal>
      </div>
    </section>
  );
}
