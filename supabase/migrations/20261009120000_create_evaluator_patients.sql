-- HU001: assignment of patients to evaluators.
-- An evaluator only works with the patients a superuser assigned to them.
create table public.evaluator_patients (
  evaluator_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (evaluator_id, patient_id),
  constraint evaluator_patients_not_self check (evaluator_id <> patient_id)
);

comment on table public.evaluator_patients is 'Pacientes asignados a cada evaluador; solo el superusuario escribe.';

create index evaluator_patients_patient_id_idx on public.evaluator_patients (patient_id);

-- True when the current user is an active evaluator assigned to the given patient.
create or replace function private.is_evaluator_of (patient uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.evaluator_patients ep
    join public.profiles p on p.id = ep.evaluator_id
    where ep.patient_id = patient
      and ep.evaluator_id = (select auth.uid())
      and p.role = 'evaluator'
      and p.is_active
  );
$$;

grant execute on function private.is_evaluator_of (uuid) to authenticated, service_role;

alter table public.evaluator_patients enable row level security;

revoke all on public.evaluator_patients from anon;

create policy "evaluator_patients_select"
on public.evaluator_patients for select to authenticated
using (
  evaluator_id = (select auth.uid())
  or patient_id = (select auth.uid())
  or (select private.is_superuser())
);

create policy "evaluator_patients_insert_superuser"
on public.evaluator_patients for insert to authenticated
with check ((select private.is_superuser()));

create policy "evaluator_patients_update_superuser"
on public.evaluator_patients for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "evaluator_patients_delete_superuser"
on public.evaluator_patients for delete to authenticated
using ((select private.is_superuser()));
