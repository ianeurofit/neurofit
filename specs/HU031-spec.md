# HU031 · Catálogo de escalas reutilizables

> **Prioridad:** P0 · **Sprint:** 1 · **Épica 9 — Puesta en marcha del Test 1**  
> **Dependencias:** [HU005](HU005-spec.md)  
> **Rector:** [specs.md](specs.md) · **Reglas:** [constitution.md](../docs/constitution.md) · **Estado:** Implementada

## 1. Historia

**Como** super admin **quiero** escalas predefinidas **para** no recrear las mismas opciones en cada pregunta.

## 2. Criterios de aceptación

- **CA-01.** El catálogo trae: Frecuencia 0–4 (F5), Independiente/Necesita ayuda (IND), Sí/No/No lo sé (SNN), Frecuencia de consumo (FC) y Comparación con hace 5 años.
- **CA-02.** **Dado** una pregunta nueva, **cuando** elijo una escala, **entonces** se copian sus opciones y puntajes, que luego puedo ajustar.
- **CA-03.** Cambiar el catálogo no modifica preguntas existentes ni respuestas históricas.
- **CA-04.** Las etiquetas de cada escala existen en `es` y `en`.

Se cumplen además los [criterios transversales](specs.md#10-criterios-transversales).

## 3. Requisitos funcionales

| RF | Requisito | Cubre | Pruebas |
|---|---|---|---|
| RF-01 | La migración siembra `scales` y `scale_options` con F5, IND, SNN, FC y CMP5 (§5). | CA-01 | T-HU031-01 |
| RF-02 | `applyScale(scale)` devuelve una copia de las opciones; cambios posteriores en la escala no afectan a la copia. | CA-02, CA-03 | T-HU031-02 |
| RF-03 | Las opciones copiadas se pueden editar en la pregunta como cualquier otra. | CA-02 | T-HU031-03 |
| RF-04 | Cada `scale_options.label` tiene `es` y `en`; una restricción `check` lo exige. | CA-04 | T-HU031-04 |

## 4. Diseño técnico

**Datos.** `<ts>_create_scales.sql`: tablas `scales` y `scale_options`, seed y `check (label ? 'es' and label ? 'en')`.

**Lógica.**

```ts
// shared/utils/scales.ts
export function applyScale(scale: Scale): QuestionOption[]
```

**Catálogo sembrado** (`20261120110000_create_scales.sql`). `scales (code PK, name jsonb {es,en})` y `scale_options (id, scale_code, value, label jsonb {es,en}, score numeric null, position)`, únicos `(scale_code, value)` y `(scale_code, position)`; RLS de estructura (solo `superuser` lee y escribe) y trigger de auditoría en ambas.

| Escala | Opciones (`value`: etiqueta es · puntaje) |
|---|---|
| `F5` | `never` Nunca 0 · `rarely` Rara vez 1 · `sometimes` A veces 2 · `often` A menudo 3 · `always` Siempre 4 |
| `IND` | `independent` Independiente 0 · `needs_help` Necesita ayuda 1 |
| `SNN` | `yes` Sí · `no` No · `unknown` No lo sé (sin puntaje) |
| `FC` | `never` Nunca 0 · `days_1_2` 1–2 días/semana 1 · `days_3_5` 3–5 días/semana 2 · `daily` Todos los días 3 |
| `CMP5` | `much_better` Mucho mejor 0 · `slightly_better` Un poco mejor 1 · `same` Igual 2 · `slightly_worse` Un poco peor 3 · `much_worse` Mucho peor 4 |

Los puntajes de `FC` van de 0 a 3; si un alimento es protector, lo invierte la `direction` de la pregunta (HU005), no la escala.

**API.** `GET /api/admin/scales`: solo `superuser` (401/403); devuelve `[{ code, name, options: [{ value, label, score, position }] }]` con las opciones en orden. No recibe parámetros, así que no hay 422.

**Interfaz.** Selector de escala en `QuestionForm.vue` (`components/admin/tests/`), con `v-model:options`. Elegir una escala copia sus opciones con `applyScale`; cada etiqueta (es/en) y puntaje se edita después solo en la pregunta, con el error junto a la opción. HU005 añade a este componente el código, el texto, el tipo y la configuración por tipo, y lo muestra en una pantalla.

**Validación mínima.** `shared/utils/questions.ts` trae `validateQuestionInput` y `validateOptions` solo con lo que necesita esta HU (código, texto, tipo y opciones: ≥ 2, `value` y `label.es` únicos, `score` numérico o vacío). HU005 lo amplía con la configuración de cada tipo.

**i18n.** Etiquetas en la BD; nombres de escala en `scales.*`.

## 5. Pruebas unitarias

Una prueba se nombra con su id: `it('T-HU031-01 …')`. La HU pasa a **Implementada** cuando todas están en verde.

| Id | Archivo | Caso | Resultado esperado | RF |
|---|---|---|---|---|
| T-HU031-01 | `supabase/tests/scales.test.sql` | escalas sembradas | F5, IND, SNN, FC y CMP5 con sus opciones | RF-01 |
| T-HU031-02 | `test/unit/scales/applyScale.test.ts` | aplicar F5 y luego modificar la escala | la copia no cambia | RF-02 |
| T-HU031-03 | `test/unit/questions/validateQuestionInput.test.ts` | opciones copiadas con una etiqueta editada | válido | RF-03 |
| T-HU031-04 | `supabase/tests/scales.test.sql` | insertar opción sin `en` | violación del `check` | RF-04 |

> **Nota (HU005).** El selector de escala y el editor de opciones pasaron de `QuestionForm.vue` a `components/admin/tests/config/ChoiceOptions.vue`, que `QuestionForm.vue` usa para `single_choice` y `multiple_choice`. Sus pruebas están en `test/nuxt/components/ChoiceOptions.test.ts`. Los mensajes de error de las opciones usan ahora `errors.question.*`.
