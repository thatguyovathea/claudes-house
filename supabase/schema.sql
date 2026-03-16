-- CMMC Apex — Supabase schema
-- Run this in the SQL editor of your Supabase project.

-- ─────────────────────────────────────────────────────────────────────────────
-- user_profiles
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  active_track text not null default 'CCP',
  exam_date    text,                          -- ISO string or null
  updated_at   timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "users can upsert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- sessions
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id              text primary key,           -- local UUID from SQLite
  user_id         uuid not null references auth.users(id) on delete cascade,
  track           text not null,
  mode            text not null,
  level           text not null,
  domain          text,
  total           integer not null,
  correct         integer not null,
  duration_sec    integer not null,
  completed_at    timestamptz not null,
  synced_at       timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_completed_at_idx on public.sessions(completed_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- answers
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.answers (
  id              text primary key,           -- local UUID from SQLite
  session_id      text not null references public.sessions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     text not null,
  selected        integer not null,
  correct         boolean not null,
  time_ms         integer not null,
  answered_at     timestamptz not null
);

alter table public.answers enable row level security;

create policy "users can read own answers"
  on public.answers for select
  using (auth.uid() = user_id);

create policy "users can insert own answers"
  on public.answers for insert
  with check (auth.uid() = user_id);

create policy "users can update own answers"
  on public.answers for update
  using (auth.uid() = user_id);

create index if not exists answers_user_id_idx on public.answers(user_id);
create index if not exists answers_session_id_idx on public.answers(session_id);
create index if not exists answers_question_id_idx on public.answers(question_id);
