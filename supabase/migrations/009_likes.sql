-- "Mi piace" sugli articoli (pulsante a cuore sotto il titolo, come alfredopedulla.com).
-- Tabella a parte: un like non deve cambiare la data di modifica dell'articolo (che Google legge).
create table if not exists public.article_likes (
  article_id uuid primary key references public.articles(id) on delete cascade,
  likes integer not null default 0 check (likes >= 0)
);
alter table public.article_likes enable row level security;
drop policy if exists "lettura pubblica like" on public.article_likes;
create policy "lettura pubblica like" on public.article_likes for select using (true);

-- +1 o -1, mai sotto zero, solo su articoli pubblicati; il browser ricorda se il lettore ha già messo il cuore
create or replace function public.like_article(p_slug text, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid; v integer;
begin
  if p_delta not in (1, -1) then return null; end if;
  select id into v_id from public.articles where slug = p_slug and published and published_at <= now();
  if v_id is null then return null; end if;
  insert into public.article_likes (article_id, likes) values (v_id, greatest(0, p_delta))
  on conflict (article_id) do update set likes = greatest(0, public.article_likes.likes + p_delta)
  returning likes into v;
  return v;
end $$;
revoke execute on function public.like_article(text, integer) from public;
grant execute on function public.like_article(text, integer) to anon, authenticated;
