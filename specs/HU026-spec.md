# HU026 · Seguimiento longitudinal

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 8 — Evolución**  
> **Dependencias:** [HU022](HU022-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** repetir la evaluación cada 6–12 meses y ver cómo cambié respecto a mi línea base **para** monitorear mi evolución.

## 2. Criterios de aceptación

- **CA-01.** La primera evaluación completada se marca como línea base.
- **CA-02.** **Dado** una evaluación anterior, **cuando** intento repetirla antes del intervalo mínimo (configurable, por defecto 6 meses), **entonces** se me informa la fecha disponible.
- **CA-03.** **Dado** dos o más evaluaciones, **cuando** veo resultados, **entonces** veo la variación por dominio (mejoró, igual, empeoró) y un gráfico de evolución.
- **CA-04.** **Dado** versiones del test distintas, **cuando** se comparan, **entonces** solo se usan preguntas con el mismo código y se indica qué quedó fuera.
- **CA-05.** Un empeoramiento marcado entre evaluaciones genera alerta para el evaluador.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | Al completar la primera evaluación de un paciente para un `test.code`, `is_baseline = true`. | CA-01 | T-HU026-01 |
| RF-02 | `nextAllowedDate(last, months = 6)` calcula la fecha mínima; `POST /api/assessments` responde 409 `too_soon` con esa fecha. | CA-02 | T-HU026-02 |
| RF-03 | `compareResults(previous, current)` devuelve por dominio `improved`, `same` o `worse` con un margen de ± 5 puntos. | CA-03 | T-HU026-03 |
| RF-04 | Entre versiones distintas, la comparación usa solo códigos comunes y lista `excluded`. | CA-04 | T-HU026-04 |
| RF-05 | Un dominio con caída ≥ 15 puntos crea una alerta `orange` para el evaluador. | CA-05 | T-HU026-05 |

## 4. Diseño técnico

**Datos.** `assessments.is_baseline`.

**Lógica.**

```ts
// shared/utils/longitudinal.ts
export function nextAllowedDate(last: Date, months?: number): Date
export function compareResults(prev: ResultSnapshot, curr: ResultSnapshot): Comparison
```

**API.** `GET /api/me/history`

**Interfaz.** `components/results/EvolutionChart.vue`.

**i18n.** `results.evolution.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU026-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU026-01 | `test/unit/longitudinal/baseline.test.ts` | primera y segunda evaluación | true, false | RF-01 |
| T-HU026-02 | `test/unit/longitudinal/nextAllowedDate.test.ts` | última el 2026-01-31 | 2026-07-31 | RF-02 |
| T-HU026-03 | `test/unit/longitudinal/compareResults.test.ts` | memoria 60 → 63 y 60 → 50 | `same`, `worse` | RF-03 |
| T-HU026-04 | `test/unit/longitudinal/compareResults.test.ts` | versiones con un código distinto | el código aparece en `excluded` | RF-04 |
| T-HU026-05 | `test/unit/longitudinal/compareResults.test.ts` | caída de 15 puntos | alerta `orange` | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Umbral de "empeoramiento marcado".
- **Pregunta abierta:** Umbral de "empeoramiento marcado" (propuesto: 15 puntos).
