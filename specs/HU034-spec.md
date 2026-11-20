# HU034 · Verificación de integridad y publicación del Test 1

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU007](HU007-spec.md), [HU030](HU030-spec.md), [HU032](HU032-spec.md), [HU033](HU033-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** una verificación automática antes de publicar **para** no liberar un test incompleto.

## 2. Criterios de aceptación

- **CA-01.** Valida 13 secciones, ≥ 1 pregunta activa por sección, tipos y opciones válidos, condiciones que apuntan a códigos existentes, pistas completas y códigos únicos.
- **CA-02.** **Dado** errores, **cuando** intento publicar, **entonces** veo la lista por módulo y pregunta, y no se publica.
- **CA-03.** **Dado** que todo pasa, **cuando** publico, **entonces** `TEST_1` v1 queda `published`, en `audit_log` y visible para pacientes y evaluadores.
- **CA-04.** Los ítems en borrador (Módulo 9) se publican con advertencia al super admin y sin peso en el índice.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `validateTest1(tree)` añade a `validateForPublish` las reglas del Test 1: 13 secciones con los códigos esperados, condiciones que apuntan a códigos existentes y códigos únicos. | CA-01 | T-HU034-01, T-HU034-02, T-HU034-03 |
| RF-02 | El endpoint de publicación devuelve los errores agrupados por sección y pregunta y no publica. | CA-02 | T-HU034-04 |
| RF-03 | Sin errores, publica `TEST_1` v1 con `publish_test` (HU007). | CA-03 | T-HU034-05 |
| RF-04 | Las secciones con `is_draft_content` generan `warnings` (no errores); la UI las muestra al `superuser`. | CA-04 | T-HU034-01 |

## 4. Diseño técnico

**Datos.** Sin cambios.

**Lógica.**

```ts
// shared/utils/publish.ts
export function validateTest1(tree: TestTree): { errors: PublishError[], warnings: PublishWarning[] }
export function groupErrors(errors: PublishError[]): Record<string, PublishError[]>
```

**API.** Reutiliza `POST /api/admin/tests/:id/publish`.

**Interfaz.** Panel de errores y advertencias en la página del test.

**i18n.** `tests.publish.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU034-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU034-01 | `test/unit/publish/validateTest1.test.ts` | fixture del Test 1 con pistas aprobadas | sin errores y con advertencia de EMO | RF-01, RF-04 |
| T-HU034-02 | `test/unit/publish/validateTest1.test.ts` | sin la sección NUT | error `missing_section` NUT | RF-01 |
| T-HU034-03 | `test/unit/publish/validateTest1.test.ts` | condición a `XXX_999` | error `unknown_question` | RF-01 |
| T-HU034-04 | `test/unit/publish/groupErrors.test.ts` | 3 errores en 2 secciones | 2 grupos | RF-02 |
| T-HU034-05 | `supabase/tests/publish_test.test.sql` | publicar TEST_1 v1 | estado `published` y fila en `audit_log` | RF-03 |
