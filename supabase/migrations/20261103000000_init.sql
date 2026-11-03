-- =============================================================================
-- ciupitustefan.com — initial schema
-- Security model: RLS on every table; anon can only read published content;
-- writes require an authenticated user listed in admin_users (is_admin()).
-- Privileged maintenance (rate limit, retention, contact inserts) runs only as service_role.
-- =============================================================================

-- ---------- Administrators -----------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- No policies: the table is not readable or writable through the API at all.
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- CV sections ----------------------------------------------------------
create table public.cv_sections (
  key        text primary key check (key in (
               'profile','contact','experience','education','skills','personalSkills','languages',
               'certifications','courses','volunteering','awards','otherInfo','seo')),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint cv_sections_size check (pg_column_size(data) < 500000)
);
alter table public.cv_sections enable row level security;

create policy "cv_sections: public read" on public.cv_sections
  for select to anon, authenticated using (true);
create policy "cv_sections: admin insert" on public.cv_sections
  for insert to authenticated with check ((select public.is_admin()));
create policy "cv_sections: admin update" on public.cv_sections
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "cv_sections: admin delete" on public.cv_sections
  for delete to authenticated using ((select public.is_admin()));

revoke all on public.cv_sections from anon;
grant select on public.cv_sections to anon;

-- Append-only history: every write creates a revision (backup + restore from the dashboard).
create table public.cv_section_revisions (
  id         bigint generated always as identity primary key,
  key        text not null,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid
);
create index cv_section_revisions_key_idx on public.cv_section_revisions (key, id desc);
alter table public.cv_section_revisions enable row level security;
create policy "revisions: admin read" on public.cv_section_revisions
  for select to authenticated using ((select public.is_admin()));
revoke all on public.cv_section_revisions from anon;
revoke insert, update, delete on public.cv_section_revisions from authenticated;

create or replace function public.record_cv_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cv_section_revisions (key, data, created_by) values (new.key, new.data, new.updated_by);
  -- Keep the 50 most recent revisions per section (retention).
  delete from public.cv_section_revisions r
   where r.key = new.key
     and r.id not in (select id from public.cv_section_revisions where key = new.key order by id desc limit 50);
  return new;
end;
$$;
revoke all on function public.record_cv_revision() from public;
create trigger cv_sections_revision after insert or update on public.cv_sections
  for each row execute function public.record_cv_revision();

-- ---------- Projects -----------------------------------------------------------
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  status       text not null default 'draft' check (status in ('draft','published')),
  featured     boolean not null default false,
  sort_order   integer not null default 100,
  category     text not null check (category in ('hardware','rf','embedded','web','security','networking')),
  year         integer not null check (year between 1990 and 2100),
  title        jsonb not null,
  summary      jsonb not null,
  description  jsonb not null default '{"ro":"","en":""}',
  objective    jsonb not null default '{"ro":"","en":""}',
  problem      jsonb not null default '{"ro":"","en":""}',
  role         jsonb not null default '{"ro":"","en":""}',
  contribution jsonb not null default '{"ro":"","en":""}',
  process      jsonb not null default '{"ro":"","en":""}',
  results      jsonb not null default '{"ro":"","en":""}',
  technologies text[] not null default '{}',
  live_url     text not null default '' check (live_url = '' or live_url ~ '^https?://'),
  repo_url     text not null default '' check (repo_url = '' or repo_url ~ '^https?://'),
  docs_url     text not null default '' check (docs_url = '' or docs_url ~ '^https?://'),
  cover        jsonb,
  gallery      jsonb not null default '[]',
  attachments  jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null
);
create index projects_order_idx on public.projects (sort_order, year desc);
alter table public.projects enable row level security;

create policy "projects: public read published" on public.projects
  for select to anon using (status = 'published');
create policy "projects: authenticated read" on public.projects
  for select to authenticated using (status = 'published' or (select public.is_admin()));
create policy "projects: admin insert" on public.projects
  for insert to authenticated with check ((select public.is_admin()));
create policy "projects: admin update" on public.projects
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "projects: admin delete" on public.projects
  for delete to authenticated using ((select public.is_admin()));
revoke all on public.projects from anon;
grant select on public.projects to anon;

-- ---------- Contact messages ---------------------------------------------------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(name) between 2 and 100),
  email      text not null check (length(email) <= 254),
  subject    text not null default '' check (length(subject) <= 150),
  message    text not null check (length(message) between 20 and 5000),
  locale     text not null check (locale in ('ro','en')),
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at);
alter table public.contact_messages enable row level security;
-- Inserts happen only server-side with the service role (after validation + rate limiting).
create policy "messages: admin read" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "messages: admin delete" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));
revoke all on public.contact_messages from anon;
revoke insert, update on public.contact_messages from authenticated;

-- ---------- Rate limiting --------------------------------------------------------
create table public.rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  hits         integer not null
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- ---------- Retention ------------------------------------------------------------
create or replace function public.purge_expired_data(p_retention_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.contact_messages where created_at < now() - make_interval(days => p_retention_days);
  get diagnostics v_deleted = row_count;
  delete from public.rate_limits where window_start < now() - interval '1 day';
  return v_deleted;
end;
$$;
revoke all on function public.purge_expired_data(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_data(integer) to service_role;

-- ---------- Storage --------------------------------------------------------------
-- Public-read bucket for published portfolio media. Only WebP (re-encoded server side) and PDF.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 4194304, array['image/webp', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Public files are served by the Storage CDN for a public bucket; listing objects through the API
-- is admin-only. SELECT is also required by Storage for remove() and upsert.
create policy "portfolio: admin select" on storage.objects
  for select to authenticated using (bucket_id = 'portfolio' and (select public.is_admin()));
create policy "portfolio: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio' and (select public.is_admin()));
create policy "portfolio: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio' and (select public.is_admin()));
create policy "portfolio: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and (select public.is_admin()));
