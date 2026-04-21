import Image from "next/image";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-black" />

      <div className="relative z-10 container-narrow grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <Reveal>
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-ink-gold/60" />
              <span className="eyebrow">V · Inizia</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="display text-5xl md:text-7xl text-ink-paper leading-[1.03] max-w-[14ch]">
              Pronto a costruire il{" "}
              <em className="text-ink-gold">tuo agente</em>?
            </h2>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-8 text-lg md:text-xl text-ink-paper/70 max-w-xl leading-relaxed">
              Una call di 30 minuti, gratuita. Analizziamo i tuoi processi e
              mappiamo dove un agente AI può avere il maggior impatto sul tuo
              business — senza impegno.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <form
              action="mailto:info@aetheris.solutions"
              method="post"
              encType="text/plain"
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl"
            >
              <input
                name="name"
                placeholder="Nome"
                required
                className="bg-transparent border-b border-white/25 focus:border-ink-gold/80 py-3 text-ink-paper placeholder:text-ink-fog/80 outline-none transition"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="bg-transparent border-b border-white/25 focus:border-ink-gold/80 py-3 text-ink-paper placeholder:text-ink-fog/80 outline-none transition"
              />
              <input
                name="company"
                placeholder="Azienda"
                className="bg-transparent border-b border-white/25 focus:border-ink-gold/80 py-3 text-ink-paper placeholder:text-ink-fog/80 outline-none transition sm:col-span-2"
              />
              <textarea
                name="message"
                placeholder="Raccontaci cosa vorresti automatizzare…"
                rows={3}
                className="bg-transparent border-b border-white/25 focus:border-ink-gold/80 py-3 text-ink-paper placeholder:text-ink-fog/80 outline-none transition sm:col-span-2 resize-none"
              />
              <div className="sm:col-span-2 mt-6">
                <button type="submit" className="btn-ghost">
                  Prenota la call
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </form>
          </Reveal>
        </div>

        <div className="md:col-span-5 relative">
          <Reveal delay={200}>
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
              <Image
                src="/images/man-beard.png"
                alt=""
                fill
                sizes="40vw"
                className="object-contain engrave fade-mask"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
