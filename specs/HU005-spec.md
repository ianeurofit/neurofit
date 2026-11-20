# HU005 · Crear preguntas de cada tipo

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU004](HU004-spec.md), [HU031](HU031-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** crear preguntas de los tipos soportados **para** modelar la preevaluación.

## 2. Criterios de aceptación

- **CA-01.** **Dado** una sección, **cuando** creo una pregunta, **entonces** debo definir código, texto, tipo y obligatoriedad; variable, dirección, peso, alerta, fuente y pista conversacional son opcionales.
- **CA-02.** El código de pregunta es único **en todo el test** (no solo en la sección).
- **CA-03.** `multiple_choice`: exige ≥ 2 opciones con valor y etiqueta únicos; permite marcar "permitir varias", un `score` por opción y opciones excluyentes.
- **CA-04.** `true_false`: se guarda como booleano; las etiquetas visibles (Sí/No o Verdadero/Falso) son configurables.
- **CA-05.** `numeric_scale`: `min` < `max` (por defecto 1 y 10) con etiquetas opcionales en los extremos.
- **CA-06.** `agreement`: escala de 5 puntos con etiquetas editables (por defecto "Totalmente en desacuerdo" → "Totalmente de acuerdo").
- **CA-07.** `numeric_free`: admite unidad y límites opcionales; `open_text`: admite longitud máxima (por defecto 1000).
- **CA-08.** **Dado** una configuración inválida, **cuando** guardo, **entonces** veo los errores por campo y no se guarda.
- **CA-09.** La pregunta guardada aparece de inmediato en la vista previa (HU009).

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `validateQuestionInput` exige `code`, `prompt.es`, `type` y `required`; los demás campos son opcionales. | CA-01 | T-HU005-01 |
| RF-02 | `(test_id, code)` es único en `questions`, así que el código no se repite en todo el test. | CA-02 | T-HU005-02 |
| RF-03 | `single_choice` y `multiple_choice` exigen ≥ 2 opciones con `value` y `label.es` únicos; `multiple_choice` acepta `exclusiveValues` que existan entre sus opciones. | CA-03 | T-HU005-03, T-HU005-04 |
| RF-04 | `true_false` exige `config.labels.true` y `config.labels.false`. | CA-04 | T-HU005-05 |
| RF-05 | `numeric_scale` exige `min < max` (por defecto 1 y 10). | CA-05 | T-HU005-06, T-HU005-08 |
| RF-06 | `agreement` exige 5 etiquetas (por defecto de "Totalmente en desacuerdo" a "Totalmente de acuerdo"). | CA-06 | T-HU005-07, T-HU005-08 |
| RF-07 | `numeric_free` acepta `unit`, `min`, `max` y `step` opcionales con `min ≤ max`; `open_text` acepta `maxLength` entre 1 y 5000 (por defecto 1000). | CA-07 | T-HU005-08, T-HU005-09 |
| RF-08 | `validateQuestionInput` devuelve todos los errores por campo a la vez; el endpoint responde 422 sin guardar. | CA-08 | T-HU005-10 |
| RF-09 | Tras guardar, el composable `useQuestionEditor` actualiza la vista previa sin recargar. | CA-09 | T-HU005-11 |

## 4. Diseño técnico

**Datos.** `<ts>_create_questions.sql`: enums `question_type` y `question_direction`; tablas `questions` y `question_options` (§7.3); vista `questions_public` sin `weight`, `alert_rule`, `clinical_note` ni `score`.

**Lógica.**

```ts
// shared/utils/questions.ts
export function validateQuestionInput(input: QuestionInput): FieldValidation   // errores por campo
export function defaultConfig(type: QuestionType): Record<string, unknown>
// app/composables/useQuestionEditor.ts
export function useQuestionEditor(testId: string): { draft, errors, save(), preview }
```

**API.** `POST/PATCH /api/admin/tests/:id/questions[/:questionId]`

- `POST /api/admin/tests/:id/questions`: solo `superuser`. Cuerpo `{ sectionId, code, prompt: { es, en? }, type, required, allowsDecline?, config?, options?, variable?, direction?, weight?, source?, conversationalHint?, docRef?, clinicalNote?, alertRule? }`. La pregunta va al final de su sección. Responde 201 con la pregunta y sus opciones; 422 `{ errors: [{ field, code }] }` con **todos** los errores a la vez (RF-08); 409 `question_code_taken` en `code` si el código ya existe en el test; 409 `new_version_required` si el test no es borrador; 404 si el test no existe.
- `PATCH /api/admin/tests/:id/questions/:questionId`: mismas reglas. El cuerpo puede traer solo lo que cambia: se mezcla sobre la pregunta guardada y se valida entera. Las opciones se reemplazan. 404 si la pregunta no es de ese test.
- `GET /api/admin/tests/:id/questions` (añadido en la implementación): las preguntas del test con sus opciones, en orden de sección y posición. Alimenta la vista previa.
- Sin sesión, 401; con rol no permitido o perfil inactivo, 403. Escriben con la sesión del usuario (no `service_role`) para que `audit_log` registre al actor.
- Las opciones solo se guardan en `single_choice` y `multiple_choice`. En `multiple_choice`, `is_exclusive` sale de `config.exclusiveValues`.

**Datos (detalle).** La pregunta y sus opciones se guardan en una sola transacción con la función `public.save_question(test, question_id, question, options)` (`security invoker`: aplican RLS, la protección de estructura de HU004 y la auditoría). Una pregunta apunta a `(section_id, test_id)`, así que su sección siempre es del mismo test. Las tablas base solo las lee el `superuser`; el resto lee `questions_public`, que filtra tests `published` y no tiene `weight`, `alert_rule`, `clinical_note` ni `score` en las opciones.

**Interfaz.** `components/admin/tests/QuestionForm.vue` con un subformulario por tipo (`config/*.vue`): `ChoiceOptions.vue` (escala de HU031, opciones y "excluyente" en `multiple_choice`), `TrueFalse.vue`, `NumericScale.vue`, `Agreement.vue`, `NumericFree.vue` y `OpenText.vue`. Se muestra en `pages/dashboard/tests/[id]/preguntas.vue`, enlazada desde la estructura del test: cada sección lista sus preguntas (vista previa de CA-09) con su botón "Agregar pregunta", y el formulario se abre en un panel lateral. Al cambiar el tipo, su configuración vuelve a los valores por defecto. La regla de alerta (`alert_rule`) se acepta en la API pero no tiene campo en el formulario: su editor llega con HU036.

**Decisiones de la implementación.** El código de pregunta usa `^[A-Z0-9_]{2,40}$` y el valor de una opción `^[a-z0-9_]{1,40}$`. Las etiquetas de `true_false` y `agreement`, los extremos de `numeric_scale` y la unidad de `numeric_free` se guardan como `{ es, en? }` (D-2).

**i18n.** `tests.questions.*`, `errors.question.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU005-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU005-01 | `test/unit/questions/validateQuestionInput.test.ts` | pregunta sin `prompt.es` | error `required` en `prompt` | RF-01 |
| T-HU005-02 | `supabase/tests/tests_structure.test.sql` | mismo código en dos secciones del mismo test | error de unicidad | RF-02 |
| T-HU005-03 | `test/unit/questions/validateQuestionInput.test.ts` | `single_choice` con 1 opción | error `min_options` | RF-03 |
| T-HU005-04 | `test/unit/questions/validateQuestionInput.test.ts` | `multiple_choice` con valores repetidos y con `exclusiveValues` inexistente | errores `duplicate_option` y `unknown_option` | RF-03 |
| T-HU005-05 | `test/unit/questions/validateQuestionInput.test.ts` | `true_false` sin `labels.false` | error en `config.labels` | RF-04 |
| T-HU005-06 | `test/unit/questions/validateQuestionInput.test.ts` | `numeric_scale` con min 10 y max 1 | error `min_gte_max` | RF-05 |
| T-HU005-07 | `test/unit/questions/validateQuestionInput.test.ts` | `agreement` con 4 etiquetas | error `labels_count` | RF-06 |
| T-HU005-08 | `test/unit/questions/defaultConfig.test.ts` | defaultConfig para cada tipo | valores por defecto de §5 | RF-05, RF-06, RF-07 |
| T-HU005-09 | `test/unit/questions/validateQuestionInput.test.ts` | `open_text` con `maxLength` 0 y `numeric_free` con min > max | dos errores | RF-07 |
| T-HU005-10 | `test/unit/questions/validateQuestionInput.test.ts` | pregunta con 3 campos inválidos | 3 errores en una sola llamada | RF-08 |
| T-HU005-11 | `test/nuxt/composables/useQuestionEditor.test.ts` | save() exitoso | `preview` contiene la pregunta nueva | RF-09 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Tipos de tarea cognitiva (HU028).
- **Pregunta abierta:** Aprobar formalmente `open_text` y `numeric_free` (plan §12.1); `test-1.md` ya los usa.
