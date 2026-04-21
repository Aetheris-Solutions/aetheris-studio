export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-14">
      <div className="container-narrow grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl leading-none">ÆS</span>
            <span className="smallcaps text-[10px] text-ink-fog">
              Aetheris&nbsp;Solutions
            </span>
          </div>
          <p className="mt-4 text-ink-fog max-w-sm text-sm leading-relaxed">
            Agenti AI su misura che ottimizzano il business e portano
            risultati misurabili.
          </p>
        </div>

        <div className="md:col-span-3">
          <div className="smallcaps text-[10px] text-ink-gold/80 mb-4">
            Contatti
          </div>
          <ul className="space-y-2 text-ink-paper/80 text-sm">
            <li>
              <a
                href="mailto:info@aetheris.solutions"
                className="hover:text-ink-paper"
              >
                info@aetheris.solutions
              </a>
            </li>
            <li className="text-ink-fog">Milano · Remote</li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="smallcaps text-[10px] text-ink-gold/80 mb-4">
            Naviga
          </div>
          <ul className="grid grid-cols-2 gap-y-2 text-ink-paper/80 text-sm">
            <li>
              <a href="#philosophy" className="hover:text-ink-paper">
                Filosofia
              </a>
            </li>
            <li>
              <a href="#agents" className="hover:text-ink-paper">
                Agenti
              </a>
            </li>
            <li>
              <a href="#method" className="hover:text-ink-paper">
                Metodo
              </a>
            </li>
            <li>
              <a href="#results" className="hover:text-ink-paper">
                Risultati
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-ink-paper">
                Contatti
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-narrow mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-3 text-xs text-ink-fog">
        <span>© {new Date().getFullYear()} Aetheris Solutions. Tutti i diritti riservati.</span>
        <span className="smallcaps text-[10px]">
          Crafted in the æther
        </span>
      </div>
    </footer>
  );
}
