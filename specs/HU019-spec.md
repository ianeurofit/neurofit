# HU019 · Seguridad y límites clínicos del asistente

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 5 — Motor conversacional con slot-filling**  
> **Dependencias:** [HU016](HU016-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo clínico **quiero** que el asistente respete límites éticos **para** proteger a los pacientes.

## 2. Criterios de aceptación

- **CA-01.** **Dado** señales de crisis (ideación suicida, autolesión) o de emergencia neurológica aguda (pérdida súbita del habla, debilidad facial), **cuando** se detectan, **entonces** el asistente suspende la captura, responde con empatía, muestra líneas de ayuda y urgencias de Colombia y llama a `escalate_safety`.
- **CA-02.** Cada escalamiento genera una alerta visible para el equipo autorizado.
- **CA-03.** El asistente nunca afirma "tienes Alzheimer/demencia"; usa el lenguaje del documento base ("señales que requieren seguimiento", "se recomienda valoración profesional").
- **CA-04.** Ante intentos de manipulación (pedir que ignore sus reglas, que cambie respuestas de otro paciente), mantiene su rol y no ejecuta acciones fuera de sus herramientas.
- **CA-05.** Las conversaciones quedan registradas para revisión del equipo autorizado.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `detectCrisis(text, locale)` clasifica `self_harm`, `acute_neuro` o `null` con listas de patrones revisadas por el equipo clínico. | CA-01 | T-HU019-01 |
| RF-02 | Ante crisis, el servidor detiene la extracción del turno, llama a `escalate_safety`, crea `safety_events` y devuelve la respuesta de recursos con líneas de ayuda del país configurado. | CA-01, CA-02 | T-HU019-02, T-HU019-03 |
| RF-03 | `assertNoDiagnosis` (HU015) filtra todo texto del asistente antes de enviarlo. | CA-03 | T-HU019-04 |
| RF-04 | El sistema solo ejecuta herramientas de `TOOLS` con el `assessment_id` de la sesión; cualquier otro id en los argumentos se ignora. | CA-04 | T-HU019-05 |
| RF-05 | Todos los mensajes quedan en `messages`; `superuser` los puede consultar. | CA-05 | T-HU019-06 |

## 4. Diseño técnico

**Datos.** `<ts>_create_safety_events.sql` con RLS (evaluador asignado y `superuser` leen).

**Lógica.**

```ts
// shared/utils/safety.ts
export function detectCrisis(text: string, locale: Locale): 'self_harm' | 'acute_neuro' | null
export function crisisResources(country: string, locale: Locale): Resource[]
// server/utils/llm/tools/index.ts
export function bindContext(call: ToolCall, ctx: ToolContext): ToolCall   // fuerza assessment_id
```

**API.** `GET /api/admin/safety-events` · `PATCH /api/admin/safety-events/:id` (marcar revisado)

**Interfaz.** `components/assessment/CrisisCard.vue`; alerta en el panel del evaluador.

**i18n.** `safety.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU019-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU019-01 | `test/unit/safety/detectCrisis.test.ts` | 'no quiero seguir viviendo', 'se me durmió la cara de repente', 'hoy dormí mal' | `self_harm`, `acute_neuro`, null | RF-01 |
| T-HU019-02 | `test/unit/llm/processTurn.test.ts` | mensaje con crisis y datos de sueño | no guarda respuestas, crea `safety_events` y devuelve recursos | RF-02 |
| T-HU019-03 | `test/unit/safety/crisisResources.test.ts` | crisisResources('CO','es') | incluye la línea nacional de Colombia | RF-02 |
| T-HU019-04 | `test/unit/llm/processTurn.test.ts` | respuesta del modelo con diagnóstico | se envía la respuesta segura | RF-03 |
| T-HU019-05 | `test/unit/llm/bindContext.test.ts` | `save_answer` con otro `assessment_id` | se reemplaza por el de la sesión | RF-04 |
| T-HU019-06 | `supabase/tests/messages.test.sql` | `superuser` lee mensajes de cualquier evaluación | filas visibles | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Lista oficial de líneas de ayuda en Colombia y para usuarios en inglés.
- **Pregunta abierta:** Lista oficial de líneas de ayuda por país.
