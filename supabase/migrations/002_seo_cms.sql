-- Migrazione 002: SEO, CMS completo, media, impostazioni. Esegui nello SQL Editor di Supabase.

-- ===== Articoli: SEO e campi redazionali =====
alter table articles add column if not exists meta_title text;
alter table articles add column if not exists meta_description text;
alter table articles add column if not exists canonical_url text;
alter table articles add column if not exists og_image_url text;
alter table articles add column if not exists noindex boolean not null default false;
alter table articles add column if not exists focus_keyword text;
alter table articles add column if not exists tags text[] not null default '{}';
alter table articles add column if not exists author_name text not null default 'Antonio Scaduto';
alter table articles add column if not exists wp_id int unique;
alter table articles add column if not exists updated_at timestamptz not null default now();

create or replace function set_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists articles_updated_at on articles;
create trigger articles_updated_at before update on articles for each row execute function set_updated_at();

-- ricerca full-text (italiano)
alter table articles add column if not exists fts tsvector
  generated always as (
    to_tsvector('italian', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,''))
  ) stored;
create index if not exists articles_fts_idx on articles using gin (fts);
create index if not exists articles_cat_idx on articles (category_id, published_at desc);
create index if not exists articles_views_idx on articles (views desc);
create index if not exists articles_tags_idx on articles using gin (tags);

-- ===== Pagine e categorie: SEO =====
alter table pages add column if not exists meta_title text;
alter table pages add column if not exists meta_description text;
alter table pages add column if not exists noindex boolean not null default false;
alter table pages add column if not exists updated_at timestamptz not null default now();

alter table categories add column if not exists description text;
alter table categories add column if not exists meta_title text;
alter table categories add column if not exists meta_description text;

-- ===== Impostazioni del sito (una riga chiave/valore per voce) =====
create table if not exists settings (
  key text primary key,
  value text not null default ''
);
alter table settings enable row level security;
drop policy if exists "lettura pubblica impostazioni" on settings;
drop policy if exists "admin impostazioni" on settings;
create policy "lettura pubblica impostazioni" on settings for select using (true);
create policy "admin impostazioni" on settings for all to authenticated using (true) with check (true);
insert into settings (key, value) values
  ('site_title','Antonio Scaduto'),
  ('tagline','Il calcio a 360 gradi'),
  ('meta_description','Antonio Scaduto: notizie, calciomercato, interviste ed esclusive. Il calcio a 360 gradi.'),
  ('og_image',''),('contact_email',''),
  ('facebook',''),('instagram',''),('x',''),('youtube',''),('telegram','')
on conflict (key) do nothing;

-- ===== Media (immagini caricate dalla dashboard) =====
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists "media lettura pubblica" on storage.objects;
drop policy if exists "media scrittura admin" on storage.objects;
create policy "media lettura pubblica" on storage.objects for select using (bucket_id = 'media');
create policy "media scrittura admin" on storage.objects for all to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

-- ===== Articoli programmati: i pubblici vedono solo quelli già in uscita =====
drop policy if exists "lettura pubblica articoli" on articles;
create policy "lettura pubblica articoli" on articles for select
  using ((published and published_at <= now()) or auth.role() = 'authenticated');
