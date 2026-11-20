-- HU024: audit trail written by triggers, so no write path can skip it.
create table public.audit_log (
  id bigint generated always as identity primary key,
  -- No foreign key on purpose: the trail must keep the actor even if the account is deleted.
  actor_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity text not null,
  entity_id uuid,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is 'Registro de cambios de las tablas de estructura; solo lectura para el superusuario.';

create index audit_log_created_at_idx on public.audit_log (created_at desc, id desc);
create index audit_log_entity_idx on public.audit_log (entity, created_at desc);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);

-- Changed columns only: { "column": { "old": ..., "new": ... } }.
-- A missing old row (insert) or new row (delete) counts every column as changed.
create or replace function private.json_diff (old_row jsonb, new_row jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    jsonb_object_agg(k, jsonb_build_object('old', old_row -> k, 'new', new_row -> k)),
    '{}'::jsonb
  )
  from (
    select jsonb_object_keys(coalesce(old_row, '{}'::jsonb) || coalesce(new_row, '{}'::jsonb)) as k
  ) as keys
  where (old_row -> k) is distinct from (new_row -> k);
$$;

-- Generic row trigger: attach it to every structure table.
create or replace function private.audit ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb;
  new_row jsonb;
  row_diff jsonb;
  row_id text;
begin
  if tg_op = 'INSERT' then
    new_row := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
  else
    old_row := to_jsonb(old);
  end if;

  row_diff := private.json_diff(old_row, new_row);

  -- A no-op update leaves nothing to audit.
  if tg_op = 'UPDATE' and row_diff = '{}'::jsonb then
    return null;
  end if;

  -- Tables keyed by a pair of columns have no `id`; their diff carries the key columns.
  row_id := coalesce(new_row, old_row) ->> 'id';

  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    case when row_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then row_id::uuid end,
    row_diff
  );

  return null;
end;
$$;

revoke execute on function private.audit () from public, anon, authenticated;
grant execute on function private.json_diff (jsonb, jsonb) to authenticated, service_role;

-- Read-only for superusers: no write grant and no write policy for anyone.
alter table public.audit_log enable row level security;

revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

create policy "audit_log_select_superuser"
on public.audit_log for select to authenticated
using ((select private.is_superuser()));

-- Tables that already exist and must be audited. Later structure tables attach the
-- trigger in their own migration.
create trigger evaluator_patients_audit
after insert or update or delete on public.evaluator_patients
for each row execute function private.audit ();
