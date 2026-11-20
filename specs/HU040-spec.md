# HU040 · Asignar el rol de profesional

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 10 — Profesionales de la salud**  
> **Dependencias:** [HU001](HU001-spec.md), [HU024](HU024-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** crear usuarios con el rol `professional` o cambiar a este rol a un usuario existente **para** habilitar a psicólogos, fisioterapeutas y nutricionistas en la plataforma.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un `superuser` en la gestión de usuarios, **cuando** crea un usuario y elige el rol "Profesional", **entonces** el perfil queda con `role = 'professional'`, activo, y aparece en la lista con ese rol.
- **CA-02.** **Dado** un usuario existente, **cuando** el `superuser` cambia su rol a "Profesional", **entonces** conserva su cuenta y datos; si el rol anterior tenía asignaciones de pacientes, se pide confirmación indicando cuántas se eliminarán.
- **CA-03.** **Dado** un usuario que no es `superuser`, **cuando** intenta asignar o cambiar un rol (interfaz, API o SQL), **entonces** se rechaza; un profesional tampoco puede cambiar su propio rol.
- **CA-04.** **Dado** un profesional activo, **cuando** inicia sesión, **entonces** llega a su panel `/dashboard/profesional`; no ve gestión de tests, usuarios ni auditoría, y una ruta no permitida lo devuelve a su inicio.
- **CA-05.** **Dado** un profesional desactivado, **cuando** intenta iniciar sesión, **entonces** se cierra su sesión con el mensaje de cuenta inactiva.
- **CA-06.** **Dado** el rol nuevo, **cuando** se muestra en listas, formularios o selectores, **entonces** aparece traducido (`es` y `en`) con icono y color propios.
- **CA-07.** **Dado** una asignación o un cambio de rol, **cuando** se guarda, **entonces** queda en `audit_log` con el usuario afectado y los roles anterior y nuevo.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | La migración `ALTER TYPE user_role ADD VALUE 'professional'` va en un archivo propio, separado de cualquier uso del valor. | CA-01 | T-HU040-01 |
| RF-02 | `USER_ROLES`, `ROLE_HOME`, `ROLE_COLORS` y `ROLE_ICONS` incluyen `professional` (inicio `/dashboard/profesional`); `assertRole` lo acepta y rechaza cualquier otro valor. | CA-01, CA-06 | T-HU040-02 |
| RF-03 | `canAccessArea` permite las rutas `dashboard-profesional*` solo a `professional`; `buildDashboardMenu('professional')` incluye inicio, pacientes y perfil, y nada de gestión. | CA-04 | T-HU040-03 |
| RF-04 | `planRoleChange(current, next, assignments)` devuelve `{ needsConfirm, removed }`: cambiar desde `evaluator` o `professional` a otro rol elimina sus asignaciones; `PATCH /api/admin/users/:id` exige `?confirm=true` cuando `needsConfirm`. | CA-02 | T-HU040-04, T-HU040-05 |
| RF-05 | `POST /api/admin/users` y `PATCH /api/admin/users/:id` aceptan `role = 'professional'` solo desde `requireSuperuser`. | CA-01, CA-03 | T-HU040-06 |
| RF-06 | `guard_profile_privileges` sigue impidiendo que un no-`superuser` cambie `role`, incluido un profesional sobre su propio perfil. | CA-03 | T-HU040-07 |
| RF-07 | `private.is_staff()` **no** incluye `professional`: el profesional lee únicamente su propio perfil. | CA-03, CA-04 | T-HU040-08 |
| RF-08 | `checkRoleAccess` devuelve 403 para un profesional inactivo y el middleware cierra su sesión con `cuenta-inactiva`. | CA-05 | T-HU040-09 |
| RF-09 | Un trigger en `profiles` registra en `audit_log` cada cambio de `role` con el rol anterior y el nuevo. | CA-07 | T-HU040-10 |
| RF-10 | Existen las claves `roles.professional.label` y `roles.professional.description` en `es` y `en`. | CA-06 | T-HU040-11 |

## 4. Diseño técnico

**Datos.** `<ts>_add_professional_role.sql` (solo el valor del enum) y `<ts>_audit_profile_roles.sql` (trigger de auditoría sobre `profiles`).

**Lógica.**

```ts
// shared/utils/roles.ts
export function planRoleChange(current: UserRole, next: UserRole, assignments: number): { needsConfirm: boolean, removed: number }
// app/types/user.ts  (se amplían USER_ROLES, ROLE_HOME, ROLE_COLORS, ROLE_ICONS)
// shared/utils/auth.ts  (se amplían canAccessArea y buildDashboardMenu de HU001)
```

**API.** Se amplían `POST /api/admin/users` y `PATCH /api/admin/users/:id`.

**Interfaz.** Selector de rol en `dashboard/usuarios/nuevo.vue` y en la edición; página `dashboard/profesional/index.vue` (inicio).

**i18n.** `roles.professional.*`, `dashboard.professional.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU040-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU040-01 | `supabase/tests/roles.test.sql` | valores del enum `user_role` | incluye `professional` | RF-01 |
| T-HU040-02 | `test/unit/roles/roles.test.ts` | mapas de roles y assertRole | cada rol tiene inicio, color e icono; `professional` válido, `admin` inválido | RF-02 |
| T-HU040-03 | `test/unit/auth/auth.test.ts` | canAccessArea y buildDashboardMenu con `professional` | solo su área; menú sin gestión | RF-03 |
| T-HU040-04 | `test/unit/roles/planRoleChange.test.ts` | evaluator con 3 pacientes pasa a professional | `needsConfirm: true`, `removed: 3` | RF-04 |
| T-HU040-05 | `test/unit/roles/planRoleChange.test.ts` | user pasa a professional | `needsConfirm: false` | RF-04 |
| T-HU040-06 | `test/unit/roles/adminUsersHandler.test.ts` | crear usuario con rol `professional` como `superuser` y como `evaluator` | creado; 403 | RF-05 |
| T-HU040-07 | `supabase/tests/profiles.test.sql` | un `professional` actualiza su propio `role` | error de privilegios | RF-06 |
| T-HU040-08 | `supabase/tests/profiles.test.sql` | un `professional` consulta `profiles` | solo su fila | RF-07 |
| T-HU040-09 | `test/unit/auth/auth.test.ts` | checkRoleAccess con profesional inactivo | 403 | RF-08 |
| T-HU040-10 | `supabase/tests/audit_log.test.sql` | cambiar el rol de un usuario | fila con rol anterior y nuevo | RF-09 |
| T-HU040-11 | `test/unit/i18n/keysParity.test.ts` | claves `roles.professional.*` | existen en `es` y `en` | RF-10 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Roles personalizados creados por el super admin.
- **Fuera de alcance:** Un usuario con dos roles a la vez.
- **Pregunta abierta:** ¿Un profesional también puede ser paciente de la plataforma con otra cuenta? (hoy: sí, con otro correo)
