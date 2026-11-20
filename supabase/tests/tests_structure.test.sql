-- HU003 / HU001 / HU004 / HU005: structure tables `tests`, `test_sections`, `questions` and
-- `question_options`. Only a superuser writes them; everyone else only sees published tests.
begin;

select plan(49);

insert into auth.users (id, email) values
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local'),
  ('a0000000-0000-0000-0000-00000000000a', 'evaluator@test.local'),
  ('c0000000-0000-0000-0000-0000000000c1', 'patient@test.local');
update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';
update public.profiles set role = 'evaluator' where id = 'a0000000-0000-0000-0000-00000000000a';

select has_table('public', 'tests', 'tests table exists');
select has_type('public', 'test_status', 'test_status enum exists');
insert into public.tests (id, code, title, created_by, status) values
  ('10000000-0000-0000-0000-000000000001', 'DRAFT_TEST', '{"es":"Borrador"}', 'd0000000-0000-0000-0000-0000000000d0', 'draft'),
  ('10000000-0000-0000-0000-000000000002', 'PUBLISHED_TEST', '{"es":"Publicado"}', 'd0000000-0000-0000-0000-0000000000d0', 'draft');

insert into public.tests (id, code, title) values ('10000000-0000-0000-0000-000000000003', 'DEFAULTS_TEST', '{"es":"Por defecto"}');
select results_eq(
  $$select status::text, version from public.tests where id = '10000000-0000-0000-0000-000000000003'$$,
  $$values ('draft'::text, 1)$$,
  'a new test starts as draft, version 1'
);
delete from public.tests where id = '10000000-0000-0000-0000-000000000003';

select throws_ok(
  $$insert into public.tests (code, title) values ('DRAFT_TEST', '{"es":"Otro"}')$$,
  '23505', null, 'the test code is unique'
);
select throws_ok(
  $$insert into public.tests (code, title) values ('bad code', '{"es":"Otro"}')$$,
  '23514', null, 'the test code must match ^[A-Z0-9_]{3,40}$'
);

-- HU004: sections of a test.
select has_table('public', 'test_sections', 'test_sections table exists');

insert into public.test_sections (id, test_id, code, title, domain, position) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'MOD_1', '{"es":"Módulo 1"}', 'cognition', 1),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MOD_2', '{"es":"Módulo 2"}', 'sleep', 2),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'MOD_1', '{"es":"Otro test"}', 'cognition', 1);

-- HU005: questions and their options, written while both tests are drafts.
select has_table('public', 'questions', 'questions table exists');
select has_table('public', 'question_options', 'question_options table exists');
select has_type('public', 'question_type', 'question_type enum exists');

insert into public.questions (id, test_id, section_id, code, prompt, type, config, required, position, weight, clinical_note) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'MEM_001', '{"es":"¿Olvidas conversaciones?"}', 'single_choice', '{}', true, 1, 2, 'nota clínica'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003',
   'MEM_001', '{"es":"Misma pregunta en otro test"}', 'single_choice', '{}', true, 1, 3, 'nota clínica');
insert into public.question_options (question_id, value, label, score, position) values
  ('40000000-0000-0000-0000-000000000002', 'never', '{"es":"Nunca"}', 0, 1),
  ('40000000-0000-0000-0000-000000000002', 'always', '{"es":"Siempre"}', 4, 2);

-- T-HU005-02: the question code is unique in the whole test, not only in its section.
select throws_ok(
  $$insert into public.questions (test_id, section_id, code, prompt, type, position)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'MEM_001', '{"es":"Repetida"}', 'open_text', 1)$$,
  '23505', null, 'T-HU005-02 two sections of the same test cannot share a question code'
);
select is(
  (select count(*)::int from public.questions where code = 'MEM_001' and test_id::text like '10000000%'),
  2,
  'the same question code is allowed in different tests'
);
select throws_ok(
  $$insert into public.questions (test_id, section_id, code, prompt, type, position)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'MEM_002', '{"es":"Sección ajena"}', 'open_text', 5)$$,
  '23503', null, 'a question cannot point to a section of another test'
);
select throws_ok(
  $$insert into public.question_options (question_id, value, label, position)
    values ('40000000-0000-0000-0000-000000000002', 'never', '{"es":"Otra"}', 3)$$,
  '23505', null, 'two options of a question cannot share a value'
);
select throws_ok(
  $$insert into public.questions (test_id, section_id, code, prompt, type, position)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'MEM_003', '{"en":"No Spanish"}', 'open_text', 1)$$,
  '23514', null, 'a question needs its prompt in Spanish'
);

-- HU006: conditions, deactivation and question order (draft test 1, section MOD_2).
insert into public.questions (id, test_id, section_id, code, prompt, type, position) values
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'ORD_A', '{"es":"A"}', 'open_text', 1),
  ('40000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'ORD_B', '{"es":"B"}', 'open_text', 2),
  ('40000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'ORD_C', '{"es":"C"}', 'open_text', 3);

select is(
  (select active from public.questions where id = '40000000-0000-0000-0000-000000000011'),
  true,
  'a new question is active'
);
select throws_ok(
  $$update public.questions set depends_on = '{"op":"eq"}' where id = '40000000-0000-0000-0000-000000000011'$$,
  '23514', null, 'a condition needs questionCode and a known op'
);
select lives_ok(
  $$update public.questions set depends_on = '{"questionCode":"ORD_B","op":"eq","value":"si"}' where id = '40000000-0000-0000-0000-000000000011'$$,
  'a well-formed condition is stored'
);

-- T-HU006-09 / RF-07: reordering questions follows the section rules of HU004.
select lives_ok(
  $$select public.reorder_section_questions('30000000-0000-0000-0000-000000000002',
    array['40000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000012']::uuid[])$$,
  'reordering questions swaps positions in one statement'
);
select results_eq(
  $$select code, position from public.questions where section_id = '30000000-0000-0000-0000-000000000002' order by position$$,
  $$values ('ORD_C'::text, 1), ('ORD_A'::text, 2), ('ORD_B'::text, 3)$$,
  'the new question order is saved with consecutive positions'
);
select throws_ok(
  $$select public.reorder_section_questions('30000000-0000-0000-0000-000000000002',
    array['40000000-0000-0000-0000-000000000011']::uuid[])$$,
  '22023', null, 'reordering must list every question of the section exactly once'
);

-- save_question also writes the condition and the active flag.
select lives_ok(
  $$select public.save_question('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000012',
    '{"section_id":"30000000-0000-0000-0000-000000000002","code":"ORD_B","prompt":{"es":"B"},"type":"open_text","config":{"maxLength":10},"required":true,"active":false,"depends_on":{"questionCode":"ORD_C","op":"neq","value":"x"}}',
    '[]')$$,
  'save_question stores the condition and the active flag'
);
select results_eq(
  $$select active, depends_on ->> 'questionCode', position from public.questions where id = '40000000-0000-0000-0000-000000000012'$$,
  $$values (false, 'ORD_C'::text, 3)$$,
  'the question is inactive, keeps its condition and its position'
);

update public.tests set status = 'published' where id = '10000000-0000-0000-0000-000000000002';

-- Hidden columns: the public view never exposes weights, alert rules, clinical notes or scores.
select hasnt_column('public', 'questions_public', 'weight', 'questions_public hides weight');
select hasnt_column('public', 'questions_public', 'alert_rule', 'questions_public hides alert_rule');
select hasnt_column('public', 'questions_public', 'clinical_note', 'questions_public hides clinical_note');

select throws_ok(
  $$update public.question_options set label = '{"es":"Cambio"}' where question_id = '40000000-0000-0000-0000-000000000002'$$,
  'P0001', 'new_version_required', 'an option of a published test cannot be edited'
);

-- T-HU004-02
select throws_ok(
  $$insert into public.test_sections (test_id, code, title, domain, position)
    values ('10000000-0000-0000-0000-000000000001', 'MOD_1', '{"es":"Repetido"}', 'cognition', 3)$$,
  '23505', null, 'two sections of the same test cannot share a code'
);
select is(
  (select count(*)::int from public.test_sections where code = 'MOD_1' and test_id::text like '10000000%'),
  2,
  'the same section code is allowed in different tests'
);
select throws_ok(
  $$insert into public.test_sections (test_id, code, title, domain, position)
    values ('10000000-0000-0000-0000-000000000001', 'MOD_3', '{"es":"Misma posición"}', 'cognition', 2)$$,
  '23505', null, 'two sections of the same test cannot share a position'
);

-- RF-03: reordering swaps positions atomically.
select lives_ok(
  $$select public.reorder_test_sections('10000000-0000-0000-0000-000000000001',
    array['30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001']::uuid[])$$,
  'reordering swaps positions in one statement'
);
select results_eq(
  $$select code from public.test_sections where test_id = '10000000-0000-0000-0000-000000000001' order by position$$,
  $$values ('MOD_2'::text), ('MOD_1'::text)$$,
  'the new order is saved'
);
select throws_ok(
  $$select public.reorder_test_sections('10000000-0000-0000-0000-000000000001',
    array['30000000-0000-0000-0000-000000000001']::uuid[])$$,
  '22023', null, 'reordering must list every section of the test exactly once'
);

-- CA-05: the structure of a published test cannot change.
select throws_ok(
  $$update public.test_sections set title = '{"es":"Cambio"}' where id = '30000000-0000-0000-0000-000000000003'$$,
  'P0001', 'new_version_required', 'a section of a published test cannot be edited'
);

set local role authenticated;

-- T-HU003-05: a patient does not see draft tests.
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.tests where id = '10000000-0000-0000-0000-000000000001'),
  0,
  'a patient does not see a draft test'
);
select results_eq(
  $$select code from public.tests where id::text like '10000000%'$$,
  $$values ('PUBLISHED_TEST'::text)$$,
  'a patient sees published tests'
);
select results_eq(
  $$select code, jsonb_array_length(options) from public.questions_public where test_id::text like '10000000%'$$,
  $$values ('MEM_001'::text, 2)$$,
  'a patient sees only the questions of published tests, with their options'
);
select is(
  (select count(*)::int from public.questions_public where code like 'ORD_%'),
  0,
  'questions of a draft test are not public'
);
select is(
  (select bool_or(option ? 'score') from public.questions_public q, jsonb_array_elements(q.options) option),
  false,
  'the options of the public view carry no score'
);

-- Evaluator: same visibility, and no writes (T-HU001-11).
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.tests where id = '10000000-0000-0000-0000-000000000001'),
  0,
  'an evaluator does not see a draft test'
);
select throws_ok(
  $$insert into public.tests (code, title) values ('EVAL_TEST', '{"es":"Evaluador"}')$$,
  '42501', null, 'an evaluator cannot insert a test'
);
select throws_ok(
  $$insert into public.questions (test_id, section_id, code, prompt, type, position)
    values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'EVAL_Q', '{"es":"Evaluador"}', 'open_text', 9)$$,
  '42501', null, 'an evaluator cannot insert a question'
);
select is((select count(*)::int from public.questions), 0, 'an evaluator cannot read the questions table');
select throws_ok(
  $$select public.reorder_section_questions('30000000-0000-0000-0000-000000000002',
    array['40000000-0000-0000-0000-000000000011']::uuid[])$$,
  '22023', null, 'an evaluator cannot reorder questions (sees none of them)'
);

-- Superuser: sees everything and can write.
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.tests where id::text like '10000000%'),
  2,
  'a superuser sees draft and published tests'
);
select lives_ok(
  $$insert into public.tests (code, title, created_by) values ('ADMIN_TEST', '{"es":"Admin"}', 'd0000000-0000-0000-0000-0000000000d0')$$,
  'a superuser can insert a test'
);

-- save_question writes a question and replaces its options in one call.
select lives_ok(
  $$select public.save_question('10000000-0000-0000-0000-000000000001', null,
    '{"section_id":"30000000-0000-0000-0000-000000000002","code":"SLP_001","prompt":{"es":"¿Duermes bien?"},"type":"multiple_choice","config":{"exclusiveValues":["none"]},"required":true}',
    '[{"value":"none","label":{"es":"Ninguno"},"score":0,"is_exclusive":true},{"value":"snore","label":{"es":"Ronquidos"},"score":1}]')$$,
  'a superuser saves a question with its options'
);
select results_eq(
  $$select q.position, o.value, o.position, o.is_exclusive from public.questions q
    join public.question_options o on o.question_id = q.id where q.code = 'SLP_001' and q.test_id = '10000000-0000-0000-0000-000000000001' order by o.position$$,
  $$values (4, 'none'::text, 1, true), (4, 'snore'::text, 2, false)$$,
  'the question goes last in its section and the options keep their order'
);
select lives_ok(
  $$select public.save_question('10000000-0000-0000-0000-000000000001',
    (select id from public.questions where code = 'SLP_001' and test_id = '10000000-0000-0000-0000-000000000001'),
    '{"section_id":"30000000-0000-0000-0000-000000000002","code":"SLP_001","prompt":{"es":"¿Duermes bien?"},"type":"single_choice","config":{},"required":false}',
    '[{"value":"yes","label":{"es":"Sí"}},{"value":"no","label":{"es":"No"}},{"value":"unknown","label":{"es":"No lo sé"}}]')$$,
  'saving again updates the question'
);
select results_eq(
  $$select q.type::text, q.required, count(o.*)::int from public.questions q
    join public.question_options o on o.question_id = q.id where q.code = 'SLP_001' and q.test_id = '10000000-0000-0000-0000-000000000001' group by q.type, q.required$$,
  $$values ('single_choice'::text, false, 3)$$,
  'saving again replaces the options'
);

select * from finish();

rollback;
