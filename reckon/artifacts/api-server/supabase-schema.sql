-- =========================================================
-- Reckon — Supabase Database Schema
-- Run this in the Supabase SQL Editor for reckon-prod
-- =========================================================

-- 1. profiles — extends auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  resume_text text,
  resume_url text,
  subscription_type text not null default 'free' check (subscription_type in ('free','payg','monthly')),
  jobs_count integer not null default 0,
  amount_owed numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- Service role bypass (for server-side operations)
drop policy if exists "Service role full access to profiles" on public.profiles;
create policy "Service role full access to profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');


-- 2. jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null default '',
  job_title text not null default '',
  job_url text,
  job_description text not null default '',
  status text not null default 'saved' check (status in ('saved','applied','interview','rejected','offer')),
  match_score integer check (match_score >= 0 and match_score <= 100),
  missing_skills jsonb,
  resume_suggestions jsonb,
  generated_email text,
  market_report jsonb,
  email_generates_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

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

-- RLS for usage_tracking
alter table public.usage_tracking enable row level security;

drop policy if exists "Users can view own usage" on public.usage_tracking;
create policy "Users can view own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

drop policy if exists "Service role full access to usage_tracking" on public.usage_tracking;
create policy "Service role full access to usage_tracking"
  on public.usage_tracking for all
  using (auth.role() = 'service_role');


-- 4. Storage bucket for resumes (PRIVATE — no public access)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

-- Storage RLS — users can only access their own folder
drop policy if exists "Users can upload own resume" on storage.objects;
create policy "Users can upload own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Resumes are publicly readable" on storage.objects;

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
