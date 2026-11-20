-- HU007: publish, version and archive tests. `tests.parent_test_id` already exists (HU003).
-- Versions of one test share its code: (code, version) is unique, and a code has at most one
-- draft and one published version at a time.
drop index public.tests_code_key;
create unique index tests_code_version_key on public.tests (code, version);
create unique index tests_one_draft_per_code on public.tests (code) where status = 'draft';
create unique index tests_one_published_per_code on public.tests (code) where status = 'published';

-- RF-02 / RF-04: publishes a draft and archives the version it replaces, in one transaction.
-- The checks of the content (validateForPublish) run in the server before calling it.
create or replace function public.publish_test (test uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.tests%rowtype;
begin
  if not private.is_superuser() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into target from public.tests t where t.id = test for update;

  if not found then
    raise exception 'test_not_found' using errcode = 'P0002';
  end if;
  if target.status <> 'draft' then
    raise exception 'not_draft' using errcode = 'P0001', hint = 'Only a draft can be published.';
  end if;

  -- CA-04: the version in use is archived; assessments keep the test_version they started with.
  update public.tests t set status = 'archived'
  where t.code = target.code and t.status = 'published' and t.id <> target.id;

  update public.tests t set status = 'published' where t.id = target.id;
end;
$$;

revoke execute on function public.publish_test (uuid) from public, anon;
grant execute on function public.publish_test (uuid) to authenticated;

-- RF-03: inserts a whole test tree (the result of cloneTestVersion) as a new draft, in one
-- transaction. Runs with the caller's rights: RLS, the structure guard and the audit trail apply.
create or replace function public.create_test_version (tree jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created uuid;
  section_item jsonb;
  section_id uuid;
  question_item jsonb;
  question_id uuid;
begin
  insert into public.tests (code, title, description, version, status, parent_test_id, created_by)
  values (
    tree ->> 'code', tree -> 'title', nullif(tree -> 'description', 'null'::jsonb),
    coalesce((tree ->> 'version')::int, 1), 'draft', (tree ->> 'parent_test_id')::uuid, auth.uid()
  )
  returning id into created;

  for section_item in select * from jsonb_array_elements(coalesce(tree -> 'sections', '[]'::jsonb)) loop
    insert into public.test_sections (test_id, code, title, domain, position, is_draft_content)
    values (
      created, section_item ->> 'code', section_item -> 'title', section_item ->> 'domain',
      (section_item ->> 'position')::int, coalesce((section_item ->> 'is_draft_content')::boolean, false)
    )
    returning id into section_id;

    for question_item in select * from jsonb_array_elements(coalesce(section_item -> 'questions', '[]'::jsonb)) loop
      insert into public.questions (
        test_id, section_id, code, doc_ref, prompt, type, config, required, allows_decline, position,
        variable, direction, weight, alert_rule, depends_on, conversational_hint, source, clinical_note,
        is_draft_content, active
      )
      values (
        created, section_id, question_item ->> 'code', question_item ->> 'doc_ref', question_item -> 'prompt',
        (question_item ->> 'type')::public.question_type, coalesce(question_item -> 'config', '{}'::jsonb),
        coalesce((question_item ->> 'required')::boolean, true),
        coalesce((question_item ->> 'allows_decline')::boolean, false),
        (question_item ->> 'position')::int, question_item ->> 'variable',
        coalesce((question_item ->> 'direction')::public.question_direction, 'neutral'),
        (question_item ->> 'weight')::numeric, nullif(question_item -> 'alert_rule', 'null'::jsonb),
        nullif(question_item -> 'depends_on', 'null'::jsonb), nullif(question_item -> 'conversational_hint', 'null'::jsonb),
        question_item ->> 'source', question_item ->> 'clinical_note',
        coalesce((question_item ->> 'is_draft_content')::boolean, false),
        coalesce((question_item ->> 'active')::boolean, true)
      )
      returning id into question_id;

      insert into public.question_options (question_id, value, label, score, position, is_exclusive)
      select question_id, item ->> 'value', item -> 'label', (item ->> 'score')::numeric, ordinality,
        coalesce((item ->> 'is_exclusive')::boolean, false)
      from jsonb_array_elements(coalesce(question_item -> 'options', '[]'::jsonb)) with ordinality as o (item, ordinality);
    end loop;
  end loop;

  return created;
end;
$$;

revoke execute on function public.create_test_version (jsonb) from public, anon;
grant execute on function public.create_test_version (jsonb) to authenticated;
