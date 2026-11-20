# HU013 · Validación y consistencia de respuestas

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 3 — Respuesta mediante formularios**  
> **Dependencias:** [HU005](HU005-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** sistema **quiero** validar cada respuesta contra la configuración de su pregunta **para** garantizar datos íntegros.

## 2. Criterios de aceptación

- **CA-01.** Numéricas fuera de `min`/`max` se rechazan con mensaje claro, en cliente y servidor.
- **CA-02.** Selección única acepta exactamente una opción existente; selección múltiple acepta una o más, y una opción excluyente ("Ninguna") desmarca y deshabilita las demás.
- **CA-03.** Texto abierto se recorta de espacios y respeta la longitud máxima.
- **CA-04.** Una respuesta se actualiza (upsert) sin duplicados por `(assessment_id, question_id)`.
- **CA-05.** El servidor valida aunque el cliente ya lo haya hecho; una respuesta inválida enviada directo a la API se rechaza con 422.
- **CA-06.** No se aceptan respuestas en evaluaciones `completed` ni a preguntas de otra versión del test.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `validateAnswer(question, value)` rechaza números fuera de `min`/`max` con `out_of_range`. | CA-01 | T-HU013-01 |
| RF-02 | `single_choice` acepta exactamente un valor existente; `multiple_choice` acepta uno o más; un valor exclusivo junto con otros devuelve `exclusive_conflict`. `applyExclusive(selected, clicked, exclusive)` resuelve la selección en la UI. | CA-02 | T-HU013-02, T-HU013-03, T-HU013-04 |
| RF-03 | `open_text` se recorta y rechaza con `too_long` si supera `maxLength`; vacío en obligatoria es `required`. | CA-03 | T-HU013-05 |
| RF-04 | El guardado es upsert por `(assessment_id, question_id)`. | CA-04 | T-HU013-06 |
| RF-05 | `PUT /api/assessments/:id/answers/:code` vuelve a ejecutar `validateAnswer` y responde 422 con el código de error. | CA-05 | T-HU013-07 |
| RF-06 | El servidor rechaza con `assessment_closed` si la evaluación está `completed` y con `question_not_in_version` si la pregunta no pertenece a su `test_version`. | CA-06 | T-HU013-08 |

## 4. Diseño técnico

**Datos.** Restricción única `answers (assessment_id, question_id)`.

**Lógica.**

```ts
// shared/utils/validateAnswer.ts
export function validateAnswer(q: Question, value: unknown): ValidationResult
export function applyExclusive(selected: string[], clicked: string, exclusive: string[]): string[]
// server/utils/answers.ts
export function assertWritable(a: { status: AssessmentStatus, test_version: number }, q: { test_version: number }): void
```

**API.** `PUT /api/assessments/:id/answers/:questionCode`

**Interfaz.** Mensajes de error bajo cada control con `errors.answer.<code>`.

**i18n.** `errors.answer.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU013-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU013-01 | `test/unit/answers/validateAnswer.test.ts` | numeric_scale 1–10 con 0, 1, 10, 11 | error, ok, ok, error | RF-01 |
| T-HU013-02 | `test/unit/answers/validateAnswer.test.ts` | single_choice con valor inexistente y con ['a','b'] | `unknown_option`, `wrong_type` | RF-02 |
| T-HU013-03 | `test/unit/answers/validateAnswer.test.ts` | multiple_choice ['none','hta'] con 'none' exclusivo | `exclusive_conflict` | RF-02 |
| T-HU013-04 | `test/unit/answers/applyExclusive.test.ts` | seleccionar 'none' con ['hta','dm'] marcadas | ['none'] | RF-02 |
| T-HU013-05 | `test/unit/answers/validateAnswer.test.ts` | open_text '  hola  ', texto de 1001 caracteres y '' obligatorio | 'hola', `too_long`, `required` | RF-03 |
| T-HU013-06 | `supabase/tests/answers.test.sql` | insertar dos respuestas a la misma pregunta | error de unicidad | RF-04 |
| T-HU013-07 | `test/unit/answers/saveAnswerHandler.test.ts` | valor fuera de rango enviado a la API | 422 `out_of_range` | RF-05 |
| T-HU013-08 | `test/unit/answers/assertWritable.test.ts` | evaluación completada y pregunta de otra versión | `assessment_closed`, `question_not_in_version` | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Validaciones cruzadas entre preguntas (ej. edad vs. edad de inicio).
