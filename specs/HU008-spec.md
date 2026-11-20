# HU008 · Importar un test desde un archivo estructurado

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU005](HU005-spec.md), [HU031](HU031-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** cargar en bloque las preguntas de un documento **para** no digitarlas una por una.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un archivo con el formato de `docs/test-1.md` (módulos con tablas ID, Ref, pregunta, tipo, opciones), **cuando** lo importo, **entonces** se crean secciones, preguntas y opciones.
- **CA-02.** Antes de confirmar se muestra una vista previa con el conteo por sección y por tipo y la lista de errores con su fila (tipo no soportado, código duplicado, opciones vacías).
- **CA-03.** **Dado** errores, **cuando** confirmo, **entonces** no se importa nada (operación en una transacción).
- **CA-04.** La importación es **idempotente**: reimportar actualiza por `code` y no duplica.
- **CA-05.** Las escalas F5 e IND se mapean a selección única con `score` por opción; los pesos quedan en `null` con la marca "pendiente de validación".
- **CA-06.** Solo se puede importar sobre un test en `draft`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `parseTestMarkdown(md)` extrae módulos (`## Módulo n · Título (CÓDIGO)`) y sus filas de tabla (ID, Ref, pregunta, tipo, opciones) a un `TestImport`. | CA-01 | T-HU008-01 |
| RF-02 | `previewImport(parsed)` devuelve el conteo por sección y por tipo y los errores con número de línea (`unsupported_type`, `duplicate_code`, `empty_options`). | CA-02 | T-HU008-02, T-HU008-03 |
| RF-03 | `POST /api/admin/tests/:id/import` ejecuta la importación en una transacción; si hay errores no escribe nada. | CA-03 | T-HU008-04 |
| RF-04 | `planUpsert(existing, parsed)` clasifica cada pregunta en crear, actualizar o sin cambios por `code`; reimportar no duplica. | CA-04 | T-HU008-05, T-HU008-06 |
| RF-05 | `mapDocType(token)` traduce F5, IND, SNN, FC → `single_choice` con puntajes; OM → `multiple_choice`; SN → `true_false`; NUM → `numeric_free`; OPEN → `open_text`. Los pesos quedan `null`. | CA-05 | T-HU008-07 |
| RF-06 | La importación solo se permite sobre tests en `draft` (`assertStructureEditable`). | CA-06 | T-HU008-08 |

## 4. Diseño técnico

**Datos.** Sin tablas nuevas.

**Lógica.**

```ts
// shared/utils/importer.ts
export function parseTestMarkdown(md: string): { test: TestImport, errors: ImportError[] }
export function previewImport(parsed: TestImport): ImportPreview
export function planUpsert(existing: Question[], parsed: TestImport): UpsertPlan
export function mapDocType(token: string): { type: QuestionType, scaleCode?: ScaleCode } | null
```

**API.** `POST /api/admin/tests/:id/import` (`?dryRun=true` devuelve solo la vista previa)

- Cuerpo `{ markdown }` (el contenido del archivo, leído en el navegador; máximo 1 MB → 413 `too_large`; vacío → 422 `empty_file`). Solo `superuser` (401/403). Solo sobre tests `draft`: 409 `new_version_required` en otro caso, 404 si no existe.
- `?dryRun=true` responde 200 `{ preview, plan }` aunque haya errores. Sin `dryRun`: con errores responde 422 `{ preview }` y no escribe nada; si no, escribe todo con `public.import_test` en una transacción y responde `{ imported: true, preview, plan }`.
- `plan` resume `sections { create, update, unchanged }` y `questions { create, update, unchanged, untouched }`. `untouched` son preguntas del test que no están en el archivo: no se borran.

**Datos (detalle).** Migración `20261120150000_import_test.sql` con `public.import_test(test, sections, questions)` (`security invoker`: aplican RLS, la protección de borrador de HU004 y la auditoría con el actor). Hace upsert por código. Una sección nueva va al final con `domain` = código en minúsculas. Una pregunta nueva va al final de su sección. Al actualizar solo escribe lo que define el archivo (texto en español, tipo, configuración, obligatoriedad, dirección, `doc_ref`, `is_draft_content` y opciones). Peso, textos en inglés, condición, pista y estado activo se conservan. Las opciones solo se reemplazan si cambian.

**Formato que entiende el parser.**
- Módulos: `## Módulo n · Título (\`CÓDIGO\`)`. Si lista varios códigos se unen con `_` (`HIS_GEN_MED_SUB`), salvo que `parseTestMarkdown(md, { sectionCodes: { 2: 'ANT' } })` indique otro. Un módulo con «BORRADOR» en el título marca sus preguntas con `is_draft_content`.
- Columnas por nombre: `ID`, `Ref`, `Tipo`, `Opciones…` y `Dirección`. La columna restante es el texto. Se ignoran las tablas fuera de un módulo.
- Opciones separadas por «·». Un número al final de la opción es su puntaje. `(excluyente)` marca una opción excluyente. Las opciones pueden ir también en la celda del tipo (`OU: Mucho mejor 0 · …`).
- Se eliminan las marcas `†`, `⚑`, `(alerta)` y la negrita. `*(opc.)*` marca la pregunta como no obligatoria.
- `NUM (horas)` fija la unidad y `NUM (0–7)` los límites.
- Dirección: por defecto `higher_is_risk`, y `neutral` para `numeric_free` y `open_text`. La columna «Dirección» (protector/riesgo/neutral) o la anotación `(dirección: mayor = protector)` la cambian.
- Las escalas F5, IND, SNN, FC y CMP5 copian las opciones del catálogo (HU031). Los pesos quedan en `null`.
- Las líneas «Condicional:» no se importan: son de HU032.

**Errores.** `no_modules`, `unsupported_type`, `invalid_code`, `duplicate_code`, `missing_prompt`, `unknown_scale`, `empty_options` (menos de 2 opciones), además de los de `validateQuestionInput` (HU005) con su `field`. Todos llevan su número de línea.

`planUpsert(existing, existingSections, parsed)` recibe también las secciones existentes, para planificar las secciones nuevas o con título cambiado.

**Interfaz.** `components/admin/tests/ImportDialog.vue`: subir archivo → vista previa → confirmar. Botón «Importar archivo» en la estructura de los tests en borrador. La vista previa muestra el conteo por sección y por tipo, el plan (crear/actualizar/sin cambios) y los errores con su línea. «Importar» queda desactivado si hay errores o nada que cambiar.

**Hallazgo en `docs/test-1.md`.** DAT_006 («País / ciudad») y DAT_007 («Idioma principal») tienen «selección» en lugar de opciones, así que el archivo actual da 2 errores `empty_options` y no se importa. Hay que decidir sus opciones (o cambiarlas a otro tipo) antes de HU030.

**i18n.** `tests.import.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU008-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU008-01 | `test/unit/importer/parseTestMarkdown.test.ts` | fragmento con 2 módulos y 5 filas | 2 secciones, 5 preguntas | RF-01 |
| T-HU008-02 | `test/unit/importer/previewImport.test.ts` | fila con tipo `XYZ` en la línea 12 | error `unsupported_type` en línea 12 | RF-02 |
| T-HU008-03 | `test/unit/importer/previewImport.test.ts` | conteo por tipo | totales por `question_type` correctos | RF-02 |
| T-HU008-04 | `test/unit/importer/runImport.test.ts` | importación con un error | no se llama a ninguna escritura | RF-03 |
| T-HU008-05 | `test/unit/importer/planUpsert.test.ts` | reimportar el mismo archivo | todo "sin cambios" | RF-04 |
| T-HU008-06 | `test/unit/importer/planUpsert.test.ts` | archivo con un texto cambiado y una pregunta nueva | 1 actualizar, 1 crear | RF-04 |
| T-HU008-07 | `test/unit/importer/mapDocType.test.ts` | cada token del documento | tipo y escala esperados; `XYZ` → null | RF-05 |
| T-HU008-08 | `test/unit/tests/assertStructureEditable.test.ts` | importar sobre test `published` | `new_version_required` | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Importar desde Excel o Google Sheets.
