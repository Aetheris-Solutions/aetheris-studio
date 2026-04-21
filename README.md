# Aetheris Solutions — Homepage

Sito homepage statico in **Next.js 16** (App Router) per **Aetheris Solutions**: agenti AI custom che ottimizzano il business.

Estetica ispirata a [aetherisstudio.com](https://www.aetherisstudio.com/), bilanciata con un posizionamento tecnico (framework AETHER, prodotti nominati, pricing trasparente).

---

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **TypeScript** strict
- **Tailwind CSS 3**
- **Google Fonts**: Instrument Serif · Inter · JetBrains Mono
- **Email**: Resend / Web3Forms / FormSubmit (fallback chain)
- **Database (opzionale)**: Supabase

---

## Sviluppo

```bash
npm install
cp .env.example .env.local   # opzionale: configura provider email/db
npm run dev                  # http://localhost:3000
```

## Build produzione

```bash
npm run build
npm start
```

---

## Sistema di contatto

Il form di contatto invia tutte le richieste a **`marouane.moustaid@aetheris.consulting`** (override con `CONTACT_TO_EMAIL`).

### Provider in cascata (priorità)

Il sistema prova i provider in quest'ordine, usando il primo configurato:

1. **Resend** *(consigliato per produzione)* — set `RESEND_API_KEY`
   - Free tier: 3.000 email/mese · dashboard, deliverability altissima
   - Signup: https://resend.com → API keys → crea → set env var
2. **Web3Forms** — set `WEB3FORMS_KEY`
   - Free, no signup approfondito · 250 email/mese
   - https://web3forms.com → Create access key
3. **FormSubmit.co** *(fallback zero-config, attivo di default)*
   - Nessuna configurazione richiesta
   - **Importante**: la prima submission verso un nuovo indirizzo invia
     un'email di attivazione al destinatario. Il destinatario deve
     cliccare il link "Activate Form" una volta. Da quel momento, tutte
     le successive arrivano dirette.

### Persistenza Supabase (opzionale)

Quando configurata, ogni richiesta viene salvata anche in DB.

```bash
# 1. Crea progetto su https://supabase.com
# 2. SQL Editor → incolla supabase/schema.sql → Run
# 3. Project Settings → API → copia URL + service_role key
# 4. Set env vars:
#    SUPABASE_URL=...
#    SUPABASE_SERVICE_ROLE_KEY=...
```

### Test del sistema email

```bash
npm run test:email
```

Invia una richiesta di prova reale al destinatario configurato usando lo stesso provider chain del Server Action.

---

## Struttura

```
app/
  layout.tsx          # Fonts, metadata
  page.tsx            # Composizione delle 9 sezioni
  globals.css         # Design system (tokens, type, surfaces)
  actions/
    contact.ts        # Server Action submitContact
components/
  Nav.tsx             # Header sticky con burger mobile
  Hero.tsx            # Hero con sky + KPI strip
  TrustBar.tsx        # Marquee tech stack
  Framework.tsx       # Framework AETHER (6 fasi)
  Agents.tsx          # 4 prodotti (Hermes, Vulcano, Minerva, Custos)
  CaseStudies.tsx     # 3 case study con numeri
  Stack.tsx           # Garanzie + tech stack
  Pricing.tsx         # 3 tier (Starter, Business, Enterprise)
  Faq.tsx             # 7 FAQ
  Contact.tsx         # Server wrapper sezione contatto
  ContactForm.tsx     # Client form con state UI (loading, success, error)
  Footer.tsx          # Footer 3 colonne
  Reveal.tsx          # IntersectionObserver scroll reveal
lib/
  email.ts            # Provider chain (Resend → Web3Forms → FormSubmit)
  supabase.ts         # REST helper Supabase (no SDK)
public/images/        # Incisioni classiche (sky, pegasus, ritratti)
scripts/
  test-email.mjs      # Test reale del sistema di invio
supabase/
  schema.sql          # CREATE TABLE contact_submissions
```

---

## Variabili d'ambiente

Vedi `.env.example`. Tutte opzionali — il sito funziona out-of-the-box con FormSubmit come fallback.

| Var | Scopo |
|---|---|
| `CONTACT_TO_EMAIL` | Destinatario delle richieste (default: `marouane.moustaid@aetheris.consulting`) |
| `RESEND_API_KEY` | Provider email primario (consigliato in produzione) |
| `RESEND_FROM_EMAIL` | Mittente email (default: onboarding@resend.dev) |
| `WEB3FORMS_KEY` | Provider email alternativo |
| `SUPABASE_URL` | Persistenza richieste in DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase (server-side only) |
| `SITE_ORIGIN` | Origin per FormSubmit (default: `https://aetheris.solutions`) |

---

## Deploy su Vercel

1. Push su GitHub (già fatto: [maru-mm/aetheris-solutions](https://github.com/maru-mm/aetheris-solutions))
2. Import su https://vercel.com/new → seleziona il repo
3. Aggiungi le env vars (Settings → Environment Variables)
4. Deploy

Il sito è 100% static + Server Actions, supportato nativamente da Vercel.
