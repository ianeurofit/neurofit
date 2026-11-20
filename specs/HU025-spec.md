# HU025 · Privacidad y derechos del titular

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 7 — Seguridad, privacidad y auditoría**  
> **Dependencias:** [HU014](HU014-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** controlar mis datos **para** sentirme seguro al compartir información de salud.

## 2. Criterios de aceptación

- **CA-01.** **Dado** mi perfil, **cuando** pido descargar mis datos, **entonces** obtengo mis respuestas y resultados en JSON legible.
- **CA-02.** **Dado** mi perfil, **cuando** pido eliminar mis datos y lo confirmo, **entonces** se eliminan o anonimizan en el plazo definido y recibo confirmación.
- **CA-03.** Las respuestas sensibles solo las ven el paciente, su evaluador asignado y `superuser`.
- **CA-04.** Al proveedor de IA solo se envía lo necesario, sin nombre, correo ni documento.
- **CA-05.** La política de privacidad nombra al proveedor de IA y su política de retención.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `GET /api/me/export` devuelve un JSON con perfil, consentimientos, evaluaciones, respuestas y resultados del usuario, y nada de otros usuarios. | CA-01 | T-HU025-01 |
| RF-02 | `POST /api/me/delete-request` crea `data_requests` (`kind = delete`); su procesamiento ejecuta `anonymizePatient` y elimina la cuenta en `auth.users`. | CA-02 | T-HU025-02 |
| RF-03 | Las respuestas de SUB, EMO y HIS solo son visibles para el paciente, su evaluador asignado y `superuser` (RLS de HU014). | CA-03 | T-HU025-03 |
| RF-04 | `redactForLLM(payload)` elimina nombre, correo, teléfono y número de documento antes de enviar al proveedor. | CA-04 | T-HU025-04 |
| RF-05 | La página `/politicas` incluye la sección del proveedor de IA y su retención (contenido i18n). | CA-05 | T-HU025-05 |

## 4. Diseño técnico

**Datos.** `<ts>_create_data_requests.sql`: tabla `data_requests` con RLS del paciente.

**Lógica.**

```ts
// shared/utils/privacy.ts
export function redactForLLM(text: string): string
export function buildExport(data: ExportSource): ExportFile
// server/utils/privacy.ts
export async function anonymizePatient(patientId: string): Promise<void>
```

**API.** `GET /api/me/export` · `POST /api/me/delete-request`

**Interfaz.** Sección "Mis datos" en el perfil del paciente.

**i18n.** `privacy.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU025-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU025-01 | `test/unit/privacy/buildExport.test.ts` | fuente con datos de 2 pacientes | solo los del solicitante | RF-01 |
| T-HU025-02 | `test/unit/privacy/anonymize.test.ts` | procesar solicitud de eliminación | llama a anonimizar y a borrar la cuenta | RF-02 |
| T-HU025-03 | `supabase/tests/answers.test.sql` | evaluador no asignado lee respuestas SUB | 0 filas | RF-03 |
| T-HU025-04 | `test/unit/privacy/redactForLLM.test.ts` | 'Soy Ana Pérez, ana@x.com, 3001234567, CC 1020304050' | sin nombre, correo, teléfono ni documento | RF-04 |
| T-HU025-05 | `test/unit/i18n/keysParity.test.ts` | claves `privacy.aiProvider.*` | existen en `es` y `en` | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Cumplimiento de la Ley 1581 de 2012 y plazos de eliminación, a validar con asesor legal.
