-- Esquema privado para helpers (no expuesto por PostgREST)
create schema if not exists private;

revoke all on schema private from anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.current_role ()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid());
$$;

create or replace function private.is_superuser ()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'superuser'
      and p.is_active
  );
$$;

create or replace function private.is_staff ()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('superuser', 'evaluator')
      and p.is_active
  );
$$;

grant execute on function private.current_role (), private.is_superuser (), private.is_staff () to authenticated;

-- Nadie que no sea superusuario puede cambiar rol o estado, ni siquiera el propio
create or replace function public.guard_profile_privileges ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    -- service_role / backend verificado
    return new;
  end if;

  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not private.is_superuser() then
    raise exception 'No autorizado para modificar rol o estado del usuario'
      using errcode = '42501';
  end if;

  new.id := old.id;
  return new;
end;
$$;

create trigger profiles_guard_privileges
before update on public.profiles
for each row
execute function public.guard_profile_privileges ();

-- RLS
alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "profiles_select_staff"
on public.profiles for select to authenticated
using ((select private.is_staff()));

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "profiles_update_superuser"
on public.profiles for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "profiles_insert_superuser"
on public.profiles for insert to authenticated
with check ((select private.is_superuser()));

create policy "profiles_delete_superuser"
on public.profiles for delete to authenticated
using ((select private.is_superuser()) and id <> (select auth.uid()));
