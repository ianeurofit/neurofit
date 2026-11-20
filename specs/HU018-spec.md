# HU018 · Control de cobertura y cierre de la conversación

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 5 — Motor conversacional con slot-filling**  
> **Dependencias:** [HU016](HU016-spec.md), [HU032](HU032-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** que el asistente sepa cuándo terminó **para** no repetir ni alargar la charla.

## 2. Criterios de aceptación

- **CA-01.** El servidor mantiene la cobertura por sección; una pregunta cuenta como resuelta si está `answered`, `declined` o no aplica por condición.
- **CA-02.** Una respuesta ya guardada no se vuelve a preguntar salvo corrección o contradicción.
- **CA-03.** **Dado** que todo está resuelto, **cuando** el asistente cierra, **entonces** resume lo conversado y pide confirmación antes de generar resultados.
- **CA-04.** **Dado** que el paciente abandona, **cuando** pasa el tiempo configurado (por defecto 30 días), **entonces** la evaluación pasa a `abandoned`; antes de eso puede retomarse.
- **CA-05.** **Dado** que el paciente cambia a formulario, **cuando** se abre, **entonces** las respuestas capturadas aparecen precargadas y editables, y la evaluación queda en modo `mixed`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `coverage(questionnaire, answers)` devuelve por sección resueltas/total, contando como resueltas `answered`, `declined` y las ocultas por condición. | CA-01 | T-HU018-01 |
| RF-02 | `buildSystemPrompt` excluye las preguntas ya resueltas, salvo las marcadas `needs_confirmation`. | CA-02 | T-HU018-02 |
| RF-03 | Con cobertura completa, el asistente genera un resumen y solo llama a `finish_assessment` tras una confirmación explícita del paciente. | CA-03 | T-HU018-03 |
| RF-04 | `shouldAbandon(assessment, now, days = 30)` es verdadero si `in_progress` y sin actividad en `days`; una tarea programada lo aplica. | CA-04 | T-HU018-04 |
| RF-05 | `switchToForm` cambia `mode` a `mixed` y el formulario carga las respuestas existentes como editables. | CA-05 | T-HU018-05 |

## 4. Diseño técnico

**Datos.** Tarea programada (`pg_cron`) que marca `abandoned` diariamente.

**Lógica.**

```ts
// shared/utils/coverage.ts
export function coverage(q: Question[], answers: Answer[]): SectionCoverage[]
export function isComplete(c: SectionCoverage[]): boolean
export function shouldAbandon(a: { status: AssessmentStatus, last_activity_at: string }, now: Date, days?: number): boolean
```

**API.** `POST /api/assessments/:id/mode` (`{ mode: 'mixed' }`)

**Interfaz.** Indicador discreto de avance en `ChatPanel.vue` (sin números de pregunta).

**i18n.** `assessment.chat.summary.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU018-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU018-01 | `test/unit/coverage/coverage.test.ts` | sección con 1 respondida, 1 declinada y 1 oculta de 3 | 3/3 resueltas | RF-01 |
| T-HU018-02 | `test/unit/llm/prompt.test.ts` | pendientes con una `needs_confirmation` ya respondida | solo esa respondida aparece | RF-02 |
| T-HU018-03 | `test/unit/llm/processTurn.test.ts` | cobertura completa sin confirmación del paciente | no se llama `finish_assessment` | RF-03 |
| T-HU018-04 | `test/unit/coverage/shouldAbandon.test.ts` | 31 y 29 días sin actividad | true, false | RF-04 |
| T-HU018-05 | `test/nuxt/composables/useAssessment.test.ts` | switchToForm() con 5 respuestas de conversación | `mode: mixed` y 5 respuestas precargadas | RF-05 |
