-- Road Map: cada hito deja de ser un texto suelto y pasa a ser un objeto
-- {text, amount} para poder asignarle un valor en pesos colombianos (COP).

-- Valida la forma del array de hitos. Va en una funcion porque un CHECK
-- no admite subconsultas.
create or replace function public.roadmap_items_valid (items jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(items) = 'array'
     and not exists (
       select 1
       from jsonb_array_elements(items) as e
       where jsonb_typeof(e) <> 'object'
          or jsonb_typeof(e -> 'text') <> 'string'
          or jsonb_typeof(e -> 'amount') <> 'number'
          -- CASE y no OR: Postgres no garantiza el orden de evaluacion, asi que
          -- el cast solo se ejecuta cuando ya se sabe que amount es un numero.
          or case
               when jsonb_typeof(e -> 'amount') = 'number'
                 then (e ->> 'amount')::numeric < 0
               else false
             end
     );
$$;

comment on function public.roadmap_items_valid (jsonb) is
  'True si el jsonb es un array de {text: string, amount: number >= 0}.';

alter table public.roadmap_nodes
  add column items_jsonb jsonb not null default '[]'::jsonb;

-- Los hitos que ya existen conservan su texto y arrancan en 0.
update public.roadmap_nodes
set items_jsonb = coalesce(
  (
    select jsonb_agg(jsonb_build_object('text', item, 'amount', 0))
    from unnest(items) as item
  ),
  '[]'::jsonb
);

alter table public.roadmap_nodes drop column items;

alter table public.roadmap_nodes rename column items_jsonb to items;

alter table public.roadmap_nodes
  add constraint roadmap_nodes_items_shape check (public.roadmap_items_valid (items));

comment on column public.roadmap_nodes.items is
  'Hitos del nodo: array JSON de {text, amount}. amount es el valor en COP.';
