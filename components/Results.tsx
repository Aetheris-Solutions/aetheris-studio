import Image from "next/image";
import Reveal from "./Reveal";

const results = [
  {
    k: "−72%",
    t: "Tempo di risposta",
    d: "sulle richieste clienti del nostro cliente e-commerce",
  },
  {
    k: "+238%",
    t: "Lead qualificati",
    d: "in 90 giorni per una SaaS B2B con agente commerciale",
  },
  {
    k: "−41%",
    t: "Costi operativi",
    d: "grazie all'agente operations su flussi order-to-cash",
  },
  {
    k: "94%",
    t: "Ticket risolti",
    d: "in autonomia dall'agente customer care — senza escalation",
  },
];

export default function Results() {
  return (
    <section id="results" className="relative py-32 md:py-48 overflow-hidden">
      {/* Soft figure right */}
      <div className="absolute right-[-10%] top-0 bottom-0 w-[50vw] max-w-[700px] opacity-[0.18] pointer-events-none select-none hidden md:block">
        <div className="relative h-full">
          <Image
            src="/images/woman-full.png"
            alt=""
            fill
            sizes="50vw"
            className="object-contain engrave fade-mask-soft"
          />
        </div>
      </div>

      <div className="relative z-10 container-narrow">
        <Reveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-10 bg-ink-gold/60" />
            <span className="eyebrow">IV · Risultati</span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="display text-4xl md:text-6xl text-ink-paper max-w-[18ch] leading-[1.05]">
            Numeri, non{" "}
            <em className="text-ink-gold">promesse</em>.
          </h2>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-6 max-w-xl text-lg text-ink-paper/70">
            I risultati medi dei nostri agenti in produzione presso i nostri
            clienti. Ogni numero è misurato, non stimato.
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-16 max-w-4xl">
          {results.map((r, i) => (
            <Reveal key={r.k} delay={i * 100}>
              <div className="border-t border-white/15 pt-8">
                <div className="display text-6xl md:text-7xl text-ink-paper tracking-tight">
                  {r.k}
                </div>
                <div className="smallcaps text-[10px] text-ink-gold/85 mt-4">
                  {r.t}
                </div>
                <p className="mt-3 text-ink-paper/65 leading-relaxed max-w-sm">
                  {r.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
