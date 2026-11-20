# HU014 · Almacenamiento seguro de respuestas

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 4 — Persistencia en Supabase**  
> **Dependencias:** [HU001](HU001-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo Neurofit **quiero** que toda respuesta quede guardada en Supabase con trazabilidad **para** analizarla, auditarla y calcular resultados.

## 2. Criterios de aceptación

- **CA-01.** Cada respuesta guarda valor, puntaje calculado, fuente (`form`, `conversation`, `evaluator`), fecha y, si aplica, confianza y evidencia.
- **CA-02.** El esquema se crea con migraciones versionadas en `supabase/migrations/` y los tipos TypeScript se generan desde la base.
- **CA-03.** RLS está activo en todas las tablas: un paciente no lee ni escribe respuestas de otro.
- **CA-04.** El paciente nunca recibe `weight`, `alert_rule`, `clinical_note` ni `score` de las preguntas (vista `questions_public`).
- **CA-05.** Ninguna clave `service_role` llega al cliente.
- **CA-06.** Eliminar una cuenta borra o anonimiza sus respuestas según la política de privacidad (HU025).

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `buildAnswerRow(question, value, ctx)` llena `value`, `state`, `score` (`computeScore`), `source`, `answered_by`, `answered_at` y, si existen, `confidence` y `evidence`. | CA-01 | T-HU014-01 |
| RF-02 | `computeScore(question, value)` devuelve el `score` de la opción (single), la suma (multiple), el número (numéricas) o `null` (texto, `declined`). | CA-01 | T-HU014-02, T-HU014-03 |
| RF-03 | El esquema se crea solo con migraciones; `pnpm db:types` regenera `app/types/database.types.ts`. | CA-02 | T-HU014-04 |
| RF-04 | Todas las tablas del módulo tienen RLS activo; un paciente no lee ni escribe datos de otro. | CA-03 | T-HU014-05 |
| RF-05 | El cliente solo lee preguntas a través de `questions_public`, que no expone `weight`, `alert_rule`, `clinical_note` ni `score`. | CA-04 | T-HU014-06 |
| RF-06 | `serverSupabaseServiceRole` solo se usa en `server/`; una prueba revisa que ningún archivo de `app/` lo importe. | CA-05 | T-HU014-07 |
| RF-07 | `anonymizePatient(patientId)` (HU025) borra `evidence` y texto libre y desvincula `patient_id`. | CA-06 | T-HU014-08 |

## 4. Diseño técnico

**Datos.** `<ts>_create_answers.sql`: enums `answer_source`, `answer_state`; tablas `answers` y `answer_history` (trigger `before update`); RLS por `private.can_access_assessment`.

**Lógica.**

```ts
// shared/utils/score.ts
export function computeScore(q: Question, value: AnswerValue | null): number | null
// server/utils/answers.ts
export function buildAnswerRow(q: Question, value: AnswerValue | null, ctx: AnswerContext): AnswerInsert
```

**API.** Usada por los endpoints de HU011, HU012 y HU016.

**Interfaz.** Sin interfaz propia.

**i18n.** —

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU014-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU014-01 | `test/unit/answers/buildAnswerRow.test.ts` | respuesta de conversación con confianza | fila con `source`, `confidence`, `evidence` y `score` | RF-01 |
| T-HU014-02 | `test/unit/score/computeScore.test.ts` | single F5 "A menudo", multiple con 2 opciones, numeric 7, open_text | 3, suma, 7, null | RF-02 |
| T-HU014-03 | `test/unit/score/computeScore.test.ts` | respuesta `declined` | null | RF-02 |
| T-HU014-04 | `test/unit/repo/migrationsOnly.test.ts` | buscar `create table` fuera de `supabase/migrations` | ninguna coincidencia | RF-03 |
| T-HU014-05 | `supabase/tests/answers.test.sql` | paciente A lee y escribe respuestas de B | 0 filas y error | RF-04 |
| T-HU014-06 | `supabase/tests/questions_public.test.sql` | `user` selecciona `weight` en `questions_public` | columna inexistente | RF-05 |
| T-HU014-07 | `test/unit/repo/serviceRoleBoundary.test.ts` | buscar `serverSupabaseServiceRole` en `app/` | ninguna coincidencia | RF-06 |
| T-HU014-08 | `test/unit/privacy/anonymize.test.ts` | anonymizeAnswers(filas) | `evidence` y textos en null | RF-07 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Réplica en otra base de datos.
