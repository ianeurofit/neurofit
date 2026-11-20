# HU037 · Recorrido completo de prueba (end-to-end)

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU011](HU011-spec.md), [HU020](HU020-spec.md), [HU021](HU021-spec.md), [HU022](HU022-spec.md), [HU023](HU023-spec.md), [HU034](HU034-spec.md), [HU038](HU038-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo técnico **quiero** un recorrido automatizado con el Test 1 **para** confirmar que el ecosistema funciona de principio a fin.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un paciente de prueba con consentimiento, **cuando** completa el Test 1 por formulario con un perfil de HU038, **entonces** la evaluación queda `completed` y se generan Hallazgos, Riesgos y Factores, Índice y Plan iguales a los esperados.
- **CA-02.** El mismo recorrido por conversación, con un LLM simulado, llena los mismos slots y cierra con `finish_assessment`.
- **CA-03.** Se confirma que un paciente no lee respuestas de otro y que solo `superuser` modifica el test.
- **CA-04.** Se ejecuta en `es` y `en`, en tema claro y oscuro y a 360 px de ancho.
- **CA-05.** Se ejecuta en CI y bloquea el despliegue a Netlify si falla.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `test/e2e/test1-form.test.ts` (`@nuxt/test-utils/e2e`) completa el Test 1 por formulario con cada perfil de HU038 y compara el resultado con el esperado. | CA-01 | T-HU037-01 |
| RF-02 | `test/e2e/test1-chat.test.ts` repite el recorrido por conversación con un cliente LLM simulado (`server/utils/llm/mock.ts`) que devuelve llamadas de herramienta predefinidas. | CA-02 | T-HU037-02 |
| RF-03 | El recorrido incluye un segundo paciente que intenta leer la evaluación del primero (403) y un `evaluator` que intenta editar el test (403). | CA-03 | T-HU037-03 |
| RF-04 | El recorrido se ejecuta con `locale` `es` y `en`, `colorMode` `light` y `dark`, y viewport de 320 px. | CA-04 | T-HU037-04 |
| RF-05 | El flujo de CI ejecuta `pnpm test` y la suite e2e; Netlify solo despliega si pasan. | CA-05 | T-HU037-05 |

## 4. Diseño técnico

**Datos.** Base local de Supabase con migraciones y seed de HU030 y HU038.

**Lógica.**

```ts
// server/utils/llm/mock.ts
export function createMockLlm(script: ToolCall[][]): LlmClient
```

**API.** Todas las del flujo.

**Interfaz.** Todas las del flujo.

**i18n.** —

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU037-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU037-01 | `test/e2e/test1-form.test.ts` | perfil "sin señales", "seguimiento" y "alerta" | resultado igual al esperado | RF-01 |
| T-HU037-02 | `test/e2e/test1-chat.test.ts` | guion de conversación del perfil "seguimiento" | mismos slots y `completed` | RF-02 |
| T-HU037-03 | `test/e2e/test1-access.test.ts` | paciente B y evaluador no autorizados | 403 en ambos | RF-03 |
| T-HU037-04 | `test/e2e/test1-form.test.ts` | matriz idioma × tema a 320 px | sin errores ni desbordes horizontales | RF-04 |
| T-HU037-05 | `test/unit/repo/ciWorkflow.test.ts` | archivo de CI | contiene los pasos `pnpm test` y e2e antes de desplegar | RF-05 |
