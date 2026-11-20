# HU015 · Conversación natural que captura respuestas sin parecer un formulario

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 5 — Motor conversacional con slot-filling**  
> **Dependencias:** [HU016](HU016-spec.md), [HU017](HU017-spec.md), [HU018](HU018-spec.md), [HU019](HU019-spec.md), [HU033](HU033-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** conversar con el asistente como en una charla cotidiana **para** compartir mi situación sin sentir que lleno un cuestionario.

## 2. Criterios de aceptación

- **CA-01.** El asistente no enumera preguntas ni muestra "pregunta 12 de 124"; plantea una idea a la vez usando la `conversational_hint` de cada pregunta.
- **CA-02.** **Dado** un mensaje que responde varias preguntas, **cuando** se procesa, **entonces** se guardan todas (ej. "duermo unas 5 horas y me despierto mucho" → `SLP_001` y `SLP_003`).
- **CA-03.** El orden se adapta a lo que cuenta el paciente, pero se cubren todas las preguntas obligatorias aplicables antes de cerrar.
- **CA-04.** El paciente puede pedir cambiar de tema o pasar al formulario en cualquier momento.
- **CA-05.** El asistente responde en el idioma activo (`es` o `en`).
- **CA-06.** El asistente nunca emite diagnósticos ni promete resultados clínicos.
- **CA-07.** La interfaz de chat funciona a 360 px, en tema claro y oscuro.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `buildSystemPrompt(pending, locale)` incluye solo las pistas (`conversational_hint`) de las preguntas pendientes, prohíbe enumerar preguntas y fija el idioma de respuesta. | CA-01, CA-05 | T-HU015-01 |
| RF-02 | `selectNextTopics(pending, lastCodes)` prioriza la sección del último tema tratado y luego el orden del test. | CA-03 | T-HU015-02 |
| RF-03 | Un turno puede producir varias llamadas `save_answer`; el servidor las procesa todas en orden. | CA-02 | T-HU015-03 |
| RF-04 | `assertNoDiagnosis(text)` detecta frases de diagnóstico ("tienes Alzheimer", "you have dementia"); si aparecen, el texto se reemplaza por una respuesta segura. | CA-06 | T-HU015-04 |
| RF-05 | Los comandos "cambiar de tema" y "pasar al formulario" están siempre visibles; el segundo cambia `mode` a `mixed`. | CA-04 | T-HU015-05 |
| RF-06 | `ChatPanel.vue` usa Nuxt UI, funciona a 320 px y en ambos temas. | CA-07 | T-HU015-06 |

## 4. Diseño técnico

**Datos.** `<ts>_create_conversations.sql`: tablas `conversations` y `messages` con RLS por evaluación.

**Lógica.**

```ts
// server/utils/llm/prompt.ts
export function buildSystemPrompt(pending: Question[], locale: Locale): string
export function selectNextTopics(pending: Question[], lastCodes: string[]): string[]
// shared/utils/safety.ts
export function assertNoDiagnosis(text: string): { safe: boolean, replacement?: string }
```

**API.** `POST /api/assessments/:id/conversation/messages` (stream de la respuesta)

**Interfaz.** `components/assessment/ChatPanel.vue`, `ChatMessage.vue`, `ChatActions.vue`.

**i18n.** `assessment.chat.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU015-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU015-01 | `test/unit/llm/prompt.test.ts` | 3 preguntas pendientes en `en` | el prompt contiene sus 3 pistas, ninguna otra, y la instrucción de idioma | RF-01 |
| T-HU015-02 | `test/unit/llm/prompt.test.ts` | pendientes de SLP y MEM tras hablar de sueño | primero los SLP | RF-02 |
| T-HU015-03 | `test/unit/llm/processTurn.test.ts` | turno con 2 llamadas `save_answer` (SLP_001, SLP_003) | 2 respuestas guardadas en orden | RF-03 |
| T-HU015-04 | `test/unit/safety/assertNoDiagnosis.test.ts` | 'Tienes Alzheimer' y 'Sueles dormir 6 horas' | no seguro, seguro | RF-04 |
| T-HU015-05 | `test/nuxt/components/ChatActions.test.ts` | pulsar "pasar al formulario" | emite `switch-to-form` | RF-05 |
| T-HU015-06 | `test/nuxt/components/ChatPanel.test.ts` | montar con 2 mensajes | renderiza sin errores y con roles `log`/`status` accesibles | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Voz a texto (P1).
- **Pregunta abierta:** Proveedor y modelo de LLM y región de procesamiento (plan §12.3).
