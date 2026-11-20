# HU016 · Slot-filling con function calling y salidas estructuradas

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 5 — Motor conversacional con slot-filling**  
> **Dependencias:** [HU013](HU013-spec.md), [HU014](HU014-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo técnico **quiero** que el modelo llene las preguntas mediante funciones con salida estructurada **para** que cada respuesta se guarde de forma confiable y auditable.

## 2. Criterios de aceptación

- **CA-01.** El agente dispone solo de: `get_conversation_state`, `save_answer`, `flag_for_confirmation`, `mark_not_answered`, `escalate_safety` y `finish_assessment`.
- **CA-02.** **Dado** que el modelo llama a `save_answer` con confianza ≥ umbral (por defecto 0,75), **cuando** el valor pasa la validación de HU013, **entonces** se guarda con `source = 'conversation'`, `confidence` y `evidence`.
- **CA-03.** **Dado** confianza menor al umbral, **cuando** el modelo intenta guardar, **entonces** se registra como `needs_confirmation` y el asistente confirma con naturalidad.
- **CA-04.** **Dado** una llamada con argumentos que no cumplen el esquema, **cuando** el servidor la recibe, **entonces** la rechaza, lo registra en `extraction_events` y el modelo reintenta (máximo 2 veces).
- **CA-05.** Solo el servidor (Nitro) escribe en Supabase; el modelo nunca accede a la base.
- **CA-06.** Cada guardado, corrección o rechazo queda en `extraction_events` con el `message_id` de origen.
- **CA-07.** **Dado** que el paciente corrige una respuesta, **cuando** se procesa, **entonces** se actualiza el valor y se conserva el historial.
- **CA-08.** `finish_assessment` se rechaza si quedan preguntas obligatorias pendientes.
- **CA-09.** El estado vive en `conversations.state` y permite retomar la conversación.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `TOOLS` define exactamente seis herramientas con su esquema JSON; cualquier otro nombre se rechaza. | CA-01 | T-HU016-01 |
| RF-02 | `handleSaveAnswer` guarda si `confidence ≥ threshold` (por defecto 0,75) y `validateAnswer` pasa; usa `source = 'conversation'`. | CA-02 | T-HU016-02 |
| RF-03 | Con `confidence < threshold` guarda con `needs_confirmation = true` y registra `needs_confirmation`. | CA-03 | T-HU016-03 |
| RF-04 | Argumentos que no cumplen el esquema se rechazan, se registran como `rejected` y se devuelven al modelo; máximo 2 reintentos por turno. | CA-04 | T-HU016-04, T-HU016-05 |
| RF-05 | Las herramientas se ejecutan en `server/utils/llm/tools/` con `service_role`; el modelo no recibe credenciales. | CA-05 | T-HU016-06 |
| RF-06 | Cada acción crea un `extraction_events` con `message_id`, `question_id`, `action` y `payload`. | CA-06 | T-HU016-07 |
| RF-07 | Una corrección actualiza la respuesta (upsert) y la versión anterior queda en `answer_history`. | CA-07 | T-HU016-08 |
| RF-08 | `handleFinish` devuelve error `pending_required` si `canFinish` es falso. | CA-08 | T-HU016-09 |
| RF-09 | `conversations.state` guarda `{ pending, lastCodes, retries }`; `GET …/conversation` lo restaura. | CA-09 | T-HU016-10 |

## 4. Diseño técnico

**Datos.** `<ts>_create_extraction_events.sql` con RLS (solo `service_role` escribe).

**Lógica.**

```ts
// server/utils/llm/tools/index.ts
export const TOOLS: ToolDefinition[]
export async function runTool(call: ToolCall, ctx: ToolContext): Promise<ToolResult>
// server/utils/llm/tools/saveAnswer.ts
export function decideSave(args: SaveAnswerArgs, q: Question, threshold = 0.75): 'save' | 'confirm' | { reject: string }
```

**API.** Interno al endpoint de HU015.

**Interfaz.** Sin interfaz propia.

**i18n.** —

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU016-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU016-01 | `test/unit/llm/tools.test.ts` | nombres de `TOOLS` y llamada a `delete_answer` | los 6 nombres; `unknown_tool` | RF-01 |
| T-HU016-02 | `test/unit/llm/decideSave.test.ts` | confianza 0,9 con valor válido | 'save' | RF-02 |
| T-HU016-03 | `test/unit/llm/decideSave.test.ts` | confianza 0,6 | 'confirm' | RF-03 |
| T-HU016-04 | `test/unit/llm/decideSave.test.ts` | valor 7 en una F5 | `{ reject: 'unknown_option' }` | RF-04 |
| T-HU016-05 | `test/unit/llm/runTool.test.ts` | tercer argumento inválido en el mismo turno | deja de reintentar y responde al paciente | RF-04 |
| T-HU016-06 | `test/unit/repo/serviceRoleBoundary.test.ts` | imports de `server/utils/llm` | no expone el cliente fuera de `tools/` | RF-05 |
| T-HU016-07 | `test/unit/llm/runTool.test.ts` | save_answer exitoso | crea `extraction_events` con `action: saved` | RF-06 |
| T-HU016-08 | `test/unit/llm/runTool.test.ts` | corrección de SLP_001 de 5 a 6 | upsert con 6 y evento `updated` | RF-07 |
| T-HU016-09 | `test/unit/llm/runTool.test.ts` | finish_assessment con 2 pendientes | `pending_required` | RF-08 |
| T-HU016-10 | `test/unit/llm/conversationState.test.ts` | serializar y restaurar el estado | objeto idéntico | RF-09 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Entrenamiento o ajuste fino del modelo.
