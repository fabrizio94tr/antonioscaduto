-- Rinforzi di sicurezza (verifica ottobre 2026)

-- media: solo immagini, max 10 MB (prima accettava qualsiasi file, anche HTML)
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif']
 where id = 'media';

-- iscrizioni newsletter: solo email plausibili (niente testi lunghi o formule per Excel)
alter table public.subscribers drop constraint if exists subscribers_email_ok;
alter table public.subscribers add constraint subscribers_email_ok
  check (char_length(email) <= 254 and email ~* '^[a-z0-9._%+''-]+@[a-z0-9.-]+\.[a-z]{2,}$') not valid;

-- notifiche push: endpoint https e chiavi di lunghezza ragionevole
alter table public.push_subscriptions drop constraint if exists push_subscriptions_ok;
alter table public.push_subscriptions add constraint push_subscriptions_ok
  check (endpoint like 'https://%' and char_length(endpoint) <= 1000 and char_length(p256dh) <= 200 and char_length(auth) <= 100) not valid;

-- funzioni interne: non servono ai visitatori anonimi
revoke execute on function public.refresh_tag_index() from anon, public;
revoke execute on function public.recent_comment_count(uuid) from anon, public;
grant execute on function public.refresh_tag_index() to authenticated;
grant execute on function public.recent_comment_count(uuid) to authenticated;
