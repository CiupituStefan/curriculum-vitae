-- =============================================================================
-- Security & privacy hardening (audit 2026-11-03)
-- =============================================================================

-- 1) MFA enforced in the database too: an administrator who has a verified MFA factor is
--    treated as admin only when the session JWT carries aal = 'aal2'. Accounts without MFA
--    keep working with aal1. Defence in depth behind requireAdmin() in the application.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()))
     and (
       coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
       or not exists (
         select 1 from auth.mfa_factors f
          where f.user_id = (select auth.uid()) and f.status = 'verified'
       )
     );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Trigger function must not be callable through the API (Supabase advisor 0028/0029).
revoke execute on function public.record_cv_revision() from public, anon, authenticated;

-- 3) Covering indexes for foreign keys (Supabase performance advisor).
create index if not exists cv_sections_updated_by_idx on public.cv_sections (updated_by);
create index if not exists projects_updated_by_idx on public.projects (updated_by);

-- 4) Record of consent for contact-form submissions (GDPR art. 7(1): the controller must be able
--    to demonstrate consent). Stores when it was given and which privacy-policy version was shown.
alter table public.contact_messages
  add column if not exists consent_at timestamptz not null default now(),
  add column if not exists privacy_version text not null default 'unknown'
    check (length(privacy_version) <= 32);
