export type SiteLocale = 'en' | 'it';

const italian: Record<string, string> = {
  'Aetheris Studio, back to top': 'Aetheris Studio, torna all’inizio',
  'Primary navigation': 'Navigazione principale',
  'Mobile navigation': 'Navigazione mobile',
  'Open navigation': 'Apri la navigazione',
  'Close navigation': 'Chiudi la navigazione',
  'Menu': 'Menu',
  'Work': 'Progetti',
  'The system': 'Il sistema',
  'System': 'Sistema',
  'Engagement': 'Collaborazione',
  'Studio': 'Studio',
  'Qualify a project': 'Qualifica un progetto',
  'Skip to hero content': 'Vai al contenuto principale',
  'Integrated commerce growth · Europe': 'Crescita eCommerce integrata · Europa',
  'Commerce,': 'Il commerce,',
  'seen whole.': 'visto per intero.',
  'We connect storefront, measurement, acquisition, conversion and retention into one accountable growth system for ambitious European consumer brands.':
    'Colleghiamo storefront, misurazione, acquisizione, conversione e retention in un unico sistema di crescita misurabile, con responsabilità chiare, per brand consumer europei ambiziosi.',
  'Qualify your project': 'Qualifica il tuo progetto',
  'See selected work': 'Scopri i progetti selezionati',
  'For established consumer brands with active eCommerce across Europe.':
    'Per brand consumer consolidati con un eCommerce attivo in Europa.',
  'Skip intro': 'Salta l’intro',
  'Aetheris Studio opening motion in progress. Press Escape or interact to skip.':
    'Animazione introduttiva Aetheris Studio in corso. Premi Esc o interagisci per saltarla.',
  'Aetheris Studio opening motion complete.': 'Animazione introduttiva Aetheris Studio completata.',
  'Aetheris Studio opening motion skipped; final content is ready.':
    'Animazione introduttiva Aetheris Studio saltata; il contenuto è pronto.',

  'Selected work & systems': 'Progetti e sistemi selezionati',
  'Evidence': 'Prove',
  'before theatre.': 'prima della scena.',
  'Live storefronts, operating archives and in-house systems. Every entry states what was verified—and what it does not attempt to prove.':
    'Storefront live, archivi operativi e sistemi sviluppati internamente. Ogni voce dichiara cosa è stato verificato e cosa non intende dimostrare.',
  'Verified work and systems': 'Progetti e sistemi verificati',
  'Production verified': 'Produzione verificata',
  'Operating archive verified': 'Archivio operativo verificato',
  'Live system verified': 'Sistema live verificato',
  'Verification record': 'Registro di verifica',

  'The fragmentation tax': 'Il costo della frammentazione',
  'Your customer sees one brand.': 'Il cliente vede un unico brand.',
  'Your operation behaves like six.': 'La tua organizzazione ne gestisce sei.',
  'Untrusted measurement': 'Misurazione poco affidabile',
  'When every team reads a different number, prioritisation becomes opinion.':
    'Quando ogni team legge numeri diversi, le priorità diventano opinioni.',
  'Disconnected execution': 'Esecuzione disconnessa',
  'Storefront, media and content optimise their own outputs instead of one commercial outcome.':
    'Storefront, media e contenuti ottimizzano i propri output invece di un unico risultato commerciale.',
  'Slow learning loops': 'Cicli di apprendimento lenti',
  'Signals arrive after the moment to act—and the same problems return in the next cycle.':
    'I segnali arrivano dopo il momento utile per agire e gli stessi problemi tornano nel ciclo successivo.',
  'The problem is rarely a lack of activity. It is the absence of one operating system.':
    'Il problema raramente è la mancanza di attività. È l’assenza di un unico sistema operativo.',
  'One connected system': 'Un unico sistema connesso',
  'Five disciplines.': 'Cinque discipline.',
  'One commercial view.': 'Una visione commerciale.',
  'We diagnose commerce as a whole, then focus the team on the workstreams with the clearest commercial rationale.':
    'Analizziamo il commerce nel suo insieme, poi concentriamo il team sui flussi di lavoro con la logica commerciale più chiara.',
  'Start with clarity': 'Partire dalla chiarezza',
  'Find the constraint before adding more activity.':
    'Individua il vincolo prima di aggiungere altra attività.',
  'The Commerce Growth Diagnostic turns the five-discipline view into one ordered commercial plan.':
    'Il Commerce Growth Diagnostic trasforma la lettura delle cinque discipline in un piano commerciale ordinato.',
  'See the Diagnostic': 'Scopri il Diagnostic',

  'Selected work · proof ledger': 'Progetti selezionati · registro delle prove',
  'Built where commerce': 'Costruito dove il commerce',
  'meets execution.': 'incontra l’esecuzione.',
  'Our role': 'Il nostro ruolo',
  'Published scope': 'Perimetro pubblicato',
  'Evidence reviewed': 'Prove esaminate',
  'Verified outcome': 'Risultato verificato',
  'Claim boundary': 'Limite della dichiarazione',
  'Visit the live storefront': 'Visita lo storefront live',
  'project scope': 'perimetro del progetto',
  'evidence ledger': 'registro delle prove',

  'A paid, fixed-scope diagnostic that turns fragmented data into an ordered 90-day decision plan. Its timetable is confirmed after scope, access and data readiness.':
    'Un diagnostic a pagamento e perimetro definito che trasforma dati frammentati in un piano decisionale ordinato di 90 giorni. Le tempistiche vengono confermate dopo la verifica di perimetro, accessi e qualità dei dati.',
  'Qualify for a Commerce Growth Call': 'Qualificati per una Commerce Growth Call',
  'This is a fit call, not a free audit.': 'È una call di valutazione reciproca, non un audit gratuito.',
  'Fixed scope · Paid entry': 'Perimetro definito · Ingresso a pagamento',
  'Diagnostic / 90-day decision plan': 'Diagnostic / piano decisionale di 90 giorni',
  'What leaves the room': 'Cosa rimane dopo il confronto',
  'Commercial scoreboard · Opportunity map · Ordered backlog · 90-day decision plan':
    'Scoreboard commerciale · Mappa delle opportunità · Backlog ordinato · Piano decisionale di 90 giorni',

  'The flagship engagement': 'Il percorso principale',
  'Build the growth system': 'Costruisci il sistema di crescita',
  'your next stage requires.': 'che richiede la tua prossima fase.',
  'A focused 90-day engagement implementing the two to four priority workstreams selected through the Commerce Growth Diagnostic.':
    'Un percorso mirato di 90 giorni per implementare da due a quattro flussi di lavoro prioritari selezionati attraverso il Commerce Growth Diagnostic.',
  'What remains after 90 days': 'Cosa rimane dopo 90 giorni',
  'One accountable roadmap · A shared commercial scoreboard · An ordered backlog · Defined owners and decision cadence.':
    'Una roadmap con responsabilità chiare · Uno scoreboard commerciale condiviso · Un backlog ordinato · Owner e cadenza decisionale definiti.',
  'Discuss the 90-day system': 'Parliamo del sistema di 90 giorni',
  'Qualification first. The call is reserved for plausible mutual fit.':
    'Prima la qualificazione. La call è riservata ai casi con un possibile allineamento reciproco.',

  'Built in-house · captured in production': 'Sviluppati internamente · acquisiti in produzione',
  'Human judgement,': 'Giudizio umano,',
  'backed by systems': 'supportato da sistemi',
  'we can show.': 'che possiamo mostrare.',
  'These are dated, read-only captures from the operating systems—not interface mockups. Facts shown below are limited to what each capture and its canonical source can verify.':
    'Sono acquisizioni datate e in sola lettura dei sistemi operativi, non mockup di interfaccia. I fatti riportati si limitano a ciò che ogni acquisizione e la relativa fonte canonica possono verificare.',
  'Operating scope': 'Perimetro operativo',
  'Facts visible at capture': 'Fatti visibili nell’acquisizione',
  'The systems preserve context and evidence. Named people remain accountable for every recommendation, approval and release.':
    'I sistemi preservano contesto e prove. Le persone responsabili restano identificabili per ogni raccomandazione, approvazione e rilascio.',

  'The Aetheris atelier': 'L’atelier Aetheris',
  'One accountable room.': 'Un unico spazio responsabile.',
  'The craft the work requires.': 'Il mestiere che il lavoro richiede.',
  'Each engagement is assembled around the commercial constraint, with a named lead and explicit ownership for every discipline in scope.':
    'Ogni percorso viene costruito intorno al vincolo commerciale, con un referente nominato e responsabilità esplicite per ogni disciplina coinvolta.',
  'The craft is human. The system preserves its continuity.':
    'Il mestiere è umano. Il sistema ne preserva la continuità.',
  'Disciplines and ownership inside the Aetheris atelier':
    'Discipline e responsabilità all’interno dell’atelier Aetheris',
  'Every engagement scope names the people involved, their decision rights and the capacity reserved.':
    'Ogni perimetro di lavoro indica le persone coinvolte, i loro diritti decisionali e la capacità riservata.',
  'The people behind the system': 'Le persone dietro il sistema',
  'The hands behind the work.': 'Le mani dietro il lavoro.',
  'Each portrait moves from a Renaissance interpretation to the person behind it. Profiles are released individually, once identity, role and image permissions are complete.':
    'Ogni ritratto passa da un’interpretazione rinascimentale alla persona che rappresenta. I profili vengono pubblicati singolarmente solo dopo la conferma di identità, ruolo e autorizzazioni d’immagine.',
  'Aetheris Studio people': 'Persone di Aetheris Studio',
  'Portrait reserved': 'Ritratto riservato',
  'Identity and image approval pending': 'Identità e autorizzazione immagine in attesa',

  'Explore': 'Esplora',
  'Selected work': 'Progetti selezionati',
  'The Diagnostic': 'Il Diagnostic',
  'In-house systems': 'Sistemi interni',
  'Atelier': 'Atelier',
  'Connect': 'Contatti',
  'Email': 'Email',
  'Legal': 'Note legali',
  'Privacy': 'Privacy',
  'Cookies': 'Cookie',
  'Cookie choices': 'Preferenze cookie',
  'Back to the oculus': 'Torna all’oculo',
  'Footer navigation': 'Navigazione a piè di pagina',
  'A business unit of Aetheris Solutions S.r.l.':
    'Una business unit di Aetheris Solutions S.r.l.',
  'Aetheris Solutions S.r.l. · Registered office Via Giovanni Pastorelli 4/D, 20143 Milan, Italy · Milan Monza Brianza Lodi Companies Register / VAT and tax no. 14468170965 · REA MI-2786509 · Share capital €10,000 fully paid · Sole shareholder company':
    'Aetheris Solutions S.r.l. · Sede legale Via Giovanni Pastorelli 4/D, 20143 Milano, Italia · Registro Imprese Milano Monza Brianza Lodi / P. IVA e C.F. 14468170965 · REA MI-2786509 · Capitale sociale €10.000 i.v. · Società a socio unico',

  'Privacy controls': 'Controlli della privacy',
  'Choose what may run': 'Scegli cosa può essere attivato',
  'Your privacy, by design.': 'La tua privacy, by design.',
  'Essential site functions are always available. Google Analytics and Microsoft Clarity remain off unless you choose to activate analytics. Advertising technologies are not active.':
    'Le funzioni essenziali del sito sono sempre disponibili. Google Analytics e Microsoft Clarity restano disattivati finché non scegli di attivare gli analytics. Non sono presenti tecnologie pubblicitarie.',
  'Read the cookies notice': 'Leggi l’informativa cookie',
  'Optional technology preferences': 'Preferenze per le tecnologie opzionali',
  'Essential': 'Essenziali',
  'Security, navigation and the protected qualification form.':
    'Sicurezza, navigazione e modulo di qualificazione protetto.',
  'Essential technologies always active': 'Tecnologie essenziali sempre attive',
  'Always active': 'Sempre attivi',
  'Analytics': 'Analytics',
  'Helps us understand aggregate journeys and improve the site.':
    'Ci aiuta a comprendere i percorsi aggregati e migliorare il sito.',
  'Marketing': 'Marketing',
  'No advertising or personalisation technology is active.':
    'Non è attiva alcuna tecnologia pubblicitaria o di personalizzazione.',
  'Marketing technologies inactive': 'Tecnologie di marketing inattive',
  'Inactive': 'Inattivo',
  'Reject non-essential': 'Rifiuta i non essenziali',
  'Save choices': 'Salva le preferenze',
  'Preferences': 'Preferenze',
  'Accept analytics': 'Accetta gli analytics',
  'Close privacy choices and reject optional technologies':
    'Chiudi le preferenze privacy e rifiuta le tecnologie opzionali',
  'Privacy preferences saved.': 'Preferenze privacy salvate.',
  'Optional technologies rejected.': 'Tecnologie opzionali rifiutate.',

  'capabilities': 'competenze',
  'Storefront': 'Storefront',
  'Platform, merchandising, product discovery and international experience.':
    'Piattaforma, merchandising, scoperta prodotto ed esperienza internazionale.',
  'UX architecture': 'Architettura UX',
  'Internationalisation': 'Internazionalizzazione',
  'Measurement': 'Misurazione',
  'Trusted tracking, commercial economics, catalog health and decision-ready reporting.':
    'Tracking affidabile, economia commerciale, qualità del catalogo e reporting pronto per le decisioni.',
  'Attribution': 'Attribuzione',
  'Commercial scoreboard': 'Scoreboard commerciale',
  'Demand': 'Domanda',
  'Paid acquisition, search, content and market intelligence connected to the same priorities.':
    'Acquisizione a pagamento, search, contenuti e market intelligence connessi alle stesse priorità.',
  'Paid growth': 'Crescita paid',
  'SEO & GEO': 'SEO e GEO',
  'Market intelligence': 'Market intelligence',
  'Conversion': 'Conversione',
  'UX, CRO and experimentation focused on the moments that shape revenue.':
    'UX, CRO e sperimentazione concentrati sui momenti che determinano il fatturato.',
  'Experimentation': 'Sperimentazione',
  'Journey design': 'Design del percorso',
  'Merchandising': 'Merchandising',
  'Retention': 'Retention',
  'Lifecycle, CRM and content designed around customer value—not isolated sends.':
    'Lifecycle, CRM e contenuti progettati intorno al valore del cliente, non a invii isolati.',
  'Lifecycle': 'Lifecycle',
  'Content systems': 'Sistemi di contenuto',
  'Days 01—30': 'Giorni 01—30',
  'Days 31—60': 'Giorni 31—60',
  'Days 61—90': 'Giorni 61—90',
  'Establish the work.': 'Definire il lavoro.',
  'Confirm baselines, owners and the first deliverables required by the selected workstreams.':
    'Confermare baseline, owner e primi deliverable richiesti dai flussi di lavoro selezionati.',
  'Implement the priorities.': 'Implementare le priorità.',
  'Complete the agreed work across the two to four workstreams with the clearest rationale.':
    'Completare il lavoro concordato sui due-quattro flussi con la logica più chiara.',
  'Install the operating rhythm.': 'Installare il ritmo operativo.',
  'Validate delivery and leave ownership, reporting and the next decisions in place.':
    'Validare la delivery e lasciare responsabilità, reporting e prossime decisioni definiti.',
  'Trust the evidence.': 'Fidarsi delle prove.',
  'Establish what can be trusted across measurement, economics, funnel, catalog and technical health.':
    'Stabilire cosa è affidabile tra misurazione, economics, funnel, catalogo e salute tecnica.',
  'Map the opportunity.': 'Mappare l’opportunità.',
  'Locate the commercial leaks, dependencies and work with the clearest impact-to-effort rationale.':
    'Individuare dispersioni commerciali, dipendenze e attività con il rapporto impatto-sforzo più chiaro.',
  'Order the next 90 days.': 'Ordinare i prossimi 90 giorni.',
  'Define the priority workstreams, owners, scoreboard and decisions required to move.':
    'Definire flussi prioritari, owner, scoreboard e decisioni necessarie per avanzare.',

  'Headless Shopify · Live commerce': 'Headless Shopify · Commerce live',
  'A brand and three-language commerce system released to production.':
    'Un brand e un sistema commerce in tre lingue rilasciati in produzione.',
  'Premium retail · Content operations': 'Retail premium · Operazioni di contenuto',
  'A structured publishing system for luxury watch content and campaign-ready assets.':
    'Un sistema editoriale strutturato per contenuti di alta orologeria e asset pronti per le campagne.',
  'In-house system · Measurement & search': 'Sistema interno · Misurazione e search',
  'A live cross-source cockpit with baselines, evidence and a controlled work queue.':
    'Un cockpit live multi-sorgente con baseline, prove e una coda di lavoro controllata.',
  'In-house system · Content operations': 'Sistema interno · Operazioni di contenuto',
  'Brand context, editorial production, scheduling and approval in one governed queue.':
    'Contesto del brand, produzione editoriale, pianificazione e approvazione in un’unica coda governata.',
  'In-house system · Commercial operations': 'Sistema interno · Operazioni commerciali',
  'Signals, scoring, human approvals and CRM reconciliation kept in one operating ledger.':
    'Segnali, scoring, approvazioni umane e riconciliazione CRM riuniti in un unico registro operativo.',
  'Brand system · Headless Shopify · International commerce':
    'Sistema di brand · Headless Shopify · Commerce internazionale',
  'A branded commerce system—not a reskinned template.':
    'Un sistema commerce di brand, non un template rivestito.',
  'Aetheris connected brand identity, catalog, search, customer accounts, booking, cart and checkout in one headless Shopify experience across English, Italian and Spanish.':
    'Aetheris ha connesso identità di brand, catalogo, ricerca, account cliente, prenotazioni, carrello e checkout in un’unica esperienza Shopify headless in inglese, italiano e spagnolo.',
  'Brand system, experience architecture and end-to-end technical delivery.':
    'Sistema di brand, architettura dell’esperienza e delivery tecnica end-to-end.',
  'Brand identity': 'Identità di brand',
  'Headless Shopify': 'Headless Shopify',
  'EN / IT / ES': 'EN / IT / ES',
  'Catalog & search': 'Catalogo e search',
  'Booking': 'Prenotazioni',
  'GTM & technical SEO': 'GTM e SEO tecnica',
  'Live production storefront': 'Storefront live in produzione',
  'Canonical source repository': 'Repository sorgente canonico',
  'Aetheris-authored brand manual': 'Manuale di brand realizzato da Aetheris',
  'A multilingual commerce system released to production and available to customers.':
    'Un sistema commerce multilingue rilasciato in produzione e disponibile ai clienti.',
  'Production proves delivery. No revenue or conversion uplift is claimed without an approved baseline and period.':
    'La produzione dimostra la delivery. Non dichiariamo incrementi di fatturato o conversione senza baseline e periodo approvati.',
  'Live storefront capture · 22 July 2026': 'Acquisizione storefront live · 22 luglio 2026',
  'Turning luxury brand material into a controlled publishing system.':
    'Trasformare il materiale di un brand luxury in un sistema editoriale controllato.',
  'Aetheris structures retailer guidelines, official campaign material, editorial copy and scheduled content families into a traceable operating archive for Cielo 1914.':
    'Aetheris organizza linee guida del retailer, materiali ufficiali di campagna, copy editoriale e famiglie di contenuti pianificati in un archivio operativo tracciabile per Cielo 1914.',
  'Content operations, editorial system and campaign-ready asset orchestration.':
    'Operazioni di contenuto, sistema editoriale e orchestrazione di asset pronti per le campagne.',
  'Brand governance': 'Governance del brand',
  'Asset curation': 'Curatela degli asset',
  'Content families': 'Famiglie di contenuti',
  'Editorial copy': 'Copy editoriale',
  'Scheduling': 'Pianificazione',
  'Approval workflow': 'Flusso di approvazione',
  '2026 operating archive': 'Archivio operativo 2026',
  'Four structured content kits': 'Quattro kit di contenuti strutturati',
  'Live Social Agent production queue': 'Coda di produzione live del Social Agent',
  'A repeatable content operation with source material, drafts, schedules and governance attached to the work.':
    'Un’operazione di contenuto replicabile, con fonti, bozze, pianificazioni e governance collegate al lavoro.',
  'This case does not claim Shopify delivery or commercial uplift. Third-party campaign media remains governed by retailer usage rights.':
    'Questo caso non dichiara una delivery Shopify né un incremento commerciale. I media di campagna di terze parti restano soggetti ai diritti d’uso del retailer.',
  'Operating archive reviewed · 22 July 2026': 'Archivio operativo esaminato · 22 luglio 2026',

  'Measurement, search & technical health': 'Misurazione, search e salute tecnica',
  'A read-only operating cockpit connecting GA4, Search Console, Merchant Center, PageSpeed, technical SEO, baselines and controlled work items.':
    'Un cockpit operativo in sola lettura che connette GA4, Search Console, Merchant Center, PageSpeed, SEO tecnica, baseline e attività controllate.',
  'Cross-source snapshots': 'Snapshot multi-sorgente',
  'Impact tracker': 'Impact tracker',
  'Technical SEO queue': 'Coda SEO tecnica',
  'Human-approved review artifacts': 'Artefatti di revisione approvati da persone',
  'Production Railway deployment': 'Deployment Railway in produzione',
  'Authenticated read-only cockpit': 'Cockpit autenticato in sola lettura',
  '7 sources tracked': '7 sorgenti monitorate',
  '17-day impact window': 'Finestra di impatto di 17 giorni',
  '38 open technical findings at capture': '38 rilievi tecnici aperti al momento dell’acquisizione',
  'Production · read-only capture · 22 July 2026': 'Produzione · acquisizione in sola lettura · 22 luglio 2026',
  'Brand intelligence & content operations': 'Brand intelligence e operazioni di contenuto',
  'A tenant-scoped system connecting brand rules, catalog context, editorial production, scheduling and a publisher handoff behind approval gates.':
    'Un sistema per tenant che connette regole di brand, contesto catalogo, produzione editoriale, pianificazione e passaggio al publisher dietro gate di approvazione.',
  'Per-client brand brain': 'Brand brain per cliente',
  'Editorial queue': 'Coda editoriale',
  'Publisher handoff': 'Passaggio al publisher',
  'Human approval': 'Approvazione umana',
  'Production read-only queue': 'Coda di produzione in sola lettura',
  'Cielo 1914 tenant selected': 'Tenant Cielo 1914 selezionato',
  '59 draft items in the operating queue': '59 bozze nella coda operativa',
  'No automatic publishing claim': 'Nessuna dichiarazione di pubblicazione automatica',
  'Signals, approval & CRM operations': 'Segnali, approvazione e operazioni CRM',
  'A signal-to-decision workflow connecting source ingestion, deterministic scoring, Telegram approval, provider reconciliation and Attio as the commercial source of truth.':
    'Un flusso dal segnale alla decisione che connette ingestione delle fonti, scoring deterministico, approvazione Telegram, riconciliazione dei provider e Attio come fonte commerciale ufficiale.',
  'Signal ingestion': 'Ingestione dei segnali',
  'Lead scoring': 'Scoring dei lead',
  'Attio sync': 'Sincronizzazione Attio',
  'Provider reconciliation': 'Riconciliazione dei provider',
  'Live aggregate dashboard': 'Dashboard aggregata live',
  '2,485 pipeline records': '2.485 record di pipeline',
  '30 approval decisions in 7 days': '30 decisioni di approvazione in 7 giorni',
  'No personal records shown in this capture': 'Nessun dato personale mostrato in questa acquisizione',
  'Production · aggregate capture · 22 July 2026': 'Produzione · acquisizione aggregata · 22 luglio 2026',

  'Commerce lead': 'Commerce lead',
  'Owns the commercial thesis, scope, priorities and decision cadence.':
    'Presidia tesi commerciale, perimetro, priorità e cadenza decisionale.',
  'Commercial brief': 'Brief commerciale',
  '90-day roadmap': 'Roadmap di 90 giorni',
  'Shopify engineering': 'Shopify engineering',
  'Owns storefront architecture, integrations, performance and release quality.':
    'Presidia architettura dello storefront, integrazioni, performance e qualità dei rilasci.',
  'Storefront delivery': 'Delivery dello storefront',
  'Technical systems': 'Sistemi tecnici',
  'UX & CRO': 'UX e CRO',
  'Owns journey evidence, conversion hypotheses and experience design.':
    'Presidia le prove del percorso, le ipotesi di conversione e il design dell’esperienza.',
  'Experiment backlog': 'Backlog degli esperimenti',
  'Paid acquisition': 'Acquisizione paid',
  'Owns media economics, feed quality and paid-growth learning loops.':
    'Presidia economics dei media, qualità dei feed e cicli di apprendimento della crescita paid.',
  'Acquisition plan': 'Piano di acquisizione',
  'Media scoreboard': 'Scoreboard media',
  'Search & content': 'Search e contenuti',
  'Owns demand intelligence, discoverability and content operations.':
    'Presidia demand intelligence, discoverability e operazioni di contenuto.',
  'Search system': 'Sistema search',
  'Editorial operations': 'Operazioni editoriali',
  'Retention & analytics': 'Retention e analytics',
  'Owns lifecycle, measurement trust and the shared commercial view.':
    'Presidia lifecycle, affidabilità della misurazione e visione commerciale condivisa.',
  'Lifecycle system': 'Sistema lifecycle',
  'Measurement layer': 'Layer di misurazione',

  'The live That’s It multilingual storefront, captured in production.':
    'Lo storefront multilingue live di That’s It, acquisito in produzione.',
  'A violet-dial watch used in Cielo 1914 content operations.':
    'Un orologio con quadrante viola utilizzato nelle operazioni di contenuto di Cielo 1914.',
  'Google Agent production cockpit showing an aggregate impact tracker.':
    'Cockpit di produzione del Google Agent con un impact tracker aggregato.',
  'Social Agent production read-only queue for Cielo 1914.':
    'Coda di produzione in sola lettura del Social Agent per Cielo 1914.',
  'Lead Gen Agent live aggregate operations dashboard with no personal records visible.':
    'Dashboard operativa aggregata live del Lead Gen Agent senza dati personali visibili.',
  'That’s It live production homepage showing the atelier-led brand and commerce experience.':
    'Homepage live in produzione di That’s It con l’esperienza di brand e commerce guidata dall’atelier.',
  'Violet-dial watch content used in the Cielo 1914 operating archive.':
    'Contenuto con orologio dal quadrante viola utilizzato nell’archivio operativo di Cielo 1914.',
  'Cielo 1914 retail storefront.': 'Storefront retail di Cielo 1914.',
  'Google Agent live cockpit showing baseline-versus-current evidence for That’s It.':
    'Cockpit live del Google Agent con confronto tra baseline e stato attuale per That’s It.',
  'Lead Gen Agent live aggregate operations dashboard with personal records excluded.':
    'Dashboard operativa aggregata live del Lead Gen Agent con esclusione dei dati personali.',

  'You & the business': 'Tu e l’azienda',
  'Business': 'Azienda',
  'Commerce context': 'Contesto commerce',
  'Context': 'Contesto',
  'The work ahead': 'Il lavoro da affrontare',
  'Brief': 'Brief',
  'Storefront & Shopify': 'Storefront e Shopify',
  'Measurement & analytics': 'Misurazione e analytics',
  'Paid growth, search & content': 'Paid growth, search e contenuti',
  'Conversion & product discovery': 'Conversione e product discovery',
  'Retention & CRM': 'Retention e CRM',
  'The security check needs another attempt.': 'Il controllo di sicurezza richiede un nuovo tentativo.',
  'The security check could not load. Check your connection and try again.':
    'Impossibile caricare il controllo di sicurezza. Verifica la connessione e riprova.',
  'Security check': 'Controllo di sicurezza',
  'Tell us who we are speaking with.': 'Indicaci con chi stiamo parlando.',
  'Enter a valid work email address.': 'Inserisci un indirizzo email di lavoro valido.',
  'Add your role in the business.': 'Indica il tuo ruolo nell’azienda.',
  'Add the company or brand name.': 'Indica il nome dell’azienda o del brand.',
  'Enter a valid store or company URL.': 'Inserisci un URL valido dello store o dell’azienda.',
  'Select the current commerce platform.': 'Seleziona la piattaforma commerce attuale.',
  'Select the closest annual revenue range.': 'Seleziona la fascia di fatturato annuo più vicina.',
  'Select the closest monthly media spend range.': 'Seleziona la fascia di spesa media mensile più vicina.',
  'Add the primary market or region.': 'Indica il mercato o la regione principale.',
  'Select at least one relevant workstream.': 'Seleziona almeno un ambito di lavoro rilevante.',
  'Describe the commercial problem you want to solve.': 'Descrivi il problema commerciale che vuoi risolvere.',
  'Tell us what has made this a priority now.': 'Spiegaci perché è diventato una priorità adesso.',
  'Select the intended timeline.': 'Seleziona la tempistica prevista.',
  'Select the available project budget.': 'Seleziona il budget disponibile per il progetto.',
  'Select the closest ownership and data-readiness state.':
    'Seleziona la situazione più vicina rispetto a responsabilità decisionale e disponibilità dei dati.',
  'Name the constraint most likely to slow progress.': 'Indica il vincolo che più probabilmente rallenterà il lavoro.',
  'Please confirm that you have read the privacy notice.':
    'Conferma di aver letto l’informativa sulla privacy.',
  'Complete the security check before sending.': 'Completa il controllo di sicurezza prima dell’invio.',
  'Review the highlighted fields.': 'Controlla i campi evidenziati.',
  'We could not send the brief. Check your connection and try again, or email info@aetherisstudio.com.':
    'Non siamo riusciti a inviare il brief. Verifica la connessione e riprova, oppure scrivi a info@aetherisstudio.com.',
  'Brief received': 'Brief ricevuto',
  'There appears to be a fit.': 'Sembra esserci un buon allineamento.',
  'Choose a time.': 'Scegli un orario.',
  'Your brief is with us.': 'Abbiamo ricevuto il tuo brief.',
  'It remains in review.': 'Resta in revisione.',
  'Your context matches the kind of commerce work we are set up to discuss. Book a 30-minute fit call with the team.':
    'Il tuo contesto è in linea con il tipo di lavoro commerce di cui siamo attrezzati a discutere. Prenota una call di allineamento di 30 minuti con il team.',
  'The automated screen does not make a rejection decision. Your brief stays in our review queue, and you can request human reassessment at any time.':
    'La valutazione automatizzata non prende decisioni di esclusione. Il brief resta nella coda di revisione e puoi chiedere in qualsiasi momento un riesame umano.',
  'Book the Commerce Growth Call': 'Prenota la Commerce Growth Call',
  'For a direct reply, or if the matter is time-sensitive, write to':
    'Per una risposta diretta, o se la richiesta è urgente, scrivi a',
  'Start with fit': 'Partiamo dall’allineamento',
  'Bring us the constraint.': 'Portaci il vincolo.',
  'We will tell you if we can move it.': 'Ti diremo se possiamo rimuoverlo.',
  'A short commercial brief before a call. It gives both sides enough context to make the first conversation useful.':
    'Un breve brief commerciale prima della call. Offre a entrambe le parti il contesto necessario per rendere utile la prima conversazione.',
  '03 steps': '03 passaggi',
  'About 4 minutes': 'Circa 4 minuti',
  'Human review available': 'Revisione umana disponibile',
  'Qualification progress': 'Avanzamento della qualificazione',
  'There is something to review.': 'C’è qualcosa da controllare.',
  'Step': 'Passaggio',
  'of': 'di',
  'The person and business behind the request.': 'La persona e l’azienda dietro la richiesta.',
  'A few ranges are enough. No sensitive financial documents are requested.':
    'Bastano alcune fasce indicative. Non chiediamo documenti finanziari sensibili.',
  'What needs to change, why now, and who can move the work.':
    'Cosa deve cambiare, perché adesso e chi può far avanzare il lavoro.',
  'Your contact and company details': 'I tuoi contatti e i dati dell’azienda',
  'Your name': 'Il tuo nome',
  'Required': 'Obbligatorio',
  'Work email': 'Email di lavoro',
  'Your role': 'Il tuo ruolo',
  'Company or brand': 'Azienda o brand',
  'Store or company URL': 'URL dello store o dell’azienda',
  'Your commerce context': 'Il tuo contesto commerce',
  'Commerce platform': 'Piattaforma commerce',
  'Select one': 'Seleziona una voce',
  'Headless commerce': 'Commerce headless',
  'Custom or other': 'Custom o altra',
  'Not sure': 'Non lo so',
  'Annual business revenue': 'Fatturato annuo dell’azienda',
  'Select a range': 'Seleziona una fascia',
  'Under €500k': 'Meno di €500k',
  'Prefer not to say': 'Preferisco non indicarlo',
  'Online and retail combined.': 'Online e retail complessivi.',
  'Monthly paid-media spend': 'Spesa mensile in paid media',
  'None today': 'Nessuna al momento',
  'Under €1k': 'Meno di €1k',
  'Primary market or region': 'Mercato o regione principale',
  'e.g. Italy, DACH, EU': 'es. Italia, DACH, UE',
  'Relevant workstreams': 'Ambiti di lavoro rilevanti',
  'Choose all that apply': 'Seleziona tutte le opzioni pertinenti',
  'This does not lock the eventual scope.': 'La selezione non vincola il perimetro finale.',
  'The commercial problem': 'Il problema commerciale',
  'What is happening, and what should be happening instead?':
    'Cosa sta accadendo e cosa dovrebbe accadere invece?',
  'Do not include payment data, health or criminal-offence data, or confidential personal information about other people.':
    'Non includere dati di pagamento, dati relativi alla salute o a reati, né informazioni personali riservate di altre persone.',
  'Why now?': 'Perché adesso?',
  'A launch, plateau, change of team, missed target, new market…':
    'Un lancio, una fase di stallo, un cambio di team, un obiettivo mancato, un nuovo mercato…',
  'Intended start': 'Inizio previsto',
  'As soon as possible': 'Il prima possibile',
  'Within 30 days': 'Entro 30 giorni',
  'Within 90 days': 'Entro 90 giorni',
  'Within six months': 'Entro sei mesi',
  'Researching for later': 'Sto valutando per più avanti',
  'Available project budget': 'Budget disponibile per il progetto',
  'Under €5k': 'Meno di €5k',
  'Not defined yet': 'Non ancora definito',
  'Ownership & data readiness': 'Ownership e disponibilità dei dati',
  'Select the closest state': 'Seleziona la situazione più vicina',
  'I own the decision and can arrange access to the data':
    'Sono responsabile della decisione e posso predisporre l’accesso ai dati',
  'I own or control the budget; access can be arranged':
    'Gestisco o controllo il budget; l’accesso ai dati può essere predisposto',
  'I have an internal sponsor and can involve the owner':
    'Ho uno sponsor interno e posso coinvolgere il responsabile della decisione',
  'I am exploring before ownership or access is confirmed':
    'Sto valutando prima che responsabilità decisionale o accessi siano confermati',
  'The likely constraint': 'Il vincolo più probabile',
  'Data quality, internal time, platform debt, stakeholder alignment…':
    'Qualità dei dati, tempo interno, debito di piattaforma, allineamento degli stakeholder…',
  'I have read the': 'Ho letto',
  'privacy notice': 'l’informativa sulla privacy',
  'I understand that the information marked “Required” is needed to assess and answer my enquiry; without it, this form cannot be submitted. This acknowledgement is not consent to marketing.':
    'Comprendo che le informazioni contrassegnate come “Obbligatorio” sono necessarie per valutare e rispondere alla mia richiesta; senza di esse il modulo non può essere inviato. Questa presa visione non costituisce consenso al marketing.',
  'Leave this field empty': 'Lascia vuoto questo campo',
  'Back': 'Indietro',
  'Continue': 'Continua',
  'Sending…': 'Invio in corso…',
  'Send the commercial brief': 'Invia il brief commerciale',
  'Your details are used to assess this request and coordinate a response. They are never sent to analytics.':
    'I tuoi dati vengono utilizzati per valutare la richiesta e coordinare una risposta. Non vengono mai inviati agli analytics.',
  'Preview mode: CRM submission is disabled. Use email to share test feedback.':
    'Modalità anteprima: l’invio al CRM è disattivato. Usa l’email per condividere feedback di test.',
};

export const siteLocale: SiteLocale =
  typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('it')
    ? 'it'
    : 'en';

export function translate(value: string): string {
  return siteLocale === 'it' ? italian[value] ?? value : value;
}

export function localizedPath(path: string): string {
  if (siteLocale !== 'it' || !path.startsWith('/')) return path;
  if (path === '/') return '/it/';
  if (path.startsWith('/it/')) return path;
  return `/it${path}`;
}

export function localeSwitchPath(): string {
  if (typeof window === 'undefined') return siteLocale === 'it' ? '/' : '/it/';
  const { pathname, search, hash } = window.location;
  if (siteLocale === 'it') {
    const englishPath = pathname.replace(/^\/it(?=\/|$)/, '') || '/';
    return `${englishPath}${search}${hash}`;
  }
  return `/it${pathname === '/' ? '/' : pathname}${search}${hash}`;
}
