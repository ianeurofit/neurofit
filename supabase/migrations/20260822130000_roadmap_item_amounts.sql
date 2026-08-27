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

-- Los hitos que ya existen conservan su texto y arrancan en 0. Algunos ya se
-- guardaron como JSON dentro del text[] (el formulario nuevo escribiendo sobre
-- el esquema viejo): esos se desenvuelven para no perder su importe ni quedar
-- anidados dos veces.
update public.roadmap_nodes
set items_jsonb = coalesce(
  (
    select jsonb_agg(
      case
        when pg_input_is_valid(item, 'jsonb')
             and jsonb_typeof(item::jsonb) = 'object'
             and jsonb_typeof(item::jsonb -> 'text') = 'string'
          then jsonb_build_object(
                 'text', item::jsonb ->> 'text',
                 'amount', coalesce(
                   case
                     when jsonb_typeof(item::jsonb -> 'amount') = 'number'
                       then (item::jsonb ->> 'amount')::numeric
                   end,
                   0
                 )
               )
        else jsonb_build_object('text', item, 'amount', 0)
      end
      order by ord
    )
    from unnest(items) with ordinality as u (item, ord)
  ),
  '[]'::jsonb
);

alter table public.roadmap_nodes drop column items;

alter table public.roadmap_nodes rename column items_jsonb to items;

alter table public.roadmap_nodes
  add constraint roadmap_nodes_items_shape check (public.roadmap_items_valid (items));

comment on column public.roadmap_nodes.items is
  'Hitos del nodo: array JSON de {text, amount}. amount es el valor en COP.';
