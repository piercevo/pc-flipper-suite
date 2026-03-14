-- PC Flipper Suite — Supabase schema
-- Paste this into: Supabase Dashboard → SQL Editor → Run

-- Single table per user storing all app data as JSONB.
-- Simple, flexible, and easy to back up.

create table if not exists user_data (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  build        jsonb       not null default '{}'::jsonb,
  asking_price text        not null default '',
  yt_key       text        not null default '',
  flips        jsonb       not null default '[]'::jsonb,
  inventory    jsonb       not null default '[]'::jsonb,
  updated_at   timestamptz not null default now()
);

-- Row-level security: each user can only read/write their own row
alter table user_data enable row level security;

create policy "Users can manage their own data"
  on user_data
  for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);
