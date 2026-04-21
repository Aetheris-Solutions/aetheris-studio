# Aetheris Solutions — Homepage

Sito homepage statico in **Next.js 14** (App Router) per **Aetheris Solutions**, agenzia di agenti AI personalizzati che ottimizzano il business e portano risultati.

Ispirato esteticamente a [aetherisstudio.com](https://www.aetherisstudio.com/): tema dark, tipografia classica (Cinzel / Cormorant Garamond), incisioni in stile rinascimentale/barocco.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS 3
- Google Fonts (Cinzel, Cormorant Garamond, Inter)

## Struttura

```
app/
  layout.tsx      # Fonts, metadata, globals
  page.tsx        # Composizione sezioni
  globals.css     # Reset + design tokens
components/
  Nav.tsx         # Header con logo ÆS
  Hero.tsx        # Clouds sky + tagline + KPI strip
  Philosophy.tsx  # Sezione I — filosofia
  Agents.tsx      # Sezione II — i 4 agenti
  Method.tsx      # Sezione III — metodo in 4 fasi
  Quote.tsx       # Manifesto
  Results.tsx     # Sezione IV — risultati/numeri
  Contact.tsx     # Sezione V — form di contatto
  Footer.tsx      # Footer
  Reveal.tsx      # Client-side scroll reveal (IntersectionObserver)
public/images/
  sky.png, pegasus.png, man-*.png, woman-*.png
```

## Sviluppo

```bash
npm install
npm run dev
```

Apri http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Personalizzazione

- Le immagini delle incisioni sono in `public/images/`
- I colori e i font sono configurati in `tailwind.config.ts` (palette `ink.*`)
- Le sezioni sono modulari — ognuna è un componente autonomo in `components/`
