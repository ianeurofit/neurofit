# HU028 · Pruebas cognitivas digitales

> **Prioridad:** P2 · **Sprint:** 4 · **Épica 8 — Evolución**  
> **Dependencias:** [HU005](HU005-spec.md), [HU007](HU007-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo clínico **quiero** integrar pruebas cognitivas digitales **para** combinar datos subjetivos con rendimiento objetivo.

## 2. Criterios de aceptación

- **CA-01.** Solo se habilitan instrumentos validados o con licencia; la batería Neurofit™ en desarrollo queda marcada como experimental y no aporta al índice.
- **CA-02.** Se añade un tipo de pregunta "tarea" que guarda el rendimiento en bruto (aciertos, errores, tiempos).
- **CA-03.** No se aplican puntos de corte sin validación documentada.
- **CA-04.** Antes de la prueba se verifica que el dispositivo y la pantalla son adecuados.
- **CA-05.** Las tareas cumplen accesibilidad y tienen instrucciones en `es` y `en`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | Las secciones de tareas tienen `instrument_status` (`validated` o `experimental`); las `experimental` no entran en `computeBrainIndex`. | CA-01 | T-HU028-01 |
| RF-02 | Nuevo `question_type` `task`; su respuesta guarda `{ correct, errors, timesMs: number[] }`. | CA-02 | T-HU028-02 |
| RF-03 | `interpretTask` devuelve solo datos en bruto si el instrumento no tiene `cutoffs` validados. | CA-03 | T-HU028-03 |
| RF-04 | `checkDevice({ width, pointer })` exige ancho ≥ 360 px y puntero preciso o táctil; si no, muestra aviso y permite posponer. | CA-04 | T-HU028-04 |
| RF-05 | Cada tarea tiene instrucciones en `es` y `en` y se puede iniciar con teclado. | CA-05 | T-HU028-05 |

## 4. Diseño técnico

**Datos.** Valor `task` en `question_type`; `test_sections.instrument_status`.

**Lógica.**

```ts
// shared/utils/tasks.ts
export function recordTrial(state: TaskState, trial: Trial): TaskState
export function interpretTask(result: TaskResult, instrument: Instrument): TaskInterpretation
export function checkDevice(env: { width: number, pointer: 'fine' | 'coarse' | 'none' }): boolean
```

**API.** Reutiliza `PUT /api/assessments/:id/answers/:questionCode`.

**Interfaz.** `components/assessment/tasks/*` (uno por tarea).

**i18n.** `tasks.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU028-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU028-01 | `test/unit/results/brainIndex.test.ts` | sección `experimental` con resultados | no cambia el índice | RF-01 |
| T-HU028-02 | `test/unit/tasks/recordTrial.test.ts` | 3 ensayos (2 correctos) | `correct: 2`, `errors: 1`, 3 tiempos | RF-02 |
| T-HU028-03 | `test/unit/tasks/interpretTask.test.ts` | instrumento sin `cutoffs` | solo datos en bruto | RF-03 |
| T-HU028-04 | `test/unit/tasks/checkDevice.test.ts` | ancho 320 y puntero `none` | false | RF-04 |
| T-HU028-05 | `test/unit/i18n/keysParity.test.ts` | claves `tasks.*` | existen en `es` y `en` | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Instrumentos concretos y licencias (Ruta A del documento base).
