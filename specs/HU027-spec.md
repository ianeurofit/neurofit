# HU027 · Cuestionario del informante o familiar

> **Prioridad:** P2 · **Sprint:** 4 · **Épica 8 — Evolución**  
> **Dependencias:** [HU011](HU011-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** invitar a un familiar a responder sobre los cambios que observa **para** complementar mi propia percepción.

## 2. Criterios de aceptación

- **CA-01.** Al terminar la evaluación se pregunta si quiere invitar a un familiar; puede omitirlo.
- **CA-02.** **Dado** que acepta, **cuando** indica el correo del familiar, **entonces** se genera un enlace único, de un solo uso, que vence en 7 días.
- **CA-03.** El informante acepta su propio consentimiento y responde un cuestionario aparte, formulado en tercera persona.
- **CA-04.** El informante no ve ningún dato del paciente.
- **CA-05.** El paciente puede revocar la invitación antes de que se use.
- **CA-06.** Las respuestas del informante se muestran separadas, con la etiqueta "según informante".

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | Tras completar, `FinishScreen` ofrece invitar a un familiar; omitirlo no crea nada. | CA-01 | T-HU027-01 |
| RF-02 | `createInvitation` genera un token aleatorio de 32 bytes, guarda solo su hash y fija `expires_at` a 7 días. | CA-02 | T-HU027-02 |
| RF-03 | `redeemInvitation(token, now)` falla con `expired`, `used` o `revoked`; si es válido, marca `used_at` y abre el cuestionario `INFORMANT_1` con consentimiento propio. | CA-03 | T-HU027-03 |
| RF-04 | La ruta pública del informante solo carga preguntas del cuestionario; ningún endpoint le devuelve datos del paciente. | CA-04 | T-HU027-04 |
| RF-05 | `DELETE /api/informant-invitations/:id` (paciente dueño) fija `revoked_at`. | CA-05 | T-HU027-03 |
| RF-06 | Las respuestas del informante se guardan con `source = 'informant'` y se muestran en un bloque aparte. | CA-06 | T-HU027-05 |

## 4. Diseño técnico

**Datos.** `<ts>_create_informant.sql`: tabla `informant_invitations`; valor `informant` añadido a `answer_source`.

**Lógica.**

```ts
// server/utils/informant.ts
export function createInvitation(assessmentId: string, email: string, now: Date): { token: string, row: InvitationInsert }
export function checkInvitation(row: Invitation, now: Date): 'ok' | 'expired' | 'used' | 'revoked'
```

**API.** `POST /api/assessments/:id/informant-invitations` · `DELETE /api/informant-invitations/:id` · `GET/POST /api/informant/:token`

**Interfaz.** `pages/informante/[token].vue` (sin sesión).

**i18n.** `informant.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU027-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU027-01 | `test/nuxt/components/FinishScreen.test.ts` | pulsar "Ahora no" | no llama a la API | RF-01 |
| T-HU027-02 | `test/unit/informant/createInvitation.test.ts` | crear invitación | token de 64 hex, hash distinto del token, vence en 7 días | RF-02 |
| T-HU027-03 | `test/unit/informant/checkInvitation.test.ts` | vencida, usada, revocada y válida | `expired`, `used`, `revoked`, `ok` | RF-03, RF-05 |
| T-HU027-04 | `test/unit/informant/informantPayload.test.ts` | payload de la ruta pública | sin campos del paciente | RF-04 |
| T-HU027-05 | `test/unit/results/buildResult.test.ts` | respuestas con `source: informant` | en el bloque `informant` | RF-06 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Preguntas del cuestionario del informante (no están definidas en `test-1.md`).
- **Pregunta abierta:** Preguntas del cuestionario del informante (no están en `docs/test-1.md`).
