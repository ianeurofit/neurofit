-- HU006: conditions, deactivation and order of questions. `depends_on` and `active` were
-- created with the table (HU005); this migration gives them their contract and teaches
-- save_question to write them.

-- One condition per question (specs.md §8 `Condition`): { questionCode, op, value }.
alter table public.questions add constraint questions_depends_on_shape check (
  depends_on is null or (
    jsonb_typeof(depends_on) = 'object'
    and coalesce(depends_on ->> 'questionCode', '') ~ '^[A-Z0-9_]{2,40}$'
    and depends_on ->> 'op' in ('eq', 'neq', 'in', 'any_eq')
    and depends_on ? 'value'
  )
);

-- Deferrable so reorder_section_questions can swap positions inside one statement.
alter table public.questions drop constraint questions_section_position_key;
alter table public.questions add constraint questions_section_position_key
  unique (section_id, position) deferrable initially immediate;

-- RF-07: same rules as reorder_test_sections (HU004). Runs with the caller's rights, so RLS
-- and the structure guard apply.
create or replace function public.reorder_section_questions (section uuid, question_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if cardinality(question_ids) is distinct from (select count(*) from public.questions q where q.section_id = section)
     or cardinality(question_ids) <> (select count(distinct x) from unnest(question_ids) x)
     or exists (
       select 1 from unnest(question_ids) x
       where not exists (select 1 from public.questions q where q.id = x and q.section_id = section)
     ) then
    raise exception 'invalid_order' using errcode = '22023',
      hint = 'List every question of the section exactly once.';
  end if;

  set constraints public.questions_section_position_key deferred;

  update public.questions q
  set position = o.ordinality
  from unnest(question_ids) with ordinality as o (id, ordinality)
  where q.id = o.id and q.position <> o.ordinality;

  set constraints public.questions_section_position_key immediate;
end;
$$;

revoke execute on function public.reorder_section_questions (uuid, uuid[]) from public, anon;
grant execute on function public.reorder_section_questions (uuid, uuid[]) to authenticated;

-- save_question (HU005) now also writes `depends_on` and `active`.
create or replace function public.save_question (test uuid, question_id uuid, question jsonb, options jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved uuid := question_id;
  section uuid := (question ->> 'section_id')::uuid;
  current_section uuid;
begin
  if jsonb_typeof(options) is distinct from 'array' then
    raise exception 'invalid_options' using errcode = '22023', hint = 'options must be a JSON array.';
  end if;

  if saved is null then
    insert into public.questions (
      test_id, section_id, code, doc_ref, prompt, type, config, required, allows_decline, position,
      variable, direction, weight, alert_rule, depends_on, conversational_hint, source, clinical_note,
      is_draft_content, active
    )
    values (
      test, section, question ->> 'code', question ->> 'doc_ref', question -> 'prompt',
      (question ->> 'type')::public.question_type, coalesce(question -> 'config', '{}'::jsonb),
      coalesce((question ->> 'required')::boolean, true), coalesce((question ->> 'allows_decline')::boolean, false),
      (select coalesce(max(q.position), 0) + 1 from public.questions q where q.section_id = section),
      question ->> 'variable', coalesce((question ->> 'direction')::public.question_direction, 'neutral'),
      (question ->> 'weight')::numeric, nullif(question -> 'alert_rule', 'null'::jsonb),
      nullif(question -> 'depends_on', 'null'::jsonb),
      nullif(question -> 'conversational_hint', 'null'::jsonb), question ->> 'source', question ->> 'clinical_note',
      coalesce((question ->> 'is_draft_content')::boolean, false), coalesce((question ->> 'active')::boolean, true)
    )
    returning id into saved;
  else
    select q.section_id into current_section from public.questions q where q.id = saved and q.test_id = test;

    if not found then
      raise exception 'question_not_found' using errcode = 'P0002';
    end if;

    update public.questions q set
      section_id = section,
      code = question ->> 'code',
      doc_ref = question ->> 'doc_ref',
      prompt = question -> 'prompt',
      type = (question ->> 'type')::public.question_type,
      config = coalesce(question -> 'config', '{}'::jsonb),
      required = coalesce((question ->> 'required')::boolean, true),
      allows_decline = coalesce((question ->> 'allows_decline')::boolean, false),
      position = case when section = current_section then q.position
        else (select coalesce(max(o.position), 0) + 1 from public.questions o where o.section_id = section) end,
      variable = question ->> 'variable',
      direction = coalesce((question ->> 'direction')::public.question_direction, 'neutral'),
      weight = (question ->> 'weight')::numeric,
      alert_rule = nullif(question -> 'alert_rule', 'null'::jsonb),
      depends_on = nullif(question -> 'depends_on', 'null'::jsonb),
      conversational_hint = nullif(question -> 'conversational_hint', 'null'::jsonb),
      source = question ->> 'source',
      clinical_note = question ->> 'clinical_note',
      is_draft_content = coalesce((question ->> 'is_draft_content')::boolean, false),
      active = coalesce((question ->> 'active')::boolean, true)
    where q.id = saved;

    -- Options are replaced only when they change, so an unrelated edit leaves no audit noise.
    if options is distinct from coalesce((
      select jsonb_agg(jsonb_build_object('value', o.value, 'label', o.label, 'score', o.score,
        'is_exclusive', o.is_exclusive) order by o.position)
      from public.question_options o where o.question_id = saved), '[]'::jsonb) then
      delete from public.question_options o where o.question_id = saved;
    else
      return saved;
    end if;
  end if;

  insert into public.question_options (question_id, value, label, score, position, is_exclusive)
  select saved, item ->> 'value', item -> 'label', (item ->> 'score')::numeric, ordinality,
    coalesce((item ->> 'is_exclusive')::boolean, false)
  from jsonb_array_elements(options) with ordinality as o (item, ordinality);

  return saved;
end;
$$;
