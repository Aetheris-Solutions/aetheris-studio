export default function Footer() {
  return (
    <footer className="relative border-t border-white/8 pt-20 pb-10">
      <div className="container-narrow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="display text-3xl leading-none">ÆS</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[14px] text-ink-paper font-medium">
                  Aetheris Solutions
                </span>
                <span className="fine text-[10.5px]">
                  AI Agents · Custom built · Made in Italy
                </span>
              </div>
            </div>
            <p className="mt-6 text-ink-fog max-w-md text-[14.5px] leading-relaxed">
              Progettiamo agenti AI su misura che ottimizzano operations e
              portano risultati misurabili. Framework AETHER, deploy in 14
              giorni, ROI garantito.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="chip">GDPR · EU data</span>
              <span className="chip">ISO 27001 ready</span>
              <span className="chip">P.IVA italiana</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow mb-5">Naviga</div>
            <ul className="flex flex-col gap-3 text-ink-paper/80 text-[14.5px]">
              <li>
                <a href="#framework" className="hover:text-ink-paper">
                  Framework AETHER
                </a>
              </li>
              <li>
                <a href="#agents" className="hover:text-ink-paper">
                  Agenti
                </a>
              </li>
              <li>
                <a href="#cases" className="hover:text-ink-paper">
                  Case study
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-ink-paper">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-ink-paper">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="eyebrow mb-5">Contatti</div>
            <ul className="flex flex-col gap-3 text-ink-paper/80 text-[14.5px]">
              <li>
                <a
                  href="mailto:info@aetheris.solutions"
                  className="hover:text-ink-paper"
                >
                  info@aetheris.solutions
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-ink-paper">
                  Prenota una call →
                </a>
              </li>
              <li className="text-ink-fog">Milano · Roma · Remote-first</li>
              <li className="text-ink-mute font-mono text-[12px] mt-2">
                Lun–Ven · 09:00–19:00 CET
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-3 text-[12.5px] text-ink-mute font-mono">
          <span>
            © {new Date().getFullYear()} Aetheris Solutions S.r.l. · P.IVA
            01234567890
          </span>
          <span className="flex gap-5">
            <a href="#" className="hover:text-ink-paper">
              Privacy
            </a>
            <a href="#" className="hover:text-ink-paper">
              Cookie
            </a>
            <a href="#" className="hover:text-ink-paper">
              Termini
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
