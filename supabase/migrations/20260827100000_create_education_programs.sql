-- Educacion: catalogo publico de conferencias, talleres y programas de Neurofit.
-- Lo gestiona el superusuario; cualquier visitante puede leer lo publicado.

-- Lineas de la oferta (ver "Estrategia" del catalogo).
create type public.education_line as enum ('talk', 'workshop', 'program', 'ia');

create table public.education_programs (
  id uuid primary key default gen_random_uuid(),
  -- Identificador legible: permite enlazar una conferencia concreta.
  slug text not null unique,
  line public.education_line not null default 'talk',
  -- Orden manual dentro de su linea
  position integer not null default 0,

  -- Contenido en espanol (obligatorio) y su traduccion al ingles (opcional:
  -- si falta, la interfaz cae al espanol en vez de mostrar un hueco).
  title text not null,
  title_en text,
  objective text not null,
  objective_en text,
  topics text[] not null default '{}',
  topics_en text[] not null default '{}',

  -- Ficha
  duration text not null default '60 a 90 minutos',
  duration_en text,
  modality text not null default 'both',
  icon text not null default 'i-lucide-brain',

  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint education_programs_modality_check
    check (modality in ('both', 'onsite', 'virtual')),
  constraint education_programs_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.education_programs is
  'Conferencias, talleres y programas que Neurofit ofrece en /educacion.';
comment on column public.education_programs.modality is
  'both = presencial o virtual, onsite = presencial, virtual = virtual.';

create index education_programs_order_idx
  on public.education_programs (line, position, title);

create trigger education_programs_set_updated_at
before update on public.education_programs
for each row
execute function public.handle_updated_at ();

-- RLS
alter table public.education_programs enable row level security;

-- El catalogo es publico: cualquiera puede leer lo que este publicado.
create policy "education_select_published"
on public.education_programs for select to anon, authenticated
using (is_published);

-- El superusuario ve todo, incluso los borradores.
create policy "education_select_superuser"
on public.education_programs for select to authenticated
using ((select private.is_superuser()));

create policy "education_insert_superuser"
on public.education_programs for insert to authenticated
with check ((select private.is_superuser()));

create policy "education_update_superuser"
on public.education_programs for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "education_delete_superuser"
on public.education_programs for delete to authenticated
using ((select private.is_superuser()));
