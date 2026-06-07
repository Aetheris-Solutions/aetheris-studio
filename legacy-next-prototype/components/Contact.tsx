import Image from "next/image";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <section
      id="contact"
      className="section relative overflow-hidden border-t border-white/5"
    >
      {/* faint pegasus */}
      <div className="absolute right-[-15%] top-[5%] w-[55vw] max-w-[700px] opacity-[0.10] pointer-events-none select-none hidden lg:block">
        <Image
          src="/images/pegasus.png"
          alt=""
          width={900}
          height={1100}
          className="engrave fade-mask-soft"
        />
      </div>

      <div className="relative z-10 container-narrow grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="cross" />
              <span className="eyebrow">Inizia</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="display text-5xl md:text-6xl lg:text-7xl text-ink-paper leading-[1.02] max-w-[14ch]">
              Costruiamo il tuo{" "}
              <span className="display-italic text-ink-gold">
                primo agente.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={240}>
            <p className="lead mt-7 max-w-xl">
              Una call di 30 minuti, gratuita. Audit del processo, mappatura
              dei punti di leva, proposta tecnica entro 5 giorni lavorativi.
              Senza impegno.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <ul className="mt-8 flex flex-col gap-3 text-ink-paper/80 text-[15px]">
              <li className="flex gap-3">
                <span className="cross mt-[0.45em]" />
                Audit incluso · 30 minuti
              </li>
              <li className="flex gap-3">
                <span className="cross mt-[0.45em]" />
                Risposta entro 24h lavorative
              </li>
              <li className="flex gap-3">
                <span className="cross mt-[0.45em]" />
                Proposta tecnica + preventivo entro 5 giorni
              </li>
            </ul>
          </Reveal>

          <Reveal delay={480}>
            <div className="mt-10 surface p-5 flex flex-col sm:flex-row sm:items-center gap-4 max-w-md">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)] animate-pulse" />
                <span className="font-mono text-[12px] text-ink-paper">
                  Disponibili ora
                </span>
              </div>
              <div className="fine">3 slot liberi questa settimana</div>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal delay={200}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
