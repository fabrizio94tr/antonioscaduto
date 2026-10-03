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
1. Crea un progetto Supabase ed esegui `supabase/schema.sql` nello SQL Editor.
2. Authentication → Users: crea l'utente redazione (email + password).
3. Copia `.env.example` in `.env.local` e compila le chiavi.
4. `npm install && npm run dev`
5. Deploy: importa il repo su Vercel e imposta le stesse variabili d'ambiente.

## Da fare con il cliente
Logo/colori, contenuti delle pagine, migrazione articoli dal vecchio WordPress, upload immagini (Supabase Storage), editor ricco, gestione trasferimenti da admin, dominio, cookie banner e pubblicità.
