-- HU004: sections group the questions of a test by module. Structure table: only a
-- superuser writes it, and only while the test is a draft.
create table public.test_sections (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  code text not null,
  title jsonb not null,
  domain text not null,
  position integer not null,
  is_draft_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint test_sections_code_format check (code ~ '^[A-Z0-9_]{2,40}$'),
  constraint test_sections_title_has_es check (
    jsonb_typeof(title) = 'object'
    and char_length(btrim(coalesce(title ->> 'es', ''))) between 3 and 120
  ),
  constraint test_sections_domain_length check (char_length(btrim(domain)) between 2 and 60),
  constraint test_sections_position_positive check (position >= 1),
  constraint test_sections_test_code_key unique (test_id, code),
  -- Deferrable so reorder_test_sections can swap positions inside one statement.
  constraint test_sections_test_position_key unique (test_id, position) deferrable initially immediate
);

comment on table public.test_sections is 'Secciones (módulos) de un test; posiciones 1..n. Solo el superusuario escribe.';

-- CA-05: the structure of a test that is no longer a draft is frozen; a new version is needed.
create or replace function private.guard_test_structure ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent uuid := case when tg_op = 'DELETE' then old.test_id else new.test_id end;
begin
  if exists (select 1 from public.tests t where t.id = parent and t.status <> 'draft')
     or (tg_op = 'UPDATE' and old.test_id <> new.test_id
         and exists (select 1 from public.tests t where t.id = old.test_id and t.status <> 'draft')) then
    raise exception 'new_version_required' using errcode = 'P0001',
      hint = 'The test is not a draft: create a new version to change its structure.';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke execute on function private.guard_test_structure () from public, anon, authenticated;

create trigger test_sections_guard_structure
before insert or update or delete on public.test_sections
for each row execute function private.guard_test_structure ();

create trigger test_sections_touch_updated_at
before update on public.test_sections
for each row execute function private.touch_updated_at ();

create trigger test_sections_audit
after insert or update or delete on public.test_sections
for each row execute function private.audit ();

-- RF-03: saves a new order (1..n) in one statement. Runs with the caller's rights, so RLS applies.
create or replace function public.reorder_test_sections (test uuid, section_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if cardinality(section_ids) is distinct from (select count(*) from public.test_sections s where s.test_id = test)
     or cardinality(section_ids) <> (select count(distinct x) from unnest(section_ids) x)
     or exists (
       select 1 from unnest(section_ids) x
       where not exists (select 1 from public.test_sections s where s.id = x and s.test_id = test)
     ) then
    raise exception 'invalid_order' using errcode = '22023',
      hint = 'List every section of the test exactly once.';
  end if;

  set constraints public.test_sections_test_position_key deferred;

  update public.test_sections s
  set position = o.ordinality
  from unnest(section_ids) with ordinality as o (id, ordinality)
  where s.id = o.id and s.position <> o.ordinality;

  -- Checks the positions now instead of at commit.
  set constraints public.test_sections_test_position_key immediate;
end;
$$;

revoke execute on function public.reorder_test_sections (uuid, uuid[]) from public, anon;
grant execute on function public.reorder_test_sections (uuid, uuid[]) to authenticated;

alter table public.test_sections enable row level security;

revoke all on public.test_sections from anon;

-- Same visibility as the parent test: published for everyone, everything for a superuser.
create policy "test_sections_select"
on public.test_sections for select to authenticated
using (
  (select private.is_superuser())
  or exists (select 1 from public.tests t where t.id = test_id and t.status = 'published')
);

create policy "test_sections_insert_superuser"
on public.test_sections for insert to authenticated
with check ((select private.is_superuser()));

create policy "test_sections_update_superuser"
on public.test_sections for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "test_sections_delete_superuser"
on public.test_sections for delete to authenticated
using ((select private.is_superuser()));
