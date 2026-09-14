# Aetheris Studio

Migrazione autonoma del sito Webflow di Aetheris Studio, pronta per GitHub e
Cloudflare Pages.

## Struttura

- `webflow-site/`: sito statico pubblicato, incluse le sei pagine e gli asset.
- `functions/api/`: backend Cloudflare per il contact form.
- `scripts/import-webflow.mjs`: importazione ripetibile dallo staging Webflow.
- `tests/`: test automatici del contact form.
- `legacy-next-prototype/`: precedente concept Next.js, conservato ma escluso
  dal deploy.

## Pagine

- `/`
- `/services`
- `/portfolio`
- `/contact`
- `/ecommerce-growth-audit`
- `/privacy-policy`
- `/cookies-policy`

## Sviluppo locale

Non servono dipendenze npm.

```bash
npm run dev
```

Il sito sarà disponibile su `http://localhost:4173`.

## Verifica

```bash
npm test
```

Per riapplicare le correzioni SEO/crawlability ai file statici dopo una
reimportazione Webflow:

```bash
npm run seo:apply
```

Il test interattivo del menu mobile richiede Chrome headless avviato con
DevTools sulla porta `9222`:

```bash
npm run test:browser
```

## Reimportazione

Per aggiornare la copia a partire dallo staging pubblico:

```bash
npm run import:webflow
```

Lo script scarica HTML, CSS, JavaScript, font e immagini, li salva localmente e
reinserisce il contact form proprietario. Non modifica chiavi o segreti.

## Contact form

Il form usa:

- reCAPTCHA v3, verificato lato server;
- Resend per la notifica a `info@aetherisstudio.com`;
- autoresponder per la persona che compila il form;
- honeypot e validazione server-side.

Le variabili richieste sono documentate in `.dev.vars.example`. I valori reali
devono essere configurati in Cloudflare e non devono essere committati.

La landing ecommerce usa le stesse funzioni `/api/contact` e
`/api/contact-config`, quindi eredita le variabili già configurate nel progetto
Cloudflare Pages.

## Deploy

La configurazione completa è in [CLOUDFLARE.md](./CLOUDFLARE.md).

- Production branch: `main`
- Build command: vuoto
- Build output directory: `webflow-site`

Il dominio canonico verificato è `aetherisstudio.com`.
