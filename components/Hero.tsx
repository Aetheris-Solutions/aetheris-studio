import Image from "next/image";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Sky / clouds background */}
      <div className="absolute inset-0">
        <Image
          src="/images/sky.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover engrave-soft animate-drift-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_80%)]" />
      </div>

      {/* Pegasus — faint, to the right */}
      <div className="absolute right-[-8%] top-[12%] w-[55vw] max-w-[820px] opacity-[0.22] pointer-events-none select-none hidden md:block">
        <Image
          src="/images/pegasus.png"
          alt=""
          width={900}
          height={1100}
          className="engrave fade-mask-soft"
          priority
        />
      </div>

      <div className="relative z-10 container-narrow pt-40 md:pt-52 pb-24">
        <Reveal>
          <div className="flex items-center gap-4 mb-8">
            <span className="ornament" />
            <span className="eyebrow">Aetheris · Solutions · MMXXVI</span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="display text-[clamp(3rem,9vw,8rem)] text-ink-paper max-w-[14ch]">
            Agenti AI
            <span className="block not-italic font-light text-[0.85em] text-ink-paper/85">
              che <em className="text-ink-gold">lavorano</em> per il
              <br className="hidden md:block" /> tuo business.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={280}>
          <p className="mt-10 max-w-xl text-lg md:text-xl text-ink-paper/70 leading-relaxed">
            Progettiamo{" "}
            <span className="italic text-ink-paper">agenti artificiali</span>{" "}
            su misura che automatizzano processi, rispondono ai clienti,
            analizzano dati e orchestrano le tue operations —{" "}
            <span className="italic text-ink-paper">
              ventiquattro ore su ventiquattro.
            </span>
          </p>
        </Reveal>

        <Reveal delay={420}>
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <a href="#contact" className="btn-ghost">
              Prenota una call
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              href="#philosophy"
              className="smallcaps text-[10px] text-ink-fog hover:text-ink-paper transition pl-1"
            >
              Scopri la filosofia
            </a>
          </div>
        </Reveal>

        {/* KPI strip */}
        <Reveal delay={560}>
          <div className="mt-24 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-white/10 pt-10">
            {[
              { k: "24/7", v: "Operatività continua" },
              { k: "−68%", v: "Tempo medio operativo" },
              { k: "3×", v: "Lead qualificati" },
              { k: "∞", v: "Scalabilità" },
            ].map((it) => (
              <div key={it.k}>
                <div className="display text-4xl md:text-5xl text-ink-paper">
                  {it.k}
                </div>
                <div className="smallcaps text-[10px] text-ink-fog mt-2">
                  {it.v}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-ink-fog">
        <span className="smallcaps text-[9px]">scroll</span>
        <span className="block w-px h-10 bg-gradient-to-b from-ink-fog/60 to-transparent" />
      </div>
    </section>
  );
}
