import Image from "next/image";
import Reveal from "./Reveal";

const phases = [
  {
    n: "A",
    code: "01",
    title: "Audit",
    sub: "Diagnosi completa del business",
    body: "Mappiamo i tuoi processi, le fonti dati e gli strumenti esistenti. Identifichiamo i 3 punti dove un agente AI ha il massimo impatto economico.",
    bullets: ["Process discovery", "Data assessment", "ROI matrix"],
    tag: "Settimana 1",
  },
  {
    n: "E",
    code: "02",
    title: "Engineer",
    sub: "Progettazione dell'agente",
    body: "Disegniamo l'architettura: ruolo, prompt system, knowledge base, guardrail, flusso conversazionale e integrazioni con il tuo stack.",
    bullets: ["System design", "Prompt engineering", "Integration spec"],
    tag: "Settimana 1–2",
  },
  {
    n: "T",
    code: "03",
    title: "Train",
    sub: "Training sui tuoi dati reali",
    body: "Addestriamo l'agente su documenti aziendali, FAQ, conversazioni storiche, listini. RAG vettoriale + fine-tuning quando necessario.",
    bullets: ["RAG vettoriale", "Fine-tuning", "Eval automatica"],
    tag: "Settimana 2",
  },
  {
    n: "H",
    code: "04",
    title: "Hand-off",
    sub: "Deploy & integrazione",
    body: "Connettiamo l'agente al tuo CRM, WhatsApp, email, calendario. Test end-to-end, training del team, go-live monitorato.",
    bullets: ["Deploy production", "Team training", "Go-live"],
    tag: "Settimana 2–3",
  },
  {
    n: "E",
    code: "05",
    title: "Evolve",
    sub: "Monitoraggio & ottimizzazione",
    body: "Dashboard ROI in tempo reale, review settimanale conversazioni, iterazioni continue. L'agente migliora ogni mese.",
    bullets: ["Dashboard KPI", "Weekly review", "Continuous iteration"],
    tag: "Da settimana 4",
  },
  {
    n: "R",
    code: "06",
    title: "Return",
    sub: "Misurazione del ROI",
    body: "Report mensile con ROI calcolato su metriche concordate: ore risparmiate, lead qualificati, ticket risolti, ricavi generati.",
    bullets: ["Monthly report", "ROI tracking", "Roadmap evolutiva"],
    tag: "Mese 2+",
  },
];

export default function Framework() {
  return (
    <section id="framework" className="section relative overflow-hidden">
      {/* faint background figure */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="relative w-[80vw] max-w-[900px] aspect-[4/5] opacity-[0.07]">
          <Image
            src="/images/man-full.png"
            alt=""
            fill
            sizes="80vw"
            className="object-contain engrave fade-mask-soft"
          />
        </div>
      </div>

      <div className="relative z-10 container-narrow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="cross" />
                <span className="eyebrow">Il metodo</span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="display text-4xl md:text-5xl lg:text-6xl text-ink-paper leading-[1.05]">
                Framework <span className="display-italic text-ink-gold">AETHER™</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="kicker mt-4">
                Audit · Engineer · Train · Hand-off · Evolve · Return
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={200}>
              <p className="lead">
                Sei fasi, una sequenza ripetibile. Niente improvvisazione,
                niente proof-of-concept che restano in cassetto. Ogni progetto
                segue lo stesso processo collaudato — dal primo incontro al
                ROI report del mese 3.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="chip">⏱ 14gg deploy</span>
                <span className="chip">📊 ROI tracciato</span>
                <span className="chip">🔁 Iterazione continua</span>
                <span className="chip">🛡 GDPR compliant</span>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 border border-white/8 rounded-2xl overflow-hidden">
          {phases.map((p, i) => (
            <Reveal key={p.code} delay={i * 80}>
              <article className="group relative h-full bg-ink-deep p-7 md:p-8 transition-colors hover:bg-[#0d0c0a]">
                <div className="flex items-start justify-between mb-7">
                  <div className="display text-7xl md:text-8xl text-ink-gold/85 leading-none">
                    {p.n}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-[10.5px] text-ink-fog tracking-widest">
                      / {p.code}
                    </span>
                    <span className="font-mono text-[10.5px] text-ink-mute">
                      {p.tag}
                    </span>
                  </div>
                </div>

                <h3 className="display text-3xl text-ink-paper mb-1.5">
                  {p.title}
                </h3>
                <div className="font-sans text-[13px] text-ink-gold/80 mb-4">
                  {p.sub}
                </div>
                <p className="text-ink-paper/70 text-[15px] leading-relaxed">
                  {p.body}
                </p>

                <ul className="mt-6 pt-6 border-t border-white/8 flex flex-wrap gap-2">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="font-mono text-[10.5px] text-ink-fog px-2 py-1 border border-white/8 rounded-md"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
