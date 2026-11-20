-- HU031: catalogue of reusable answer scales, seeded by the migration.
begin;

select plan(12);

insert into auth.users (id, email) values
  ('d0000000-0000-0000-0000-0000000000d0', 'admin@test.local'),
  ('a0000000-0000-0000-0000-00000000000a', 'evaluator@test.local');
update public.profiles set role = 'superuser' where id = 'd0000000-0000-0000-0000-0000000000d0';
update public.profiles set role = 'evaluator' where id = 'a0000000-0000-0000-0000-00000000000a';

select has_table('public', 'scales', 'scales table exists');
select has_table('public', 'scale_options', 'scale_options table exists');

-- T-HU031-01: the seeded scales and their options.
select set_eq(
  $$select code from public.scales$$,
  $$values ('F5'), ('IND'), ('SNN'), ('FC'), ('CMP5')$$,
  'the catalogue has F5, IND, SNN, FC and CMP5'
);
select results_eq(
  $$select value, label ->> 'es', score from public.scale_options where scale_code = 'F5' order by position$$,
  $$values ('never', 'Nunca', 0::numeric), ('rarely', 'Rara vez', 1), ('sometimes', 'A veces', 2),
           ('often', 'A menudo', 3), ('always', 'Siempre', 4)$$,
  'F5 goes from Nunca 0 to Siempre 4'
);
select results_eq(
  $$select value, score from public.scale_options where scale_code = 'IND' order by position$$,
  $$values ('independent', 0::numeric), ('needs_help', 1)$$,
  'IND is Independiente 0 and Necesita ayuda 1'
);
select results_eq(
  $$select value, score from public.scale_options where scale_code = 'SNN' order by position$$,
  $$values ('yes', null::numeric), ('no', null), ('unknown', null)$$,
  'SNN is Sí, No and No lo sé without score'
);
select results_eq(
  $$select label ->> 'es' from public.scale_options where scale_code = 'FC' order by position$$,
  $$values ('Nunca'), ('1–2 días/semana'), ('3–5 días/semana'), ('Todos los días')$$,
  'FC has the four consumption frequencies'
);
select results_eq(
  $$select value, score from public.scale_options where scale_code = 'CMP5' order by position$$,
  $$values ('much_better', 0::numeric), ('slightly_better', 1), ('same', 2), ('slightly_worse', 3), ('much_worse', 4)$$,
  'CMP5 goes from Mucho mejor 0 to Mucho peor 4'
);
select is(
  (select count(*)::int from public.scale_options where not (label ? 'es' and label ? 'en')),
  0,
  'every seeded label exists in es and en'
);

-- T-HU031-04: an option without English is rejected.
select throws_ok(
  $$insert into public.scale_options (scale_code, value, label, position) values ('F5', 'extra', '{"es":"Extra"}', 6)$$,
  '23514', null, 'an option label without en violates the check'
);

-- Structure table: only a superuser reads or writes the catalogue.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.scales (code, name) values ('NEW', '{"es":"Nueva","en":"New"}')$$,
  '42501', null, 'an evaluator cannot add a scale'
);

select set_config('request.jwt.claims', '{"sub":"d0000000-0000-0000-0000-0000000000d0","role":"authenticated"}', true);
select is((select count(*)::int from public.scales), 5, 'a superuser reads the catalogue');

select * from finish();

rollback;
