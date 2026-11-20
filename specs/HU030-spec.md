# HU030 · Cargar el Test 1 con sus 13 módulos y 124 preguntas

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU008](HU008-spec.md), [HU031](HU031-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** cargar el Test 1 desde `docs/test-1.md` **para** tener la preevaluación completa en Supabase sin digitarla.

## 2. Criterios de aceptación

- **CA-01.** **Dado** `docs/test-1.md`, **cuando** ejecuto la carga, **entonces** se crea el test `TEST_1` en `draft` con 13 secciones en orden (DAT, ANT, MEM, ATT, EXEC, LANG, ORI, FUNC, EMO, SLP, PHY, NUT, SOCCOG) y 124 preguntas.
- **CA-02.** Cada pregunta conserva su código, su referencia P1–P80 cuando existe, su tipo, sus opciones con puntaje, su dirección y su obligatoriedad.
- **CA-03.** Las preguntas del Módulo 9 quedan marcadas como borrador.
- **CA-04.** La carga es idempotente y reporta secciones, preguntas por tipo y filas rechazadas.
- **CA-05.** Los pesos quedan en `null` ("pendiente de validación").

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `pnpm seed:test-1` ejecuta `parseTestMarkdown('docs/test-1.md')` y `runImport` para crear `TEST_1` en `draft` con las 13 secciones en orden. | CA-01 | T-HU030-01, T-HU030-02 |
| RF-02 | Cada pregunta conserva `code`, `doc_ref`, `type`, opciones con `score`, `direction`, `required`, `allows_decline` y `depends_on` según `docs/test-1.md`. | CA-02 | T-HU030-03, T-HU030-04 |
| RF-03 | Las preguntas de la sección EMO quedan con `is_draft_content = true`. | CA-03 | T-HU030-05 |
| RF-04 | La carga es idempotente (HU008) e imprime el resumen de `previewImport`. | CA-04 | T-HU030-06 |
| RF-05 | Todas las preguntas quedan con `weight = null`. | CA-05 | T-HU030-07 |
| RF-06 | `test/fixtures/test-1.ts` se genera desde el mismo parser y es la fuente de datos de las pruebas. | CA-01, CA-02 | T-HU030-02 |

## 4. Diseño técnico

**Datos.** Script `scripts/seed-test-1.ts`; no crea tablas.

**Lógica.**

```ts
// scripts/seed-test-1.ts
export async function seedTest1(mdPath: string, client: SupabaseClient): Promise<ImportPreview>
```

**API.** Ninguna (script de servidor).

**Interfaz.** Ninguna.

**i18n.** —

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU030-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU030-01 | `test/unit/test1/test1Structure.test.ts` | secciones de `docs/test-1.md` | DAT, ANT, MEM, ATT, EXEC, LANG, ORI, FUNC, EMO, SLP, PHY, NUT, SOCCOG en orden | RF-01 |
| T-HU030-02 | `test/unit/test1/test1Structure.test.ts` | conteo por sección | 14, 11, 11, 7, 8, 6, 5, 13, 9, 7, 6, 16, 11 (124) | RF-01, RF-06 |
| T-HU030-03 | `test/unit/test1/test1Structure.test.ts` | `doc_ref` presentes | P1–P80 sin huecos | RF-02 |
| T-HU030-04 | `test/unit/test1/test1Structure.test.ts` | opciones de MEM_001 y FUNC_001 | F5 con 0–4; IND con 0–1 | RF-02 |
| T-HU030-05 | `test/unit/test1/test1Structure.test.ts` | preguntas EMO | todas `isDraftContent` | RF-03 |
| T-HU030-06 | `test/unit/importer/planUpsert.test.ts` | ejecutar el plan dos veces sobre Test 1 | la segunda vez todo "sin cambios" | RF-04 |
| T-HU030-07 | `test/unit/test1/test1Structure.test.ts` | pesos | todos null | RF-05 |
