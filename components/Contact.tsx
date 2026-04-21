import Image from "next/image";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="section relative overflow-hidden border-t border-white/5">
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
              <span className="display-italic text-ink-gold">primo agente.</span>
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
            <form
              action="mailto:info@aetheris.solutions"
              method="post"
              encType="text/plain"
              className="surface p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[11px] text-ink-mute tracking-widest">
                  ~/aetheris/contact.form
                </span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/15" />
                  <span className="w-2 h-2 rounded-full bg-white/15" />
                  <span className="w-2 h-2 rounded-full bg-white/15" />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                    NOME *
                  </span>
                  <input
                    name="name"
                    placeholder="Mario Rossi"
                    required
                    className="input"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                    EMAIL *
                  </span>
                  <input
                    name="email"
                    type="email"
                    placeholder="mario@azienda.it"
                    required
                    className="input"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                    AZIENDA
                  </span>
                  <input
                    name="company"
                    placeholder="Nome azienda · settore"
                    className="input"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                    AGENTE D&apos;INTERESSE
                  </span>
                  <select name="agent" className="input" defaultValue="">
                    <option value="" disabled>
                      Seleziona un agente…
                    </option>
                    <option value="hermes">Hermes — Lead Qualifier</option>
                    <option value="vulcano">Vulcano — Operations Engine</option>
                    <option value="minerva">Minerva — Data Analyst</option>
                    <option value="custos">Custos — Customer Care</option>
                    <option value="custom">Agente custom</option>
                    <option value="dontknow">Non sono sicuro / consigliami</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                    COSA VUOI AUTOMATIZZARE
                  </span>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Es: voglio automatizzare le risposte ai lead su WhatsApp e prenotare le call sul calendario…"
                    className="input resize-none"
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:justify-between">
                <p className="fine">
                  Cliccando invia accetti la nostra Privacy Policy.
                </p>
                <button type="submit" className="btn btn-primary justify-center">
                  Prenota la call
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
