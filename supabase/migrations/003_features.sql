-- Migrazione 003: ruoli, tag, commenti, notifiche push, statistiche, cronologia, newsletter, impostazioni extra.
-- Esegui nello SQL Editor di Supabase DOPO la 002.

create extension if not exists unaccent;

-- ===== Ruoli: "editor" scrive articoli/mercato/commenti; chi non ha ruolo o è "admin" fa tutto =====
-- Per rendere editor un utente:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"editor"}' where email = 'redattore@esempio.it';
create or replace function is_admin() returns boolean language sql stable as
$$ select auth.role() = 'authenticated' and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') <> 'editor' $$;

drop policy if exists "admin pagine" on pages;
drop policy if exists "admin categorie" on categories;
drop policy if exists "admin impostazioni" on settings;
drop policy if exists "admin legge iscritti" on subscribers;
create policy "admin pagine" on pages for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin categorie" on categories for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin impostazioni" on settings for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin legge iscritti" on subscribers for select to authenticated using (is_admin());
create policy "admin gestisce iscritti" on subscribers for delete to authenticated using (is_admin());

-- ===== Indice dei tag (pagine /tag/nome) =====
drop materialized view if exists tag_index;
create materialized view tag_index as
  select trim(both '-' from regexp_replace(lower(unaccent(t)), '[^a-z0-9]+', '-', 'g')) as slug,
         min(t) as name, count(*)::int as n
  from articles, unnest(tags) as t
  where published
  group by 1
  having trim(both '-' from regexp_replace(lower(unaccent(t)), '[^a-z0-9]+', '-', 'g')) <> '';
create unique index tag_index_slug on tag_index (slug);
create index tag_index_n on tag_index (n desc);
grant select on tag_index to anon, authenticated;
create or replace function refresh_tag_index() returns void language sql security definer set search_path = public as
$$ refresh materialized view concurrently tag_index; $$;
grant execute on function refresh_tag_index() to anon, authenticated;

-- ===== Commenti (moderati) =====
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  author text not null check (char_length(author) between 2 and 60),
  body text not null check (char_length(body) between 3 and 1500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_article_idx on comments (article_id, created_at);
alter table comments enable row level security;
drop policy if exists "commenti approvati" on comments;
drop policy if exists "invio commenti" on comments;
drop policy if exists "moderazione commenti" on comments;
create policy "commenti approvati" on comments for select using (approved or auth.role() = 'authenticated');
create policy "invio commenti" on comments for insert to anon, authenticated with check (approved = false);
create policy "moderazione commenti" on comments for all to authenticated using (true) with check (true);

-- ===== Notifiche push =====
create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists "iscrizione push" on push_subscriptions;
drop policy if exists "admin push" on push_subscriptions;
create policy "iscrizione push" on push_subscriptions for insert to anon, authenticated with check (true);
create policy "admin push" on push_subscriptions for all to authenticated using (true) with check (true);

-- ===== Newsletter: disiscrizione con token =====
alter table subscribers add column if not exists token uuid not null default gen_random_uuid();
create unique index if not exists subscribers_token_idx on subscribers (token);
create or replace function unsubscribe(p_token uuid) returns boolean language plpgsql security definer set search_path = public as
$$ begin delete from subscribers where token = p_token; return found; end; $$;
grant execute on function unsubscribe(uuid) to anon, authenticated;
alter table articles add column if not exists notified boolean not null default false;

-- ===== Statistiche =====
create table if not exists article_views_daily (
  day date not null,
  article_id uuid not null references articles(id) on delete cascade,
  views int not null default 0,
  primary key (day, article_id)
);
alter table article_views_daily enable row level security;
drop policy if exists "stat lettura admin" on article_views_daily;
create policy "stat lettura admin" on article_views_daily for select to authenticated using (true);

create or replace function increment_views(p_slug text) returns void
language plpgsql security definer set search_path = public as
$$
declare v_id uuid;
begin
  update articles set views = views + 1 where slug = p_slug and published returning id into v_id;
  if v_id is not null then
    insert into article_views_daily (day, article_id, views) values ((now() at time zone 'Europe/Rome')::date, v_id, 1)
    on conflict (day, article_id) do update set views = article_views_daily.views + 1;
  end if;
end;
$$;
grant execute on function increment_views(text) to anon, authenticated;

create table if not exists search_log (
  id bigint generated always as identity primary key,
  q text not null,
  results int not null default 0,
  created_at timestamptz not null default now()
);
alter table search_log enable row level security;
drop policy if exists "log ricerche insert" on search_log;
drop policy if exists "log ricerche lettura" on search_log;
create policy "log ricerche insert" on search_log for insert to anon, authenticated with check (char_length(q) between 2 and 100);
create policy "log ricerche lettura" on search_log for select to authenticated using (true);

-- ===== Cronologia modifiche articoli =====
create table if not exists article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  title text, excerpt text, content text, meta_title text, meta_description text,
  saved_at timestamptz not null default now(),
  saved_by uuid default auth.uid()
);
create index if not exists revisions_article_idx on article_revisions (article_id, saved_at desc);
alter table article_revisions enable row level security;
drop policy if exists "revisioni admin" on article_revisions;
create policy "revisioni admin" on article_revisions for all to authenticated using (true) with check (true);

create or replace function save_revision() returns trigger language plpgsql security definer set search_path = public as
$$
begin
  if old.title is distinct from new.title or old.content is distinct from new.content
     or old.meta_title is distinct from new.meta_title or old.meta_description is distinct from new.meta_description then
    insert into article_revisions (article_id, title, excerpt, content, meta_title, meta_description)
    values (old.id, old.title, old.excerpt, old.content, old.meta_title, old.meta_description);
    -- tiene solo le ultime 30 versioni
    delete from article_revisions where article_id = old.id and id not in
      (select id from article_revisions where article_id = old.id order by saved_at desc limit 30);
  end if;
  return new;
end;
$$;
drop trigger if exists articles_revision on articles;
create trigger articles_revision before update on articles for each row execute function save_revision();

-- ===== Impostazioni aggiuntive =====
insert into settings (key, value) values
  ('ga_id',''),('gsc_verification',''),
  ('adsense_client',''),('ad_slot_article',''),('ad_slot_sidebar',''),('ad_slot_home',''),
  ('sponsor_image',''),('sponsor_link',''),('newsletter_from','')
on conflict (key) do nothing;
