import Image from "next/image";
import Reveal from "./Reveal";

export default function Philosophy() {
  return (
    <section
      id="philosophy"
      className="relative py-32 md:py-48 overflow-hidden"
    >
      <div className="container-narrow grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        {/* Left: portrait */}
        <div className="md:col-span-5 relative order-2 md:order-1">
          <Reveal>
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
              <Image
                src="/images/woman-portrait.png"
                alt="Musa classica — rappresentazione dell'intelligenza"
                fill
                sizes="(max-width: 768px) 80vw, 40vw"
                className="object-contain engrave fade-mask"
              />
            </div>
          </Reveal>
        </div>

        {/* Right: text */}
        <div className="md:col-span-7 order-1 md:order-2">
          <Reveal>
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-ink-gold/60" />
              <span className="eyebrow">I · Filosofia</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="display text-4xl md:text-6xl text-ink-paper leading-[1.05] max-w-[18ch]">
              L&apos;intelligenza è{" "}
              <em className="text-ink-gold">un&apos;arte antica</em>,
              <br />
              oggi al servizio del tuo business.
            </h2>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-8 text-lg md:text-xl text-ink-paper/75 max-w-xl leading-relaxed">
              Aetheris nasce dall&apos;idea che la tecnologia più potente debba
              essere anche la più invisibile. I nostri{" "}
              <em className="text-ink-paper">agenti AI</em> non sostituiscono
              il tuo team: lo{" "}
              <em className="text-ink-paper">potenziano</em>, assorbendo le
              attività ripetitive e amplificando le decisioni strategiche.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <p className="mt-6 text-lg md:text-xl text-ink-paper/75 max-w-xl leading-relaxed">
              Progettiamo sistemi su misura — non template. Ogni agente è
              disegnato attorno al tuo contesto, ai tuoi dati, alle tue
              metriche.
            </p>
          </Reveal>

          <Reveal delay={480}>
            <div className="hairline mt-14 max-w-lg" />
            <blockquote className="mt-10 max-w-xl">
              <p className="display italic text-2xl md:text-3xl text-ink-paper/90 leading-snug">
                &ldquo;Omnia fert ætas — il tempo porta ogni cosa. A noi
                resta il compito di impiegarlo meglio.&rdquo;
              </p>
              <footer className="mt-4 smallcaps text-[10px] text-ink-fog">
                — Aetheris Manifesto
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
