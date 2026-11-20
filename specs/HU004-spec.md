# HU004 · Gestionar secciones de un test

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU003](HU003-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** agregar, editar, reordenar y eliminar secciones **para** agrupar las preguntas por módulo.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un test en `draft`, **cuando** agrego una sección con título, código y dominio, **entonces** aparece al final con `position` = n+1.
- **CA-02.** El código de sección es único dentro del test; si se repite, se rechaza con mensaje claro.
- **CA-03.** **Dado** varias secciones, **cuando** las reordeno (arrastrar en escritorio, botones subir/bajar en móvil), **entonces** las posiciones quedan consecutivas (1..n) y el orden se refleja en formularios y vista previa.
- **CA-04.** **Dado** una sección con preguntas, **cuando** intento eliminarla, **entonces** se pide confirmación indicando cuántas preguntas se eliminarán.
- **CA-05.** **Dado** un test con evaluaciones respondidas o publicado, **cuando** intento eliminar o modificar su estructura, **entonces** se bloquea y se ofrece crear una nueva versión.
- **CA-06.** Cada cambio queda en `audit_log`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `POST /api/admin/tests/:id/sections` agrega la sección con `position = max + 1`. | CA-01 | T-HU004-01 |
| RF-02 | `(test_id, code)` es único; un duplicado devuelve 409 `section_code_taken`. | CA-02 | T-HU004-02 |
| RF-03 | `reorder(items, fromIndex, toIndex)` devuelve posiciones consecutivas 1..n; el endpoint `PATCH …/sections/order` las guarda en una transacción. | CA-03 | T-HU004-03, T-HU004-04 |
| RF-04 | En móvil (< 640 px) se muestran botones subir/bajar en lugar de arrastrar; ambos usan `reorder`. | CA-03 | T-HU004-03 |
| RF-05 | `DELETE` de una sección con preguntas exige `?confirm=true`; sin él devuelve 409 con `questionCount`. | CA-04 | T-HU004-05 |
| RF-06 | `assertStructureEditable(test, hasAnswers)` rechaza con `new_version_required` si el test no está en `draft` o tiene respuestas. | CA-05 | T-HU004-06, T-HU004-07 |
| RF-07 | Cada cambio en `test_sections` queda en `audit_log`. | CA-06 | T-HU004-08 |

## 4. Diseño técnico

**Datos.** `<ts>_create_test_sections.sql`: tabla `test_sections` (§7.3) con RLS de estructura.

**Lógica.**

```ts
// shared/utils/ordering.ts
export function reorder<T extends { position: number }>(items: T[], from: number, to: number): T[]
export function nextPosition(items: { position: number }[]): number
// shared/utils/tests.ts
export function assertStructureEditable(test: { status: TestStatus }, hasAnswers: boolean): ValidationResult
```

**API.** `POST/PATCH/DELETE /api/admin/tests/:id/sections[/:sectionId]` · `PATCH /api/admin/tests/:id/sections/order`

- Todas exigen `superuser` (401/403) y responden 404 si el test o la sección no existen o el id no es un uuid.
- Cuerpo de sección: `{ code, title: { es, en? }, domain }`. `code` cumple `^[A-Z0-9_]{2,40}$` (único en el test), `title.es` 3–120 y `domain` 2–60 caracteres. 422 `{ errors: [{ field, code }] }` si no valida; 409 `section_code_taken` si el código se repite. `position` nunca viene del cliente.
- `PATCH …/:sectionId` acepta cambios parciales; la posición solo cambia con `…/order`.
- `PATCH …/order` recibe `{ ids: uuid[] }` con todas las secciones del test, una vez cada una; si no, 422 `invalid_order`. La función `public.reorder_test_sections` guarda 1..n en una sola sentencia (restricción única `(test_id, position)` diferible).
- `DELETE` sin `?confirm=true` y con preguntas responde 409 `{ code: 'confirm_required', questionCount }`. Tras borrar, las posiciones se renumeran 1..n.
- Si el test no está en `draft` o tiene respuestas, 409 `new_version_required`. El trigger `private.guard_test_structure` lo impide también en la base.
- Añadido para la interfaz: `GET /api/admin/tests/:id` devuelve el test con sus secciones en orden y `question_count` de cada una.
- Mientras no existan las tablas de HU005 (`questions`) y HU011 (`assessments`), `countSectionQuestions` devuelve 0 y `testHasAnswers` devuelve `false` (`server/utils/testStructure.ts`). Esas HU deben reemplazarlas.

**Interfaz.** `components/admin/tests/SectionList.vue` con arrastre (escritorio) y botones (móvil); confirmación con `UModal`. La lista se muestra en `pages/dashboard/tests/[id]/index.vue` (página nueva, enlazada desde el código de cada test en `dashboard/tests`), con el alta y la edición en un `UModal`. Los botones subir/bajar se ven también en escritorio para poder reordenar con teclado; el arrastre es HTML5 nativo, sin dependencias.

**i18n.** `tests.sections.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU004-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU004-01 | `test/unit/shared/ordering.test.ts` | nextPosition([]) y con posiciones [1,2,3] | 1 y 4 | RF-01 |
| T-HU004-02 | `supabase/tests/tests_structure.test.sql` | insertar dos secciones con el mismo código en un test | error de unicidad | RF-02 |
| T-HU004-03 | `test/unit/shared/ordering.test.ts` | reorder de 4 elementos moviendo el 0 al 2 | posiciones 1,2,3,4 con el orden nuevo | RF-03, RF-04 |
| T-HU004-04 | `test/unit/shared/ordering.test.ts` | reorder con índice fuera de rango | lista sin cambios | RF-03 |
| T-HU004-05 | `test/unit/tests/deleteSection.test.ts` | planDeleteSection con 5 preguntas y sin confirmar | `{ needsConfirm: true, questionCount: 5 }` | RF-05 |
| T-HU004-06 | `test/unit/tests/assertStructureEditable.test.ts` | test `published` y test `draft` con respuestas | `new_version_required` en ambos | RF-06 |
| T-HU004-07 | `test/unit/tests/assertStructureEditable.test.ts` | test `draft` sin respuestas | `ok: true` | RF-06 |
| T-HU004-08 | `supabase/tests/audit_log.test.sql` | actualizar una sección | fila en `audit_log` con `diff` | RF-07 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Secciones compartidas entre tests.
