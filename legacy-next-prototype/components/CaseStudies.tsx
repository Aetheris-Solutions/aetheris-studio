import Image from "next/image";
import Reveal from "./Reveal";

const cases = [
  {
    code: "CASE /001",
    sector: "E-commerce moda · 8M€ revenue",
    agent: "Custos + Hermes",
    title: "Da 12h di ritardo medio sui ticket a 4 minuti.",
    body:
      "Customer care multilingua su WhatsApp + chat sito. L'agente gestisce ordini, resi, tracking, FAQ pre-acquisto. Escalation umana solo per casi complessi.",
    metrics: [
      { k: "94%", v: "ticket risolti senza umano" },
      { k: "+38%", v: "conversion rate da chat" },
      { k: "4 min", v: "tempo medio risposta" },
    ],
    duration: "Live in 18 giorni",
  },
  {
    code: "CASE /002",
    sector: "SaaS B2B · serie A",
    agent: "Hermes",
    title: "+€127.000 di pipeline riattivando lead dormienti.",
    body:
      "Hermes contatta su WhatsApp i lead non chiusi negli ultimi 12 mesi: qualifica, prenota demo, aggiorna lo stato in HubSpot. Nessuna ri-pubblicità ads.",
    metrics: [
      { k: "+€127k", v: "pipeline in 60 giorni" },
      { k: "23%", v: "lead riattivati" },
      { k: "0€", v: "speso in ads" },
    ],
    duration: "Live in 14 giorni",
  },
  {
    code: "CASE /003",
    sector: "Manifattura B2B · 30 dipendenti",
    agent: "Vulcano",
    title: "−340 ore/mese di data entry tra ERP e gestionale.",
    body:
      "Vulcano sincronizza ordini fornitori, fatture passive e movimentazione magazzino tra ERP, gestionale e fogli di lavoro. Errori di trascrizione: zero.",
    metrics: [
      { k: "−340h", v: "back office al mese" },
      { k: "12.5×", v: "ROI primo anno" },
      { k: "0", v: "errori di trascrizione" },
    ],
    duration: "Live in 24 giorni",
  },
];

export default function CaseStudies() {
  return (
    <section
      id="cases"
      className="section relative overflow-hidden border-t border-white/5"
    >
      {/* faint sky banding */}
      <div className="absolute inset-x-0 top-0 h-72 opacity-30 pointer-events-none">
        <Image
          src="/images/sky.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover engrave-soft [mask-image:linear-gradient(to_bottom,#000,transparent)]"
        />
      </div>

      <div className="relative z-10 container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="cross" />
                <span className="eyebrow">Case Study</span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="display text-4xl md:text-5xl lg:text-6xl text-ink-paper leading-[1.05] max-w-[20ch]">
                Numeri reali.{" "}
                <span className="display-italic text-ink-gold">
                  Da clienti reali.
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <p className="lead">
                Ogni numero è misurato su KPI concordati prima del go-live. I
                nomi dei clienti sono protetti da NDA — disponibili in call su
                richiesta.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {cases.map((c, i) => (
            <Reveal key={c.code} delay={i * 100}>
              <article className="surface surface-hover p-7 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                      {c.code}
                    </span>
                    <span className="chip">{c.agent}</span>
                    <span className="chip">{c.duration}</span>
                  </div>
                  <h3 className="display text-2xl md:text-4xl text-ink-paper leading-snug max-w-[28ch]">
                    {c.title}
                  </h3>
                  <p className="mt-5 text-ink-paper/75 text-[15.5px] leading-relaxed max-w-2xl">
                    {c.body}
                  </p>
                  <div className="fine mt-5">{c.sector}</div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-3 gap-3 self-center">
                  {c.metrics.map((m) => (
                    <div
                      key={m.v}
                      className="border border-white/8 rounded-lg p-4 bg-white/[0.015] flex flex-col"
                    >
                      <div className="display text-2xl md:text-3xl text-ink-paper leading-tight">
                        {m.k}
                      </div>
                      <div className="fine mt-2 leading-tight">{m.v}</div>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
