-- HU008: import_test writes the sections and questions of an import in one transaction,
-- upserting by code so a second import does not duplicate anything.
begin;

select plan(11);

insert into auth.users (id, email) values
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local'),
  ('a0000000-0000-0000-0000-00000000000a', 'evaluator@test.local');
update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';
update public.profiles set role = 'evaluator' where id = 'a0000000-0000-0000-0000-00000000000a';

insert into public.tests (id, code, title, created_by) values
  ('60000000-0000-0000-0000-000000000001', 'IMPORT_TEST', '{"es":"Importado"}', 'd0000000-0000-0000-0000-0000000000d0');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);

select has_function('public', 'import_test', array['uuid', 'jsonb', 'jsonb'], 'import_test exists');

select lives_ok(
  $$select public.import_test('60000000-0000-0000-0000-000000000001',
    '[{"code":"MEM","title":"Memoria"},{"code":"SLP","title":"Sueño"}]',
    '[{"section_code":"MEM","code":"MEM_001","doc_ref":"P4","prompt":"¿Olvidas?","type":"single_choice","config":{},"required":true,"direction":"higher_is_risk","is_draft_content":false,
       "options":[{"value":"never","label":{"es":"Nunca"},"score":0,"is_exclusive":false},{"value":"always","label":{"es":"Siempre"},"score":4,"is_exclusive":false}]},
      {"section_code":"SLP","code":"SLP_001","doc_ref":null,"prompt":"¿Roncas?","type":"true_false","config":{"labels":{"true":{"es":"Sí"},"false":{"es":"No"}}},"required":true,"direction":"higher_is_risk","is_draft_content":true,"options":[]}]')$$,
  'a superuser imports sections and questions'
);
select results_eq(
  $$select code, position, domain from public.test_sections where test_id = '60000000-0000-0000-0000-000000000001' order by position$$,
  $$values ('MEM'::text, 1, 'mem'::text), ('SLP'::text, 2, 'slp'::text)$$,
  'sections are created in file order'
);
select results_eq(
  $$select q.code, s.code, q.doc_ref, q.prompt ->> 'es', q.weight, q.is_draft_content, (select count(*)::int from public.question_options o where o.question_id = q.id)
    from public.questions q join public.test_sections s on s.id = q.section_id
    where q.test_id = '60000000-0000-0000-0000-000000000001' order by q.code$$,
  $$values ('MEM_001'::text, 'MEM'::text, 'P4'::text, '¿Olvidas?'::text, null::numeric, false, 2),
           ('SLP_001'::text, 'SLP'::text, null::text, '¿Roncas?'::text, null::numeric, true, 0)$$,
  'questions are created with their options and no weight'
);

-- Fields the file does not define (weight, English text, condition) survive a reimport.
update public.questions set weight = 2, prompt = prompt || '{"en":"Do you forget?"}', depends_on = '{"questionCode":"SLP_001","op":"eq","value":true}'
where code = 'MEM_001' and test_id = '60000000-0000-0000-0000-000000000001';

-- T-HU008-05 / T-HU008-06: reimport updates by code (one changed text, one new question).
select lives_ok(
  $$select public.import_test('60000000-0000-0000-0000-000000000001', '[]',
    '[{"section_code":"MEM","code":"MEM_001","doc_ref":"P4","prompt":"¿Olvidas cosas?","type":"single_choice","config":{},"required":true,"direction":"higher_is_risk","is_draft_content":false,
       "options":[{"value":"never","label":{"es":"Nunca"},"score":0,"is_exclusive":false},{"value":"always","label":{"es":"Siempre"},"score":4,"is_exclusive":false}]},
      {"section_code":"MEM","code":"MEM_002","doc_ref":"P5","prompt":"¿Repites?","type":"open_text","config":{"maxLength":1000},"required":false,"direction":"neutral","is_draft_content":false,"options":[]}]')$$,
  'a second import updates and adds'
);
select is(
  (select count(*)::int from public.questions where test_id = '60000000-0000-0000-0000-000000000001'),
  3,
  'reimporting does not duplicate questions'
);
select results_eq(
  $$select prompt ->> 'es', prompt ->> 'en', weight, depends_on ->> 'questionCode' from public.questions
    where code = 'MEM_001' and test_id = '60000000-0000-0000-0000-000000000001'$$,
  $$values ('¿Olvidas cosas?'::text, 'Do you forget?'::text, 2::numeric, 'SLP_001'::text)$$,
  'an update changes the Spanish text and keeps weight, English text and condition'
);
select is(
  (select position from public.questions where code = 'MEM_002' and test_id = '60000000-0000-0000-0000-000000000001'),
  2,
  'a new question goes to the end of its section'
);

select throws_ok(
  $$select public.import_test('60000000-0000-0000-0000-000000000001', '[]',
    '[{"section_code":"GHOST","code":"X_001","prompt":"x","type":"open_text","config":{},"required":true,"direction":"neutral","is_draft_content":false,"options":[]}]')$$,
  '23503', null, 'a question for a section that does not exist is refused'
);

select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select throws_ok(
  $$select public.import_test('60000000-0000-0000-0000-000000000001', '[{"code":"EVAL","title":"Evaluador"}]', '[]')$$,
  '42501', null, 'an evaluator cannot import'
);

-- CA-06: only drafts.
select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);
select public.publish_test('60000000-0000-0000-0000-000000000001');
select throws_ok(
  $$select public.import_test('60000000-0000-0000-0000-000000000001', '[{"code":"NEW","title":"Nueva"}]', '[]')$$,
  'P0001', 'new_version_required', 'a published test cannot be imported over'
);

select * from finish();

rollback;
