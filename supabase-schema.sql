-- ============================================================
-- NextStep Africa — Supabase schema
-- Paste this whole file into Supabase Dashboard -> SQL Editor -> New query
-- -> Run. Safe to run once on a fresh project.
-- ============================================================

-- 1. Opportunities directory
create table public.opportunities (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    organization text not null,
    opportunity_type text not null check (opportunity_type in ('Fellowship', 'Internship', 'Job', 'Funding', 'Scholarship', 'Conference')),
    location_type text not null check (location_type in ('Remote', 'Hybrid', 'On-site')),
    location text not null,
    description text not null,
    eligibility text not null,
    benefits text not null,
    deadline text not null,
    apply_url text not null,
    tags text[] default '{}',
    featured boolean default false,
    published_at timestamptz default now(),
    views_count integer default 0
);

-- 2. Blog articles
create table public.blogs (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    excerpt text not null,
    content text not null,
    author jsonb not null, -- {"name": "...", "role": "...", "avatarUrl": "..."}
    category text not null check (category in ('Career Guide', 'Public Health News', 'Alumni Spotlight', 'Academic Resource', 'Policy & Innovation')),
    tags text[] default '{}',
    image_url text not null,
    featured boolean default false,
    status text not null default 'published' check (status in ('draft', 'published', 'scheduled')),
    published_at timestamptz default now(),
    scheduled_for timestamptz,
    views_count integer default 0,
    read_time_min integer default 3
);

-- 3. Newsletter subscribers
create table public.subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    subscribed_at timestamptz default now(),
    status text not null default 'active' check (status in ('active', 'unsubscribed'))
);

-- 4. Enable Row Level Security everywhere
alter table public.opportunities enable row level security;
alter table public.blogs enable row level security;
alter table public.subscribers enable row level security;

-- 5. Public (anonymous) read access
-- Anyone can browse opportunities and published articles without logging in.
create policy "Public can read opportunities"
  on public.opportunities for select
  using (true);

create policy "Public can read published blogs"
  on public.blogs for select
  using (status = 'published');

-- 6. Public newsletter signups (insert only — visitors can never read the list)
create policy "Public can subscribe"
  on public.subscribers for insert
  with check (true);

-- 7. Admin (any signed-in user) full access
-- This app has exactly one admin login by design — anyone who can sign in
-- gets full read/write/delete on all three tables. Only ever create ONE
-- Supabase Auth user for this project (Authentication -> Users -> Add user).
-- Do not enable public sign-ups for this project.
create policy "Signed-in admin can manage opportunities"
  on public.opportunities for all
  to authenticated
  using (true)
  with check (true);

create policy "Signed-in admin can manage blogs"
  on public.blogs for all
  to authenticated
  using (true)
  with check (true);

create policy "Signed-in admin can view subscribers"
  on public.subscribers for select
  to authenticated
  using (true);
