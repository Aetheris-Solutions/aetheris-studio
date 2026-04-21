"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "#framework", label: "Metodo" },
  { href: "#agents", label: "Agenti" },
  { href: "#cases", label: "Case study" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-black/65 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container-narrow flex items-center justify-between py-4">
        <Link href="#top" className="flex items-center gap-3 group">
          <span className="display text-3xl leading-none tracking-tight">
            ÆS
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-[13px] text-ink-paper font-medium">
              Aetheris Solutions
            </span>
            <span className="fine text-[10px]">AI Agents · Custom built</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9 font-sans text-[14px] text-ink-fog">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-ink-paper transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href="#contact" className="btn btn-ghost">
            <span className="dot inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
            Disponibili ora
          </a>
          <a href="#contact" className="btn btn-primary">
            Prenota call
            <span className="arrow" aria-hidden>
              →
            </span>
          </a>
        </div>

        {/* Mobile burger */}
        <button
          aria-label="Apri menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex flex-col gap-1.5 p-2"
        >
          <span
            className={`block h-px w-6 bg-ink-paper transition ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-ink-paper transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-ink-paper transition ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden border-t border-white/5 transition-all duration-500 ${
          open ? "max-h-96 bg-black/85 backdrop-blur-xl" : "max-h-0"
        }`}
      >
        <div className="container-narrow py-6 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ink-paper text-lg"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-4 w-full justify-center"
          >
            Prenota call →
          </a>
        </div>
      </div>
    </header>
  );
}
