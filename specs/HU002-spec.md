# HU002 · Consentimiento informado antes de evaluar

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 1 — Acceso, roles y consentimiento**  
> **Dependencias:** [HU001](HU001-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** leer y aceptar cómo se usarán mis datos **para** decidir con confianza si continúo.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un paciente sin consentimiento vigente, **cuando** intenta iniciar una evaluación, **entonces** se le muestra el consentimiento y no puede continuar sin aceptarlo.
- **CA-02.** **Dado** el consentimiento en pantalla, **cuando** el paciente acepta, **entonces** se crea un registro en `consents` (paciente, versión, fecha) y se vincula a la `assessment`.
- **CA-03.** **Dado** el consentimiento en pantalla, **cuando** el paciente lo rechaza, **entonces** vuelve a su panel y no se crea ninguna `assessment`.
- **CA-04.** **Dado** una nueva versión del texto, **cuando** el paciente inicia una nueva evaluación, **entonces** debe aceptar la versión nueva.
- **CA-05.** **Dado** una evaluación iniciada por un evaluador, **cuando** el paciente no tiene consentimiento vigente, **entonces** la evaluación no pasa a `in_progress`.
- **CA-06.** El texto explica que el resultado **no es un diagnóstico médico**, qué datos se recogen, el uso de un proveedor de IA y el derecho a descargar y eliminar los datos.
- **CA-07.** El consentimiento se muestra en el idioma activo (`es` o `en`) y la versión aceptada se puede consultar después desde el perfil.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `hasValidConsent(consents, currentVersion)` es verdadero solo si existe un consentimiento del paciente con la versión vigente. | CA-01, CA-04, CA-05 | T-HU002-01, T-HU002-02 |
| RF-02 | `POST /api/assessments` responde 409 `consent_required` si el paciente no tiene consentimiento vigente. | CA-01 | T-HU002-03 |
| RF-03 | `POST /api/consents` crea una fila en `consents` con paciente, versión vigente y fecha, y la vincula a la evaluación indicada. | CA-02 | T-HU002-04 |
| RF-04 | Rechazar el consentimiento no llama a ningún endpoint de escritura y navega al panel del paciente. | CA-03 | T-HU002-05 |
| RF-05 | `startAssessment` no cambia el estado a `in_progress` si `hasValidConsent` es falso, aunque la inicie un evaluador. | CA-05 | T-HU002-03 |
| RF-06 | `consent_versions.body` tiene el texto en `es` y `en`; `localize(body, locale)` lo devuelve en el idioma activo con respaldo a `es`. | CA-06, CA-07 | T-HU002-06 |
| RF-07 | El texto vigente contiene obligatoriamente las secciones `noDiagnosis`, `dataUse`, `aiProvider` y `rights`; `validateConsentBody` lo comprueba al publicar una versión. | CA-06 | T-HU002-07 |
| RF-08 | `GET /api/consents/me` devuelve las versiones aceptadas por el paciente con fecha. | CA-07 | T-HU002-08 |

## 4. Diseño técnico

**Datos.** `<ts>_create_consents.sql`: `consent_versions (version pk, body jsonb, published_at)` y `consents (id, patient_id, version, accepted_at)`; RLS: el paciente lee y crea solo los suyos; `superuser` lee todo.

**Lógica.**

```ts
// shared/utils/consent.ts
export function hasValidConsent(consents: { version: string }[], currentVersion: string): boolean
export function validateConsentBody(body: Record<string, LocalizedText>): ValidationResult
// shared/utils/i18n.ts
export function localize(text: LocalizedText, locale: Locale): string
// app/composables/useConsent.ts
export function useConsent(): { current, accepted, accept(assessmentId?: string), reject() }
```

**API.** `GET /api/consents/current` · `POST /api/consents` · `GET /api/consents/me`

**Interfaz.** `components/assessment/ConsentGate.vue` (modal bloqueante antes de iniciar); historial en el perfil del paciente.

**i18n.** `consent.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU002-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU002-01 | `test/unit/consent/consent.test.ts` | hasValidConsent sin consentimientos | false | RF-01 |
| T-HU002-02 | `test/unit/consent/consent.test.ts` | hasValidConsent con versión anterior y con versión vigente | false, true | RF-01 |
| T-HU002-03 | `test/unit/assessment/startAssessment.test.ts` | crear evaluación sin consentimiento vigente | error `consent_required` | RF-02, RF-05 |
| T-HU002-04 | `test/nuxt/composables/useConsent.test.ts` | accept(assessmentId) | llama `POST /api/consents` con la versión vigente y el id | RF-03 |
| T-HU002-05 | `test/nuxt/composables/useConsent.test.ts` | reject() | no llama a `$fetch` y navega al panel | RF-04 |
| T-HU002-06 | `test/unit/i18n/localize.test.ts` | localize({ es: 'Hola' }, 'en') | 'Hola' (respaldo) | RF-06 |
| T-HU002-07 | `test/unit/consent/consent.test.ts` | validateConsentBody sin la sección `noDiagnosis` | `ok: false` | RF-07 |
| T-HU002-08 | `supabase/tests/consents.test.sql` | paciente A consulta consentimientos | solo ve los suyos | RF-08 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Firma digital con validez legal.
- **Pregunta abierta:** Texto legal definitivo, a validar con asesor legal (Ley 1581 de 2012).
