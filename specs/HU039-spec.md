# HU039 · Catálogo de medicamentos para el cruce cognitivo

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU030](HU030-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** indicar mis medicamentos desde una lista **para** que el sistema detecte los que pueden afectar la cognición sin que la IA los adivine.

## 2. Criterios de aceptación

- **CA-01.** `MED_002` permite buscar en un catálogo con autocompletado o escribir un medicamento libre.
- **CA-02.** El cruce con una base farmacológica marca los medicamentos relevantes y los muestra como factor en Riesgos y Factores, sin recomendar suspenderlos.
- **CA-03.** Si no hay catálogo disponible, el texto libre se guarda y queda pendiente de revisión por el evaluador.
- **CA-04.** El catálogo y su fuente están documentados y versionados.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `MED_002` usa el control `medication_list`: autocompletado sobre `medications` y entrada libre. | CA-01 | T-HU039-01 |
| RF-02 | `matchMedications(entries, catalog)` normaliza (minúsculas, sin tildes) y marca `cognitive_flag`; el resultado alimenta `classifyFactors` (HU021). | CA-02 | T-HU039-02 |
| RF-03 | Las entradas sin coincidencia quedan con `status = 'pending_review'` para el evaluador. | CA-03 | T-HU039-03 |
| RF-04 | `medications.source` y `catalog_version` son obligatorios. | CA-04 | T-HU039-04 |

## 4. Diseño técnico

**Datos.** `<ts>_create_medications.sql`: tabla `medications` con `not null` en `source` y `catalog_version`.

**Lógica.**

```ts
// shared/utils/medications.ts
export function normalizeName(s: string): string
export function matchMedications(entries: string[], catalog: Medication[]): MedicationMatch[]
```

**API.** `GET /api/medications?q=`

**Interfaz.** `components/assessment/MedicationInput.vue` con `UInputMenu`.

**i18n.** `medications.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU039-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU039-01 | `test/nuxt/components/MedicationInput.test.ts` | escribir 'lora' con catálogo de ejemplo | sugiere el medicamento y permite texto libre | RF-01 |
| T-HU039-02 | `test/unit/medications/matchMedications.test.ts` | 'Clonazepám' contra catálogo con 'clonazepam' marcado | coincidencia con `cognitive_flag: true` | RF-02 |
| T-HU039-03 | `test/unit/medications/matchMedications.test.ts` | 'remedio casero' | `pending_review` | RF-03 |
| T-HU039-04 | `supabase/tests/medications.test.sql` | insertar sin `source` | violación de `not null` | RF-04 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Fuente de la base farmacológica y su licencia.
