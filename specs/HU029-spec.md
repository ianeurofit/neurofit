# HU029 · Panel de analítica para super admin

> **Prioridad:** P2 · **Sprint:** 4 · **Épica 8 — Evolución**  
> **Dependencias:** [HU011](HU011-spec.md), [HU015](HU015-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** métricas de uso **para** mejorar el test y la conversación.

## 2. Criterios de aceptación

- **CA-01.** Muestra tasa de finalización, abandono por pregunta, tiempo promedio por módulo y preguntas con más aclaraciones en conversación.
- **CA-02.** Filtros por versión del test, modo (formulario o conversación) y rango de fechas.
- **CA-03.** Solo datos agregados, sin identificar pacientes; grupos de menos de 5 personas no se muestran.
- **CA-04.** Solo `superuser` accede.
- **CA-05.** Exportación a CSV.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `completionRate`, `dropOffByQuestion`, `avgTimeBySection` y `clarificationsByQuestion` calculan las métricas a partir de filas agregadas. | CA-01 | T-HU029-01 |
| RF-02 | Las funciones aceptan filtros de versión, modo y rango de fechas. | CA-02 | T-HU029-02 |
| RF-03 | `suppressSmallGroups(rows, k = 5)` oculta grupos con menos de 5 personas; las vistas SQL no exponen ids de pacientes. | CA-03 | T-HU029-03 |
| RF-04 | La vista `analytics_*` y su endpoint son solo para `superuser`. | CA-04 | T-HU029-04 |
| RF-05 | `toCsv(rows)` exporta con encabezados y comillas correctas. | CA-05 | T-HU029-05 |

## 4. Diseño técnico

**Datos.** `<ts>_create_analytics_views.sql`: vistas agregadas `analytics_completion`, `analytics_dropoff`.

**Lógica.**

```ts
// shared/utils/analytics.ts
export function completionRate(rows: AssessmentRow[]): number
export function dropOffByQuestion(rows: DropRow[]): Record<string, number>
export function suppressSmallGroups<T extends { n: number }>(rows: T[], k?: number): T[]
export function toCsv(rows: Record<string, unknown>[]): string
```

**API.** `GET /api/admin/analytics` · `GET /api/admin/analytics.csv`

**Interfaz.** `pages/dashboard/analitica.vue`.

**i18n.** `analytics.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU029-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU029-01 | `test/unit/analytics/metrics.test.ts` | 10 evaluaciones, 7 completadas | 0,7 | RF-01 |
| T-HU029-02 | `test/unit/analytics/metrics.test.ts` | filtro modo `conversation` | solo filas de conversación | RF-02 |
| T-HU029-03 | `test/unit/analytics/suppress.test.ts` | grupos de 3 y de 8 | solo el de 8 | RF-03 |
| T-HU029-04 | `supabase/tests/analytics.test.sql` | `evaluator` consulta `analytics_completion` | rechazado | RF-04 |
| T-HU029-05 | `test/unit/analytics/toCsv.test.ts` | valor con coma y comillas | campo escapado | RF-05 |
