# Aetheris Studio

Migrazione autonoma del sito Webflow di Aetheris Studio, pronta per GitHub e
Cloudflare Pages.

## Struttura

- `webflow-site/`: sito statico pubblicato, incluse le sei pagine e gli asset.
- `functions/api/`: backend Cloudflare per il contact form.
- `scripts/seo-utils.mjs`: genera metadati SEO, consenso analytics, `sitemap.xml`,
  `robots.txt`, `_headers` e `404.html` in `webflow-site/`.
- `tests/`: test automatici del contact form e dei file statici.
- `legacy-next-prototype/`: precedente concept Next.js, conservato ma escluso
  dal deploy.

## Pagine

- `/`
- `/services`
- `/portfolio`
- `/contact`
- `/ecommerce-growth-audit` (landing campaign, noindex e isolata dal sito)
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

Dopo ogni modifica a `scripts/seo-utils.mjs`, rigenerare i file statici:

```bash
npm run seo:apply
```

Il test interattivo del menu mobile richiede Chrome headless avviato con
DevTools sulla porta `9222`:

```bash
npm run test:browser
```

## Webflow

Lo staging Webflow è dismesso e lo script di reimportazione è stato rimosso:
`webflow-site/` è l'unica fonte del sito.

## Contact form

Il form usa:

- reCAPTCHA v3, verificato lato server;
- Resend per la notifica a `info@aetherisstudio.com`;
- autoresponder per la persona che compila il form;
- honeypot e validazione server-side.

Le variabili richieste sono documentate in `.dev.vars.example`. I valori reali
devono essere configurati in Cloudflare e non devono essere committati.

La landing campaign `/ecommerce-growth-audit` usa le stesse funzioni
`/api/contact` e `/api/contact-config`, quindi eredita le variabili già
configurate nel progetto Cloudflare Pages. La homepage resta il sito
istituzionale.

La landing serve solo alla lead generation: resta `noindex, nofollow` (meta tag
e header `X-Robots-Tag`), fuori dalla sitemap e senza link da o verso il sito,
a parte le pagine legali. È una build Vite precompilata: il sorgente è nel repo
privato `Aetheris-Solutions/aetheris-studio-campaign-landing-page`, dove vanno
riportate anche le modifiche fatte qui.

## Deploy

La configurazione completa è in [CLOUDFLARE.md](./CLOUDFLARE.md).

- Production branch: `main`
- Build command: vuoto
- Build output directory: `webflow-site`

Il dominio canonico verificato è `aetherisstudio.com`.
