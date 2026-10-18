-- Migrazione 006: lettori registrati (commenti con login) separati dalla redazione.
--
-- PRIMA di questa migrazione "autenticato" = redazione. Da ora ogni nuovo account creato dal login dei lettori
-- riceve automaticamente app_metadata.role = 'reader' (non modificabile dall'utente) e NON ha alcun permesso di redazione.
-- Gli account già esistenti (redazione) restano come sono: chi non ha ruolo = admin, "editor" = redattore.
-- Per creare un nuovo admin/redattore dal pannello Supabase (Auth > Users) dopo questa migrazione, promuovilo:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'nome@esempio.it';
--   (oppure "editor" per un redattore)

-- chi fa parte della redazione (admin o redattore), mai un lettore
create or replace function public.is_staff() returns boolean language sql stable set search_path = '' as
$$ select auth.role() = 'authenticated' and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') <> 'reader' $$;

-- is_admin: solo admin (né redattori né lettori)
create or replace function public.is_admin() returns boolean language sql stable set search_path = '' as
$$ select auth.role() = 'authenticated' and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') not in ('editor', 'reader') $$;

-- ogni nuovo account è un lettore, finché non viene promosso a mano
create or replace function public.mark_new_user_as_reader() returns trigger language plpgsql security definer set search_path = '' as
$$ begin
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"role":"reader"}'::jsonb;
  return new;
end $$;
revoke execute on function public.mark_new_user_as_reader() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_reader on auth.users;
create trigger on_auth_user_created_reader before insert on auth.users for each row execute function public.mark_new_user_as_reader();

-- ===== policy: la redazione, non "qualunque autenticato" =====
alter policy "admin articoli" on public.articles using ((select public.is_staff())) with check ((select public.is_staff()));
alter policy "lettura pubblica articoli" on public.articles using ((published and published_at <= now()) or (select public.is_staff()));
alter policy "revisioni admin" on public.article_revisions using ((select public.is_staff())) with check ((select public.is_staff()));
alter policy "stat lettura admin" on public.article_views_daily using ((select public.is_staff()));
alter policy "admin push" on public.push_subscriptions using ((select public.is_staff())) with check ((select public.is_staff()));
alter policy "log ricerche lettura" on public.search_log using ((select public.is_staff()));
alter policy "admin trasferimenti" on public.transfers using ((select public.is_staff())) with check ((select public.is_staff()));
alter policy "media scrittura admin" on storage.objects using (bucket_id = 'media' and (select public.is_staff())) with check (bucket_id = 'media' and (select public.is_staff()));

-- il refresh dei tag lo fa solo la redazione
create or replace function public.refresh_tag_index() returns void language plpgsql security definer set search_path = public as
$$ begin
  if (select public.is_staff()) then refresh materialized view concurrently public.tag_index; end if;
end $$;

-- ===== commenti: solo con login, moderati =====
alter table public.comments add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists comments_user_idx on public.comments (user_id, created_at);

-- quanti commenti ha mandato una persona nell'ultima ora (per il limite anti-spam; funzione interna, non richiamabile dall'esterno)
create or replace function public.recent_comment_count(p_user uuid) returns int language sql stable security definer set search_path = '' as
$$ select count(*)::int from public.comments where user_id = p_user and created_at > now() - interval '1 hour' $$;
revoke execute on function public.recent_comment_count(uuid) from public, anon;
grant execute on function public.recent_comment_count(uuid) to authenticated;

drop policy if exists "invio commenti" on public.comments;
drop policy if exists "lettori inviano commenti" on public.comments;
create policy "lettori inviano commenti" on public.comments for insert to authenticated
  with check (approved = false and user_id = (select auth.uid()) and public.recent_comment_count((select auth.uid())) < 5);

drop policy if exists "moderazione commenti" on public.comments;
create policy "moderazione commenti" on public.comments for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
alter policy "commenti approvati" on public.comments using (approved or (select public.is_staff()));

-- niente link nei commenti (anche se qualcuno scrive direttamente all'API)
alter table public.comments drop constraint if exists comments_no_links;
alter table public.comments add constraint comments_no_links check (body !~* '(https?://|www\.)') not valid;
