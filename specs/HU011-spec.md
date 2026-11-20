# HU011 · Paciente completa el test en un formulario amigable

> **Prioridad:** P0 · **Sprint:** 2 · **Épica 3 — Respuesta mediante formularios**  
> **Dependencias:** [HU002](HU002-spec.md), [HU007](HU007-spec.md), [HU013](HU013-spec.md), [HU014](HU014-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** paciente **quiero** responder el test en un formulario claro, por pasos y sin presión **para** completarlo a mi ritmo.

## 2. Criterios de aceptación

- **CA-01.** Se muestra una sección por pantalla con barra de progreso ("Módulo 3 de 13") y textos cálidos y sencillos.
- **CA-02.** Cada tipo tiene su control: botones grandes para selección y Sí/No, botones o deslizador para escalas, campo numérico con unidad y área de texto para respuestas abiertas.
- **CA-03.** **Dado** que respondo una pregunta, **cuando** cambia el valor, **entonces** se guarda automáticamente y veo una confirmación discreta.
- **CA-04.** **Dado** que cierro la ventana, **cuando** vuelvo, **entonces** retomo en la primera pregunta pendiente con mis respuestas cargadas.
- **CA-05.** Puedo volver atrás y cambiar respuestas antes de finalizar.
- **CA-06.** **Dado** preguntas obligatorias sin responder, **cuando** intento finalizar, **entonces** se señalan con un mensaje amable y puedo saltar directamente a ellas.
- **CA-07.** En preguntas sensibles puedo elegir "Prefiero no responder", que cuenta como resuelta.
- **CA-08.** **Dado** que finalizo, **cuando** confirmo, **entonces** la evaluación pasa a `completed`, ya no es editable y veo una pantalla de agradecimiento con acceso a resultados.
- **CA-09.** Objetivos táctiles ≥ 44 px, contraste WCAG AA y uso completo con teclado.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `useAssessment` agrupa las preguntas visibles por sección (una por pantalla) y expone `progress` con módulo actual y total. | CA-01 | T-HU011-01 |
| RF-02 | `QuestionField.vue` elige el control según `type` (botones, Sí/No, deslizador, número con unidad, área de texto). | CA-02 | T-HU011-02 |
| RF-03 | Cada cambio de valor llama a `saveAnswer` con un retraso de 400 ms; muestra el estado `saving` → `saved` o `error`. | CA-03 | T-HU011-03 |
| RF-04 | `firstPending(questionnaire, answers)` devuelve la primera pregunta visible, obligatoria y sin resolver; se usa al retomar. | CA-04 | T-HU011-04 |
| RF-05 | La navegación permite volver a secciones anteriores mientras el estado no sea `completed`. | CA-05 | T-HU011-05 |
| RF-06 | `canFinish(questionnaire, answers)` devuelve `{ ok: false, pending: string[] }` si faltan obligatorias; la UI enlaza a cada pendiente. | CA-06 | T-HU011-06 |
| RF-07 | En preguntas con `allowsDecline`, "Prefiero no responder" guarda `state = 'declined'`, que cuenta como resuelta. | CA-07 | T-HU011-07 |
| RF-08 | `POST /api/assessments/:id/complete` cambia el estado a `completed`, fija `completed_at` y bloquea nuevas escrituras. | CA-08 | T-HU011-08, T-HU011-09 |
| RF-09 | Los controles tienen altura mínima de 44 px y `aria-label`; se completan con teclado. | CA-09 | T-HU011-02 |

## 4. Diseño técnico

**Datos.** `<ts>_create_assessments.sql`: enums `assessment_status`, `assessment_mode`; tabla `assessments` (§7.3) con RLS.

**Lógica.**

```ts
// shared/utils/progress.ts
export function firstPending(q: Question[], answers: Answer[]): string | null
export function canFinish(q: Question[], answers: Answer[]): { ok: true } | { ok: false, pending: string[] }
export function sectionProgress(sections: Section[], current: number): { current: number, total: number, percent: number }
// app/composables/useAssessment.ts
export function useAssessment(assessmentId: string): AssessmentEngine
```

**API.** `POST /api/assessments` · `GET /api/assessments/:id` · `PUT /api/assessments/:id/answers/:questionCode` · `POST /api/assessments/:id/complete`

**Interfaz.** `pages/dashboard/evaluacion/[id].vue`, `components/assessment/{SectionStep,QuestionField,ProgressBar,FinishScreen}.vue`.

**i18n.** `assessment.form.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU011-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU011-01 | `test/unit/progress/sectionProgress.test.ts` | sección 3 de 13 | `{ current: 3, total: 13, percent: 23 }` | RF-01 |
| T-HU011-02 | `test/nuxt/components/QuestionField.test.ts` | montar cada tipo | renderiza el control esperado | RF-02, RF-09 |
| T-HU011-03 | `test/nuxt/composables/useAssessment.test.ts` | dos cambios en menos de 400 ms | una sola llamada a `saveAnswer` y estado `saved` | RF-03 |
| T-HU011-04 | `test/unit/progress/firstPending.test.ts` | obligatorias 1 y 3 respondidas, 2 pendiente | código de la 2 | RF-04 |
| T-HU011-05 | `test/nuxt/composables/useAssessment.test.ts` | goTo(1) con estado `in_progress` y con `completed` | navega; no navega | RF-05 |
| T-HU011-06 | `test/unit/progress/canFinish.test.ts` | una obligatoria pendiente | `ok: false` con su código | RF-06 |
| T-HU011-07 | `test/unit/progress/canFinish.test.ts` | obligatoria con `declined` | `ok: true` | RF-07 |
| T-HU011-08 | `test/unit/assessment/completeAssessment.test.ts` | completar con todo resuelto | `status: completed`, `completed_at` definido | RF-08 |
| T-HU011-09 | `test/unit/assessment/completeAssessment.test.ts` | guardar respuesta en evaluación `completed` | `assessment_closed` | RF-08 |

## 6. Fuera de alcance y preguntas abiertas

- **Fuera de alcance:** Voz a texto en el formulario.
