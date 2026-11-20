# HU020 · Hallazgos

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 6 — Resultados**  
> **Dependencias:** [HU022](HU022-spec.md), [HU036](HU036-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente o evaluador **quiero** ver los hallazgos principales **para** entender qué señales se identificaron.

## 2. Criterios de aceptación

- **CA-01.** Se presentan por dominio (memoria, atención, funciones ejecutivas, idioma, orientación, funcionalidad, sueño, estado emocional) con semáforo: 🟢 sin señales · 🟡 seguimiento · 🟠 valoración recomendada · 🔴 valoración prioritaria.
- **CA-02.** El semáforo nunca depende solo del color: incluye texto e ícono.
- **CA-03.** Cada hallazgo indica, en la vista del evaluador, qué respuestas lo originan.
- **CA-04.** Los hallazgos de texto libre (`GLO_001`) se muestran como "ámbito potencialmente afectado", nunca como diagnóstico.
- **CA-05.** Las alertas por reglas aparecen arriba con la acción sugerida.
- **CA-06.** El paciente ve lenguaje sencillo; el evaluador, una versión detallada.
- **CA-07.** Todo resultado muestra el descargo: "Este resultado corresponde a una medición automatizada y no constituye un diagnóstico médico ni neuropsicológico."

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `buildFindings(scores, model)` devuelve un hallazgo por dominio con nivel `green`/`yellow`/`orange`/`red` según `model.thresholds`. | CA-01 | T-HU020-01 |
| RF-02 | `ResultLevel.vue` muestra siempre ícono y texto además del color. | CA-02 | T-HU020-02 |
| RF-03 | Cada hallazgo incluye `evidence: string[]` con los códigos de pregunta que lo originan; solo se muestra en la vista del evaluador. | CA-03 | T-HU020-03 |
| RF-04 | El texto de `GLO_001` se clasifica con el LLM en un `domain` y se guarda como `potential_area`; `assertNoDiagnosis` se aplica al texto generado. | CA-04 | T-HU020-04 |
| RF-05 | Las alertas de `evaluateAlerts` (HU036) se ordenan primero, por nivel descendente. | CA-05 | T-HU020-05 |
| RF-06 | `findingText(finding, audience, locale)` devuelve textos para `patient` (sencillo) o `evaluator` (detallado). | CA-06 | T-HU020-06 |
| RF-07 | `ResultsDisclaimer.vue` aparece en toda vista de resultados. | CA-07 | T-HU020-07 |

## 4. Diseño técnico

**Datos.** `<ts>_create_assessment_results.sql`: tabla `assessment_results` (§7.3), solo `service_role` escribe.

**Lógica.**

```ts
// shared/utils/findings.ts
export function domainScores(q: Question[], answers: Answer[]): Record<Domain, DomainScore>
export function buildFindings(scores: Record<Domain, DomainScore>, model: ScoringModel): Finding[]
export function sortFindings(findings: Finding[], alerts: Alert[]): Finding[]
export function findingText(f: Finding, audience: 'patient' | 'evaluator', locale: Locale): string
```

**API.** `POST /api/assessments/:id/results` (se llama al completar) · `GET /api/assessments/:id/results`

**Interfaz.** `components/results/{FindingsList,ResultLevel,ResultsDisclaimer}.vue`.

**i18n.** `results.findings.*`, `results.levels.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU020-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU020-01 | `test/unit/results/buildFindings.test.ts` | perfiles "sin señales" y "alerta" de HU038 | niveles esperados por dominio | RF-01 |
| T-HU020-02 | `test/nuxt/components/ResultLevel.test.ts` | nivel `orange` | renderiza ícono y texto | RF-02 |
| T-HU020-03 | `test/unit/results/buildFindings.test.ts` | dominio memoria con MEM_001 y MEM_004 altos | `evidence` contiene ambos códigos | RF-03 |
| T-HU020-04 | `test/unit/results/potentialArea.test.ts` | clasificación devuelta con texto de diagnóstico | se reemplaza por texto seguro | RF-04 |
| T-HU020-05 | `test/unit/results/sortFindings.test.ts` | hallazgos y una alerta `orange` | la alerta queda primera | RF-05 |
| T-HU020-06 | `test/unit/results/findingText.test.ts` | audiencia `patient` y `evaluator` | claves i18n distintas | RF-06 |
| T-HU020-07 | `test/nuxt/pages/results.test.ts` | montar la página de resultados | contiene `ResultsDisclaimer` | RF-07 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Umbrales del semáforo por dominio (pendientes de validación clínica).
