# HU006 · Editar, duplicar, ordenar y desactivar preguntas

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU005](HU005-spec.md), [HU007](HU007-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** gestionar el ciclo de vida de una pregunta **para** mantener el test actualizado sin perder datos históricos.

## 2. Criterios de aceptación

- **CA-01.** **Dado** una pregunta sin respuestas en un test `draft`, **cuando** la edito, **entonces** los cambios se aplican directamente.
- **CA-02.** **Dado** una pregunta con respuestas, **cuando** intento cambiar su tipo u opciones, **entonces** se bloquea y se ofrece crear una nueva versión del test; las respuestas históricas siguen ligadas a la versión original.
- **CA-03.** **Dado** una pregunta, **cuando** la duplico, **entonces** se crea una copia con código sufijado (`_COPY`, `_COPY2`…) al final de la sección.
- **CA-04.** **Dado** una pregunta, **cuando** la desactivo, **entonces** no aparece en evaluaciones nuevas y sus respuestas previas se conservan.
- **CA-05.** **Dado** una pregunta, **cuando** defino una condición "mostrar si `CÓDIGO` = valor", **entonces** solo se aceptan códigos existentes del mismo test y valores válidos para su tipo.
- **CA-06.** **Dado** una condición que crea un ciclo (A depende de B y B de A), **cuando** guardo, **entonces** se rechaza.
- **CA-07.** Reordenar preguntas sigue las mismas reglas que las secciones (HU004).

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | Una pregunta de un test `draft` sin respuestas se edita directamente (`PATCH`). | CA-01 | T-HU006-01 |
| RF-02 | `assertQuestionChange(change, hasAnswers)` rechaza con `new_version_required` cambios de `type` u opciones si la pregunta tiene respuestas. | CA-02 | T-HU006-02 |
| RF-03 | `duplicateCode(code, existing)` devuelve `<code>_COPY`, `<code>_COPY2`… sin chocar con los existentes; la copia va al final de la sección. | CA-03 | T-HU006-03 |
| RF-04 | `active = false` excluye la pregunta de `buildQuestionnaire` para evaluaciones nuevas; las respuestas previas no se tocan. | CA-04 | T-HU006-04 |
| RF-05 | `validateCondition(condition, questions)` exige que `questionCode` exista en el mismo test y que `value` sea válido para su tipo. | CA-05 | T-HU006-05, T-HU006-06 |
| RF-06 | `detectCycle(questions)` encuentra dependencias circulares; si hay un ciclo, se rechaza el guardado. | CA-06 | T-HU006-07, T-HU006-08 |
| RF-07 | Reordenar preguntas usa `reorder` de HU004. | CA-07 | T-HU006-09 |

## 4. Diseño técnico

**Datos.** Columna `questions.depends_on jsonb` (contrato `Condition`, §8) y `questions.active`.

**Lógica.**

```ts
// shared/utils/questions.ts
export function assertQuestionChange(change: Partial<QuestionInput>, hasAnswers: boolean): ValidationResult
export function duplicateCode(code: string, existing: string[]): string
export function buildQuestionnaire(questions: Question[]): Question[]   // solo activas, en orden
// shared/utils/conditions.ts
export function validateCondition(c: Condition, questions: Question[]): ValidationResult
export function detectCycle(questions: Pick<Question, 'code' | 'dependsOn'>[]): string[] | null
```

**API.** `PATCH /api/admin/questions/:id` · `POST /api/admin/questions/:id/duplicate` · `PATCH /api/admin/sections/:id/questions/order`

- `PATCH /api/admin/questions/:id`: solo `superuser`. El cuerpo trae solo lo que cambia (`active`, `dependsOn` o cualquier campo de HU005); se mezcla sobre la pregunta guardada y se valida entera. 422 `{ errors: [{ field, code }] }` con los errores de la pregunta y de su condición (`dependsOn.questionCode|op|value` con `unknown_question`, `self_reference`, `cycle`, `invalid_operator` o `invalid_value`); 409 `new_version_required` si el test no es borrador o si, con respuestas, cambia el tipo o las opciones; 404 si la pregunta no existe. Comparte la lógica con `PATCH /api/admin/tests/:id/questions/:questionId` (HU005) en `server/utils/questionSave.ts`.
- `POST /api/admin/questions/:id/duplicate`: crea la copia con `duplicateCode` al final de la sección, con sus opciones, configuración y condición. Responde 201 con la copia.
- `PATCH /api/admin/sections/:id/questions/order`: cuerpo `{ ids }` con todas las preguntas de la sección; 422 `invalid_order` si falta o sobra alguna; 204 al guardar. Usa `public.reorder_section_questions`, igual que las secciones (HU004).
- Sin sesión, 401; con rol no permitido, 403. Escriben con la sesión del usuario para que `audit_log` registre al actor.

**Datos (detalle).** `depends_on` y `active` ya los creó HU005. La migración `20261120130000_question_lifecycle.sql` añade el `check` de forma de la condición (`questionCode`, `op` ∈ `eq|neq|in|any_eq`, `value`), hace diferible la unicidad de posición por sección, crea `reorder_section_questions` y enseña a `save_question` a guardar `depends_on` y `active`. `save_question` ya no borra y reinserta las opciones cuando no cambian, para no llenar la auditoría al desactivar o mover una pregunta. `questions_public` ya excluía las preguntas inactivas.

**Operadores por tipo.** `single_choice`: `eq`, `neq`, `in`. `multiple_choice`: `any_eq`. `true_false`: `eq`, `neq` con booleano. `numeric_scale` y `agreement`: `eq`, `neq`, `in` con enteros dentro del rango. `numeric_free`: `eq`, `neq` con número dentro de sus límites. `open_text` no puede ser origen de una condición.

**Interfaz.** Acciones por fila en `QuestionList.vue`: editar, duplicar, activar/desactivar, mover (arrastrar en escritorio y flechas en cualquier ancho, para teclado y pantallas táctiles). Una pregunta inactiva se marca «Inactiva» y sigue en la lista. Editor de condición en `QuestionForm.vue` («Mostrar solo si…»): pregunta, condición y valor según el tipo, con estado vacío cuando no hay otras preguntas; interruptor «Activa» en el formulario.

**Decisión de la implementación.** La protección de estructura de HU004 sigue vigente: solo se edita, duplica, desactiva o reordena en tests `draft`. `testHasAnswers` sigue devolviendo `false` hasta HU011, así que la regla de CA-02 ya está en el servidor pero solo se activará cuando existan respuestas.

**i18n.** `tests.questions.actions.*`, `errors.condition.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU006-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU006-01 | `test/unit/questions/assertQuestionChange.test.ts` | cambiar `prompt` sin respuestas | `ok: true` | RF-01 |
| T-HU006-02 | `test/unit/questions/assertQuestionChange.test.ts` | cambiar `type` con respuestas | `new_version_required` | RF-02 |
| T-HU006-03 | `test/unit/questions/duplicateCode.test.ts` | duplicateCode('MEM_001', ['MEM_001','MEM_001_COPY']) | 'MEM_001_COPY2' | RF-03 |
| T-HU006-04 | `test/unit/questions/buildQuestionnaire.test.ts` | una pregunta inactiva entre tres | devuelve 2 en orden | RF-04 |
| T-HU006-05 | `test/unit/conditions/validateCondition.test.ts` | condición sobre un código inexistente | `unknown_question` | RF-05 |
| T-HU006-06 | `test/unit/conditions/validateCondition.test.ts` | condición `eq` 'Quizás' sobre una `true_false` | `invalid_value` | RF-05 |
| T-HU006-07 | `test/unit/conditions/detectCycle.test.ts` | A depende de B y B de A | ['A','B'] | RF-06 |
| T-HU006-08 | `test/unit/conditions/detectCycle.test.ts` | cadena A → B → C sin ciclo | null | RF-06 |
| T-HU006-09 | `test/unit/shared/ordering.test.ts` | reorder sobre preguntas | posiciones consecutivas | RF-07 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Condiciones compuestas con Y/O (primera versión: una condición por pregunta).
