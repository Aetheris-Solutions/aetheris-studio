import Reveal from "./Reveal";

const faqs = [
  {
    q: "In quanto tempo l'agente è operativo?",
    a: "Tra 10 e 21 giorni a seconda della complessità. Starter live in 10 giorni, Business in 14, Enterprise da 30 in su. Ti consegniamo un piano dettagliato dopo la discovery call.",
  },
  {
    q: "Cosa succede se il mio team non sa usare l'AI?",
    a: "Niente. L'agente lavora in autonomia sui canali (WhatsApp, email, chat). Il team riceve solo quello che richiede intervento umano. Facciamo training di 2 ore al go-live, è più che sufficiente.",
  },
  {
    q: "I miei dati restano riservati?",
    a: "Sempre. Server EU (Frankfurt o Milano), DPA firmata, dati cifrati at-rest e in-transit. Per settori regolati offriamo deploy on-premise. Non addestriamo modelli pubblici sui tuoi dati.",
  },
  {
    q: "Cosa succede se non sono soddisfatto?",
    a: "Se al mese 3 non hai raggiunto il 50% del ROI atteso (concordato per iscritto al kickoff), continuiamo a lavorare gratis fino a portarti lì. Niente garbo, sta in contratto.",
  },
  {
    q: "Posso portarmi via il mio agente?",
    a: "Sì, in qualsiasi momento. Codice, prompt, knowledge base e dati sono tuoi. Ti consegniamo tutto in formato standard (Git repo, JSON, vector DB export). Zero lock-in.",
  },
  {
    q: "Lavorate con aziende fuori dall'Italia?",
    a: "Sì, ma il nostro core è il mercato italiano (lingua, GDPR, fatturazione, tono). Per progetti internazionali parla con noi: lavoriamo già con clienti in CH, FR, DE, UK.",
  },
  {
    q: "Cosa differenzia voi da altri agenti AI o da n8n / Make / chatbot?",
    a: "Tre cose: (1) progettiamo agenti autonomi, non workflow rigidi — comprendono contesto e si adattano; (2) integriamo deeply nel tuo stack (CRM, ERP), non restano a galla; (3) garantiamo ROI per iscritto. Non vendiamo strumenti, vendiamo risultati.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="section relative border-t border-white/5">
      <div className="container-narrow grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="cross" />
              <span className="eyebrow">Faq</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="display text-4xl md:text-5xl text-ink-paper leading-[1.05]">
              Domande{" "}
              <span className="display-italic text-ink-gold">
                frequenti.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="lead mt-5 max-w-md">
              Tutto quello che chiedono sempre. Se non trovi la tua risposta,{" "}
              <a
                href="#contact"
                className="text-ink-paper underline underline-offset-4 decoration-ink-gold/60 hover:decoration-ink-gold"
              >
                scrivici
              </a>
              .
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <ul className="flex flex-col gap-px bg-white/8 rounded-2xl border border-white/8 overflow-hidden">
            {faqs.map((f, i) => (
              <li key={f.q} className="bg-ink-deep">
                <Reveal delay={i * 50}>
                  <details className="group">
                    <summary className="flex items-start justify-between gap-6 p-6 md:p-7 cursor-pointer hover:bg-white/[0.015] transition">
                      <div className="flex items-start gap-5">
                        <span className="font-mono text-[10.5px] text-ink-mute tracking-widest pt-1">
                          / 0{i + 1}
                        </span>
                        <span className="display text-xl md:text-2xl text-ink-paper leading-snug">
                          {f.q}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className="text-ink-gold text-2xl leading-none mt-0.5 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-6 md:px-7 pb-7 -mt-1 ml-0 md:ml-[3.25rem] text-ink-paper/75 text-[15.5px] leading-relaxed max-w-3xl">
                      {f.a}
                    </div>
                  </details>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
