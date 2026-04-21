"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container-narrow flex items-center justify-between py-5">
        <Link href="#top" className="flex items-center gap-3 group">
          <span className="font-display text-3xl leading-none tracking-tight">
            ÆS
          </span>
          <span className="hidden sm:block smallcaps text-[10px] text-ink-fog group-hover:text-ink-paper transition">
            Aetheris&nbsp;Solutions
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 smallcaps text-[10px] text-ink-fog">
          <a href="#philosophy" className="hover:text-ink-paper transition">
            Filosofia
          </a>
          <a href="#agents" className="hover:text-ink-paper transition">
            Agenti
          </a>
          <a href="#method" className="hover:text-ink-paper transition">
            Metodo
          </a>
          <a href="#results" className="hover:text-ink-paper transition">
            Risultati
          </a>
        </nav>

        <a href="#contact" className="btn-ghost">
          <span>Inizia</span>
          <span className="arrow" aria-hidden>
            →
          </span>
        </a>
      </div>
    </header>
  );
}
