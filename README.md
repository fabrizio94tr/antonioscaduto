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

## Due stili con slider (Classico / Nuovo)
- Il sito ha due versioni grafiche sugli stessi contenuti, con uno slider in basso a sinistra per confrontarle (la scelta resta sul dispositivo).
  **Classico**: verde e neon (variante F del wireframe). **Nuovo "Prima Pagina"**: carta e inchiostro, rosso vermiglio, titoli giganti, schede con ombra netta, foto in bicromia, hero a tutta larghezza.
- Link diretti: `/?stile=nuovo` e `/?stile=classico`.
- Dal pannello (Impostazioni → Sito): stile predefinito, slider visibile sì/no (da spegnere quando il cliente ha scelto), animazione del pallone (default: rotola), intro (default: sì).
- Codice: `app/globals.css` (classico) e `app/style-new.css` (nuovo, attivo con `<html data-style="new">`); elementi solo-nuovo con classe `only-new`.
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
