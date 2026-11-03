-- =============================================================================
-- ISO 27001 audit (2026-11-03) remediation
--  1) A.8.2.3 / A.9.4.1 / A.18.1.4: data the owner chose NOT to publish (the phone number)
--     must not be readable through the public API. It moves to an admin-only table.
--  2) A.12.4.1 / A.12.4.3: persistent, tamper-resistant security event log (admin read-only;
--     written only by the server with the service role), retained for 365 days.
-- =============================================================================

-- ---------- 1) Private CV data ----------------------------------------------------
create table if not exists public.cv_private (
  key        text primary key check (key in ('contact')),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.cv_private enable row level security;
create policy "cv_private: admin read" on public.cv_private
  for select to authenticated using ((select public.is_admin()));
create policy "cv_private: admin insert" on public.cv_private
  for insert to authenticated with check ((select public.is_admin()));
create policy "cv_private: admin update" on public.cv_private
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "cv_private: admin delete" on public.cv_private
  for delete to authenticated using ((select public.is_admin()));
revoke all on public.cv_private from anon;
create index if not exists cv_private_updated_by_idx on public.cv_private (updated_by);

-- Move an unpublished phone number out of the publicly readable section.
insert into public.cv_private (key, data)
select 'contact', jsonb_build_object('phone', data ->> 'phone')
  from public.cv_sections
 where key = 'contact'
   and coalesce((data ->> 'showPhone')::boolean, false) = false
   and coalesce((data ->> 'showPhoneInPdf')::boolean, false) = false
   and coalesce(data ->> 'phone', '') <> ''
on conflict (key) do update set data = excluded.data, updated_at = now();

update public.cv_sections
   set data = jsonb_set(data, '{phone}', '""')
 where key = 'contact'
   and coalesce((data ->> 'showPhone')::boolean, false) = false
   and coalesce((data ->> 'showPhoneInPdf')::boolean, false) = false
   and coalesce(data ->> 'phone', '') <> '';

-- ---------- 2) Security event log ---------------------------------------------------
create table if not exists public.security_events (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  event   text not null check (event ~ '^[a-z0-9_.]{3,64}$'),
  actor   uuid,
  details jsonb not null default '{}' check (pg_column_size(details) < 4000)
);
create index if not exists security_events_at_idx on public.security_events (at desc);
alter table public.security_events enable row level security;
create policy "security_events: admin read" on public.security_events
  for select to authenticated using ((select public.is_admin()));
-- No insert/update/delete policies: only the service role writes, nobody edits or deletes
-- through the API (append-only from the application's point of view).
revoke all on public.security_events from anon;
revoke insert, update, delete on public.security_events from authenticated;

-- Retention: contact messages (configurable), rate-limit counters (1 day), security log (365 days).
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
  delete from public.security_events where at < now() - interval '365 days';
  return v_deleted;
end;
$$;
revoke all on function public.purge_expired_data(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_data(integer) to service_role;
