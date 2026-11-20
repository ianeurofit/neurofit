# HU036 · Alertas iniciales del Test 1

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU010](HU010-spec.md), [HU030](HU030-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo clínico **quiero** alertas configuradas desde el primer día **para** que las señales prioritarias no pasen desapercibidas.

## 2. Criterios de aceptación

- **CA-01.** `DAT_014` = "Han empeorado rápidamente" genera como mínimo una alerta 🟠.
- **CA-02.** `FUNC_011` = Sí junto con ≥ 2 actividades en "Necesita ayuda" genera una alerta 🟠.
- **CA-03.** Las alertas aparecen en Hallazgos (HU020) y en el panel del evaluador, con el descargo.
- **CA-04.** Los umbrales están en la BD y se editan desde HU010, sin cambiar código.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `evaluateAlerts(rules, answers)` evalúa expresiones `{ all|any: [...], count: { codes, value, gte } }` y devuelve las alertas activas con su nivel. | CA-01, CA-02 | T-HU036-01, T-HU036-02 |
| RF-02 | La migración siembra `RAPID_DECLINE` (`DAT_014 = 'worse_fast'` → `orange`) y `NEW_FUNCTIONAL_LOSS` (`FUNC_011 = true` y `count(FUNC_001..010 = 'needs_help') ≥ 2` → `orange`). | CA-01, CA-02 | T-HU036-01, T-HU036-02 |
| RF-03 | Las alertas activas se guardan en `assessment_results.findings.alerts` y se muestran en Hallazgos y en el panel del evaluador. | CA-03 | T-HU036-03 |
| RF-04 | Las reglas están en `alert_rules` y se editan desde HU010; el código no contiene umbrales. | CA-04 | T-HU036-04, T-HU036-05 |

## 4. Diseño técnico

**Datos.** `<ts>_create_alert_rules.sql`: enum `alert_level`, tabla `alert_rules` y seed de las dos reglas.

**Lógica.**

```ts
// shared/utils/alerts.ts
export function evaluateAlerts(rules: AlertRule[], answers: Answer[]): Alert[]
export function maxLevel(alerts: Alert[]): AlertLevel
```

**API.** Incluido en la generación de resultados (HU020).

**Interfaz.** Alertas en `FindingsList.vue` y en `pages/dashboard/evaluador.vue`.

**i18n.** Mensajes de alerta en `alert_rules.message` (`es`/`en`).

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU036-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU036-01 | `test/unit/alerts/evaluateAlerts.test.ts` | `DAT_014` = 'worse_fast' y = 'worse_slow' | alerta `orange`; ninguna | RF-01, RF-02 |
| T-HU036-02 | `test/unit/alerts/evaluateAlerts.test.ts` | FUNC_011 = true con 1 y con 2 actividades `needs_help` | ninguna; `orange` | RF-01, RF-02 |
| T-HU036-03 | `test/unit/alerts/maxLevel.test.ts` | alertas `yellow` y `orange` | `orange` | RF-03 |
| T-HU036-04 | `test/unit/repo/noHardcodedThresholds.test.ts` | buscar los códigos de regla en `shared/` y `server/` | ninguna coincidencia fuera de pruebas | RF-04 |
| T-HU036-05 | `supabase/tests/alert_rules.test.sql` | reglas sembradas | RAPID_DECLINE y NEW_FUNCTIONAL_LOSS activas | RF-04 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Validación clínica de los niveles de alerta.
