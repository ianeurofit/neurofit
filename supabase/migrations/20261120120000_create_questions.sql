-- HU005: questions of a test and the options of its choice questions. Structure tables:
-- only a superuser reads or writes them, and only while the test is a draft. Everyone else
-- reads published questions through `questions_public`, which hides weights, alert rules,
-- clinical notes and option scores.
create type public.question_type as enum
  ('single_choice', 'multiple_choice', 'true_false', 'numeric_scale', 'agreement', 'numeric_free', 'open_text');

create type public.question_direction as enum ('higher_is_risk', 'higher_is_protective', 'neutral');

-- Lets a question point to (section, test) so its section always belongs to the same test.
alter table public.test_sections add constraint test_sections_id_test_key unique (id, test_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  section_id uuid not null,
  code text not null,
  doc_ref text,
  prompt jsonb not null,
  type public.question_type not null,
  config jsonb not null default '{}'::jsonb,
  required boolean not null default true,
  allows_decline boolean not null default false,
  position integer not null,
  variable text,
  direction public.question_direction not null default 'neutral',
  weight numeric,
  alert_rule jsonb,
  depends_on jsonb,
  conversational_hint jsonb,
  source text,
  clinical_note text,
  is_draft_content boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_section_fkey foreign key (section_id, test_id)
    references public.test_sections (id, test_id) on delete cascade,
  constraint questions_code_format check (code ~ '^[A-Z0-9_]{2,40}$'),
  constraint questions_prompt_has_es check (
    jsonb_typeof(prompt) = 'object'
    and char_length(btrim(coalesce(prompt ->> 'es', ''))) between 1 and 1000
  ),
  constraint questions_config_object check (jsonb_typeof(config) = 'object'),
  constraint questions_position_positive check (position >= 1),
  constraint questions_weight_positive check (weight is null or weight >= 0),
  -- RF-02: the code is unique in the whole test, not only in its section.
  constraint questions_test_code_key unique (test_id, code),
  constraint questions_section_position_key unique (section_id, position)
);

create index questions_section_id_idx on public.questions (section_id);

comment on table public.questions is 'Preguntas de un test. El código es único en todo el test. Solo el superusuario lee y escribe; el resto usa questions_public.';

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  value text not null,
  label jsonb not null,
  score numeric,
  position integer not null,
  is_exclusive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_options_value_format check (value ~ '^[a-z0-9_]{1,40}$'),
  constraint question_options_label_has_es check (
    jsonb_typeof(label) = 'object' and char_length(btrim(coalesce(label ->> 'es', ''))) > 0
  ),
  constraint question_options_position_positive check (position >= 1),
  constraint question_options_question_value_key unique (question_id, value),
  constraint question_options_question_position_key unique (question_id, position)
);

comment on table public.question_options is 'Opciones de las preguntas de elección, en orden. Solo el superusuario lee y escribe.';

-- Questions reuse the HU004 guard: they carry their test_id.
create trigger questions_guard_structure
before insert or update or delete on public.questions
for each row execute function private.guard_test_structure ();

-- Options reach their test through the question.
create or replace function private.guard_question_option_structure ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  question uuid := case when tg_op = 'DELETE' then old.question_id else new.question_id end;
begin
  if exists (
    select 1 from public.questions q join public.tests t on t.id = q.test_id
    where q.id = question and t.status <> 'draft'
  ) then
    raise exception 'new_version_required' using errcode = 'P0001',
      hint = 'The test is not a draft: create a new version to change its structure.';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke execute on function private.guard_question_option_structure () from public, anon, authenticated;

create trigger question_options_guard_structure
before insert or update or delete on public.question_options
for each row execute function private.guard_question_option_structure ();

create trigger questions_touch_updated_at
before update on public.questions
for each row execute function private.touch_updated_at ();

create trigger question_options_touch_updated_at
before update on public.question_options
for each row execute function private.touch_updated_at ();

create trigger questions_audit
after insert or update or delete on public.questions
for each row execute function private.audit ();

create trigger question_options_audit
after insert or update or delete on public.question_options
for each row execute function private.audit ();

-- Saves a question and replaces its options in one transaction. With `question_id` null it
-- creates the question at the end of its section. Runs with the caller's rights, so RLS, the
-- structure guard and the audit trail (with the caller as actor) all apply.
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
      variable, direction, weight, alert_rule, conversational_hint, source, clinical_note, is_draft_content
    )
    values (
      test, section, question ->> 'code', question ->> 'doc_ref', question -> 'prompt',
      (question ->> 'type')::public.question_type, coalesce(question -> 'config', '{}'::jsonb),
      coalesce((question ->> 'required')::boolean, true), coalesce((question ->> 'allows_decline')::boolean, false),
      (select coalesce(max(q.position), 0) + 1 from public.questions q where q.section_id = section),
      question ->> 'variable', coalesce((question ->> 'direction')::public.question_direction, 'neutral'),
      (question ->> 'weight')::numeric, nullif(question -> 'alert_rule', 'null'::jsonb),
      nullif(question -> 'conversational_hint', 'null'::jsonb), question ->> 'source', question ->> 'clinical_note',
      coalesce((question ->> 'is_draft_content')::boolean, false)
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
      -- Moving to another section puts the question at its end.
      position = case when section = current_section then q.position
        else (select coalesce(max(o.position), 0) + 1 from public.questions o where o.section_id = section) end,
      variable = question ->> 'variable',
      direction = coalesce((question ->> 'direction')::public.question_direction, 'neutral'),
      weight = (question ->> 'weight')::numeric,
      alert_rule = nullif(question -> 'alert_rule', 'null'::jsonb),
      conversational_hint = nullif(question -> 'conversational_hint', 'null'::jsonb),
      source = question ->> 'source',
      clinical_note = question ->> 'clinical_note',
      is_draft_content = coalesce((question ->> 'is_draft_content')::boolean, false)
    where q.id = saved;

    delete from public.question_options o where o.question_id = saved;
  end if;

  insert into public.question_options (question_id, value, label, score, position, is_exclusive)
  select saved, item ->> 'value', item -> 'label', (item ->> 'score')::numeric, ordinality,
    coalesce((item ->> 'is_exclusive')::boolean, false)
  from jsonb_array_elements(options) with ordinality as o (item, ordinality);

  return saved;
end;
$$;

revoke execute on function public.save_question (uuid, uuid, jsonb, jsonb) from public, anon;
grant execute on function public.save_question (uuid, uuid, jsonb, jsonb) to authenticated;

alter table public.questions enable row level security;
alter table public.question_options enable row level security;

revoke all on public.questions from anon;
revoke all on public.question_options from anon;

-- The base tables carry weights, alert rules, clinical notes and scores: only a superuser reads them.
create policy "questions_select_superuser"
on public.questions for select to authenticated
using ((select private.is_superuser()));

create policy "questions_insert_superuser"
on public.questions for insert to authenticated
with check ((select private.is_superuser()));

create policy "questions_update_superuser"
on public.questions for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "questions_delete_superuser"
on public.questions for delete to authenticated
using ((select private.is_superuser()));

create policy "question_options_select_superuser"
on public.question_options for select to authenticated
using ((select private.is_superuser()));

create policy "question_options_insert_superuser"
on public.question_options for insert to authenticated
with check ((select private.is_superuser()));

create policy "question_options_update_superuser"
on public.question_options for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "question_options_delete_superuser"
on public.question_options for delete to authenticated
using ((select private.is_superuser()));

-- Published, active questions without the hidden columns. The view runs with its owner's
-- rights (it reads past the superuser-only RLS above), so it filters by status itself.
create view public.questions_public
with (security_barrier = true)
as
select
  q.id, q.test_id, q.section_id, q.code, q.doc_ref, q.prompt, q.type, q.config, q.required,
  q.allows_decline, q.position, q.variable, q.direction, q.depends_on, q.conversational_hint,
  q.source, q.is_draft_content,
  coalesce(
    (select jsonb_agg(jsonb_build_object('value', o.value, 'label', o.label, 'position', o.position,
       'is_exclusive', o.is_exclusive) order by o.position)
     from public.question_options o where o.question_id = q.id),
    '[]'::jsonb
  ) as options
from public.questions q
join public.tests t on t.id = q.test_id
where t.status = 'published' and q.active;

comment on view public.questions_public is 'Preguntas publicadas sin weight, alert_rule, clinical_note ni score.';

revoke all on public.questions_public from anon, public;
grant select on public.questions_public to authenticated;
