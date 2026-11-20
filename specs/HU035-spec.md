# HU035 · Módulo Estado emocional con instrumento validado

> **Prioridad:** P1 · **Sprint:** 4 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU007](HU007-spec.md), [HU034](HU034-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** psicólogo **quiero** reemplazar los ítems borrador del Módulo 9 por un instrumento validado **para** cumplir el criterio clínico del documento base.

## 2. Criterios de aceptación

- **CA-01.** Los ítems `EMO_001–009` se sustituyen creando una nueva versión del test; las respuestas de la versión anterior se conservan.
- **CA-02.** El puntaje del instrumento se calcula con su método oficial y se guarda como resultado del módulo.
- **CA-03.** Cada ítem registra la fuente y la licencia del instrumento.
- **CA-04.** Las preguntas del módulo admiten "Prefiero no responder".
- **CA-05.** Una respuesta que indique riesgo (ej. ítem de ideación suicida, si el instrumento lo tiene) activa el protocolo de HU019.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | Reemplazar los ítems EMO usa `cloneTestVersion` (HU007): la versión nueva lleva el instrumento y la anterior conserva sus respuestas. | CA-01 | T-HU035-01 |
| RF-02 | `scoreInstrument(instrument, answers)` aplica la regla oficial (suma con ítems invertidos si los hay) y devuelve puntaje y categoría. | CA-02 | T-HU035-02, T-HU035-03 |
| RF-03 | `questions.source` guarda nombre, versión y licencia del instrumento. | CA-03 | T-HU035-04 |
| RF-04 | Todos los ítems del instrumento tienen `allows_decline = true`. | CA-04 | T-HU035-04 |
| RF-05 | Un ítem marcado `crisis_item` con respuesta ≥ 1 dispara `escalate_safety` (HU019). | CA-05 | T-HU035-05 |

## 4. Diseño técnico

**Datos.** `questions.crisis_item boolean`; tabla `instruments (code, name, version, license, scoring jsonb)`.

**Lógica.**

```ts
// shared/utils/instruments.ts
export function scoreInstrument(instrument: Instrument, answers: Answer[]): { score: number, category: string }
export function crisisTriggered(q: Question[], answers: Answer[]): boolean
```

**API.** Reutiliza los de HU007 y HU005.

**Interfaz.** Sin cambios.

**i18n.** `instruments.*`

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU035-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU035-01 | `test/unit/publish/cloneTestVersion.test.ts` | nueva versión con ítems EMO sustituidos | v1 intacta, v2 con los ítems nuevos | RF-01 |
| T-HU035-02 | `test/unit/instruments/scoreInstrument.test.ts` | instrumento de 9 ítems 0–3, todos en 2 | puntaje 18 y su categoría | RF-02 |
| T-HU035-03 | `test/unit/instruments/scoreInstrument.test.ts` | ítem invertido | se invierte antes de sumar | RF-02 |
| T-HU035-04 | `test/unit/test1/test1Structure.test.ts` | preguntas del instrumento | `source` con licencia y `allowsDecline: true` | RF-03, RF-04 |
| T-HU035-05 | `test/unit/instruments/crisisTriggered.test.ts` | ítem de crisis en 0 y en 1 | false, true | RF-05 |

## 6. Fuera de alcance y preguntas abiertas

- **Pregunta abierta:** Instrumento elegido y gestión de su licencia (plan §12.8).
