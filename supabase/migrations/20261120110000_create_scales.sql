-- HU031: catalogue of reusable answer scales. A question copies the options of a scale
-- (HU005), so changing the catalogue never touches existing questions or answers.
create table public.scales (
  code text primary key,
  name jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scales_code_format check (code ~ '^[A-Z0-9_]{2,20}$'),
  constraint scales_name_has_es_en check (
    jsonb_typeof(name) = 'object' and name ? 'es' and name ? 'en'
    and btrim(name ->> 'es') <> '' and btrim(name ->> 'en') <> ''
  )
);

comment on table public.scales is 'Catálogo de escalas de respuesta reutilizables. Solo el superusuario escribe.';

create table public.scale_options (
  id uuid primary key default gen_random_uuid(),
  scale_code text not null references public.scales (code) on update cascade on delete cascade,
  value text not null,
  label jsonb not null,
  score numeric,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scale_options_value_format check (value ~ '^[a-z0-9_]{1,40}$'),
  -- CA-04: every label exists in both languages.
  constraint scale_options_label_es_en check (
    jsonb_typeof(label) = 'object' and label ? 'es' and label ? 'en'
    and btrim(label ->> 'es') <> '' and btrim(label ->> 'en') <> ''
  ),
  constraint scale_options_position_positive check (position >= 1),
  constraint scale_options_scale_value_key unique (scale_code, value),
  constraint scale_options_scale_position_key unique (scale_code, position)
);

comment on table public.scale_options is 'Opciones de cada escala con etiqueta es/en y puntaje opcional.';

create trigger scales_touch_updated_at
before update on public.scales
for each row execute function private.touch_updated_at ();

create trigger scale_options_touch_updated_at
before update on public.scale_options
for each row execute function private.touch_updated_at ();

create trigger scales_audit
after insert or update or delete on public.scales
for each row execute function private.audit ();

create trigger scale_options_audit
after insert or update or delete on public.scale_options
for each row execute function private.audit ();

alter table public.scales enable row level security;
alter table public.scale_options enable row level security;

revoke all on public.scales, public.scale_options from anon;

create policy "scales_select_superuser" on public.scales for select to authenticated
using ((select private.is_superuser()));
create policy "scales_insert_superuser" on public.scales for insert to authenticated
with check ((select private.is_superuser()));
create policy "scales_update_superuser" on public.scales for update to authenticated
using ((select private.is_superuser())) with check ((select private.is_superuser()));
create policy "scales_delete_superuser" on public.scales for delete to authenticated
using ((select private.is_superuser()));

create policy "scale_options_select_superuser" on public.scale_options for select to authenticated
using ((select private.is_superuser()));
create policy "scale_options_insert_superuser" on public.scale_options for insert to authenticated
with check ((select private.is_superuser()));
create policy "scale_options_update_superuser" on public.scale_options for update to authenticated
using ((select private.is_superuser())) with check ((select private.is_superuser()));
create policy "scale_options_delete_superuser" on public.scale_options for delete to authenticated
using ((select private.is_superuser()));

-- Seed (specs.md §5). Catalogue data lives in migrations (plan §6).
insert into public.scales (code, name) values
  ('F5', '{"es":"Frecuencia 0–4","en":"Frequency 0–4"}'),
  ('IND', '{"es":"Independiente / Necesita ayuda","en":"Independent / Needs help"}'),
  ('SNN', '{"es":"Sí / No / No lo sé","en":"Yes / No / I don''t know"}'),
  ('FC', '{"es":"Frecuencia de consumo","en":"Consumption frequency"}'),
  ('CMP5', '{"es":"Comparación con hace 5 años","en":"Compared with 5 years ago"}');

insert into public.scale_options (scale_code, value, label, score, position) values
  ('F5', 'never', '{"es":"Nunca","en":"Never"}', 0, 1),
  ('F5', 'rarely', '{"es":"Rara vez","en":"Rarely"}', 1, 2),
  ('F5', 'sometimes', '{"es":"A veces","en":"Sometimes"}', 2, 3),
  ('F5', 'often', '{"es":"A menudo","en":"Often"}', 3, 4),
  ('F5', 'always', '{"es":"Siempre","en":"Always"}', 4, 5),
  ('IND', 'independent', '{"es":"Independiente","en":"Independent"}', 0, 1),
  ('IND', 'needs_help', '{"es":"Necesita ayuda","en":"Needs help"}', 1, 2),
  ('SNN', 'yes', '{"es":"Sí","en":"Yes"}', null, 1),
  ('SNN', 'no', '{"es":"No","en":"No"}', null, 2),
  ('SNN', 'unknown', '{"es":"No lo sé","en":"I don''t know"}', null, 3),
  ('FC', 'never', '{"es":"Nunca","en":"Never"}', 0, 1),
  ('FC', 'days_1_2', '{"es":"1–2 días/semana","en":"1–2 days a week"}', 1, 2),
  ('FC', 'days_3_5', '{"es":"3–5 días/semana","en":"3–5 days a week"}', 2, 3),
  ('FC', 'daily', '{"es":"Todos los días","en":"Every day"}', 3, 4),
  ('CMP5', 'much_better', '{"es":"Mucho mejor","en":"Much better"}', 0, 1),
  ('CMP5', 'slightly_better', '{"es":"Un poco mejor","en":"A little better"}', 1, 2),
  ('CMP5', 'same', '{"es":"Igual","en":"The same"}', 2, 3),
  ('CMP5', 'slightly_worse', '{"es":"Un poco peor","en":"A little worse"}', 3, 4),
  ('CMP5', 'much_worse', '{"es":"Mucho peor","en":"Much worse"}', 4, 5);
