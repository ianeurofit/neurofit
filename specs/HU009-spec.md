# HU009 · Vista previa del test

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 2 — Gestión de tests**  
> **Dependencias:** [HU005](HU005-spec.md), [HU011](HU011-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** super admin **quiero** ver el test como lo verá un paciente **para** validarlo antes de publicar.

## 2. Criterios de aceptación

- **CA-01.** **Dado** un test en cualquier estado, **cuando** abro la vista previa, **entonces** lo recorro igual que un paciente sin crear `assessments` ni `answers` reales.
- **CA-02.** Puedo cambiar entre ancho móvil y escritorio, idioma `es`/`en` y tema claro/oscuro sin salir de la vista previa.
- **CA-03.** Las condiciones se aplican en vivo: al responder, aparecen u ocultan las preguntas que dependen de esa respuesta.
- **CA-04.** En modo conversación (cuando exista HU015), veo qué pregunta se llenó con cada mensaje.
- **CA-05.** Al salir, las respuestas simuladas se descartan.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `useAssessmentPreview(testId)` usa el mismo motor del formulario (HU011) con un adaptador en memoria; nunca llama a `/api/assessments`. | CA-01, CA-05 | T-HU009-01 |
| RF-02 | La vista previa tiene controles de ancho (móvil 375 px / escritorio), idioma (`es`/`en`) y tema (claro/oscuro). | CA-02 | T-HU009-02 |
| RF-03 | Las condiciones se recalculan en cada respuesta con `visibleQuestions` (HU032). | CA-03 | T-HU009-03 |
| RF-04 | En modo conversación, cada mensaje simulado muestra los códigos de pregunta que llenó. | CA-04 | T-HU009-04 |
| RF-05 | Al salir de la vista previa se descarta el estado en memoria. | CA-05 | T-HU009-05 |

## 4. Diseño técnico

**Datos.** Sin cambios.

**Lógica.**

```ts
// app/composables/useAssessmentPreview.ts
export function useAssessmentPreview(testId: string): AssessmentEngine   // misma interfaz que useAssessment
// app/utils/memoryAnswerStore.ts
export function createMemoryAnswerStore(): AnswerStore
```

**API.** `GET /api/admin/tests/:id/tree` (cualquier estado, solo `superuser`)

**Interfaz.** `pages/dashboard/tests/[id]/vista-previa.vue` con barra de controles.

**i18n.** `tests.preview.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU009-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU009-01 | `test/nuxt/composables/useAssessmentPreview.test.ts` | responder 3 preguntas | `$fetch` nunca se llama con `/api/assessments` | RF-01 |
| T-HU009-02 | `test/nuxt/components/PreviewToolbar.test.ts` | cambiar idioma y tema | emite `update:locale` y `update:colorMode` | RF-02 |
| T-HU009-03 | `test/nuxt/composables/useAssessmentPreview.test.ts` | responder `DAT_009 = false` | `DAT_010` pasa a visible | RF-03 |
| T-HU009-04 | `test/nuxt/components/PreviewChat.test.ts` | mensaje con `filledCodes` | muestra las insignias de esos códigos | RF-04 |
| T-HU009-05 | `test/unit/assessment/memoryAnswerStore.test.ts` | reset() tras guardar respuestas | store vacío | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Compartir la vista previa con personas externas.
