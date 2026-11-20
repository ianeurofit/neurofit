-- HU001 / T-HU001-08: a new profile starts as `user` and only a superuser can change roles.
begin;

select plan(5);

insert into auth.users (id, email) values
  ('c0000000-0000-0000-0000-0000000000c1', 'patient-1@test.local'),
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local');

update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';

select is(
  (select role::text from public.profiles where id = 'c0000000-0000-0000-0000-0000000000c1'),
  'user',
  'a newly registered user gets the user role'
);

-- The user tries to change their own privileges
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);

select throws_ok(
  $$update public.profiles set role = 'superuser' where id = 'c0000000-0000-0000-0000-0000000000c1'$$,
  '42501',
  'No autorizado para modificar rol o estado del usuario',
  'a user cannot change their own role'
);

select throws_ok(
  $$update public.profiles set is_active = false where id = 'c0000000-0000-0000-0000-0000000000c1'$$,
  '42501',
  'No autorizado para modificar rol o estado del usuario',
  'a user cannot change their own active state'
);

-- The superuser can
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);

select lives_ok(
  $$update public.profiles set role = 'evaluator' where id = 'c0000000-0000-0000-0000-0000000000c1'$$,
  'a superuser can change the role of another user'
);

reset role;

select is(
  (select role::text from public.profiles where id = 'c0000000-0000-0000-0000-0000000000c1'),
  'evaluator',
  'the role was changed'
);

select * from finish();

rollback;
