# HU022 · Índice Brain Intelligence (Neurofit Brain Score™)

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 6 — Resultados**  
> **Dependencias:** [HU010](HU010-spec.md), [HU014](HU014-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** ver un índice resumen de la salud de mi cerebro **para** tener una referencia clara y compararla en el tiempo.

## 2. Criterios de aceptación

- **CA-01.** Se calcula un índice general y subíndices (perfil cognitivo, salud cerebral, funcionalidad) con puntajes, direcciones y pesos leídos de la BD.
- **CA-02.** El índice se muestra siempre con su desglose, nunca como número aislado.
- **CA-03.** Si los pesos no están validados, se etiqueta como "preliminar / línea base".
- **CA-04.** Si faltan respuestas, se muestra el nivel de completitud; con menos del 80 % de las preguntas obligatorias no se calcula el índice general.
- **CA-05.** Se guarda la `model_version`; recalcular crea un resultado nuevo.
- **CA-06.** Las preguntas en borrador (Módulo 9) no aportan peso.
- **CA-07.** El cálculo es determinista: mismas respuestas y misma versión dan el mismo resultado.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `computeBrainIndex(q, answers, model)` calcula el índice general y los subíndices `cognitive`, `brain_health` y `functional` (0–100) con pesos, direcciones y umbrales del `scoring_models` vigente. | CA-01 | T-HU022-01 |
| RF-02 | `BrainIndexCard.vue` no se renderiza sin su desglose de subíndices. | CA-02 | T-HU022-02 |
| RF-03 | Si el modelo tiene preguntas con `weight = null`, el resultado lleva `preliminary: true` y la vista muestra la etiqueta "Preliminar / línea base". | CA-03 | T-HU022-03 |
| RF-04 | `completeness` = obligatorias resueltas / obligatorias visibles; con menos de 0,8 el índice general es `null`. | CA-04 | T-HU022-04 |
| RF-05 | El resultado guarda `model_version`; recalcular crea otra fila (HU010). | CA-05 | T-HU022-05 |
| RF-06 | Las preguntas con `isDraftContent` (Módulo 9) se excluyen del cálculo. | CA-06 | T-HU022-06 |
| RF-07 | `computeBrainIndex` es una función pura: misma entrada, misma salida. | CA-07 | T-HU022-07 |

## 4. Diseño técnico

**Datos.** `assessment_results.brain_index`, `completeness`, `model_version`.

**Lógica.**

```ts
// shared/utils/brainIndex.ts
export function computeBrainIndex(q: Question[], answers: Answer[], model: ScoringModel): BrainIndex
// BrainIndex = { overall: number | null, subindices: Record<'cognitive' | 'brain_health' | 'functional', number | null>,
//                completeness: number, preliminary: boolean, modelVersion: string }
```

**API.** Incluido en `GET /api/assessments/:id/results`.

**Interfaz.** `components/results/BrainIndexCard.vue`.

**i18n.** `results.index.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU022-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU022-01 | `test/unit/results/brainIndex.test.ts` | perfiles de HU038 | índices esperados ± 0,5 | RF-01 |
| T-HU022-02 | `test/nuxt/components/BrainIndexCard.test.ts` | montar sin subíndices | no renderiza el número | RF-02 |
| T-HU022-03 | `test/unit/results/brainIndex.test.ts` | modelo con un peso null | `preliminary: true` | RF-03 |
| T-HU022-04 | `test/unit/results/brainIndex.test.ts` | completitud 0,75 y 0,85 | `overall` null; número | RF-04 |
| T-HU022-05 | `test/unit/results/brainIndex.test.ts` | resultado | `modelVersion` = versión del modelo | RF-05 |
| T-HU022-06 | `test/unit/results/brainIndex.test.ts` | respuestas EMO extremas | mismo índice que sin ellas | RF-06 |
| T-HU022-07 | `test/unit/results/brainIndex.test.ts` | calcular dos veces la misma entrada | resultados iguales | RF-07 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Nombre comercial definitivo del índice (plan §12.2).
