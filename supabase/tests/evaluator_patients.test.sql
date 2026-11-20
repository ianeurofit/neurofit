-- HU001 / T-HU001-05: an evaluator only sees the patients assigned to them.
begin;

select plan(9);

-- Fixtures: the profile of each user is created by the on_auth_user_created trigger.
insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-00000000000a', 'evaluator-a@test.local'),
  ('b0000000-0000-0000-0000-00000000000b', 'evaluator-b@test.local'),
  ('c0000000-0000-0000-0000-0000000000c1', 'patient-1@test.local'),
  ('c0000000-0000-0000-0000-0000000000c2', 'patient-2@test.local'),
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local');

update public.profiles set role = 'evaluator'
  where id in ('a0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-00000000000b');
update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';

insert into public.evaluator_patients (evaluator_id, patient_id, assigned_by) values
  ('a0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-0000000000c1', 'd0000000-0000-0000-0000-0000000000d0'),
  ('b0000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-0000000000c2', 'd0000000-0000-0000-0000-0000000000d0');

select has_table('public', 'evaluator_patients', 'evaluator_patients table exists');

select throws_ok(
  $$insert into public.evaluator_patients (evaluator_id, patient_id)
    values ('a0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-0000000000c1')$$,
  '23505',
  null,
  'the same evaluator and patient pair cannot be assigned twice'
);

-- Evaluator A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

select results_eq(
  $$select patient_id from public.evaluator_patients$$,
  $$values ('c0000000-0000-0000-0000-0000000000c1'::uuid)$$,
  'evaluator A only sees their own assignment'
);

select is(private.is_evaluator_of('c0000000-0000-0000-0000-0000000000c1'), true, 'A is the evaluator of patient 1');
select is(private.is_evaluator_of('c0000000-0000-0000-0000-0000000000c2'), false, 'A is not the evaluator of patient 2');

select throws_ok(
  $$insert into public.evaluator_patients (evaluator_id, patient_id)
    values ('a0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-0000000000c2')$$,
  '42501',
  null,
  'an evaluator cannot assign patients to themselves'
);

-- Patient 1
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);

select results_eq(
  $$select evaluator_id from public.evaluator_patients$$,
  $$values ('a0000000-0000-0000-0000-00000000000a'::uuid)$$,
  'a patient only sees who their evaluator is'
);

-- Superuser
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.evaluator_patients where assigned_by = 'd0000000-0000-0000-0000-0000000000d0'),
  2,
  'the superuser sees every assignment'
);

select lives_ok(
  $$delete from public.evaluator_patients
    where evaluator_id = 'b0000000-0000-0000-0000-00000000000b'$$,
  'the superuser can remove an assignment'
);

select * from finish();

rollback;
