-- HU024: every change to a structure table is audited by a trigger, and only a superuser can read it.
begin;

select plan(20);

insert into auth.users (id, email) values
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local'),
  ('a0000000-0000-0000-0000-00000000000a', 'evaluator@test.local'),
  ('c0000000-0000-0000-0000-0000000000c1', 'patient@test.local');
update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';
update public.profiles set role = 'evaluator' where id = 'a0000000-0000-0000-0000-00000000000a';

-- A throw-away table with the audit trigger attached, to exercise the mechanism on its own.
create temp table audit_probe (id uuid primary key, prompt text, weight int);
create trigger audit_probe_audit
after insert or update or delete on audit_probe
for each row execute function private.audit ();

select has_table('public', 'audit_log', 'audit_log table exists');

-- json_diff keeps only the changed columns
select is(
  private.json_diff('{"a":1,"b":2}'::jsonb, '{"a":1,"b":3}'::jsonb),
  '{"b":{"old":2,"new":3}}'::jsonb,
  'json_diff returns only the changed columns'
);
select is(
  private.json_diff(null, '{"a":1}'::jsonb),
  '{"a":{"old":null,"new":1}}'::jsonb,
  'json_diff treats a missing old row as all columns new'
);

-- Writes made as a given user are attributed to them (the claims are what auth.uid() reads).
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);

insert into audit_probe values ('11111111-1111-1111-1111-111111111111', 'first', 1);

select results_eq(
  $$select action, entity, entity_id, actor_id from public.audit_log where entity = 'audit_probe'$$,
  $$values ('insert'::text, 'audit_probe'::text, '11111111-1111-1111-1111-111111111111'::uuid, 'd0000000-0000-0000-0000-0000000000d0'::uuid)$$,
  'an insert is recorded with its entity, id and actor'
);

update audit_probe set prompt = 'second' where id = '11111111-1111-1111-1111-111111111111';

select is(
  (select diff from public.audit_log where entity = 'audit_probe' and action = 'update'),
  '{"prompt":{"old":"first","new":"second"}}'::jsonb,
  'an update stores only the changed column in the diff'
);
select is(
  (select actor_id from public.audit_log where entity = 'audit_probe' and action = 'update'),
  'd0000000-0000-0000-0000-0000000000d0'::uuid,
  'an update records the actor'
);

update audit_probe set prompt = 'second' where id = '11111111-1111-1111-1111-111111111111';

select is(
  (select count(*)::int from public.audit_log where entity = 'audit_probe' and action = 'update'),
  1,
  'an update that changes nothing is not recorded'
);

delete from audit_probe where id = '11111111-1111-1111-1111-111111111111';

select is(
  (select diff -> 'prompt' ->> 'old' from public.audit_log where entity = 'audit_probe' and action = 'delete'),
  'second',
  'a delete keeps the values that were removed'
);

-- Backend writes (no user session) are recorded without an actor.
select set_config('request.jwt.claims', '', true);
insert into audit_probe values ('22222222-2222-2222-2222-222222222222', 'by backend', 2);

select is(
  (select actor_id from public.audit_log where entity = 'audit_probe' and entity_id = '22222222-2222-2222-2222-222222222222'),
  null::uuid,
  'a write without a user session has no actor'
);

-- T-HU024-02: every existing structure table carries the audit trigger.
select is(
  (
    select coalesce(array_agg(t.table_name order by t.table_name), '{}'::text[])
    from (values
      ('tests'), ('test_sections'), ('questions'), ('question_options'), ('scales'), ('scale_options'),
      ('scoring_models'), ('alert_rules'), ('recommendation_templates'), ('evaluator_patients'),
      ('professional_profiles'), ('professional_patients'), ('plan_goal_revisions')
    ) as t (table_name)
    where to_regclass('public.' || t.table_name) is not null
      and not exists (
        select 1 from pg_trigger g
        where g.tgrelid = to_regclass('public.' || t.table_name)
          and g.tgfoid = 'private.audit'::regproc
          and not g.tgisinternal
      )
  ),
  '{}'::text[],
  'every structure table has an audit trigger'
);

select ok(
  exists (
    select 1 from pg_trigger g
    where g.tgrelid = 'public.evaluator_patients'::regclass
      and g.tgfoid = 'private.audit'::regproc and not g.tgisinternal
  ),
  'evaluator_patients is audited'
);

-- T-HU003-06: creating a test leaves one insert row in the audit log.
insert into public.tests (id, code, title, created_by)
values ('20000000-0000-0000-0000-000000000001', 'AUDITED_TEST', '{"es":"Auditado"}', 'd0000000-0000-0000-0000-0000000000d0');

select results_eq(
  $$select action, entity from public.audit_log where entity_id = '20000000-0000-0000-0000-000000000001'$$,
  $$values ('insert'::text, 'tests'::text)$$,
  'inserting a test records one insert row in audit_log'
);

-- T-HU004-08: updating a section leaves an update row with the changed columns.
insert into public.test_sections (id, test_id, code, title, domain, position)
values ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', 'MOD_A', '{"es":"Antes"}', 'sleep', 1);
update public.test_sections set title = '{"es":"Después"}' where id = '30000000-0000-0000-0000-000000000009';

select is(
  (select diff -> 'title' from public.audit_log where entity = 'test_sections' and action = 'update'
     and entity_id = '30000000-0000-0000-0000-000000000009'),
  '{"old":{"es":"Antes"},"new":{"es":"Después"}}'::jsonb,
  'updating a section records the diff of its title'
);

-- T-HU024-03: nobody can write to audit_log and only a superuser can read it.
select ok(
  not exists (select 1 from pg_policies where tablename = 'audit_log' and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')),
  'audit_log has no write policies'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);

select ok((select count(*) from public.audit_log) > 0, 'a superuser can read the audit log');

select throws_ok(
  $$insert into public.audit_log (action, entity) values ('insert', 'forged')$$,
  '42501', null, 'a superuser cannot insert into audit_log'
);
select throws_ok(
  $$update public.audit_log set entity = 'forged'$$,
  '42501', null, 'a superuser cannot update audit_log'
);
select throws_ok(
  $$delete from public.audit_log$$,
  '42501', null, 'a superuser cannot delete from audit_log'
);

select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select is((select count(*)::int from public.audit_log), 0, 'an evaluator sees no audit rows');

select set_config('request.jwt.claims', '{"sub":"c0000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);
select is((select count(*)::int from public.audit_log), 0, 'a patient sees no audit rows');

select * from finish();

rollback;
