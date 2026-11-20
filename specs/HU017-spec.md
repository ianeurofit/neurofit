# HU017 · Mapeo de lenguaje natural a escalas

> **Prioridad:** P0 · **Sprint:** 3 · **Épica 5 — Motor conversacional con slot-filling**  
> **Dependencias:** [HU016](HU016-spec.md), [HU033](HU033-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** sistema **quiero** traducir expresiones cotidianas a los valores de cada tipo de pregunta **para** que el paciente no tenga que elegir un número.

## 2. Criterios de aceptación

- **CA-01.** Escalas F5 y de acuerdo: frases como "casi siempre" o "a veces me pasa" se mapean a su opción, con los ejemplos definidos en la pregunta.
- **CA-02.** Escala 1–10: si el paciente no da un número, el asistente propone un anclaje ("si 1 es nada y 10 es muchísimo…") antes de guardar.
- **CA-03.** Sí/No: solo se guarda ante una afirmación o negación clara; si no, se pide aclaración.
- **CA-04.** Selección: las menciones se mapean a opciones existentes; lo que no corresponde a ninguna se guarda como "Otro" con el texto.
- **CA-05.** Numéricas libres: "unas 5 horas y media" → 5,5; rangos ("entre 5 y 6") se guardan como punto medio con confianza reducida.
- **CA-06.** Existe una suite de regresión de frases → valor esperado por tipo, en `es` y `en`, con ≥ 90 % de aciertos para aprobar.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `mapFrequency(text, locale)` traduce expresiones a F5 usando los ejemplos de `conversational_hint.examples` y un diccionario base (`es` y `en`). | CA-01 | T-HU017-01 |
| RF-02 | Para `numeric_scale` sin número explícito, `extractNumber` devuelve `null` y el asistente propone el anclaje antes de guardar. | CA-02 | T-HU017-02 |
| RF-03 | `mapYesNo(text, locale)` devuelve `true`, `false` o `null` (ambiguo); con `null` no se guarda. | CA-03 | T-HU017-03 |
| RF-04 | `mapOptions(text, options, locale)` devuelve los valores mencionados; lo no reconocido se guarda como `other` con su texto. | CA-04 | T-HU017-04 |
| RF-05 | `extractNumber(text)` entiende decimales y palabras ("cinco y media" → 5,5); un rango devuelve el punto medio y `confidence` × 0,8. | CA-05 | T-HU017-05 |
| RF-06 | La suite `test/fixtures/nl-mapping.{es,en}.json` se ejecuta en CI y exige ≥ 90 % de aciertos. | CA-06 | T-HU017-06 |

## 4. Diseño técnico

**Datos.** Ejemplos por pregunta en `questions.conversational_hint.examples` (HU033).

**Lógica.**

```ts
// shared/utils/nlMapping.ts
export function mapFrequency(text: string, locale: Locale, examples?: Example[]): { value: string, confidence: number } | null
export function mapYesNo(text: string, locale: Locale): boolean | null
export function mapOptions(text: string, options: QuestionOption[], locale: Locale): { values: string[], other?: string }
export function extractNumber(text: string, locale: Locale): { value: number, confidence: number } | null
```

**API.** Usado por `handleSaveAnswer` (HU016) como verificación del valor propuesto por el modelo.

**Interfaz.** Sin interfaz propia.

**i18n.** Diccionarios en `shared/utils/nlMapping/{es,en}.ts` (datos, no textos de interfaz).

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU017-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU017-01 | `test/unit/nl/mapFrequency.test.ts` | 'casi siempre', 'a veces me pasa', 'never' | Siempre/A menudo, A veces, Nunca | RF-01 |
| T-HU017-02 | `test/unit/nl/extractNumber.test.ts` | 'bastante' | null | RF-02 |
| T-HU017-03 | `test/unit/nl/mapYesNo.test.ts` | 'sí, claro', 'no', 'depende' | true, false, null | RF-03 |
| T-HU017-04 | `test/unit/nl/mapOptions.test.ts` | 'camino y nado, y hago tai chi' | values ['walk','swim'], other 'tai chi' | RF-04 |
| T-HU017-05 | `test/unit/nl/extractNumber.test.ts` | 'unas 5 horas y media', 'entre 5 y 6' | 5,5; 5,5 con confianza reducida | RF-05 |
| T-HU017-06 | `test/unit/nl/regressionSuite.test.ts` | suite completa es y en | aciertos ≥ 90 % | RF-06 |
