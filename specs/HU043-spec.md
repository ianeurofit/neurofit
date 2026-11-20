# HU043 · Panel del profesional y lectura de resultados

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 10 — Profesionales de la salud**  
> **Dependencias:** [HU042](HU042-spec.md), [HU020](HU020-spec.md), [HU021](HU021-spec.md), [HU022](HU022-spec.md), [HU023](HU023-spec.md), [HU025](HU025-spec.md), [HU002](HU002-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** profesional **quiero** ver los resultados de mis pacientes asignados **para** orientar mi atención desde mi área.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un profesional, **cuando** abre su panel, **entonces** ve sus pacientes asignados con el estado de su última evaluación (sin evaluar, en curso, completada), el nivel de alerta más alto y la fecha.
- **CA-02.** **Dado** un paciente asignado con una evaluación completada, **cuando** abre su ficha, **entonces** ve Hallazgos, Riesgos y factores, Índice y Plan, con el descargo y la versión del modelo.
- **CA-03.** El acceso es de solo lectura: el profesional no crea, completa ni edita evaluaciones ni respuestas.
- **CA-04.** El profesional no ve respuestas individuales, mensajes de conversación, notas del evaluador ni las respuestas que originan cada hallazgo.
- **CA-05.** **Dado** un paciente no asignado, **cuando** el profesional intenta abrir su ficha (URL o API), **entonces** recibe 403 y la base de datos no devuelve filas.
- **CA-06.** **Dado** un paciente sin evaluaciones completadas, **cuando** se abre su ficha, **entonces** se indica que aún no hay resultados.
- **CA-07.** Las alertas activas de sus pacientes aparecen destacadas en el panel.
- **CA-08.** **Dado** un paciente cuyo consentimiento vigente no incluye compartir con profesionales, **cuando** el profesional abre su ficha, **entonces** ve que falta el consentimiento y ningún resultado.
- **CA-09.** Cada apertura de una ficha queda registrada en `audit_log` con el profesional, el paciente y la fecha.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `summarizePatient(assessments, results)` devuelve estado de la última evaluación, nivel de alerta más alto y fecha, o `none` si no hay evaluaciones. | CA-01, CA-06, CA-07 | T-HU043-01, T-HU043-02 |
| RF-02 | `GET /api/professional/patients` incluye ese resumen para cada paciente asignado. | CA-01, CA-07 | T-HU043-03 |
| RF-03 | `GET /api/professional/patients/:patientId/results` responde 403 si `is_professional_of` es falso y devuelve la última evaluación completada. | CA-02, CA-05 | T-HU043-04 |
| RF-04 | `toProfessionalView(result)` conserva hallazgos, factores, índice, plan y descargo, y elimina respuestas, evidencia, notas y mensajes. | CA-02, CA-04 | T-HU043-05 |
| RF-05 | RLS: `professional` solo lee `assessments` y `assessment_results` de pacientes asignados; no tiene acceso a `answers`, `conversations`, `messages`, `section_notes`, `extraction_events` ni `safety_events`. | CA-03, CA-04, CA-05 | T-HU043-06 |
| RF-06 | Todo endpoint de escritura del módulo responde 403 a un `professional`. | CA-03 | T-HU043-07 |
| RF-07 | `validateConsentBody` exige además la sección `shareWithProfessionals`; `hasSharingConsent(consents, currentVersion)` es verdadero solo si la versión aceptada la incluye. | CA-08 | T-HU043-08 |
| RF-08 | Sin consentimiento de compartir, el endpoint devuelve `consent_missing_sharing` y ningún dato clínico. | CA-08 | T-HU043-09 |
| RF-09 | `recordAccess(event, patientId, resource)` escribe en `audit_log` cada lectura de una ficha. | CA-09 | T-HU043-10 |
| RF-10 | La ficha muestra estados de carga, vacío y error; se usa a 320 px y en ambos temas. | CA-02, CA-06 | T-HU043-11 |

## 4. Diseño técnico

**Datos.** `<ts>_professional_read_policies.sql`: políticas de lectura para `professional` sobre `assessments` y `assessment_results`; `<ts>_consent_sharing.sql`: nueva versión de `consent_versions` con la sección `shareWithProfessionals`.

**Lógica.**

```ts
// shared/utils/professionalView.ts
export function summarizePatient(assessments: AssessmentRow[], results: ResultRow[]): PatientSummary
export function toProfessionalView(result: AssessmentResult): ProfessionalResultView
// shared/utils/consent.ts  (se amplían validateConsentBody y se añade hasSharingConsent)
export function hasSharingConsent(consents: { version: string }[], currentVersion: string): boolean
// server/utils/audit.ts
export async function recordAccess(event: H3Event, patientId: string, resource: string): Promise<void>
```

**API.** `GET /api/professional/patients` · `GET /api/professional/patients/:patientId/results`

**Interfaz.** `dashboard/profesional/index.vue` (tarjetas de pacientes con alertas) y `dashboard/profesional/pacientes/[patientId].vue` (ficha de solo lectura).

**i18n.** `professional.panel.*`, `professional.patient.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU043-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU043-01 | `test/unit/professional/summarizePatient.test.ts` | tres evaluaciones, la última completada con alerta `orange` | estado `completed`, alerta `orange`, fecha de la última | RF-01 |
| T-HU043-02 | `test/unit/professional/summarizePatient.test.ts` | paciente sin evaluaciones | estado `none` | RF-01 |
| T-HU043-03 | `test/unit/professional/professionalHandlers.test.ts` | listar pacientes de un profesional con 2 asignados | dos resúmenes | RF-02 |
| T-HU043-04 | `test/unit/professional/professionalHandlers.test.ts` | resultados de un paciente no asignado | 403 | RF-03 |
| T-HU043-05 | `test/unit/professional/toProfessionalView.test.ts` | resultado con evidencia y respuestas | la vista no contiene `evidence` ni respuestas | RF-04 |
| T-HU043-06 | `supabase/tests/professional_patients.test.sql` | profesional asignado lee `assessment_results`; no asignado; lee `answers` | filas visibles; 0 filas; 0 filas | RF-05 |
| T-HU043-07 | `test/unit/professional/professionalHandlers.test.ts` | crear o editar una respuesta como `professional` | 403 | RF-06 |
| T-HU043-08 | `test/unit/consent/consent.test.ts` | hasSharingConsent con versión sin y con `shareWithProfessionals` | false, true | RF-07 |
| T-HU043-09 | `test/unit/professional/professionalHandlers.test.ts` | ficha de paciente sin consentimiento de compartir | `consent_missing_sharing` y cuerpo vacío | RF-08 |
| T-HU043-10 | `test/unit/professional/recordAccess.test.ts` | abrir una ficha | una fila de acceso con profesional, paciente y recurso | RF-09 |
| T-HU043-11 | `test/nuxt/pages/professionalPatient.test.ts` | montar la ficha en carga, vacío y error | muestra el estado correcto en cada caso | RF-10 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Contacto o mensajería entre profesional y paciente.
- **Fuera de alcance:** Ver respuestas individuales (ver pregunta abierta).
- **Pregunta abierta:** ¿El profesional debe ver las respuestas de los dominios de su profesión (ej. nutrición)? Hoy no ve ninguna respuesta individual.
- **Pregunta abierta:** Texto legal de compartir datos con profesionales, a validar con asesor legal.
- **Pregunta abierta:** Texto legal de la cláusula de compartir con profesionales, a validar con asesor legal.
