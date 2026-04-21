import Image from "next/image";
import Reveal from "./Reveal";

export default function Quote() {
  return (
    <section className="relative py-40 md:py-56 overflow-hidden">
      {/* Pegasus ghost in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="relative w-[100vw] max-w-[1300px] aspect-[5/4] opacity-[0.09]">
          <Image
            src="/images/pegasus.png"
            alt=""
            fill
            sizes="100vw"
            className="object-contain engrave fade-mask-soft"
          />
        </div>
      </div>

      <div className="relative z-10 container-narrow text-center">
        <Reveal>
          <span className="eyebrow">Aetheris · Manifesto</span>
        </Reveal>

        <Reveal delay={160}>
          <blockquote className="mt-10">
            <p className="display italic text-3xl md:text-5xl lg:text-6xl text-ink-paper/95 leading-[1.15] max-w-4xl mx-auto">
              &ldquo;La tecnologia non deve impressionare.
              <br className="hidden md:block" />
              Deve{" "}
              <em className="text-ink-gold">funzionare</em>, in silenzio,
              <br className="hidden md:block" />
              mentre tu fai crescere la tua{" "}
              <em className="text-ink-gold">impresa</em>.&rdquo;
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-14 flex items-center justify-center gap-5">
            <span className="h-px w-16 bg-ink-gold/40" />
            <span className="smallcaps text-[10px] text-ink-fog">
              Aetheris Solutions
            </span>
            <span className="h-px w-16 bg-ink-gold/40" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
