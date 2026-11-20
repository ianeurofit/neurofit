# HU041 · Elegir la profesión al primer ingreso

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 10 — Profesionales de la salud**  
> **Dependencias:** [HU040](HU040-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** profesional **quiero** elegir mi profesión (psicólogo/a, fisioterapeuta o nutricionista) al entrar por primera vez **para** que la plataforma me muestre lo que corresponde a mi área.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un profesional sin profesión elegida, **cuando** inicia sesión, **entonces** se le lleva a la pantalla de elección y no puede abrir otra vista del panel hasta elegir.
- **CA-02.** La pantalla ofrece exactamente tres opciones (Psicólogo/a, Fisioterapeuta, Nutricionista) y elegir una es obligatoria.
- **CA-03.** **Dado** que confirma su elección, **cuando** se guarda, **entonces** pasa a su panel y en los siguientes ingresos no se le vuelve a pedir.
- **CA-04.** **Dado** un profesional con profesión, **cuando** abre su perfil, **entonces** puede cambiarla; el cambio queda en `audit_log`.
- **CA-05.** Un valor distinto de los tres se rechaza en el cliente, en el servidor y en la base de datos.
- **CA-06.** Solo el propio profesional y el `superuser` pueden leer o cambiar su profesión; el `superuser` puede corregirla desde la gestión de usuarios.
- **CA-07.** La lista de usuarios del `superuser` muestra la profesión de cada profesional y permite filtrar por ella.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | Existen el enum `profession` (`psychologist`, `physiotherapist`, `nutritionist`) y la tabla `professional_profiles (profile_id, profession, selected_at)` con una fila por profesional. | CA-02, CA-05 | T-HU041-01 |
| RF-02 | `validateProfession(value)` acepta solo los tres valores y devuelve `invalid_profession` en cualquier otro caso. | CA-02, CA-05 | T-HU041-04 |
| RF-03 | `needsProfession(profile, professionalProfile)` es verdadero para un `professional` activo sin fila; `resolvePostLoginRoute` lo envía a `/dashboard/profesional/profesion` y el middleware lo mantiene allí. | CA-01 | T-HU041-02, T-HU041-03 |
| RF-04 | `PUT /api/professional/profession` guarda (o cambia) la profesión del profesional autenticado y devuelve 403 a cualquier otro rol. | CA-03, CA-04 | T-HU041-05, T-HU041-06 |
| RF-05 | `PATCH /api/admin/users/:id/profession` permite al `superuser` corregir la profesión de un profesional. | CA-06 | T-HU041-07 |
| RF-06 | RLS: el profesional lee y modifica solo su fila; el `superuser` todas; los demás roles ninguna. | CA-06 | T-HU041-08 |
| RF-07 | Un trigger rechaza crear la fila si el perfil no tiene rol `professional` y la elimina si deja de tenerlo. | CA-06 | T-HU041-09 |
| RF-08 | Un trigger de auditoría registra cada alta y cambio en `audit_log`. | CA-04 | T-HU041-10 |
| RF-09 | `filterUsersByProfession(users, profession)` filtra la lista de usuarios; la lista muestra la profesión de cada profesional. | CA-07 | T-HU041-11 |
| RF-10 | Existen las claves `professions.psychologist`, `professions.physiotherapist` y `professions.nutritionist` en `es` y `en`. | CA-02 | T-HU041-12 |

## 4. Diseño técnico

**Datos.** `<ts>_create_professional_profiles.sql`: enum `profession`, tabla `professional_profiles`, triggers de rol y de auditoría, RLS.

**Lógica.**

```ts
// shared/utils/professional.ts
export function validateProfession(value: unknown): ValidationResult
export function needsProfession(profile: Pick<Profile, 'role' | 'is_active'>, pp: ProfessionalProfile | null): boolean
export function filterUsersByProfession<T extends { profession?: Profession }>(users: T[], profession?: Profession): T[]
// shared/utils/auth.ts  (resolvePostLoginRoute de HU001 se amplía)
// app/composables/useProfessional.ts
export function useProfessional(): { professional, profession, select(profession), change(profession) }
```

**API.** `PUT /api/professional/profession` · `PATCH /api/admin/users/:id/profession` · `GET /api/professional/me`

**Interfaz.** `pages/dashboard/profesional/profesion.vue` (tres tarjetas de elección), sección "Mi profesión" en el perfil, columna y filtro en `dashboard/usuarios`.

**i18n.** `professions.*`, `dashboard.professional.profession.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU041-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU041-01 | `supabase/tests/professional_profiles.test.sql` | enum `profession` y tabla `professional_profiles` | existen con los tres valores y una fila por profesional | RF-01 |
| T-HU041-02 | `test/unit/professional/professional.test.ts` | needsProfession para profesional con y sin fila, y para un `user` | true, false, false | RF-03 |
| T-HU041-03 | `test/unit/auth/auth.test.ts` | resolvePostLoginRoute de profesional sin profesión | `/dashboard/profesional/profesion` | RF-03 |
| T-HU041-04 | `test/unit/professional/professional.test.ts` | validateProfession('psychologist'), ('doctor'), (null) | ok, `invalid_profession`, `invalid_profession` | RF-02 |
| T-HU041-05 | `test/nuxt/composables/useProfessional.test.ts` | select('nutritionist') | llama a `PUT /api/professional/profession` y actualiza el estado | RF-04 |
| T-HU041-06 | `test/unit/professional/professionHandler.test.ts` | guardar profesión como `professional` y como `user` | guardado; 403 | RF-04 |
| T-HU041-07 | `test/unit/professional/professionHandler.test.ts` | superuser corrige la profesión de otro profesional | guardado | RF-05 |
| T-HU041-08 | `supabase/tests/professional_profiles.test.sql` | profesional A lee y modifica la fila de B; un `user` lee la tabla | rechazado; 0 filas | RF-06 |
| T-HU041-09 | `supabase/tests/professional_profiles.test.sql` | insertar fila para un `user`; cambiar el rol de un profesional | rechazado; la fila desaparece | RF-07 |
| T-HU041-10 | `supabase/tests/audit_log.test.sql` | cambiar la profesión | fila en `audit_log` con valor anterior y nuevo | RF-08 |
| T-HU041-11 | `test/unit/professional/professional.test.ts` | filterUsersByProfession con 4 usuarios | solo los de esa profesión | RF-09 |
| T-HU041-12 | `test/unit/i18n/keysParity.test.ts` | claves `professions.*` | existen en `es` y `en` | RF-10 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Profesiones adicionales (se añaden con una migración y una clave de traducción).
- **Fuera de alcance:** Verificación de títulos o tarjeta profesional.
- **Pregunta abierta:** ¿Se necesita validar la profesión con un documento (tarjeta profesional)? (hoy: declaración propia)
