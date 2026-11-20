# HU021 · Riesgos y factores

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 6 — Resultados**  
> **Dependencias:** [HU022](HU022-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente o evaluador **quiero** ver los factores de riesgo y protectores **para** saber en qué puedo actuar.

## 2. Criterios de aceptación

- **CA-01.** Se separan factores de riesgo **modificables** (sedentarismo, sueño, nutrición, tabaco/alcohol, aislamiento, hipertensión/diabetes, salud emocional), **no modificables** (edad, antecedentes familiares) y **protectores** (actividad cognitiva, social, artística, física).
- **CA-02.** Cada factor muestra su nivel (bajo, medio, alto) y las preguntas que lo sustentan.
- **CA-03.** El riesgo futuro y las señales cognitivas actuales se presentan por separado.
- **CA-04.** Presión, glucosa y colesterol aislados no se interpretan como diagnóstico.
- **CA-05.** Los medicamentos relevantes (HU039) aparecen como factor, sin recomendar suspenderlos.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `classifyFactors(answers, model)` devuelve tres grupos: `modifiable`, `non_modifiable` y `protective`, según `FACTOR_MAP` (factor → códigos de pregunta → grupo). | CA-01 | T-HU021-01 |
| RF-02 | Cada factor tiene `level` (`low`/`medium`/`high`) y `evidence` con los códigos que lo sustentan. | CA-02 | T-HU021-02 |
| RF-03 | `assessment_results` guarda por separado `cognitive_signals` y `future_risk`; la vista los muestra en bloques distintos. | CA-03 | T-HU021-03 |
| RF-04 | Los valores de NUT_013–NUT_016 solo se muestran como dato informativo; no generan nivel `high` por sí solos. | CA-04 | T-HU021-04 |
| RF-05 | Los medicamentos con `cognitive_flag` (HU039) se agregan como factor modificable `medication_review`, con texto que no recomienda suspenderlos. | CA-05 | T-HU021-05 |

## 4. Diseño técnico

**Datos.** Sin tablas nuevas; usa `assessment_results.risk_factors`.

**Lógica.**

```ts
// shared/utils/factors.ts
export const FACTOR_MAP: Record<FactorCode, { group: FactorGroup, questions: string[] }>
export function classifyFactors(answers: Answer[], q: Question[], model: ScoringModel, meds?: Medication[]): FactorReport
```

**API.** Incluido en `GET /api/assessments/:id/results`.

**Interfaz.** `components/results/FactorsPanel.vue` con dos bloques (señales actuales y riesgo futuro).

**i18n.** `results.factors.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU021-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU021-01 | `test/unit/results/classifyFactors.test.ts` | perfil con sedentarismo, antecedente familiar y lectura frecuente | uno en cada grupo | RF-01 |
| T-HU021-02 | `test/unit/results/classifyFactors.test.ts` | factor sueño | `level` y `evidence` con códigos SLP | RF-02 |
| T-HU021-03 | `test/unit/results/buildResult.test.ts` | resultado completo | `cognitive_signals` y `future_risk` separados | RF-03 |
| T-HU021-04 | `test/unit/results/classifyFactors.test.ts` | solo presión 160/100, sin otros factores | ningún factor `high` | RF-04 |
| T-HU021-05 | `test/unit/results/classifyFactors.test.ts` | medicamento con `cognitive_flag` | factor `medication_review` | RF-05 |
