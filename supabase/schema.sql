-- Esegui nello SQL Editor di Supabase

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  position int not null default 0,
  in_menu boolean not null default true
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null default '',
  image_url text,
  category_id uuid references categories(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists articles_pub_idx on articles (published, published_at desc);

create table if not exists pages (
  slug text primary key,
  title text not null,
  content text not null default ''
);

alter table categories enable row level security;
alter table articles enable row level security;
alter table pages enable row level security;

create policy "lettura pubblica categorie" on categories for select using (true);
create policy "lettura pubblica articoli" on articles for select using (published or auth.role() = 'authenticated');
create policy "lettura pubblica pagine" on pages for select using (true);

create policy "admin categorie" on categories for all to authenticated using (true) with check (true);
create policy "admin articoli" on articles for all to authenticated using (true) with check (true);
create policy "admin pagine" on pages for all to authenticated using (true) with check (true);

insert into categories (slug, name, position) values
  ('news','News',1),('calciomercato','Calciomercato',2),('champions-league','Champions League',3),
  ('editoriale','Editoriale',4),('premier-league','Premier League',5),('europa-league','Europa League',6),
  ('serie-a','Serie A',7),('conference-league','Conference League',8),('serie-b','Serie B',9),
  ('esclusiva','Esclusiva',10),('altro','Altro',11)
on conflict (slug) do nothing;

insert into pages (slug, title, content) values
  ('cosa-offriamo','Cosa offriamo','Contenuto da definire con il cliente.'),
  ('vuoi-collaborare-con-noi','Vuoi collaborare con noi?','Contenuto da definire con il cliente.'),
  ('chi-siamo','Chi siamo','Contenuto da definire con il cliente.'),
  ('contatti','Contatti','Contenuto da definire con il cliente.'),
  ('privacy-policy','Privacy Policy','Da completare.'),
  ('cookie-policy','Cookie Policy','Da completare.')
on conflict (slug) do nothing;

-- ===== Funzioni extra =====
alter table articles add column if not exists views int not null default 0;
alter table articles add column if not exists breaking boolean not null default false;

-- contatore letture (chiamabile anche da anonimi, solo incremento)
create or replace function increment_views(p_slug text) returns void
language sql security definer set search_path = public as
$$ update articles set views = views + 1 where slug = p_slug and published; $$;
grant execute on function increment_views(text) to anon, authenticated;

-- newsletter
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
alter table subscribers enable row level security;
create policy "iscrizione pubblica" on subscribers for insert to anon, authenticated with check (true);
create policy "admin legge iscritti" on subscribers for select to authenticated using (true);

-- tracker calciomercato
create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  player text not null,
  from_club text,
  to_club text,
  status text not null default 'rumors' check (status in ('rumors','trattativa','vicino','ufficiale','sfumato')),
  fee text,
  note text,
  article_slug text,
  updated_at timestamptz not null default now()
);
alter table transfers enable row level security;
create policy "lettura pubblica trasferimenti" on transfers for select using (true);
create policy "admin trasferimenti" on transfers for all to authenticated using (true) with check (true);
