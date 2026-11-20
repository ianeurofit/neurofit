-- HU003: tests are the top-level structure of an evaluation. Only a superuser writes
-- them; everyone else only reads published ones.
create type public.test_status as enum ('draft', 'published', 'archived');

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title jsonb not null,
  description jsonb,
  version integer not null default 1,
  status public.test_status not null default 'draft',
  parent_test_id uuid references public.tests (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tests_code_format check (code ~ '^[A-Z0-9_]{3,40}$'),
  constraint tests_title_has_es check (
    jsonb_typeof(title) = 'object'
    and char_length(btrim(coalesce(title ->> 'es', ''))) between 3 and 120
  ),
  constraint tests_description_is_object check (description is null or jsonb_typeof(description) = 'object'),
  constraint tests_version_positive check (version >= 1)
);

comment on table public.tests is 'Tests de evaluación; textos visibles en jsonb {es, en}. Solo el superusuario escribe.';

create unique index tests_code_key on public.tests (code);
create index tests_status_idx on public.tests (status);
create index tests_parent_test_id_idx on public.tests (parent_test_id);

create or replace function private.touch_updated_at ()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.touch_updated_at () from public, anon, authenticated;

create trigger tests_touch_updated_at
before update on public.tests
for each row execute function private.touch_updated_at ();

create trigger tests_audit
after insert or update or delete on public.tests
for each row execute function private.audit ();

alter table public.tests enable row level security;

revoke all on public.tests from anon;

create policy "tests_select"
on public.tests for select to authenticated
using (status = 'published' or (select private.is_superuser()));

create policy "tests_insert_superuser"
on public.tests for insert to authenticated
with check ((select private.is_superuser()));

create policy "tests_update_superuser"
on public.tests for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "tests_delete_superuser"
on public.tests for delete to authenticated
using ((select private.is_superuser()));
