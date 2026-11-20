-- TK-S1-09: example pgTAP test. Run with `supabase test db` (needs Docker and `supabase start`).
begin;

select plan(3);

select has_table('public', 'profiles', 'profiles table exists');

select has_column('public', 'profiles', 'role', 'profiles has a role column');

select is(
  (
    select c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles'
  ),
  true,
  'RLS is enabled on profiles'
);

select * from finish();

rollback;
