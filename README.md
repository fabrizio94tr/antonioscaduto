# Antonio Scaduto – sito di notizie calcio

Next.js 15 (App Router) + Supabase + Vercel. Stile ispirato ad alfredopedulla.com, con funzioni extra.

## Funzioni
- Home con hero, ultime notizie in timeline (`data | ora`), Editoriale, Più letti, newsletter
- Ticker "Ultim'ora", menu categorie (le stesse del vecchio sito), pagine statiche
- **Mercato Live** (`/mercato`): tracker trattative con stato (rumors / trattativa / vicino / ufficiale / sfumato), filtri e ricerca
- Ricerca, dark mode, tempo di lettura, condivisione (WhatsApp/Telegram/X), articoli correlati
- SEO: metadata, OpenGraph, JSON-LD NewsArticle, sitemap, RSS (`/feed.xml`)
- Admin `/admin` (Supabase Auth): crea/modifica/elimina articoli, bozze, in evidenza
- Senza variabili Supabase il sito parte con **dati demo** (utile per il confronto col cliente)

## Setup
1. Crea un progetto Supabase ed esegui nello SQL Editor `supabase/schema.sql`, poi `supabase/migrations/002_seo_cms.sql` e `003_features.sql` (in ordine).
2. Authentication → Users: crea l'utente redazione (email + password).
3. Copia `.env.example` in `.env.local` e compila le chiavi.
4. `npm install && npm run dev`
5. Deploy: importa il repo su Vercel e imposta le stesse variabili d'ambiente.

## Dashboard (/admin)
Panoramica, articoli (editor visuale, bozze, programmazione, immagini, tag, SEO: meta title/description, canonical, noindex,
immagine social, parola chiave con checklist e anteprima Google), pagine, categorie, Mercato Live, newsletter (CSV), impostazioni.

## Design ("Scoreboard")
Basato sulla variante F del wireframe (verde campo + neon, ispirata a Pedullà) con:
- Font ospitati in `public/fonts`: Anton (titoli/nomi), IBM Plex Sans (testi), IBM Plex Mono (orari/dati), Newsreader (lettura articoli)
- Modalità notte, grana sottile, ambra per il mercato, rosso per l'ultim'ora, colori ufficiali delle squadre nelle pagine `/tag/<squadra>` (`lib/teams.ts`)
- Hero a rotazione con nome gigante, pillola "N nuove notizie" in tempo reale, ricerca istantanea (`/` o Ctrl/⌘+K),
  Mercato Radar (termometro trattative), lettura con progresso/zoom/ascolto vocale, pallone che rotola con lo scroll
- Animazioni disattivate con "riduci movimento"; stili admin separati in `app/admin/admin.css`

## Sei stili con slider
Stessi contenuti, cinque grafiche; slider in basso a sinistra (la scelta resta sul dispositivo).
- **Classico** (`?stile=classico`): verde e neon, variante F del wireframe.
- **Pagina** (`?stile=pagina`): carta e inchiostro, rosso vermiglio, titoli giganti.
- **Volt** (`?stile=volt`): nero e giallo acido, hero a tutto schermo, riquadri, vetro, effetti 3D.
- **Quotidiano** (`?stile=quotidiano`): giornale sportivo, tre colonne, rosso/nero/bianco.
- **Pulita** (`?stile=pulita`): predefinita, replica di alfredopedulla.com come richiesto dal cliente. Intestazione verde scuro con tre linee (menu a tutto schermo con ricerca e categorie), striscia con le ultime 5 notizie, apertura grande, "NEWS" e schede foto+titolo+data, pulsanti social a destra, articolo in Titillium Web leggero (300). Niente intro, tendina, tema scuro, pallone, "LIVE", "A-/A+/Ascolta".
- **Diretta** (`?stile=diretta`): flusso di notizie in tempo reale stile portali di mercato; composizione da portale di mercato: barra verde, logo centrato, fila squadre, primo piano a carte, flusso di notizie solo testo con orario, articolo con titolo serif e riga autore.
- Effetti (`app/effects.css`): tendina di transizione tra pagine per ogni stile, barra di avanzamento, cursore a pallone (Volt), banda cinetica, count-up; disattivati con "riduci movimento".
- Dal pannello (Impostazioni → Sito): stile predefinito, slider visibile sì/no (da spegnere quando il cliente ha scelto), animazione del pallone, intro.
- Codice: `app/globals.css` (classico) e `app/style-new.css`, `style-bold.css`, `style-cds.css`, `style-live.css`, attivi con `<html data-style="new|bold|cds|live">`.
- Indice di affidabilità sulle notizie (Ufficiale / Fonte diretta / Indiscrezione): campo nell'editor, badge sul sito (migrazione `005_reliability.sql`).

## Funzioni aggiuntive
- Pagine tag/squadra (`/tag/milan`), argomenti caldi in home, sitemap indicizzate + sitemap Google News
- Commenti con moderazione, notifiche push (ultim'ora), newsletter con invio (Resend) e disiscrizione
- Banner cookie con consenso (Google Analytics / AdSense solo dopo il consenso), spazi pubblicitari e sponsor, Search Console
- Risultati e classifiche (football-data.org), assistente AI per la SEO, cronologia modifiche, anteprima bozze, statistiche
- Ruoli: chi ha `role: editor` in `app_metadata` può scrivere articoli ma non toccare pagine/categorie/impostazioni/newsletter
  (`update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"editor"}' where email = '...';`)
- Variabili opzionali: vedi `.env.example`

## Import dal vecchio WordPress
`SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-wordpress.mjs` (opzioni `--limit N`, `--since AAAA-MM-GG`).
Rilanciabile senza duplicati. La service_role key non va mai su Vercel né nel repo.
`node scripts/migrate-images.mjs` sposta le copertine su Supabase Storage (WebP). `node scripts/check-redirects.mjs <url-sito>` verifica i vecchi URL.
Gli URL degli articoli restano identici a quelli attuali (`/slug-articolo`, `/category/news`).

## Da fare con il cliente
Logo/colori, contenuti delle pagine, migrazione articoli dal vecchio WordPress, upload immagini (Supabase Storage), editor ricco, gestione trasferimenti da admin, dominio, cookie banner e pubblicità.

## Lettori registrati e commenti con login (Resend)
- I commenti si possono scrivere solo dopo l'accesso: il lettore inserisce l'email, riceve un link (niente password) e torna all'articolo. I commenti restano **moderati** (Admin → Commenti).
- **Sicurezza**: i lettori sono utenti Supabase con `app_metadata.role = "reader"`, assegnato in automatico dal database ai nuovi account (migrazione `supabase/migrations/006_readers.sql`, già applicata). Un lettore non entra in `/admin`, non può scrivere articoli, impostazioni, pagine, né moderare: lo bloccano il middleware, le API e le policy del database (`is_staff()`).
- **Nuovi admin o redattori**: ora ogni account nuovo nasce "lettore". Dopo averlo creato in Supabase (Auth → Users), promuovilo dal SQL Editor:
  `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'nome@esempio.it';` (oppure `"editor"` per un redattore, poi si disconnette e si riconnette).
- **Invio delle email con Resend** (una volta sola, dal pannello Supabase):
  1. Su resend.com: aggiungi e verifica il dominio (es. `antonioscaduto.com`) e crea una API key.
  2. Supabase → Authentication → **SMTP Settings** → abilita il server SMTP personalizzato: host `smtp.resend.com`, porta `465`, utente `resend`, password = la API key, mittente `no-reply@antonioscaduto.com`, nome "Antonio Scaduto".
  3. Supabase → Authentication → **URL Configuration**: *Site URL* = indirizzo del sito; *Redirect URLs* = `https://<sito>/auth/callback` (aggiungi anche l'indirizzo di Vercel per i test e `http://localhost:3000/auth/callback`).
  4. Supabase → Authentication → **Email Templates** → "Magic Link": oggetto `Il tuo accesso ad Antonio Scaduto`; testo: `Ciao! Clicca qui per accedere e commentare: {{ .ConfirmationURL }} — Se non l'hai chiesto tu, ignora questa email.`
  Senza SMTP personalizzato Supabase usa il proprio mittente, che consente poche email l'ora: va bene per provare, non per il sito vero.

## AdSense e consenso (Google Funding Choices)

Con AdSense il consenso ai cookie lo gestisce **Google Funding Choices** (CMP certificata IAB TCF, obbligatoria per gli annunci nell'UE). Il banner proprio del sito si disattiva da solo quando in Admin → Impostazioni è impostato il codice AdSense (`ca-pub-…`).

1. Admin → Impostazioni: inserisci il codice editore AdSense (`ca-pub-XXXXXXXXXXXXXXXX`) e, se vuoi, l'ID Google Analytics.
2. In AdSense: **Privacy e messaggi → Normative europee**: crea il messaggio di consenso (scegli "Consenti, Rifiuta, Gestisci"), seleziona il sito e **pubblica**. Se usi Analytics, attiva anche i fini "Misurazione".
3. In AdSense: **Siti → antonioscaduto.com**: verifica il sito. Il file `/ads.txt` viene generato in automatico dal codice editore.
4. Il pulsante "Gestisci cookie" in fondo al sito riapre il messaggio di Google.
