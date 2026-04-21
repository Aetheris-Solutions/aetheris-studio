import Image from "next/image";
import Reveal from "./Reveal";

const steps = [
  {
    n: "I",
    title: "Diagnosi",
    desc: "Analisi dei processi, dei dati e degli strumenti. Identifichiamo dove un agente AI può generare il massimo impatto.",
  },
  {
    n: "II",
    title: "Progettazione",
    desc: "Disegniamo l'agente sul tuo contesto: ruolo, guardrail, integrazioni, metriche di successo.",
  },
  {
    n: "III",
    title: "Costruzione",
    desc: "Sviluppiamo, addestriamo e colleghiamo l'agente ai tuoi sistemi. Test, iterazioni, calibrazione.",
  },
  {
    n: "IV",
    title: "Orchestrazione",
    desc: "Monitoraggio continuo, miglioramento settimanale, scalabilità. L'agente evolve con il tuo business.",
  },
];

export default function Method() {
  return (
    <section id="method" className="relative py-32 md:py-48 overflow-hidden">
      {/* Background figure */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="relative w-[90vw] max-w-[1100px] aspect-[4/5] opacity-[0.12]">
          <Image
            src="/images/man-full.png"
            alt=""
            fill
            sizes="100vw"
            className="object-contain engrave fade-mask-soft"
          />
        </div>
      </div>

      <div className="relative z-10 container-narrow">
        <Reveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-10 bg-ink-gold/60" />
            <span className="eyebrow">III · Il Metodo</span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="display text-4xl md:text-6xl text-ink-paper max-w-[16ch] leading-[1.05]">
            Dalla diagnosi alla{" "}
            <em className="text-ink-gold">messa in opera</em>,
            in quattro movimenti.
          </h2>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14 md:gap-y-20">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative pt-8 border-t border-white/15">
                <div className="flex items-baseline gap-6 mb-4">
                  <span className="display italic text-5xl md:text-6xl text-ink-gold/80">
                    {s.n}
                  </span>
                  <span className="smallcaps text-[10px] text-ink-fog">
                    Fase {i + 1}
                  </span>
                </div>
                <h3 className="display text-3xl md:text-4xl text-ink-paper mb-4">
                  {s.title}
                </h3>
                <p className="text-ink-paper/70 text-lg leading-relaxed max-w-lg">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
