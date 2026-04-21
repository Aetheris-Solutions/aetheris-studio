import Image from "next/image";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden pt-32 md:pt-40"
    >
      {/* Sky background */}
      <div className="absolute inset-0">
        <Image
          src="/images/sky.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover engrave-soft animate-drift-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
      </div>

      {/* Pegasus faint */}
      <div className="absolute right-[-10%] top-[8%] w-[55vw] max-w-[820px] opacity-[0.18] pointer-events-none select-none hidden md:block">
        <Image
          src="/images/pegasus.png"
          alt=""
          width={900}
          height={1100}
          className="engrave fade-mask-soft"
          priority
        />
      </div>

      <div className="relative z-10 container-narrow pb-24 md:pb-36">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 mb-9">
            <span className="chip">
              <span className="dot" /> AI Agency · Italia
            </span>
            <span className="chip">Framework AETHER™</span>
            <span className="chip">Live in 14 giorni</span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="display text-[clamp(2.6rem,7.2vw,6.5rem)] text-ink-paper max-w-[18ch] leading-[1.02]">
            Agenti AI <span className="display-italic text-ink-gold">su misura</span>{" "}
            che lavorano davvero per il tuo business.
          </h1>
        </Reveal>

        <Reveal delay={260}>
          <p className="lead mt-8 max-w-2xl">
            Non template, non chatbot. Progettiamo agenti AI che parlano con
            i tuoi clienti, automatizzano operations e si integrano nel tuo
            stack — operativi in <span className="text-ink-paper">14 giorni</span>,
            con ROI misurato fin dal primo mese.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a href="#contact" className="btn btn-primary">
              Prenota una call gratuita
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a href="#agents" className="btn btn-ghost">
              Esplora gli agenti
            </a>
            <span className="fine pl-1">
              30 minuti · zero impegno · audit incluso
            </span>
          </div>
        </Reveal>

        {/* Tech / proof strip */}
        <Reveal delay={560}>
          <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-8 border-t border-white/10 pt-10">
            {[
              { k: "60+", v: "Agenti in produzione", s: "PMI italiane" },
              { k: "14gg", v: "Tempo medio di deploy", s: "MVP operativo" },
              { k: "8.4×", v: "ROI medio primo anno", s: "dati clienti" },
              { k: "GDPR", v: "Compliant by design", s: "EU data residency" },
            ].map((it) => (
              <div key={it.k}>
                <div className="display text-4xl md:text-5xl text-ink-paper">
                  {it.k}
                </div>
                <div className="font-sans text-[13px] text-ink-paper/85 mt-2">
                  {it.v}
                </div>
                <div className="fine mt-1">{it.s}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-fog">
        <span className="fine">scroll</span>
        <span className="block w-px h-8 bg-gradient-to-b from-ink-fog/50 to-transparent" />
      </div>
    </section>
  );
}
