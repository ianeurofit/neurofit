# HU023 · Plan de recomendaciones

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 6 — Resultados**  
> **Dependencias:** [HU010](HU010-spec.md), [HU021](HU021-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** recibir un plan personalizado **para** saber qué hacer a partir de mis resultados.

## 2. Criterios de aceptación

- **CA-01.** Se genera un plan a 30, 60 y 90 días con una meta concreta por cada factor modificable detectado.
- **CA-02.** Las recomendaciones salen solo de plantillas aprobadas; la IA puede ajustar el tono, pero no inventa intervenciones clínicas.
- **CA-03.** Si corresponde, incluye la recomendación de valoración profesional con su urgencia, coherente con el semáforo.
- **CA-04.** Se programan recordatorios de reevaluación (30/60/90/180 días) que el paciente puede desactivar.
- **CA-05.** El evaluador puede revisar y ajustar el plan (P1).
- **CA-06.** El plan se puede descargar en PDF (P1).

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `buildPlan(factors, templates)` crea metas a 30, 60 y 90 días, una por cada factor modificable detectado. | CA-01 | T-HU023-01 |
| RF-02 | `selectTemplates` solo usa plantillas `approved`; el LLM, si se usa, solo reescribe el tono y `assertNoDiagnosis` valida la salida. Si el texto reescrito no conserva la meta, se usa la plantilla original. | CA-02 | T-HU023-02, T-HU023-03 |
| RF-03 | `referralFor(level)` devuelve `none` (green), `follow_up` (yellow), `recommended` (orange) o `priority` (red), y el plan la incluye. | CA-03 | T-HU023-04 |
| RF-04 | Al generar el plan se crean `reminders` a 30, 60, 90 y 180 días; el paciente puede desactivarlos. | CA-04 | T-HU023-05 |
| RF-05 | (P1) El evaluador edita el plan con `PATCH`, que guarda versión anterior. | CA-05 | T-HU023-06 |
| RF-06 | (P1) `GET …/plan.pdf` genera el PDF en el servidor. | CA-06 | T-HU023-07 |

## 4. Diseño técnico

**Datos.** `<ts>_create_reminders.sql`: tabla `reminders` con RLS del paciente.

**Lógica.**

```ts
// shared/utils/plan.ts
export function selectTemplates(factors: Factor[], templates: Template[]): Template[]
export function buildPlan(factors: Factor[], templates: Template[], level: AlertLevel): RecommendationPlan
export function referralFor(level: AlertLevel): 'none' | 'follow_up' | 'recommended' | 'priority'
export function reminderDates(from: Date): Date[]
```

**API.** `GET /api/assessments/:id/plan` · `PATCH /api/assessments/:id/plan` · `PATCH /api/reminders/:id`

**Interfaz.** `components/results/PlanTimeline.vue`.

**i18n.** `results.plan.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU023-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU023-01 | `test/unit/plan/buildPlan.test.ts` | 2 factores modificables | metas en los 3 horizontes para ambos | RF-01 |
| T-HU023-02 | `test/unit/plan/selectTemplates.test.ts` | plantillas `draft` y `approved` del mismo factor | solo la `approved` | RF-02 |
| T-HU023-03 | `test/unit/plan/buildPlan.test.ts` | reescritura del LLM sin la meta | se usa la plantilla original | RF-02 |
| T-HU023-04 | `test/unit/plan/referralFor.test.ts` | los 4 niveles | los 4 valores | RF-03 |
| T-HU023-05 | `test/unit/plan/reminderDates.test.ts` | desde 2026-01-01 | 4 fechas: +30, +60, +90, +180 días | RF-04 |
| T-HU023-06 | `test/unit/plan/editPlan.test.ts` | editar el plan | versión anterior conservada | RF-05 |
| T-HU023-07 | `test/unit/plan/planPdf.test.ts` | generar PDF de un plan | buffer que empieza por `%PDF` | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** ¿El paciente ve sus resultados de inmediato o tras revisión del evaluador? (plan §12.6)
- **Pregunta abierta:** El PDF (CA-06) puede requerir una dependencia nueva; se decide al aprobar esta spec.
