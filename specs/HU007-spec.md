# HU007 · Publicar, versionar y archivar un test

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU003](HU003-spec.md), [HU004](HU004-spec.md), [HU005](HU005-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** publicar una versión estable del test **para** que pacientes y evaluadores puedan usarla.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un test en `draft`, **cuando** lo publico, **entonces** se valida que cada sección tenga ≥ 1 pregunta activa y cada pregunta cumpla su configuración; si algo falla, se lista cada error y no se publica.
- **CA-02.** **Dado** que la validación pasa, **cuando** confirmo, **entonces** el test pasa a `published` y queda en `audit_log`.
- **CA-03.** **Dado** un test publicado, **cuando** necesito cambios estructurales, **entonces** se crea la versión n+1 en `draft` como copia, sin afectar la versión en uso.
- **CA-04.** **Dado** que publico la versión n+1, **cuando** se publica, **entonces** la versión n pasa a `archived` y las evaluaciones en curso terminan con la versión con la que empezaron.
- **CA-05.** **Dado** un test archivado, **cuando** un paciente intenta iniciarlo, **entonces** no está disponible, pero sus resultados históricos siguen accesibles.
- **CA-06.** Cada `assessment` guarda `test_version`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `validateForPublish(test)` devuelve la lista completa de errores: sección sin preguntas activas, configuración inválida (HU005) y condición inválida (HU006). | CA-01 | T-HU007-01, T-HU007-02 |
| RF-02 | Con la lista vacía, `POST /api/admin/tests/:id/publish` cambia el estado a `published` y lo registra en `audit_log`. | CA-02 | T-HU007-03 |
| RF-03 | `cloneTestVersion(test)` copia secciones, preguntas, opciones y condiciones a `version + 1` en `draft`, con `parent_test_id` = original. | CA-03 | T-HU007-04 |
| RF-04 | Publicar la versión n+1 archiva la n en la misma transacción; las evaluaciones en curso conservan su `test_version`. | CA-04 | T-HU007-05 |
| RF-05 | `POST /api/assessments` rechaza con 409 `test_unavailable` un test `archived`; sus resultados siguen accesibles por RLS. | CA-05 | T-HU007-06 |
| RF-06 | `assessments.test_version` es obligatorio y se copia del test al crear la evaluación. | CA-06 | T-HU007-07 |

## 4. Diseño técnico

**Datos.** `tests.parent_test_id`; función SQL `publish_test(test_id)` (`security definer`, solo `superuser`) que publica y archiva en una transacción.

**Lógica.**

```ts
// shared/utils/publish.ts
export function validateForPublish(test: TestTree): PublishError[]   // { sectionCode?, questionCode?, code }
export function cloneTestVersion(test: TestTree): TestTree
```

**API.** `POST /api/admin/tests/:id/publish` · `POST /api/admin/tests/:id/new-version` · `POST /api/admin/tests/:id/archive`

- `POST /api/admin/tests/:id/publish`: solo `superuser`. Lee el árbol del test, corre `validateForPublish` y, si hay errores, responde 422 `{ errors: [{ sectionCode?, questionCode?, field?, code }] }` sin cambiar nada. Si no, llama a `publish_test`. 409 `not_draft` si el test no es borrador; 404 si no existe.
- `POST /api/admin/tests/:id/new-version`: solo desde un test `published` (409 `not_published`). Copia el árbol con `cloneTestVersion` y lo inserta con `create_test_version`. Responde 201 `{ id, version, status: 'draft' }`. 409 `draft_exists` si el código ya tiene un borrador. El número es la versión más alta del código + 1, aunque esa versión sea un borrador archivado.
- `POST /api/admin/tests/:id/archive`: archiva un test `draft` o `published`; 409 `already_archived`. No se puede deshacer.
- Sin sesión, 401; con rol no permitido, 403. Los cambios de estado quedan en `audit_log` con el actor.

**Datos (detalle).** Migración `20261120140000_publish_tests.sql`. La unicidad de `tests.code` pasa a `(code, version)`, porque las versiones comparten código. Índices parciales: como mucho un borrador y un publicado por código. Un test nuevo sigue sin poder reusar un código existente, porque todo código tiene versión 1. `publish_test(test)` es `security definer`, comprueba `private.is_superuser()` y archiva la versión publicada del mismo código antes de publicar, en la misma transacción. `create_test_version(tree)` es `security invoker` e inserta test, secciones, preguntas (con condición y estado activo) y opciones en una transacción.

**Validación (detalle).** Solo se revisan las preguntas activas. Errores: `no_sections`, `empty_section` (por sección), los de `validateQuestionInput` (HU005) y los de `conditionErrors` (HU006). Además, `inactive_dependency` cuando una pregunta activa depende de una inactiva. El cliente corre la misma validación antes de enviar, y el servidor la repite.

**Evaluaciones.** `shared/utils/assessment.ts` tiene `startAssessment` (rechaza con `test_unavailable` un test que no esté `published`) y `buildAssessment` (copia `test_version`). La tabla `assessments`, `POST /api/assessments` y su RLS llegan con HU011, que debe usar estas funciones.

**Interfaz.** En la estructura del test (`pages/dashboard/tests/[id]/index.vue`): botón "Publicar" en borradores, que muestra el panel de errores agrupado por sección (`PublishErrors.vue`) o, sin errores, pide confirmación. Botón "Nueva versión" en tests publicados, que abre el borrador nuevo. Botón "Archivar" con confirmación, y aviso de test archivado.

**i18n.** `tests.publish.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU007-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU007-01 | `test/unit/publish/validateForPublish.test.ts` | sección sin preguntas activas | error `empty_section` con el código de la sección | RF-01 |
| T-HU007-02 | `test/unit/publish/validateForPublish.test.ts` | test con 2 problemas distintos | 2 errores | RF-01 |
| T-HU007-03 | `test/unit/publish/validateForPublish.test.ts` | test válido | [] | RF-02 |
| T-HU007-04 | `test/unit/publish/cloneTestVersion.test.ts` | clonar test v1 con condiciones | v2 `draft`, mismos códigos, condiciones intactas, `parent_test_id` = v1 | RF-03 |
| T-HU007-05 | `supabase/tests/publish_test.test.sql` | publicar v2 con v1 publicada | v1 `archived`, v2 `published` | RF-04 |
| T-HU007-06 | `test/unit/assessment/startAssessment.test.ts` | iniciar evaluación de un test `archived` | `test_unavailable` | RF-05 |
| T-HU007-07 | `test/unit/assessment/startAssessment.test.ts` | buildAssessment(test v3) | `test_version: 3` | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Programar publicaciones a futuro.
