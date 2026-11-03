-- RLS / authorization test-suite. Every assertion raises on failure (psql ON_ERROR_STOP=1).
\set ON_ERROR_STOP 1

create or replace function pg_temp.assert(condition boolean, message text) returns void language plpgsql as $$
begin
  if not coalesce(condition, false) then raise exception 'ASSERTION FAILED: %', message; end if;
  raise notice 'ok - %', message;
end $$;

-- Two users: one admin, one ordinary authenticated user.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@example.test'),
  ('00000000-0000-0000-0000-0000000000b2', 'user@example.test');
insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-0000000000a1');
insert into public.projects (slug, status, category, year, title, summary)
values ('draft-project', 'draft', 'web', 2026, '{"ro":"Ciornă","en":"Draft"}', '{"ro":"x","en":"x"}');
insert into public.contact_messages (name, email, message, locale)
values ('Test', 't@example.test', 'A message that is long enough.', 'ro');

-- ============ anon ============
set role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', false);
select pg_temp.assert((select count(*) from public.cv_sections) = 13, 'anon can read CV sections');
select pg_temp.assert((select count(*) from public.projects where status = 'draft') = 0, 'anon cannot see draft projects');
select pg_temp.assert((select count(*) from public.projects) = 12, 'anon sees only the 12 published projects');
select pg_temp.assert(not public.is_admin(), 'anon is not admin');

do $$ begin
  begin update public.cv_sections set data = '{}' where key = 'profile';
    perform pg_temp.assert((select count(*) from public.cv_sections where data = '{}'::jsonb) = 0, 'anon update affects no rows');
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon update denied'); end;
  begin insert into public.projects (slug, category, year, title, summary) values ('evil', 'web', 2026, '{}', '{}');
    raise exception 'ASSERTION FAILED: anon could insert a project';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot insert projects'); end;
  begin perform count(*) from public.contact_messages;
    raise exception 'ASSERTION FAILED: anon could read contact messages';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot read contact messages'); end;
  begin insert into public.contact_messages (name, email, message, locale) values ('Bot', 'b@x.test', 'spam spam spam spam spam', 'ro');
    raise exception 'ASSERTION FAILED: anon could insert contact messages directly';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot bypass the server to insert messages'); end;
  begin perform count(*) from public.admin_users;
    raise exception 'ASSERTION FAILED: anon could read admin_users';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot read admin_users'); end;
  begin perform public.check_rate_limit('x', 1, 60);
    raise exception 'ASSERTION FAILED: anon could call check_rate_limit';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot call check_rate_limit'); end;
  begin perform public.purge_expired_data(1);
    raise exception 'ASSERTION FAILED: anon could call purge_expired_data';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot call purge_expired_data'); end;
  begin insert into storage.objects (bucket_id, name) values ('portfolio', 'projects/x/evil.webp');
    raise exception 'ASSERTION FAILED: anon could upload to storage';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'anon cannot upload files'); end;
end $$;
reset role;

-- ============ authenticated, NOT admin (privilege escalation attempts) ============
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', false);
select pg_temp.assert(not public.is_admin(), 'ordinary user is not admin');
select pg_temp.assert((select count(*) from public.projects where status = 'draft') = 0, 'ordinary user cannot see drafts');
select pg_temp.assert((select count(*) from public.contact_messages) = 0, 'ordinary user sees no contact messages');
select pg_temp.assert((select count(*) from public.cv_section_revisions) = 0, 'ordinary user sees no revisions');
do $$ begin
  update public.cv_sections set data = '{"hacked":true}' where key = 'profile';
  perform pg_temp.assert((select count(*) from public.cv_sections where data ? 'hacked') = 0, 'ordinary user update affects no rows');
  delete from public.projects;
  perform pg_temp.assert((select count(*) from public.projects) = 12, 'ordinary user cannot delete projects');
  begin insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-0000000000b2');
    raise exception 'ASSERTION FAILED: user could make themselves admin';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'user cannot self-promote to admin'); end;
  begin insert into public.cv_sections (key, data) values ('seo', '{}') on conflict (key) do update set data = excluded.data;
    raise exception 'ASSERTION FAILED: user could upsert a section';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'user cannot upsert sections'); end;
  begin insert into storage.objects (bucket_id, name) values ('portfolio', 'projects/x/evil.webp');
    raise exception 'ASSERTION FAILED: user could upload to storage';
  exception when insufficient_privilege then perform pg_temp.assert(true, 'user cannot upload files'); end;
end $$;
reset role;

-- ============ admin ============
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', false);
select pg_temp.assert(public.is_admin(), 'admin is recognised');
select pg_temp.assert((select count(*) from public.projects) = 13, 'admin sees drafts too');
select pg_temp.assert((select count(*) from public.contact_messages) = 1, 'admin can read messages');
update public.cv_sections set data = jsonb_set(data, '{fullName}', '"Test Name"'), updated_by = auth.uid() where key = 'profile';
select pg_temp.assert((select data->>'fullName' from public.cv_sections where key = 'profile') = 'Test Name', 'admin can update a section');
select pg_temp.assert((select count(*) from public.cv_section_revisions where key = 'profile') >= 1, 'update created a revision');
update public.projects set status = 'published' where slug = 'draft-project';
select pg_temp.assert((select count(*) from public.projects where slug = 'draft-project' and status = 'published') = 1, 'admin can publish a project');
delete from public.contact_messages;
select pg_temp.assert((select count(*) from public.contact_messages) = 0, 'admin can delete messages');
insert into storage.objects (bucket_id, name) values ('portfolio', 'projects/x/ok.webp');
select pg_temp.assert((select count(*) from storage.objects) = 1, 'admin can upload files');
do $$ begin
  begin insert into public.projects (slug, category, year, title, summary, live_url) values ('xss', 'web', 2026, '{}', '{}', 'javascript:alert(1)');
    raise exception 'ASSERTION FAILED: javascript: URL accepted';
  exception when check_violation then perform pg_temp.assert(true, 'database rejects javascript: URLs'); end;
end $$;
reset role;

-- ============ service_role: rate limiting & retention ============
set role service_role;
select pg_temp.assert(public.check_rate_limit('test', 2, 60), 'rate limit hit 1 allowed');
select pg_temp.assert(public.check_rate_limit('test', 2, 60), 'rate limit hit 2 allowed');
select pg_temp.assert(not public.check_rate_limit('test', 2, 60), 'rate limit hit 3 blocked');
reset role;
update public.rate_limits set window_start = now() - interval '2 minutes' where key = 'test';
set role service_role;
select pg_temp.assert(public.check_rate_limit('test', 2, 60), 'rate limit window resets');
reset role;
insert into public.contact_messages (name, email, message, locale, created_at)
values ('Old', 'o@example.test', 'An old message that should be purged.', 'en', now() - interval '200 days'),
       ('New', 'n@example.test', 'A recent message that must be kept.', 'en', now());
set role service_role;
select pg_temp.assert(public.purge_expired_data(180) = 1, 'retention purges exactly the expired message');
reset role;
select pg_temp.assert((select count(*) from public.contact_messages) = 1, 'recent message kept');

-- Every table in public has RLS enabled.
select pg_temp.assert(
  (select count(*) from pg_tables where schemaname = 'public' and not rowsecurity) = 0,
  'RLS enabled on every public table');
