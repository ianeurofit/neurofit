# HU001 · Inicio de sesión con roles

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 1 — Acceso, roles y consentimiento**  
> **Dependencias:** —  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** usuario de Neurofit **quiero** iniciar sesión y ser dirigido a mi área según mi rol **para** ver solo lo que me corresponde.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un usuario con rol `user` y credenciales válidas, **cuando** inicia sesión, **entonces** llega a su panel y el menú no muestra ninguna opción de gestión de tests.
- **CA-02.** **Dado** un usuario `evaluator`, **cuando** inicia sesión, **entonces** ve la lista de sus pacientes asignados y puede iniciar una evaluación.
- **CA-03.** **Dado** un usuario `superuser`, **cuando** inicia sesión, **entonces** ve además la sección "Gestión de evaluaciones".
- **CA-04.** **Dado** credenciales inválidas, **cuando** intenta iniciar sesión, **entonces** ve un mensaje genérico traducido que no revela si el correo existe.
- **CA-05.** **Dado** un usuario recién registrado, **cuando** se crea su perfil, **entonces** recibe el rol `user` por defecto y solo un `superuser` puede cambiarle el rol.
- **CA-06.** **Dado** un usuario sin rol `superuser`, **cuando** abre una ruta de gestión por URL o llama a su API, **entonces** la UI lo redirige, la API responde 403 y la BD rechaza la escritura por RLS.
- **CA-07.** **Dado** una sesión expirada, **cuando** el usuario navega a una vista protegida, **entonces** se le pide iniciar sesión y vuelve a la ruta original al autenticarse.
- **CA-08.** **Dado** un usuario autenticado, **cuando** cierra sesión, **entonces** la sesión se elimina y el botón "atrás" no muestra vistas protegidas.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `resolveHomeRoute(role)` devuelve la ruta de `ROLE_HOME` del rol (`user` → `/dashboard/usuario`, `evaluator` → `/dashboard/evaluador`, `superuser` → `/dashboard/superusuario`). | CA-01, CA-02, CA-03 | T-HU001-01 |
| RF-02 | `canAccessArea(routeName, role)` permite las rutas `dashboard-tests*` solo a `superuser` y `dashboard-pacientes*` solo a `evaluator` y `superuser`; el middleware `roles.global.ts` usa esta función. | CA-01, CA-03, CA-06 | T-HU001-02 |
| RF-03 | `buildDashboardMenu(role)` incluye "Gestión de evaluaciones" solo para `superuser` y "Mis pacientes" para `evaluator`. | CA-01, CA-02, CA-03 | T-HU001-03, T-HU001-04 |
| RF-04 | `GET /api/evaluator/patients` devuelve solo los pacientes con fila en `evaluator_patients` para el evaluador autenticado. | CA-02 | T-HU001-05 |
| RF-05 | `POST /api/admin/evaluator-patients` (solo `superuser`) asigna un paciente a un evaluador; `validateAssignment` exige que el evaluador tenga rol `evaluator` y el paciente rol `user`. | CA-02 | T-HU001-06 |
| RF-06 | `mapAuthError(error)` devuelve la misma clave `auth.errors.invalidCredentials` para credenciales inválidas y usuario inexistente. | CA-04 | T-HU001-07 |
| RF-07 | El trigger existente crea el perfil con rol `user`; `guard_profile_privileges` impide que un usuario cambie su propio rol. | CA-05 | T-HU001-08 |
| RF-08 | `checkRoleAccess(profile, allowed)` devuelve 401 sin perfil, 403 si el rol no está permitido o el perfil está inactivo, y `ok` en otro caso; `requireRole(event, roles)` la usa en todos los endpoints del módulo. | CA-06 | T-HU001-09, T-HU001-10 |
| RF-09 | Las tablas del módulo solo aceptan escrituras de estructura cuando `private.is_superuser()` es verdadero. | CA-06 | T-HU001-11 |
| RF-10 | `safeRedirect(param)` acepta solo rutas internas que empiezan por `/` (no `//` ni URLs absolutas); si no, devuelve `/dashboard`. | CA-07 | T-HU001-12 |
| RF-11 | `useProfile().signOut()` limpia el estado del perfil y navega a `/login`. | CA-08 | T-HU001-13 |

## 4. Diseño técnico

**Datos.** `supabase/migrations/<ts>_create_evaluator_patients.sql`: tabla `evaluator_patients (evaluator_id, patient_id, assigned_by, created_at)`, PK `(evaluator_id, patient_id)`, RLS (§7.4) y función `private.is_evaluator_of(patient uuid)`.

**Lógica.**

```ts
// shared/utils/auth.ts
export function resolveHomeRoute(role: UserRole): string
export function canAccessArea(routeName: string, role: UserRole): boolean
export function buildDashboardMenu(role: UserRole): MenuItem[]
export function mapAuthError(error: { message?: string, code?: string }): string
export function safeRedirect(param: unknown): string
export function checkRoleAccess(profile: Pick<Profile, 'role' | 'is_active'> | null, allowed: UserRole[]): 'ok' | 401 | 403
export function validateAssignment(evaluator: { role: UserRole }, patient: { role: UserRole }): ValidationResult
// server/utils/requireRole.ts
export async function requireRole(event: H3Event, roles: UserRole[]): Promise<{ userId: string, role: UserRole }>
```

**API.** `GET /api/evaluator/patients` · `POST /api/admin/evaluator-patients` · `DELETE /api/admin/evaluator-patients/:evaluatorId/:patientId`

**Interfaz.** Menú del layout `dashboard` construido con `buildDashboardMenu` (oculta las entradas cuyas páginas aún no existen); página `dashboard/pacientes/index.vue` (lista de pacientes asignados); en `dashboard/usuarios`, acción "Asignar evaluador".

**i18n.** `auth.errors.*`, `dashboard.nav.*`, `patients.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU001-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU001-01 | `test/unit/auth/auth.test.ts` | resolveHomeRoute para cada rol | ruta de `ROLE_HOME` | RF-01 |
| T-HU001-02 | `test/unit/auth/auth.test.ts` | canAccessArea(`dashboard-tests`) con `superuser`, `evaluator` y `user` | true, false, false | RF-02 |
| T-HU001-03 | `test/unit/auth/auth.test.ts` | buildDashboardMenu(`user`) | sin "tests" ni "patients" | RF-03 |
| T-HU001-04 | `test/unit/auth/auth.test.ts` | buildDashboardMenu(`evaluator`) y (`superuser`) | `patients` sin `tests`; `superuser` incluye `tests` | RF-03 |
| T-HU001-05 | `supabase/tests/evaluator_patients.test.sql` | evaluador A consulta `evaluator_patients` | solo ve sus filas | RF-04 |
| T-HU001-06 | `test/unit/auth/auth.test.ts` | validateAssignment con evaluador de rol `user` | `ok: false` | RF-05 |
| T-HU001-07 | `test/unit/auth/auth.test.ts` | mapAuthError con "Invalid login credentials" y "User not found" | la misma clave | RF-06 |
| T-HU001-08 | `supabase/tests/profiles.test.sql` | un `user` actualiza su propio `role` | error de privilegios | RF-07 |
| T-HU001-09 | `test/unit/auth/auth.test.ts` | checkRoleAccess(null, …) | 401 | RF-08 |
| T-HU001-10 | `test/unit/auth/auth.test.ts` | checkRoleAccess con rol no permitido y con perfil inactivo | 403 en ambos casos | RF-08 |
| T-HU001-11 | `supabase/tests/tests_structure.test.sql` | `evaluator` inserta en `tests` | rechazado por RLS | RF-09 |
| T-HU001-12 | `test/unit/auth/auth.test.ts` | safeRedirect('//evil.com'), ('https://x.y') y ('/dashboard/usuario') | `/dashboard`, `/dashboard`, `/dashboard/usuario` | RF-10 |
| T-HU001-13 | `test/nuxt/composables/useProfile.test.ts` | signOut() | `profile` = null y `navigateTo('/login')` | RF-11 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Registro con proveedores sociales.
- **Fuera de alcance:** Gestión de usuarios y asignación de pacientes (spec aparte).
- **Pendiente:** la acción "Asignar evaluador" en `dashboard/usuarios` (interfaz) no está en las tareas de esta historia; hoy la asignación se hace por la API `POST /api/admin/evaluator-patients`.
- **Pregunta abierta:** ¿Cómo se asignan pacientes a evaluadores (manual por super admin o invitación)? (plan §12.4)
