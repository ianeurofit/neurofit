# HU010 · Configurar reglas de puntaje, alertas y plantillas de recomendación

> **Prioridad:** P1 · **Sprint:** 3 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU005](HU005-spec.md), [HU022](HU022-spec.md), [HU023](HU023-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** editar pesos, direcciones, umbrales de alerta y plantillas **para** ajustar el algoritmo sin tocar código.

## 2. Criterios de aceptación

- **CA-01.** **Dado** una pregunta, **cuando** edito su peso, dirección o regla de alerta, **entonces** se valida (peso ≥ 0; regla con operador y valor compatibles con el tipo) antes de guardar.
- **CA-02.** **Dado** un conjunto de cambios, **cuando** los publico, **entonces** se crea una nueva `model_version` y queda en `audit_log`.
- **CA-03.** Los resultados ya generados conservan la `model_version` con la que se calcularon.
- **CA-04.** **Dado** un resultado, **cuando** pido recalcularlo con la versión vigente, **entonces** se crea un resultado nuevo y el anterior se conserva.
- **CA-05.** Las plantillas de recomendación tienen factor asociado, horizonte (30/60/90 días), texto en `es` y `en` y estado (borrador/aprobada); solo las aprobadas se usan.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `validateWeight(w)` acepta `null` o un número ≥ 0; `validateAlertRule(rule, question)` exige operador y valor compatibles con el tipo de la pregunta. | CA-01 | T-HU010-01, T-HU010-02 |
| RF-02 | Publicar cambios crea un `scoring_models` con `version` semántica incrementada y lo registra en `audit_log`. | CA-02 | T-HU010-03 |
| RF-03 | `assessment_results.model_version` es inmutable: ningún endpoint lo actualiza. | CA-03 | T-HU010-04 |
| RF-04 | `POST /api/admin/results/:assessmentId/recalculate` inserta un resultado nuevo con la versión vigente y conserva el anterior. | CA-04 | T-HU010-05 |
| RF-05 | `recommendation_templates` exige `factor`, `horizon_days ∈ {30, 60, 90}`, `body.es` y `body.en`; `selectTemplates` solo usa las `approved`. | CA-05 | T-HU010-06 |

## 4. Diseño técnico

**Datos.** `<ts>_create_scoring.sql`: tablas `scoring_models` y `recommendation_templates` con RLS de estructura.

**Lógica.**

```ts
// shared/utils/scoringConfig.ts
export function validateWeight(w: unknown): ValidationResult
export function validateAlertRule(rule: AlertExpression, question: Question): ValidationResult
export function bumpVersion(current: string, kind: 'major' | 'minor'): string
export function validateTemplate(t: TemplateInput): FieldValidation
```

**API.** `PATCH /api/admin/questions/:id/scoring` · `POST /api/admin/scoring-models/publish` · `CRUD /api/admin/recommendation-templates` · `POST /api/admin/results/:assessmentId/recalculate`

**Interfaz.** `pages/dashboard/tests/[id]/puntaje.vue` y `pages/dashboard/plantillas.vue`.

**i18n.** `scoring.*`, `templates.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU010-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU010-01 | `test/unit/scoring/scoringConfig.test.ts` | validateWeight(-1), (null), (2.5) | inválido, válido, válido | RF-01 |
| T-HU010-02 | `test/unit/scoring/scoringConfig.test.ts` | regla `>= 3` sobre una `true_false` | `incompatible_operator` | RF-01 |
| T-HU010-03 | `test/unit/scoring/scoringConfig.test.ts` | bumpVersion('1.2.0', 'minor') | '1.3.0' | RF-02 |
| T-HU010-04 | `supabase/tests/assessment_results.test.sql` | `superuser` actualiza `model_version` de un resultado | rechazado | RF-03 |
| T-HU010-05 | `test/unit/results/recalculate.test.ts` | recalcular con versión nueva | devuelve un resultado nuevo; el anterior no cambia | RF-04 |
| T-HU010-06 | `test/unit/scoring/scoringConfig.test.ts` | validateTemplate con `horizon_days` 45 y sin `body.en` | 2 errores | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Edición de fórmulas arbitrarias.
