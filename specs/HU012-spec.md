# HU012 · Evaluador completa el test en nombre del paciente

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 3 — Respuesta mediante formularios**  
> **Dependencias:** [HU011](HU011-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** evaluador **quiero** llenar el test durante una consulta **para** registrar las respuestas del paciente.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un paciente asignado a mí, **cuando** inicio o abro su evaluación, **entonces** puedo responder con el mismo formulario de HU011.
- **CA-02.** **Dado** un paciente no asignado, **cuando** intento abrir su evaluación, **entonces** recibo 403 y la BD lo impide por RLS.
- **CA-03.** Cada respuesta que registro se guarda con `source = 'evaluator'`.
- **CA-04.** **Dado** respuestas que el paciente dio por su cuenta, **cuando** las veo, **entonces** se distinguen por fuente y puedo editarlas; el cambio conserva el historial.
- **CA-05.** Puedo añadir una observación clínica por sección (opcional, no visible para el paciente).
- **CA-06.** Puedo guardar y retomar más tarde.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | El evaluador usa el mismo `useAssessment` y los mismos componentes que el paciente. | CA-01 | T-HU012-01 |
| RF-02 | `canAccessAssessment(user, assessment, assignments)` permite al evaluador solo si existe `evaluator_patients` con ese paciente; si no, 403. RLS aplica la misma regla. | CA-02 | T-HU012-02, T-HU012-03 |
| RF-03 | Las respuestas guardadas por un evaluador llevan `source = 'evaluator'` y `answered_by` = evaluador. | CA-03 | T-HU012-04 |
| RF-04 | Cada respuesta muestra su fuente; editar la de otra fuente guarda la versión previa en `answer_history`. | CA-04 | T-HU012-05 |
| RF-05 | `section_notes` guarda una nota por sección y evaluador; no se incluye en ninguna respuesta para `user`. | CA-05 | T-HU012-06 |
| RF-06 | El evaluador retoma con `firstPending` igual que el paciente. | CA-06 | T-HU012-07 |

## 4. Diseño técnico

**Datos.** `<ts>_create_section_notes.sql`: tabla `section_notes` con RLS (solo evaluador asignado y `superuser`).

**Lógica.**

```ts
// shared/utils/access.ts
export function canAccessAssessment(user: { id: string, role: UserRole }, a: { patient_id: string }, assignments: Assignment[]): boolean
export function answerSourceFor(role: UserRole, mode: AssessmentMode): AnswerSource
```

**API.** `PUT /api/assessments/:id/sections/:sectionId/note`

**Interfaz.** `pages/dashboard/pacientes/[patientId]/evaluacion/[id].vue`; insignia de fuente en `QuestionField`.

**i18n.** `assessment.evaluator.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU012-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU012-01 | `test/nuxt/pages/evaluatorAssessment.test.ts` | montar la página del evaluador | usa `SectionStep` y `QuestionField` | RF-01 |
| T-HU012-02 | `test/unit/access/canAccessAssessment.test.ts` | evaluador con y sin asignación | true, false | RF-02 |
| T-HU012-03 | `supabase/tests/assessments.test.sql` | evaluador no asignado lee `answers` | 0 filas | RF-02 |
| T-HU012-04 | `test/unit/access/answerSource.test.ts` | answerSourceFor('evaluator','form') | 'evaluator' | RF-03 |
| T-HU012-05 | `supabase/tests/answers.test.sql` | actualizar una respuesta existente | la versión previa aparece en `answer_history` | RF-04 |
| T-HU012-06 | `supabase/tests/section_notes.test.sql` | `user` consulta `section_notes` | 0 filas | RF-05 |
| T-HU012-07 | `test/unit/progress/firstPending.test.ts` | retomar con respuestas mixtas de paciente y evaluador | primera pendiente correcta | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Firmar el informe como profesional.
