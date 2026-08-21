-- Road Map: hitos ("nodos de tiempo") del proyecto Neurofit IA.
-- El superusuario los gestiona; el resto del equipo autenticado solo los lee.

create type public.roadmap_status as enum ('done', 'in_progress', 'planned');

create table public.roadmap_nodes (
  id uuid primary key default gen_random_uuid(),
  -- Etiqueta visible del nodo, ej. 'Agosto 12'
  title text not null,
  -- Fecha real: ordena la linea de tiempo y permite formatear por idioma
  event_date date not null,
  -- Orden manual dentro de una misma fecha
  position integer not null default 0,
  -- Hitos que agrupa el nodo
  items text[] not null default '{}',
  status public.roadmap_status not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.roadmap_nodes is 'Nodos de tiempo del Road Map de Neurofit IA.';

create index roadmap_nodes_order_idx on public.roadmap_nodes (event_date, position);

create trigger roadmap_nodes_set_updated_at
before update on public.roadmap_nodes
for each row
execute function public.handle_updated_at ();

-- RLS
alter table public.roadmap_nodes enable row level security;

-- Cualquier persona autenticada y activa puede ver el Road Map.
create policy "roadmap_select_authenticated"
on public.roadmap_nodes for select to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
  )
);

-- Solo el superusuario crea, edita y elimina nodos.
create policy "roadmap_insert_superuser"
on public.roadmap_nodes for insert to authenticated
with check ((select private.is_superuser()));

create policy "roadmap_update_superuser"
on public.roadmap_nodes for update to authenticated
using ((select private.is_superuser()))
with check ((select private.is_superuser()));

create policy "roadmap_delete_superuser"
on public.roadmap_nodes for delete to authenticated
using ((select private.is_superuser()));

-- Contenido inicial del Road Map
insert into public.roadmap_nodes (title, event_date, position, status, items) values
  (
    'Agosto 12',
    '2026-08-12',
    0,
    'done',
    array[
      'Adecuación de sitio web a inglés multi lenguage i18n',
      'Creación de Demo de 7 pasos con paciente piloto Carlos Gómez',
      'Login sistema de usuarios RLS',
      'Lanzamiento sitio web'
    ]
  ),
  (
    'Agosto 25',
    '2026-08-25',
    0,
    'in_progress',
    array['videomarketing Lanzamiento sitio web']
  ),
  (
    'Agosto 31',
    '2026-08-31',
    0,
    'planned',
    array['Creación de plataforma para el manejo de talleres y poder evaluar grupos y paciente individuales dependiendo del taller']
  ),
  (
    'Septiembre 28',
    '2026-09-28',
    0,
    'planned',
    array[
      'Inicio de Creación del agente Brian Inteligente',
      'y plataforma de paciente consolidada',
      'pagos en línea',
      'MVP del diagnóstico automático y perfilación de pacientes'
    ]
  ),
  (
    'Diciembre 24',
    '2026-12-24',
    0,
    'planned',
    array['Siempre en constante crecimiento']
  );
