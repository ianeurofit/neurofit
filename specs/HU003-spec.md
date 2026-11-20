# HU003 · Crear un test

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU001](HU001-spec.md), [HU024](HU024-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** crear un test con título, descripción y código **para** organizar las evaluaciones de la plataforma.

## 2. Criterios de aceptación

- **CA-01.** **Dado** que estoy en "Gestión de evaluaciones", **cuando** creo un test con código y título válidos, **entonces** se guarda en `draft`, versión 1, con `created_by` = yo.
- **CA-02.** El código es obligatorio, único y cumple `^[A-Z0-9_]{3,40}$`; el título es obligatorio (3–120 caracteres); la descripción es opcional.
- **CA-03.** **Dado** un código ya existente, **cuando** guardo, **entonces** veo un error claro junto al campo y no se crea el test.
- **CA-04.** **Dado** un test en `draft`, **cuando** un paciente o evaluador consulta los tests disponibles, **entonces** no aparece.
- **CA-05.** **Dado** que creo el test, **cuando** se guarda, **entonces** queda un registro en `audit_log` con actor y fecha.
- **CA-06.** La lista de tests muestra código, título, versión y estado, con filtro por estado y funciona a 360 px de ancho.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `POST /api/admin/tests` crea el test con `status = 'draft'`, `version = 1` y `created_by` = usuario actual. | CA-01 | T-HU003-01 |
| RF-02 | `validateTestInput` exige `code` con `^[A-Z0-9_]{3,40}$`, `title.es` de 3–120 caracteres y `description` opcional. | CA-02 | T-HU003-02, T-HU003-03 |
| RF-03 | Un `code` repetido devuelve 409 con el error `code_taken` asociado al campo `code`; no se inserta nada. | CA-03 | T-HU003-04 |
| RF-04 | Los tests en `draft` no son visibles para `evaluator` ni `user` (RLS y `GET /api/tests`). | CA-04 | T-HU003-05 |
| RF-05 | Cada inserción en `tests` genera una fila en `audit_log` (trigger de HU024). | CA-05 | T-HU003-06 |
| RF-06 | `filterTests(list, status)` filtra por estado; la tabla de la lista usa diseño de tarjetas por debajo de 640 px. | CA-06 | T-HU003-07 |

## 4. Diseño técnico

**Datos.** `<ts>_create_tests.sql`: enum `test_status`, tabla `tests` (§7.3), índice único en `code`, RLS de estructura.

**Lógica.**

```ts
// shared/utils/tests.ts
export function validateTestInput(input: { code: string, title: LocalizedText, description?: LocalizedText }): FieldValidation
export function filterTests<T extends { status: TestStatus }>(list: T[], status?: TestStatus): T[]
// app/composables/useAdminTests.ts
export function useAdminTests(): { tests, create(input), refresh(), filter }
```

**API.** `GET /api/admin/tests` · `POST /api/admin/tests` · `GET /api/tests` (publicados)

- `GET /api/admin/tests?status=draft|published|archived`: solo `superuser`; un estado desconocido responde 422 `invalid_status`.
- `POST /api/admin/tests`: solo `superuser`. Cuerpo `{ code, title: { es, en? }, description?: { es, en? } }`; `status`, `version` y `created_by` los fija el servidor aunque el cliente los envíe. Responde 201 con el test, 422 `{ errors: [{ field, code }] }` si no valida y 409 `code_taken` si el código existe. Escribe con la sesión del usuario (no `service_role`) para que `audit_log` registre al actor.
- `GET /api/tests`: cualquier rol con sesión; devuelve solo `published`, también para el `superuser`.
- Sin sesión, 401; con rol no permitido o perfil inactivo, 403.

**Decisión sobre la pregunta abierta (D-2).** El título y la descripción se guardan en `{ es, en? }`: `es` es obligatorio y `en` opcional (cae a `es`). El título en inglés, si se escribe, cumple las mismas longitudes.

**Interfaz.** `pages/dashboard/tests/index.vue` (lista con filtro) y `pages/dashboard/tests/nuevo.vue` (formulario `UForm`), construidas sobre las plantillas `DashboardManagementList` y `DashboardManagementForm` (TK-S1-15/16). El formulario valida en el cliente con `validateTestInput` y muestra junto al campo los errores que solo conoce el servidor (`code_taken`).

**i18n.** `tests.admin.*`, `errors.test.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU003-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU003-01 | `test/unit/tests/createTest.test.ts` | buildNewTest(input, userId) | `status: draft`, `version: 1`, `created_by: userId` | RF-01 |
| T-HU003-02 | `test/unit/tests/validateTestInput.test.ts` | código 'ab', 'TEST 1', 'TEST_1' | inválido, inválido, válido | RF-02 |
| T-HU003-03 | `test/unit/tests/validateTestInput.test.ts` | título de 2 y de 121 caracteres | ambos inválidos | RF-02 |
| T-HU003-04 | `test/unit/tests/createTest.test.ts` | mapDbError con violación de unicidad (23505) | `{ field: 'code', code: 'code_taken' }` | RF-03 |
| T-HU003-05 | `supabase/tests/tests_structure.test.sql` | `user` consulta un test en `draft` | 0 filas | RF-04 |
| T-HU003-06 | `supabase/tests/audit_log.test.sql` | insertar un test | 1 fila en `audit_log` con `action = insert` | RF-05 |
| T-HU003-07 | `test/unit/tests/filterTests.test.ts` | filterTests(lista, 'draft') | solo los `draft` | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Contenido del test en varios idiomas (ver pregunta abierta).
- **Pregunta abierta:** ¿El título, la descripción y las preguntas del test deben existir en `es` y `en`? Hoy el contenido de `test-1.md` solo está en español.
