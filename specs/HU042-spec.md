# HU042 · Asignar pacientes a un profesional

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 10 — Profesionales de la salud**  
> **Dependencias:** [HU040](HU040-spec.md), [HU041](HU041-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** asignar pacientes a un profesional **para** que solo vea a las personas que atiende.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un `superuser`, **cuando** abre un profesional en la gestión de usuarios, **entonces** puede asignarle uno o varios pacientes y retirárselos.
- **CA-02.** Solo pueden asignarse pacientes con rol `user` a profesionales activos con rol `professional`; cualquier otra combinación se rechaza con un mensaje claro.
- **CA-03.** Un paciente puede tener varios profesionales y un profesional varios pacientes; la misma pareja no se repite.
- **CA-04.** **Dado** un profesional, **cuando** abre "Mis pacientes", **entonces** ve solo los pacientes asignados a él.
- **CA-05.** **Dado** un paciente, **cuando** abre su perfil, **entonces** ve qué profesionales (nombre y profesión) pueden ver sus resultados.
- **CA-06.** **Dado** que se desactiva a un profesional o se le cambia el rol, **cuando** ocurre, **entonces** sus asignaciones dejan de dar acceso de inmediato.
- **CA-07.** Cada asignación y cada retiro queda en `audit_log`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | La tabla `professional_patients (professional_id, patient_id, assigned_by, created_at)` tiene clave primaria compuesta y claves foráneas a `profiles`. | CA-03 | T-HU042-04 |
| RF-02 | `validateProfessionalAssignment(professional, patient)` exige profesional activo con rol `professional` y paciente con rol `user`; devuelve `invalid_professional` o `invalid_patient`. | CA-02 | T-HU042-01, T-HU042-02 |
| RF-03 | `POST` y `DELETE /api/admin/professional-patients` (solo `superuser`) crean y retiran asignaciones; asignar una pareja existente es idempotente. | CA-01, CA-03 | T-HU042-03 |
| RF-04 | `GET /api/professional/patients` devuelve solo las asignaciones del profesional autenticado. | CA-04 | T-HU042-05 |
| RF-05 | `GET /api/me/professionals` devuelve al paciente los profesionales asignados (nombre y profesión) mediante `listAccessGrants`. | CA-05 | T-HU042-05, T-HU042-07 |
| RF-06 | `private.is_professional_of(patient)` es verdadera solo si existe la fila y el profesional está activo y conserva el rol `professional`. | CA-06 | T-HU042-08 |
| RF-07 | RLS de `professional_patients`: el profesional lee las suyas, el paciente las suyas y el `superuser` todas; solo el `superuser` escribe. | CA-01, CA-04, CA-05 | T-HU042-05, T-HU042-06 |
| RF-08 | Un trigger de auditoría registra altas y bajas en `audit_log`. | CA-07 | T-HU042-09 |

## 4. Diseño técnico

**Datos.** `<ts>_create_professional_patients.sql`: tabla, trigger de validación de roles, trigger de auditoría, RLS y `private.is_professional_of`.

**Lógica.**

```ts
// shared/utils/professional.ts
export function validateProfessionalAssignment(professional: Pick<Profile, 'role' | 'is_active'>, patient: Pick<Profile, 'role'>): ValidationResult
export function listAccessGrants(rows: AssignmentRow[]): AccessGrant[]
```

**API.** `POST/DELETE /api/admin/professional-patients` · `GET /api/professional/patients` · `GET /api/me/professionals`

**Interfaz.** Pestaña "Pacientes" en el detalle del profesional (`dashboard/usuarios/[id]`), `dashboard/profesional/pacientes.vue` y sección "Quién ve mis resultados" en el perfil del paciente.

**i18n.** `professional.patients.*`, `privacy.access.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU042-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU042-01 | `test/unit/professional/assignment.test.ts` | profesional activo con paciente `user` | `ok: true` | RF-02 |
| T-HU042-02 | `test/unit/professional/assignment.test.ts` | evaluador como profesional; profesional inactivo; paciente con rol `evaluator` | `invalid_professional`, `invalid_professional`, `invalid_patient` | RF-02 |
| T-HU042-03 | `test/unit/professional/assignmentHandler.test.ts` | asignar dos veces la misma pareja | una sola fila, sin error | RF-03 |
| T-HU042-04 | `supabase/tests/professional_patients.test.sql` | clave primaria compuesta y claves foráneas | duplicado y perfil inexistente rechazados | RF-01 |
| T-HU042-05 | `supabase/tests/professional_patients.test.sql` | profesional A consulta asignaciones; paciente consulta las suyas | solo las propias | RF-04, RF-05, RF-07 |
| T-HU042-06 | `supabase/tests/professional_patients.test.sql` | `evaluator` y `professional` insertan una asignación | rechazado por RLS | RF-07 |
| T-HU042-07 | `test/unit/professional/assignment.test.ts` | listAccessGrants con 2 filas | nombre y profesión de cada profesional | RF-05 |
| T-HU042-08 | `supabase/tests/professional_patients.test.sql` | is_professional_of con profesional desactivado y con rol cambiado | false en ambos | RF-06 |
| T-HU042-09 | `supabase/tests/audit_log.test.sql` | asignar y retirar | dos filas en `audit_log` | RF-08 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Autoasignación por parte del profesional o solicitud de acceso del profesional al paciente.
- **Fuera de alcance:** Que el paciente revoque el acceso (ver pregunta abierta).
- **Pregunta abierta:** ¿Puede el paciente revocar el acceso de un profesional? Hoy solo lo ve.
- **Pregunta abierta:** ¿Se limita a un profesional por profesión y paciente? Hoy no.
