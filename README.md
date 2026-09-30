# Aetheris Studio

Migrazione autonoma del sito Webflow di Aetheris Studio, pronta per GitHub e
Cloudflare Pages.

## Struttura

- `webflow-site/`: sito statico pubblicato, incluse le sei pagine e gli asset.
- `functions/api/`: backend Cloudflare per il contact form.
- `scripts/seo-utils.mjs`: genera metadati SEO, consenso analytics, `sitemap.xml`,
  `robots.txt`, `_headers` e `404.html` in `webflow-site/`.
- `tests/`: test automatici del contact form e dei file statici.
- `docs/CONVERSION_TRACKING.md`: runbook per GTM, GA4 e Google Ads della
  conversione della landing campaign.
- `legacy-next-prototype/`: precedente concept Next.js, conservato ma escluso
  dal deploy.

## Pagine

- `/`
- `/services`
- `/portfolio`
- `/contact`
- `/ecommerce-growth-audit` (landing campaign, noindex e isolata dal sito)
- `/ecommerce-growth-audit/thank-you` (conferma dopo l'invio del form della
  landing, parte della campaign, noindex)
- `/privacy-policy`
- `/cookies-policy`

## Sviluppo locale

Non servono dipendenze npm.

```bash
npm run dev
```

Il sito sarà disponibile su `http://localhost:4173`. Il server Python non
riproduce il routing di Cloudflare Pages né gli header di `_headers`: per
esempio `/ecommerce-growth-audit/thank-you` restituisce 404 (aprire
`/ecommerce-growth-audit/thank-you.html`). Per riprodurre routing e header di
Pages:

```bash
npx wrangler pages dev webflow-site
```

Sulle pagine della campaign il banner dei consensi e Google Tag Manager si
attivano solo su `aetherisstudio.com` e `www.aetherisstudio.com`.

## Verifica

```bash
npm test
```

Dopo ogni modifica a `scripts/seo-utils.mjs`, rigenerare i file statici:

```bash
npm run seo:apply
```

`npm test` fallisce se i file generati in `webflow-site/` non corrispondono a
quelli prodotti da `seo:apply`.

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
riportate anche le modifiche fatte qui. Per aggiornare la copia pubblicata,
dal repo sorgente, sul commit da rilasciare:

```bash
npm test && npm run build:studio
git rev-parse --short HEAD
rsync -a --delete dist/ ~/aetheris-studio/webflow-site/ecommerce-growth-audit/
```

Mantenere entrambe le barre finali: `--delete` elimina dalla cartella tutto ciò
che non è in `dist/`, compresi i file con hash della build precedente, che
`git status` in questo repo deve mostrare come eliminati. Riportare lo SHA del
commit sorgente nella PR di Studio. `npm test` verifica che ogni file caricato
dalle pagine della campaign sia presente e che in `assets/` non restino file
inutilizzati.

Dopo un invio riuscito la landing porta a `/ecommerce-growth-audit/thank-you`,
che invia a Google Tag Manager l'evento `generate_lead` una sola volta, e solo se
Analytics o Advertising measurement erano già consentiti prima dell'invio: senza
consenso il lead non viene misurato (Attio resta il conteggio di riferimento).
Il banner della campaign offre due scelte separate, Analytics e
Advertising measurement; quello del sito principale resta solo analytics.
Configurazione di GTM, GA4 e Google Ads, QA e rilascio sono descritti in
[docs/CONVERSION_TRACKING.md](./docs/CONVERSION_TRACKING.md).

## Deploy

La configurazione completa è in [CLOUDFLARE.md](./CLOUDFLARE.md).

- Production branch: `main`
- Build command: `npm test`
- Build output directory: `webflow-site`

Il dominio canonico verificato è `aetherisstudio.com`.

## Colore e movimento

Il colore principale è `#9FC2FF`, con testo scuro per il contrasto.
`webflow-site/assets/css/studio-motion.css` contiene accenti, hover e focus;
`webflow-site/assets/js/studio-motion.js` gestisce reveal e stagger progressivi.
Il contenuto rimane leggibile senza JavaScript e con movimento ridotto.
Dopo le modifiche, eseguire `npm run seo:apply` per aggiornare gli URL con hash.
Mantenere lo script sincronizzato con `motion.js` nel sorgente della landing,
poi ricostruire e copiare la landing come descritto sopra.
