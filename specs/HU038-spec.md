# HU038 · Datos de ejemplo para pruebas y demostración

> **Prioridad:** P1 · **Sprint:** 3 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU030](HU030-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Borrador

## 1. Historia

**Como** equipo **quiero** perfiles de ejemplo **para** probar resultados y demostrar el producto sin datos reales.

## 2. Criterios de aceptación

- **CA-01.** Hay al menos 3 perfiles completos del Test 1: sin señales, con señales de seguimiento y con alerta.
- **CA-02.** Cada perfil define el resultado esperado por dominio, factores y nivel de alerta.
- **CA-03.** Se cargan solo en desarrollo y pruebas; la carga se niega a ejecutarse en producción.
- **CA-04.** Son los casos de regresión del cálculo del índice (HU022).

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | `test/fixtures/profiles/{no-signals,follow-up,alert}.ts` responden todas las preguntas aplicables del Test 1. | CA-01 | T-HU038-01 |
| RF-02 | Cada perfil exporta `expected`: nivel por dominio, factores y nivel de alerta. | CA-02 | T-HU038-02 |
| RF-03 | `pnpm seed:demo` aborta si `NUXT_PUBLIC_ENV === 'production'`. | CA-03 | T-HU038-03 |
| RF-04 | Los perfiles alimentan las pruebas de HU020, HU021 y HU022. | CA-04 | T-HU038-04 |

## 4. Diseño técnico

**Datos.** Script `scripts/seed-demo.ts`.

**Lógica.**

```ts
// scripts/seed-demo.ts
export function assertNotProduction(env: string | undefined): void
```

**API.** Ninguna.

**Interfaz.** Ninguna.

**i18n.** —

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU038-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU038-01 | `test/unit/fixtures/profiles.test.ts` | cada perfil contra `visibleQuestions` | sin preguntas aplicables sin respuesta | RF-01 |
| T-HU038-02 | `test/unit/fixtures/profiles.test.ts` | cada perfil | tiene `expected` con dominios, factores y alerta | RF-02 |
| T-HU038-03 | `test/unit/fixtures/assertNotProduction.test.ts` | env 'production' y 'development' | lanza; no lanza | RF-03 |
| T-HU038-04 | `test/unit/results/brainIndex.test.ts` | perfiles como entrada | usan `expected` de los fixtures | RF-04 |
