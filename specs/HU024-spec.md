# HU024 · Auditoría y trazabilidad

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 7 — Seguridad, privacidad y auditoría**  
> **Dependencias:** [HU001](HU001-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** un registro de cambios **para** saber quién modificó qué en tests, pesos y resultados.

## 2. Criterios de aceptación

- **CA-01.** `audit_log` registra creación, edición, eliminación, publicación y archivo de tests, secciones, preguntas, pesos y plantillas, con actor, fecha y diferencias.
- **CA-02.** Los registros se escriben desde la base (triggers) para que ningún camino de escritura los evite.
- **CA-03.** El registro es de solo lectura y solo `superuser` puede verlo.
- **CA-04.** La vista permite filtrar por entidad, actor y rango de fechas.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | La función `private.audit()` (`security definer`) inserta en `audit_log` actor (`auth.uid()`), acción, entidad, id y `diff` (solo columnas cambiadas) en cada INSERT/UPDATE/DELETE de las tablas de estructura. | CA-01 | T-HU024-01 |
| RF-02 | Los triggers se declaran en la migración de cada tabla de estructura; una prueba lista las tablas sin trigger. | CA-02 | T-HU024-02 |
| RF-03 | `audit_log` no tiene políticas de INSERT/UPDATE/DELETE para ningún rol; solo `superuser` tiene SELECT. | CA-03 | T-HU024-03 |
| RF-04 | `GET /api/admin/audit` filtra por entidad, actor y fechas, con paginación. | CA-04 | T-HU024-04 |

## 4. Diseño técnico

**Datos.** `<ts>_create_audit_log.sql`: tabla `audit_log`, función `private.audit()` y función `private.json_diff(old, new)`. El trigger ya está en `evaluator_patients`; cada tabla de estructura nueva lo declara en su propia migración y la prueba `T-HU024-02` falla si falta. El diff guarda `{ columna: { old, new } }`, una actualización sin cambios no se registra y las escrituras sin sesión de usuario quedan sin actor.

**Lógica.**

```ts
// shared/utils/audit.ts
export function buildAuditQuery(filters: { entity?: string, actorId?: string, from?: string, to?: string, page: number }): AuditQuery
```

**API.** `GET /api/admin/audit?entity=&actor=&from=&to=&page=` (50 por página). Responde 422 con `invalid_entity`, `invalid_actor`, `invalid_date` o `invalid_range`; una página más allá del final devuelve una lista vacía con el total real.

**Interfaz.** `pages/dashboard/auditoria.vue` con `UTable` y filtros (entidad, usuario, rango de fechas), paginación y estados cargando/vacío/error. Solo el `superuser` ve la entrada "Auditoría" del menú y puede abrirla.

**i18n.** `audit.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU024-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU024-01 | `supabase/tests/audit_log.test.sql` | actualizar el título de una pregunta | fila con actor y `diff` solo con `prompt` | RF-01 |
| T-HU024-02 | `supabase/tests/audit_log.test.sql` | tablas de estructura sin trigger de auditoría | ninguna | RF-02 |
| T-HU024-03 | `supabase/tests/audit_log.test.sql` | `superuser` inserta en `audit_log` y `evaluator` lo lee | rechazado; 0 filas | RF-03 |
| T-HU024-04 | `test/unit/audit/buildAuditQuery.test.ts` | filtros de entidad y rango, página 2 | rango y offset correctos | RF-04 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Exportación a sistemas externos.
- **Requisito para las demás historias:** las escrituras que deben quedar atribuidas a una persona se hacen con la sesión del usuario, no con la clave de servicio (la clave de servicio no tiene `auth.uid()`). Las asignaciones de HU001 ya lo hacen así.
