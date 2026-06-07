-- Aetheris Solutions — contact_submissions schema
--
-- Run this once in your Supabase project (SQL Editor → New Query).
-- After running it, set these env vars in your hosting provider:
--   SUPABASE_URL=https://xxxx.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=eyJh... (Project Settings → API → service_role)

create extension if not exists "pgcrypto";

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null,
  email       text        not null,
  company     text,
  agent       text,
  message     text,
  source      text default 'homepage',
  ip          text,
  user_agent  text,
  status      text default 'new'
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_email_idx
  on public.contact_submissions (email);

-- Lock down public access. Only the service-role key (used server-side)
-- can insert/select/update.
alter table public.contact_submissions enable row level security;

-- (no policies = no anonymous access; service_role bypasses RLS)
