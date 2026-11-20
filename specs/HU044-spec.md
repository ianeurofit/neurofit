# HU044 · Revisión del plan por profesión

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 10 — Profesionales de la salud**  
> **Dependencias:** [HU043](HU043-spec.md), [HU023](HU023-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** profesional **quiero** revisar y ajustar las metas del plan que corresponden a mi profesión **para** que el paciente reciba indicaciones validadas por un especialista de su área.

## 2. Criterios de aceptación

- **CA-01.** Cada meta del plan lleva la profesión que le corresponde según el factor que la origina; las que no pertenecen a ninguna quedan como generales.
- **CA-02.** **Dado** un profesional asignado, **cuando** abre el plan de un paciente, **entonces** ve todas las metas pero solo puede editar las de su profesión.
- **CA-03.** **Dado** que edita una meta, **cuando** guarda, **entonces** se crea una nueva versión con autor y fecha y la anterior se conserva.
- **CA-04.** El profesional no puede eliminar la recomendación de derivación profesional ni cambiar el nivel de alerta.
- **CA-05.** El texto ajustado no puede contener un diagnóstico; si lo contiene, se rechaza.
- **CA-06.** **Dado** que marca una meta como revisada, **cuando** el paciente ve su plan, **entonces** lee "Revisado por <profesión>" con la fecha; las no revisadas indican "Generado automáticamente".
- **CA-07.** **Dado** un profesional de otra profesión o no asignado, **cuando** intenta editar o revisar esa meta, **entonces** recibe 403 y la base de datos lo impide.
- **CA-08.** Cada versión y cada revisión queda en `audit_log` y el `superuser` puede consultar quién revisó qué.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `recommendation_templates.profession` (nulo = general) clasifica cada plantilla; `buildPlan` copia la profesión a cada meta. | CA-01 | T-HU044-01 |
| RF-02 | `FACTOR_PROFESSION` define la correspondencia factor → profesión propuesta en la historia y vive en datos (sembrada en la migración), no en el código. | CA-01 | T-HU044-02 |
| RF-03 | `canEditGoal(user, professionalProfile, goal, isAssigned)` es verdadero solo para un profesional activo, asignado y de la misma profesión que la meta. | CA-02, CA-07 | T-HU044-03, T-HU044-04 |
| RF-04 | `validateGoalEdit(original, edit)` rechaza cambios sobre la derivación profesional, el nivel de alerta y el factor, y aplica `assertNoDiagnosis` al texto. | CA-04, CA-05 | T-HU044-05 |
| RF-05 | `PATCH /api/professional/patients/:patientId/plan/goals/:goalId` crea una fila en `plan_goal_revisions` con `version + 1`, autor, profesión y fecha. | CA-03 | T-HU044-06 |
| RF-06 | `POST …/goals/:goalId/review` marca la última versión como revisada. | CA-06 | T-HU044-07 |
| RF-07 | `applyRevisions(plan, revisions)` devuelve el plan con la última versión de cada meta y `reviewedBy` cuando corresponde. | CA-03, CA-06 | T-HU044-07 |
| RF-08 | RLS de `plan_goal_revisions`: lectura para el paciente dueño, los profesionales asignados y el `superuser`; escritura solo desde `service_role`. | CA-07 | T-HU044-08 |
| RF-09 | Trigger de auditoría sobre `plan_goal_revisions`. | CA-08 | T-HU044-09 |
| RF-10 | El plan del paciente muestra "Revisado por <profesión> el <fecha>" o "Generado automáticamente". | CA-06 | T-HU044-07, T-HU044-10 |

## 4. Diseño técnico

**Datos.** `<ts>_create_plan_goal_revisions.sql`: tabla `plan_goal_revisions`, columna `recommendation_templates.profession`, seed de `FACTOR_PROFESSION` en las plantillas, RLS y trigger de auditoría.

**Lógica.**

```ts
// shared/utils/plan.ts  (se amplía buildPlan para copiar la profesión)
// shared/utils/planReview.ts
export function canEditGoal(user: Pick<Profile, 'role' | 'is_active'>, pp: ProfessionalProfile | null, goal: PlanGoal, isAssigned: boolean): boolean
export function validateGoalEdit(original: PlanGoal, edit: PlanGoalEdit): ValidationResult
export function applyRevisions(plan: RecommendationPlan, revisions: PlanGoalRevision[]): RecommendationPlan
```

**API.** `PATCH /api/professional/patients/:patientId/plan/goals/:goalId` · `POST /api/professional/patients/:patientId/plan/goals/:goalId/review`

**Interfaz.** Editor de metas en la ficha del profesional; insignia "Revisado por…" en `PlanTimeline.vue`.

**i18n.** `professional.plan.*`, `results.plan.reviewedBy`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU044-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU044-01 | `test/unit/plan/buildPlan.test.ts` | plan con factores de actividad física, nutrición y sueño | metas con profesión fisioterapia, nutrición y psicología | RF-01 |
| T-HU044-02 | `supabase/tests/recommendation_templates.test.sql` | plantillas sembradas | cada factor con su profesión; tabaco/alcohol y derivación sin profesión | RF-02 |
| T-HU044-03 | `test/unit/plan/canEditGoal.test.ts` | fisioterapeuta asignado sobre meta de actividad física y sobre meta de nutrición | true, false | RF-03 |
| T-HU044-04 | `test/unit/plan/canEditGoal.test.ts` | profesional no asignado; profesional inactivo | false, false | RF-03 |
| T-HU044-05 | `test/unit/plan/validateGoalEdit.test.ts` | edición que cambia la derivación; edición con "tienes Alzheimer" | `immutable_field`; `diagnosis_not_allowed` | RF-04 |
| T-HU044-06 | `test/unit/plan/planReview.test.ts` | segunda edición de la misma meta | versión 2 y la 1 conservada | RF-05 |
| T-HU044-07 | `test/unit/plan/planReview.test.ts` | marcar revisada la última versión | `reviewedBy` con profesión y fecha | RF-06, RF-07, RF-10 |
| T-HU044-08 | `supabase/tests/plan_goal_revisions.test.sql` | profesional no asignado lee y escribe; paciente ajeno lee | 0 filas y rechazo | RF-08 |
| T-HU044-09 | `supabase/tests/audit_log.test.sql` | insertar una revisión | fila en `audit_log` | RF-09 |
| T-HU044-10 | `test/nuxt/components/PlanTimeline.test.ts` | meta revisada y no revisada | insignia "Revisado por" o "Generado automáticamente" | RF-10 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Que el plan espere la revisión antes de mostrarse al paciente (ver pregunta abierta).
- **Fuera de alcance:** Crear metas nuevas que no salgan de una plantilla.
- **Pregunta abierta:** ¿Se confirma la correspondencia factor → profesión propuesta? (psicología: salud emocional, estimulación cognitiva, socialización y sueño; fisioterapia: actividad física y tiempo sentado; nutrición: nutrición y salud metabólica; general: tabaco/alcohol, medicamentos y derivación)
- **Pregunta abierta:** ¿El plan se muestra al paciente solo cuando un profesional lo revisó? Hoy se muestra de inmediato.
- **Pregunta abierta:** Clasificación clínica de los factores por profesión (propuesta de la historia, a confirmar con psicología).
