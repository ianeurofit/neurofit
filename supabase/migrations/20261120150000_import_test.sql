-- HU008: writes an import in one transaction. Sections and questions are upserted by code, so a
-- second import of the same file does not duplicate anything. Only the fields the file defines
-- are written: weights, English texts, conditions, hints and the active flag stay as they are.
-- Runs with the caller's rights: RLS, the structure guard (drafts only) and the audit trail apply.
create or replace function public.import_test (test uuid, sections jsonb, questions jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item jsonb;
  section uuid;
  existing public.questions%rowtype;
  saved uuid;
begin
  for item in select * from jsonb_array_elements(coalesce(sections, '[]'::jsonb)) loop
    update public.test_sections s
    set title = s.title || jsonb_build_object('es', item ->> 'title')
    where s.test_id = test and s.code = item ->> 'code' and s.title ->> 'es' is distinct from item ->> 'title';

    if not exists (select 1 from public.test_sections s where s.test_id = test and s.code = item ->> 'code') then
      insert into public.test_sections (test_id, code, title, domain, position)
      values (
        test, item ->> 'code', jsonb_build_object('es', item ->> 'title'), lower(item ->> 'code'),
        (select coalesce(max(s.position), 0) + 1 from public.test_sections s where s.test_id = test)
      );
    end if;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) loop
    select s.id into section from public.test_sections s where s.test_id = test and s.code = item ->> 'section_code';
    if section is null then
      raise exception 'section_not_found' using errcode = '23503', hint = item ->> 'section_code';
    end if;

    select * into existing from public.questions q where q.test_id = test and q.code = item ->> 'code';

    if not found then
      insert into public.questions (
        test_id, section_id, code, doc_ref, prompt, type, config, required, position, direction, is_draft_content
      )
      values (
        test, section, item ->> 'code', item ->> 'doc_ref', jsonb_build_object('es', item ->> 'prompt'),
        (item ->> 'type')::public.question_type, coalesce(item -> 'config', '{}'::jsonb),
        coalesce((item ->> 'required')::boolean, true),
        (select coalesce(max(q.position), 0) + 1 from public.questions q where q.section_id = section),
        coalesce((item ->> 'direction')::public.question_direction, 'neutral'),
        coalesce((item ->> 'is_draft_content')::boolean, false)
      )
      returning id into saved;
    else
      saved := existing.id;
      update public.questions q set
        section_id = section,
        position = case when q.section_id = section then q.position
          else (select coalesce(max(o.position), 0) + 1 from public.questions o where o.section_id = section) end,
        doc_ref = item ->> 'doc_ref',
        prompt = q.prompt || jsonb_build_object('es', item ->> 'prompt'),
        type = (item ->> 'type')::public.question_type,
        config = coalesce(item -> 'config', '{}'::jsonb),
        required = coalesce((item ->> 'required')::boolean, true),
        direction = coalesce((item ->> 'direction')::public.question_direction, 'neutral'),
        is_draft_content = coalesce((item ->> 'is_draft_content')::boolean, false)
      where q.id = saved;

      -- Options are replaced only when they change, so the audit trail only shows real changes.
      if coalesce(item -> 'options', '[]'::jsonb) is not distinct from coalesce((
        select jsonb_agg(jsonb_build_object('value', o.value, 'label', o.label, 'score', o.score,
          'is_exclusive', o.is_exclusive) order by o.position)
        from public.question_options o where o.question_id = saved), '[]'::jsonb) then
        continue;
      end if;
      delete from public.question_options o where o.question_id = saved;
    end if;

    insert into public.question_options (question_id, value, label, score, position, is_exclusive)
    select saved, option ->> 'value', option -> 'label', (option ->> 'score')::numeric, ordinality,
      coalesce((option ->> 'is_exclusive')::boolean, false)
    from jsonb_array_elements(coalesce(item -> 'options', '[]'::jsonb)) with ordinality as o (option, ordinality);
  end loop;
end;
$$;

revoke execute on function public.import_test (uuid, jsonb, jsonb) from public, anon;
grant execute on function public.import_test (uuid, jsonb, jsonb) to authenticated;
