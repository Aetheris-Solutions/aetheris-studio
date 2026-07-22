import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { QUALIFICATION_URL } from '../content/home';
import { AetherisMark } from './AetherisMark';

type SiteHeaderProps = {
  style?: CSSProperties;
};

type HeaderTone = 'dark' | 'light';

export function SiteHeader({ style }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState<HeaderTone>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-header-tone]'));
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 28);
      const headerLine = 74;
      const active = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= headerLine && rect.bottom > headerLine;
      });
      setTone(active?.dataset.headerTone === 'light' ? 'light' : 'dark');
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1181px) and (min-aspect-ratio: 801/1000)');
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeAtDesktop);
    return () => desktop.removeEventListener('change', closeAtDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menu = menuRef.current;
    const toggle = menuToggleRef.current;
    const focusFirstItem = requestAnimationFrame(() => {
      menu?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });
    });
    const closeAndRestoreFocus = () => {
      setMenuOpen(false);
      requestAnimationFrame(() => toggle?.focus({ preventScroll: true }));
    };
    const handleMenuKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndRestoreFocus();
        return;
      }
      if (event.key !== 'Tab' || !menu || !toggle) return;

      const focusable = [toggle, ...menu.querySelectorAll<HTMLElement>('a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleMenuKeys);
    return () => {
      cancelAnimationFrame(focusFirstItem);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleMenuKeys);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className="site-header"
        data-scrolled={scrolled || menuOpen ? 'true' : 'false'}
        data-tone={menuOpen ? 'dark' : tone}
        style={style}
      >
        <a className="brand" href="#top" aria-label="Aetheris Studio, back to top" onClick={closeMenu}>
          <AetherisMark className="brand-mark" idPrefix="brand" />
          <span>Aetheris Studio</span>
        </a>

        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#system">System</a>
          <a href="#engagement">Engagement</a>
          <a href="#studio">Studio</a>
        </nav>

        <a className="header-cta" href={QUALIFICATION_URL}>
          Qualify a project <span aria-hidden="true">↓</span>
        </a>

        <button
          ref={menuToggleRef}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
      </header>

      <nav ref={menuRef} className="mobile-menu" id={menuId} aria-label="Mobile navigation" hidden={!menuOpen}>
        <div className="mobile-menu-index"><span>Aetheris Studio</span><span>Menu</span></div>
        <div className="mobile-menu-links">
          <a href="#work" onClick={closeMenu}><small>01</small>Work</a>
          <a href="#system" onClick={closeMenu}><small>02</small>The system</a>
          <a href="#engagement" onClick={closeMenu}><small>03</small>Engagement</a>
          <a href="#studio" onClick={closeMenu}><small>04</small>Studio</a>
        </div>
        <a className="mobile-menu-cta" href={QUALIFICATION_URL} onClick={closeMenu}>
          Qualify a project <span aria-hidden="true">↓</span>
        </a>
      </nav>
    </>
  );
}
