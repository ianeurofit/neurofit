# HU032 · Lógica condicional y exclusión del Test 1

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU006](HU006-spec.md), [HU030](HU030-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** que solo me pregunten lo que aplica a mí **para** no responder cosas irrelevantes.

## 2. Criterios de aceptación

- **CA-01.** Se aplican las condiciones de `docs/test-1.md`: `DAT_010` si `DAT_009` = No; `DAT_014` si `DAT_013` ≠ "No he notado cambios"; `GEN_002/003` si `GEN_001` = Sí; `MED_002` si `MED_001` = Sí; `SUB_002` si `SUB_001` = No; `SUB_004` si `SUB_003` = Sí; `FUNC_011/013` si alguna actividad es "Necesita ayuda"; `FUNC_012` si `FUNC_011` = Sí.
- **CA-02.** Una pregunta oculta por condición no cuenta como obligatoria pendiente, ni en formulario ni en conversación.
- **CA-03.** **Dado** que cambio una respuesta que oculta preguntas ya respondidas, **cuando** se guarda, **entonces** esas respuestas se marcan como no aplicables y no se usan en resultados.
- **CA-04.** "Ninguna" en `HIS_001` y `PHY_003` desmarca y deshabilita las demás opciones.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `isVisible(question, answers)` evalúa `depends_on` con los operadores `eq`, `neq`, `in` y `any_eq` ("alguna de estas preguntas vale X"). | CA-01 | T-HU032-01, T-HU032-02, T-HU032-03, T-HU032-04, T-HU032-05 |
| RF-02 | `visibleQuestions(questions, answers)` aplica `isVisible` en cascada (una oculta oculta a sus dependientes). | CA-01, CA-02 | T-HU032-05 |
| RF-03 | `canFinish` y `coverage` usan `visibleQuestions`, así que las ocultas no cuentan como pendientes. | CA-02 | T-HU032-06 |
| RF-04 | Tras guardar, `reconcileHidden(questions, answers)` devuelve las respuestas que deben pasar a `not_applicable`; el servidor las actualiza en la misma transacción. | CA-03 | T-HU032-07 |
| RF-05 | `exclusiveValues` de `HIS_001` (`none`) y `PHY_003` (`none`) usan `applyExclusive` (HU013). | CA-04 | T-HU032-08 |

## 4. Diseño técnico

**Datos.** `depends_on` del Test 1 cargado por HU030.

**Lógica.**

```ts
// shared/utils/conditions.ts
export function isVisible(q: Question, answers: Map<string, Answer>): boolean
export function visibleQuestions(q: Question[], answers: Answer[]): Question[]
export function reconcileHidden(q: Question[], answers: Answer[]): string[]   // códigos a marcar not_applicable
```

**API.** Integrado en `PUT /api/assessments/:id/answers/:questionCode`.

**Interfaz.** Las preguntas aparecen u ocultan con `@formkit/auto-animate`.

**i18n.** —

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU032-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU032-01 | `test/unit/conditions/test1Conditions.test.ts` | `DAT_009` = false / true | `DAT_010` visible / oculta | RF-01 |
| T-HU032-02 | `test/unit/conditions/test1Conditions.test.ts` | `DAT_013` = 'no_changes' | `DAT_014` oculta | RF-01 |
| T-HU032-03 | `test/unit/conditions/test1Conditions.test.ts` | `GEN_001` = yes / no | `GEN_002`, `GEN_003` visibles / ocultas | RF-01 |
| T-HU032-04 | `test/unit/conditions/test1Conditions.test.ts` | `MED_001`, `SUB_001`, `SUB_003` | `MED_002`, `SUB_002`, `SUB_004` según `docs/test-1.md` | RF-01 |
| T-HU032-05 | `test/unit/conditions/test1Conditions.test.ts` | FUNC_004 = needs_help, FUNC_011 = false | `FUNC_011` y `FUNC_013` visibles, `FUNC_012` oculta | RF-01, RF-02 |
| T-HU032-06 | `test/unit/progress/canFinish.test.ts` | Test 1 con `DAT_009` = true y `DAT_010` sin responder | `ok: true` si lo demás está resuelto | RF-03 |
| T-HU032-07 | `test/unit/conditions/reconcileHidden.test.ts` | `GEN_001` cambia a no con `GEN_002` respondida | ['GEN_002'] (solo las ya respondidas) | RF-04 |
| T-HU032-08 | `test/unit/answers/applyExclusive.test.ts` | HIS_001: marcar 'none' con dos afecciones | ['none'] | RF-05 |
