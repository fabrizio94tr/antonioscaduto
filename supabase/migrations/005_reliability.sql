-- Migrazione 005: indice di affidabilità delle notizie (soprattutto calciomercato).
alter table articles add column if not exists reliability text
  check (reliability in ('ufficiale', 'fonte', 'indiscrezione'));
