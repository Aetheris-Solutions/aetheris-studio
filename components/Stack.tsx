import Image from "next/image";
import Reveal from "./Reveal";

const guarantees = [
  {
    code: "01",
    title: "GDPR & dati EU",
    body: "Dati ospitati su server EU (Frankfurt/Milano). DPA firmata, retention configurabile, opzione on-premise per settori regolati.",
  },
  {
    code: "02",
    title: "Trasparenza tecnica",
    body: "Accesso al codice sorgente dell'agente, log conversazioni, dashboard ROI in tempo reale. Niente black-box.",
  },
  {
    code: "03",
    title: "Garanzia ROI",
    body: "Se al mese 3 non hai raggiunto il 50% del ROI atteso, lavoriamo gratis fino a portarti lì. Per iscritto in contratto.",
  },
  {
    code: "04",
    title: "Tu sei il proprietario",
    body: "Codice, dati, prompt, modelli fine-tuned: tutto resta tuo. Zero lock-in, esportabile in qualsiasi momento.",
  },
];

const stack = [
  { cat: "LLM", items: ["GPT-5", "Claude 4.6", "Gemini 3 Pro", "Llama 4"] },
  { cat: "RAG / Vector", items: ["Pinecone", "Weaviate", "pgvector"] },
  { cat: "Orchestration", items: ["LangGraph", "n8n", "Make", "Temporal"] },
  { cat: "Channels", items: ["WhatsApp BSP", "Telegram", "Email", "Voice"] },
  { cat: "Data", items: ["Supabase", "Postgres", "BigQuery", "Snowflake"] },
  { cat: "CRM / Tools", items: ["HubSpot", "Salesforce", "Pipedrive", "Notion"] },
];

export default function Stack() {
  return (
    <section className="section relative border-t border-white/5">
      <div className="container-narrow grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Guarantees */}
        <div className="lg:col-span-7">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="cross" />
              <span className="eyebrow">Garanzie</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="display text-4xl md:text-5xl text-ink-paper leading-[1.05] max-w-[18ch]">
              Quattro garanzie{" "}
              <span className="display-italic text-ink-gold">scritte</span>{" "}
              in contratto.
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {guarantees.map((g, i) => (
              <Reveal key={g.code} delay={i * 90}>
                <div className="surface p-6 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
                      / {g.code}
                    </span>
                    <span className="cross" />
                  </div>
                  <h3 className="display text-2xl text-ink-paper">{g.title}</h3>
                  <p className="mt-3 text-ink-paper/70 text-[14.5px] leading-relaxed">
                    {g.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 -z-10 opacity-[0.07] pointer-events-none">
            <Image
              src="/images/woman-portrait.png"
              alt=""
              fill
              sizes="40vw"
              className="object-contain engrave fade-mask-soft"
            />
          </div>

          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="cross" />
              <span className="eyebrow">Stack tecnico</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="display text-3xl md:text-4xl text-ink-paper leading-[1.05] max-w-[18ch]">
              Best-in-class.{" "}
              <span className="display-italic text-ink-gold">
                Sempre aggiornato.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="lead mt-5">
              Selezioniamo modelli e tool in base al caso d&apos;uso, non per
              moda. Quando arriva un modello migliore, lo testiamo entro 30
              giorni.
            </p>
          </Reveal>

          <div className="mt-10 surface p-6 md:p-7">
            <div className="font-mono text-[10.5px] text-ink-mute tracking-widest mb-5 flex items-center justify-between">
              <span>~/aetheris/stack.json</span>
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-white/15" />
                <span className="w-2 h-2 rounded-full bg-white/15" />
                <span className="w-2 h-2 rounded-full bg-white/15" />
              </span>
            </div>
            <ul className="flex flex-col gap-4">
              {stack.map((row) => (
                <li key={row.cat}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-mono text-[11px] text-ink-gold/85 tracking-widest uppercase w-28">
                      {row.cat}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-28 -mt-7 sm:mt-0 ml-0 sm:ml-3">
                    {row.items.map((it) => (
                      <span
                        key={it}
                        className="font-mono text-[11.5px] text-ink-paper/85 px-2 py-1 border border-white/8 rounded-md bg-white/[0.015]"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
