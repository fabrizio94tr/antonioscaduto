-- Migrazione 004: sicurezza e prestazioni (dai controlli "advisors" di Supabase).

-- Funzioni interne (trigger / manutenzione): non devono essere richiamabili dall'esterno via /rest/v1/rpc
revoke execute on function public.save_revision() from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
-- il refresh dei tag lo può lanciare solo la redazione (utenti autenticati), non i visitatori
revoke execute on function public.refresh_tag_index() from public, anon;
grant execute on function public.refresh_tag_index() to authenticated;
-- increment_views e unsubscribe restano pubbliche di proposito: validano l'input e fanno solo una cosa.

-- search_path fisso nelle funzioni
alter function public.set_updated_at() set search_path = '';
alter function public.is_admin() set search_path = '';

-- estensione fuori dallo schema public
create schema if not exists extensions;
alter extension unaccent set schema extensions;

-- policy: auth.role() valutato una volta sola per query, non per riga
alter policy "lettura pubblica articoli" on articles
  using ((published and published_at <= now()) or (select auth.role()) = 'authenticated');
alter policy "commenti approvati" on comments
  using (approved or (select auth.role()) = 'authenticated');

create index if not exists article_views_daily_article_idx on article_views_daily (article_id);
