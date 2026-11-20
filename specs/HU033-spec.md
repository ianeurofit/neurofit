# HU033 · Pistas conversacionales para todas las preguntas

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU030](HU030-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo clínico **quiero** una pista de conversación por pregunta **para** que el asistente la formule de forma natural.

## 2. Criterios de aceptación

- **CA-01.** Las 124 preguntas tienen `conversational_hint` en `es` y `en`.
- **CA-02.** Las preguntas de escala incluyen 2–3 ejemplos de frase → valor para el mapeo de HU017.
- **CA-03.** Las preguntas sensibles (SUB, EMO, DAT_011) indican cómo introducirlas con tacto y que se pueden declinar.
- **CA-04.** Psicología revisa y aprueba las pistas antes de publicar.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `conversational_hint` tiene la forma `{ es, en, examples?: { text, locale, value }[], sensitive?: boolean }`. | CA-01 | T-HU033-01 |
| RF-02 | `validateHint(question)` exige `es` y `en` siempre y 2–3 `examples` por idioma en preguntas de escala (`single_choice` con escala F5, FC o CMP5). | CA-01, CA-02 | T-HU033-02 |
| RF-03 | Las preguntas SUB, EMO y DAT_011 exigen `sensitive: true`; el prompt (HU015) añade la instrucción de tacto y de que se pueden declinar. | CA-03 | T-HU033-03, T-HU033-04 |
| RF-04 | `hint_status` (`draft`/`approved`) por pregunta; `validateForPublish` exige `approved`. | CA-04 | T-HU033-05 |

## 4. Diseño técnico

**Datos.** `questions.hint_status`; pistas del Test 1 en `docs/test-1-hints.md` (lo redacta psicología) cargadas por el mismo importador.

**Lógica.**

```ts
// shared/utils/hints.ts
export function validateHint(q: Question): ValidationResult
export function isSensitive(code: string): boolean   // SUB_*, EMO_*, DAT_011
```

**API.** `PATCH /api/admin/questions/:id/hint`

**Interfaz.** Editor de pistas en `QuestionForm.vue` con pestañas `es`/`en`.

**i18n.** `tests.hints.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU033-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU033-01 | `test/unit/hints/validateHint.test.ts` | pista sin `en` | `missing_locale` | RF-01 |
| T-HU033-02 | `test/unit/hints/validateHint.test.ts` | pregunta F5 con 1 ejemplo en `es` | `examples_count` | RF-02 |
| T-HU033-03 | `test/unit/hints/isSensitive.test.ts` | 'SUB_003', 'EMO_001', 'DAT_011', 'MEM_001' | true, true, true, false | RF-03 |
| T-HU033-04 | `test/unit/llm/prompt.test.ts` | pendiente sensible | el prompt incluye la instrucción de tacto | RF-03 |
| T-HU033-05 | `test/unit/publish/validateForPublish.test.ts` | pregunta con `hint_status: draft` | error `hint_not_approved` | RF-04 |
