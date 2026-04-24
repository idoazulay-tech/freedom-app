-- =========================================================
-- Purple Reckon — Supabase Database Schema v2.0
-- Run this in the Supabase SQL Editor for reckon-prod
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS guards
-- =========================================================

-- 1. profiles — extends auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  resume_text text,
  resume_url text,
  subscription_type text not null default 'free' check (subscription_type in ('free','payg','monthly')),
  jobs_count integer not null default 0,
  emails_count integer not null default 0,
  resume_credits_count integer not null default 0,
  jobs_quota integer not null default 3,
  emails_quota integer not null default 6,
  resume_quota integer not null default 3,
  amount_owed numeric(10,2) not null default 0,
  lemon_squeezy_customer_id text,
  lemon_squeezy_subscription_id text,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Add missing columns to profiles if upgrading from v1
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='emails_count') then
    alter table public.profiles add column emails_count integer not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='resume_credits_count') then
    alter table public.profiles add column resume_credits_count integer not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='jobs_quota') then
    alter table public.profiles add column jobs_quota integer not null default 3;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='emails_quota') then
    alter table public.profiles add column emails_quota integer not null default 6;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='resume_quota') then
    alter table public.profiles add column resume_quota integer not null default 3;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='lemon_squeezy_customer_id') then
    alter table public.profiles add column lemon_squeezy_customer_id text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='lemon_squeezy_subscription_id') then
    alter table public.profiles add column lemon_squeezy_subscription_id text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='trial_ends_at') then
    alter table public.profiles add column trial_ends_at timestamptz;
  end if;
end $$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, jobs_quota, emails_quota, resume_quota)
  values (new.id, new.raw_user_meta_data->>'full_name', 3, 6, 3)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS for profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Service role full access to profiles" on public.profiles;
create policy "Service role full access to profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');


-- 2. jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- core fields (backward compat: keep job_title/company_name)
  company_name text not null default '',
  job_title text not null default '',
  job_url text,
  job_description text not null default '',

  -- spec fields
  location text,
  remote_type text check (remote_type in ('remote','hybrid','onsite','unknown')),
  employment_type text check (employment_type in ('full_time','part_time','contract','internship','unknown')),
  seniority text check (seniority in ('intern','junior','mid','senior','lead','manager','director','unknown')),
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  salary_raw text,
  tech_stack text[],
  ats_keywords text[],
  required_skills text[],
  preferred_skills text[],
  responsibilities text[],
  benefits text[],
  tone_style text check (tone_style in ('startup','corporate','formal','friendly','unknown')),
  culture_signals text[],
  language_style jsonb,

  -- status
  status text not null default 'saved' check (status in ('saved','applied','interview','rejected','offer')),
  analysis_status text not null default 'pending' check (analysis_status in ('pending','running','complete','failed')),

  -- analysis results
  match_score integer check (match_score >= 0 and match_score <= 100),
  match_data jsonb,
  market_data jsonb,
  extraction_data jsonb,

  -- email
  generated_email text,
  email_subject text,
  email_count integer not null default 0,

  -- legacy compat
  missing_skills jsonb,
  resume_suggestions jsonb,
  market_report jsonb,
  email_generates_count integer not null default 0,

  notes text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Add missing columns to jobs if upgrading from v1
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='location') then
    alter table public.jobs add column location text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='remote_type') then
    alter table public.jobs add column remote_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='employment_type') then
    alter table public.jobs add column employment_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='seniority') then
    alter table public.jobs add column seniority text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='salary_min') then
    alter table public.jobs add column salary_min numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='salary_max') then
    alter table public.jobs add column salary_max numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='salary_currency') then
    alter table public.jobs add column salary_currency text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='salary_raw') then
    alter table public.jobs add column salary_raw text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='tech_stack') then
    alter table public.jobs add column tech_stack text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='ats_keywords') then
    alter table public.jobs add column ats_keywords text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='required_skills') then
    alter table public.jobs add column required_skills text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='preferred_skills') then
    alter table public.jobs add column preferred_skills text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='responsibilities') then
    alter table public.jobs add column responsibilities text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='benefits') then
    alter table public.jobs add column benefits text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='tone_style') then
    alter table public.jobs add column tone_style text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='culture_signals') then
    alter table public.jobs add column culture_signals text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='language_style') then
    alter table public.jobs add column language_style jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='analysis_status') then
    alter table public.jobs add column analysis_status text not null default 'pending';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='match_data') then
    alter table public.jobs add column match_data jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='market_data') then
    alter table public.jobs add column market_data jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='extraction_data') then
    alter table public.jobs add column extraction_data jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='email_subject') then
    alter table public.jobs add column email_subject text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='email_count') then
    alter table public.jobs add column email_count integer not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='analyzed_at') then
    alter table public.jobs add column analyzed_at timestamptz;
  end if;
end $$;

create index if not exists jobs_user_id_idx on public.jobs(user_id);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_created_at_idx on public.jobs(created_at desc);

-- Auto-update profiles.jobs_count on job insert/delete
create or replace function public.update_jobs_count()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.profiles set jobs_count = jobs_count + 1 where id = NEW.user_id;
  elsif (TG_OP = 'DELETE') then
    update public.profiles set jobs_count = greatest(0, jobs_count - 1) where id = OLD.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_job_changed on public.jobs;
create trigger on_job_changed
  after insert or delete on public.jobs
  for each row execute procedure public.update_jobs_count();

drop trigger if exists jobs_updated_at on public.jobs;
create trigger jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- RLS for jobs
alter table public.jobs enable row level security;

drop policy if exists "Users can view own jobs" on public.jobs;
create policy "Users can view own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own jobs" on public.jobs;
create policy "Users can insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own jobs" on public.jobs;
create policy "Users can update own jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own jobs" on public.jobs;
create policy "Users can delete own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

drop policy if exists "Service role full access to jobs" on public.jobs;
create policy "Service role full access to jobs"
  on public.jobs for all
  using (auth.role() = 'service_role');


-- 3. usage_tracking
create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  period_start date not null,
  jobs_analyzed integer not null default 0,
  ai_calls integer not null default 0,
  amount_charged numeric(10,2) not null default 0,
  unique(user_id, period_start)
);

create index if not exists usage_tracking_user_date_idx on public.usage_tracking(user_id, period_start);

alter table public.usage_tracking enable row level security;

drop policy if exists "Users can view own usage" on public.usage_tracking;
create policy "Users can view own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

drop policy if exists "Service role full access to usage_tracking" on public.usage_tracking;
create policy "Service role full access to usage_tracking"
  on public.usage_tracking for all
  using (auth.role() = 'service_role');


-- 4. Storage bucket for resumes (PRIVATE)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own resume" on storage.objects;
create policy "Users can upload own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can read own resume" on storage.objects;
create policy "Users can read own resume"
  on storage.objects for select
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update own resume" on storage.objects;
create policy "Users can update own resume"
  on storage.objects for update
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete own resume" on storage.objects;
create policy "Users can delete own resume"
  on storage.objects for delete
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
