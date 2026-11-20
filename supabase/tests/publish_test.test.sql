-- HU007: publish, version and archive a test. Publishing v2 archives v1 in the same transaction.
begin;

select plan(17);

insert into auth.users (id, email) values
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local'),
  ('a0000000-0000-0000-0000-00000000000a', 'evaluator@test.local');
update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';
update public.profiles set role = 'evaluator' where id = 'a0000000-0000-0000-0000-00000000000a';

insert into public.tests (id, code, title, created_by) values
  ('50000000-0000-0000-0000-000000000001', 'PUB_TEST', '{"es":"Publicable"}', 'd0000000-0000-0000-0000-0000000000d0');
insert into public.test_sections (id, test_id, code, title, domain, position) values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'MOD_A', '{"es":"Módulo A"}', 'memory', 1);
insert into public.questions (id, test_id, section_id, code, prompt, type, config, position) values
  ('52000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'Q_SMOKE', '{"es":"¿Fumas?"}', 'true_false', '{"labels":{"true":{"es":"Sí"},"false":{"es":"No"}}}', 1);
insert into public.questions (id, test_id, section_id, code, prompt, type, config, position, depends_on) values
  ('52000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'Q_PACKS', '{"es":"¿Cuántos?"}', 'numeric_free', '{}', 2,
   '{"questionCode":"Q_SMOKE","op":"eq","value":true}');
insert into public.question_options (question_id, value, label, position) values
  ('52000000-0000-0000-0000-000000000001', 'unused', '{"es":"Sin uso"}', 1);

select has_function('public', 'publish_test', array['uuid'], 'publish_test exists');
select has_function('public', 'create_test_version', array['jsonb'], 'create_test_version exists');

-- Versions of the same code can coexist; codes still collide inside one version.
select throws_ok(
  $$insert into public.tests (code, title) values ('PUB_TEST', '{"es":"Otro"}')$$,
  '23505', null, 'a new test cannot reuse the code of version 1'
);

set local role authenticated;

-- Only a superuser publishes.
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select throws_ok(
  $$select public.publish_test('50000000-0000-0000-0000-000000000001')$$,
  '42501', null, 'an evaluator cannot publish a test'
);

select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);
select lives_ok($$select public.publish_test('50000000-0000-0000-0000-000000000001')$$, 'a superuser publishes a draft');
select is((select status::text from public.tests where id = '50000000-0000-0000-0000-000000000001'), 'published', 'v1 is published');
select results_eq(
  $$select action, actor_id, diff -> 'status' ->> 'new' from public.audit_log
    where entity = 'tests' and entity_id = '50000000-0000-0000-0000-000000000001' and action = 'update'$$,
  $$values ('update'::text, 'd0000000-0000-0000-0000-0000000000d0'::uuid, 'published'::text)$$,
  'publishing is recorded in audit_log with its actor'
);
select throws_ok(
  $$select public.publish_test('50000000-0000-0000-0000-000000000001')$$,
  'P0001', 'not_draft', 'only a draft can be published'
);

-- CA-03: version 2 is a draft copy of version 1.
select lives_ok(
  $$select public.create_test_version(jsonb_build_object(
    'code', 'PUB_TEST', 'title', '{"es":"Publicable"}'::jsonb, 'description', null, 'version', 2,
    'parent_test_id', '50000000-0000-0000-0000-000000000001',
    'sections', jsonb_build_array(jsonb_build_object(
      'code', 'MOD_A', 'title', '{"es":"Módulo A"}'::jsonb, 'domain', 'memory', 'position', 1, 'is_draft_content', false,
      'questions', jsonb_build_array(
        jsonb_build_object('code', 'Q_SMOKE', 'prompt', '{"es":"¿Fumas?"}'::jsonb, 'type', 'true_false',
          'config', '{"labels":{"true":{"es":"Sí"},"false":{"es":"No"}}}'::jsonb, 'required', true, 'position', 1,
          'options', '[]'::jsonb),
        jsonb_build_object('code', 'Q_PACKS', 'prompt', '{"es":"¿Cuántos?"}'::jsonb, 'type', 'numeric_free',
          'config', '{}'::jsonb, 'required', true, 'position', 2, 'active', false,
          'depends_on', '{"questionCode":"Q_SMOKE","op":"eq","value":true}'::jsonb,
          'options', '[{"value":"a","label":{"es":"A"},"score":1}]'::jsonb)
      )
    ))
  ))$$,
  'a superuser creates version 2'
);
select results_eq(
  $$select status::text, version, parent_test_id, created_by from public.tests where code = 'PUB_TEST' and version = 2$$,
  $$values ('draft'::text, 2, '50000000-0000-0000-0000-000000000001'::uuid, 'd0000000-0000-0000-0000-0000000000d0'::uuid)$$,
  'version 2 is a draft whose parent is version 1'
);
select results_eq(
  $$select q.code, q.position, q.active, q.depends_on ->> 'questionCode', (select count(*)::int from public.question_options o where o.question_id = q.id)
    from public.questions q join public.tests t on t.id = q.test_id
    where t.code = 'PUB_TEST' and t.version = 2 order by q.position$$,
  $$values ('Q_SMOKE'::text, 1, true, null::text, 0), ('Q_PACKS'::text, 2, false, 'Q_SMOKE'::text, 1)$$,
  'version 2 keeps codes, order, conditions, the active flag and options'
);
select throws_ok(
  $$select public.create_test_version(jsonb_build_object('code', 'PUB_TEST', 'title', '{"es":"Otra"}'::jsonb,
    'version', 3, 'parent_test_id', '50000000-0000-0000-0000-000000000001', 'sections', '[]'::jsonb))$$,
  '23505', null, 'a test code has at most one draft at a time'
);
select is(
  (select status::text from public.tests where id = '50000000-0000-0000-0000-000000000001'),
  'published',
  'creating version 2 does not touch version 1'
);

-- T-HU007-05: publishing v2 archives v1 in the same call.
select lives_ok(
  $$select public.publish_test((select id from public.tests where code = 'PUB_TEST' and version = 2))$$,
  'a superuser publishes version 2'
);
select results_eq(
  $$select version, status::text from public.tests where code = 'PUB_TEST' order by version$$,
  $$values (1, 'archived'::text), (2, 'published'::text)$$,
  'T-HU007-05 v1 is archived and v2 is published'
);
select is(
  (select count(*)::int from public.tests where code = 'PUB_TEST' and status = 'published'),
  1,
  'a test code has only one published version'
);

select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select throws_ok(
  $$select public.create_test_version('{"code":"EVAL_COPY","title":{"es":"Copia"},"version":2,"sections":[]}'::jsonb)$$,
  '42501', null, 'an evaluator cannot create a version'
);

select * from finish();

rollback;
