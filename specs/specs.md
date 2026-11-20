# Especificación técnica: Módulo de Evaluaciones (Tests) — Neurofit IA

> **Proyecto:** neurofitia.com · **Stack:** Nuxt 4 + TypeScript, Nuxt UI, @nuxtjs/i18n, @nuxtjs/supabase, Netlify
> **Reglas:** [`docs/constitution.md`](../docs/constitution.md) (innegociables) · **Fuente funcional:** [`docs/plan-test.md`](../docs/plan-test.md) · **Contenido del Test 1:** [`docs/test-1.md`](../docs/test-1.md)
> **Versión:** 1.0 · **Fecha:** 2026-10-09 · **Estado:** Borrador para aprobación

---

## 1. Resumen y objetivo

Este documento convierte el plan funcional en una especificación implementable. Define la arquitectura, el modelo de datos, los contratos compartidos y la estrategia de pruebas comunes a todo el módulo. Cada historia de usuario tiene su propia spec (`HUXXX-spec.md`) con:

1. **Criterios de aceptación (CA):** el comportamiento observable que pide el negocio.
2. **Requisitos funcionales (RF):** reglas verificables que implementan los CA.
3. **Diseño técnico:** datos, lógica, interfaz y claves i18n.
4. **Pruebas unitarias (T):** cada RF tiene al menos una prueba con `@nuxt/test-utils`. Una historia está terminada cuando todas sus pruebas pasan.

Cadena de trazabilidad: **HU → CA → RF → T**. Ningún RF existe sin un CA que lo justifique, y ningún RF queda sin prueba.

---

## 2. Reglas de la constitución aplicadas

| Principio | Cómo se aplica en estas specs |
|---|---|
| 1. Simplicidad del stack | Solo módulos aprobados. Las specs no introducen dependencias; si alguna lo necesita, lo declara en "Decisiones pendientes". |
| 2. Spec y código | No se implementa una HU sin su spec en estado **Aprobada**. Si el código diverge, se corrige primero la spec. |
| 3. Lógica e interfaz | Reglas de dominio como funciones puras en `shared/utils/` (ver D-1); estado y acceso a datos en `app/composables/`; endpoints en `server/api/`. Los `.vue` no llaman a Supabase. |
| 4. Unit tests | Cada RF tiene al menos una prueba en `test/`. `pnpm test`, `pnpm lint` y `pnpm typecheck` pasan antes de cerrar una HU. |
| 5. Persistencia | Todo en Supabase, con migraciones en `supabase/migrations/`, RLS en todas las tablas y tipos generados en `app/types/database.types.ts`. |
| 6. Idioma | Código, identificadores y commits en inglés; specs en español. Todo texto visible usa claves en `i18n/locales/es.json` y `en.json`. |
| 7. Marca y UI | Tema claro/oscuro, responsive desde 320 px y manual de marca en cada vista (criterios transversales, §10). |

---

## 3. Alcance

**Dentro:** las 39 historias de `docs/plan-test.md` (HU001–HU039) y las 5 de la épica 10, "Profesionales de la salud" (HU040–HU044), que también están en `docs/plan-test.md` (Sprint 4). Prioridad P0 para el MVP, P1 para la siguiente iteración y P2 a futuro.

**Fuera:** diagnóstico clínico de cualquier tipo, validación psicométrica de pesos y puntos de corte, y pruebas cognitivas con puntos de corte no validados.

**Ya existente en el repositorio (no se reimplementa):** tabla `profiles` con enum `user_role`, alta automática del perfil al registrarse, RLS de `profiles`, funciones `private.current_role()`, `private.is_superuser()` y `private.is_staff()`, middleware `app/middleware/roles.global.ts`, composable `useProfile`, guard `server/utils/adminGuard.ts`, páginas `login`, `registro` y `dashboard/*`, y CRUD de usuarios en `server/api/admin/users`.

---

## 4. Roles y permisos

El plan usa nombres funcionales; el código usa los nombres ya existentes en `user_role`:

| Plan | Código (`user_role`) | Inicio (`ROLE_HOME`) | Permisos en el módulo |
|---|---|---|---|
| `super_admin` | `superuser` | `/dashboard/superusuario` | Único que crea, edita, publica y archiva tests, secciones, preguntas, escalas, reglas, modelos de puntaje y plantillas. Ve todas las evaluaciones, resultados y la auditoría. Asigna pacientes a evaluadores. |
| `evaluador` | `evaluator` | `/dashboard/evaluador` | Crea y completa evaluaciones de sus pacientes asignados y ve sus resultados. No edita la estructura del test. |
| `profesional` | `professional` | `/dashboard/profesional` | **Rol nuevo (HU040).** Elige su profesión: psicólogo/a, fisioterapeuta o nutricionista (HU041). Lee los resultados de los pacientes que se le asignan, sin ver respuestas individuales (HU043), y revisa las metas del plan de su profesión (HU044). No crea ni completa evaluaciones y no edita la estructura del test. |
| `paciente` | `user` | `/dashboard/usuario` | Completa solo sus evaluaciones (formulario o conversación) y ve sus resultados. No ve la estructura interna del test (pesos, reglas, notas clínicas). |

El `superuser` es el único que asigna el rol `professional` y los pacientes de cada profesional. `private.is_staff()` **no** incluye al profesional: no lee todos los perfiles.

**Regla clave:** todo permiso se aplica en tres capas: middleware de rutas (UI), guard en `server/api` (HTTP 401/403) y RLS en la base de datos. Ninguna capa confía en la anterior.

---

## 5. Tipos de pregunta y escalas

| `question_type` | Valor en `answers.value` | `config` | Uso en Test 1 |
|---|---|---|---|
| `single_choice` | `{ "v": "<option_value>" }` | `{ scaleCode? }` | F5, IND, SNN, FC, OU |
| `multiple_choice` | `{ "v": ["<value>", …] }` | `{ exclusiveValues: string[] }` | OM (HIS_001, GEN_002, PHY_003) |
| `true_false` | `{ "v": true \| false }` | `{ labels: { true, false } }` | SN |
| `numeric_scale` | `{ "v": number }` | `{ min: 1, max: 10, minLabel?, maxLabel? }` | — (disponible) |
| `agreement` | `{ "v": 1..5 }` | `{ labels: string[5] }` | — (disponible) |
| `numeric_free` | `{ "v": number }` | `{ unit, min?, max?, step? }` | NUM |
| `open_text` | `{ "v": string }` | `{ maxLength: 1000 }` | OPEN |

> El plan proponía `multiple_choice` con la marca `allow_multiple`. Aquí se separa en `single_choice` y `multiple_choice` porque la validación, el puntaje y el control de UI son distintos (decisión D-3).

**Estados de una respuesta (`answer_state`):** `answered`, `declined` ("Prefiero no responder") y `not_applicable` (oculta por una condición después de haber sido respondida).

**Escalas del catálogo (HU031):** `F5` (Nunca 0 … Siempre 4), `IND` (Independiente 0, Necesita ayuda 1), `SNN` (Sí, No, No lo sé), `FC` (Nunca, 1–2 días/semana, 3–5 días/semana, Todos los días) y `CMP5` (Mucho mejor 0 … Mucho peor 4).

---

## 6. Arquitectura

```
app/
  pages/dashboard/…            # vistas por rol (solo presentación)
  components/assessment/…      # formulario, controles por tipo, chat, resultados
  components/admin/tests/…     # gestión de tests (superuser)
  composables/                 # estado + llamadas a server/api (useTests, useAssessment…)
shared/
  types/assessment.ts          # contratos compartidos (§8)
  utils/                       # funciones puras de dominio, sin I/O (validación, condiciones, puntaje…)
server/
  api/                         # endpoints; validan con shared/utils y escriben en Supabase
  utils/                       # guards (requireRole), acceso a datos, cliente LLM
supabase/
  migrations/                  # esquema, RLS, triggers, seeds de catálogos
  tests/                       # pruebas de RLS (pgTAP)
test/
  unit/                        # funciones puras de shared/ y server/utils (entorno node)
  nuxt/                        # composables y componentes (entorno nuxt)
```

**Flujo de una respuesta:** componente → composable (`useAssessment().saveAnswer`) → `PUT /api/assessments/:id/answers/:questionCode` → `validateAnswer` + `computeScore` (shared) → upsert en `answers` → el servidor recalcula visibilidad y cobertura → respuesta al cliente.

**Reglas de capa:**
- `shared/utils` no importa nada de Vue, Nuxt ni Supabase. Es la lógica que se prueba de forma unitaria.
- Toda escritura que dependa de reglas (respuestas, publicación, resultados) pasa por `server/api`. El cliente no escribe directo en las tablas del módulo.
- El LLM solo se usa desde `server/utils/llm/` y nunca recibe claves ni acceso a la base.

---

## 7. Modelo de datos (Supabase / Postgres)

### 7.1 Diagrama lógico

```
profiles (existente) ─< evaluator_patients >─ profiles
profiles ─┬─ professional_profiles (profesión)
          └─< professional_patients >─ profiles
scales ─< scale_options
tests ─< test_sections ─< questions ─< question_options
  │                          └── depends_on (condición)
  ├─< scoring_models          alert_rules     recommendation_templates
  └─< assessments ─┬─< answers
                   ├─< conversations ─< messages
                   ├─< extraction_events
                   ├─< assessment_results ─< plan_goal_revisions
                   └─< informant_invitations
consent_versions ─< consents
medications · reminders · audit_log
```

### 7.2 Enums

```sql
create type public.test_status as enum ('draft', 'published', 'archived');
create type public.question_type as enum
  ('single_choice', 'multiple_choice', 'true_false', 'numeric_scale', 'agreement', 'numeric_free', 'open_text');
create type public.question_direction as enum ('higher_is_risk', 'higher_is_protective', 'neutral');
create type public.assessment_status as enum ('not_started', 'in_progress', 'completed', 'abandoned');
create type public.assessment_mode as enum ('form', 'conversation', 'mixed');
create type public.answer_source as enum ('form', 'conversation', 'evaluator');
create type public.answer_state as enum ('answered', 'declined', 'not_applicable');
create type public.alert_level as enum ('green', 'yellow', 'orange', 'red');
create type public.profession as enum ('psychologist', 'physiotherapist', 'nutritionist');
-- user_role (existente) añade el valor 'professional' (HU040)
```

### 7.3 Tablas

Los textos visibles del contenido (títulos, preguntas, etiquetas, pistas) se guardan como `jsonb` `{ "es": "...", "en": "..." }`: `es` es obligatorio y `en` cae a `es` si falta (decisión D-2).

| Tabla | Columnas clave | Spec que la crea |
|---|---|---|
| `evaluator_patients` | `evaluator_id`, `patient_id`, `assigned_by`, `created_at`; PK compuesta | HU001 |
| `professional_profiles` | `profile_id` (PK), `profession profession`, `selected_at` | HU041 |
| `professional_patients` | `professional_id`, `patient_id`, `assigned_by`, `created_at`; PK compuesta | HU042 |
| `plan_goal_revisions` | `id`, `result_id`, `goal_id`, `version`, `body jsonb`, `author_id`, `profession`, `reviewed bool`, `created_at` | HU044 |
| `consent_versions` | `version` (PK), `body jsonb`, `published_at` | HU002 |
| `consents` | `id`, `patient_id`, `version`, `accepted_at` | HU002 |
| `tests` | `id`, `code` (único), `title jsonb`, `description jsonb`, `version int`, `status test_status`, `parent_test_id`, `created_by` | HU003 |
| `test_sections` | `id`, `test_id`, `code`, `title jsonb`, `domain`, `position`, `is_draft_content bool`; único `(test_id, code)` | HU004 |
| `questions` | `id`, `section_id`, `test_id`, `code`, `doc_ref` (P1–P80), `prompt jsonb`, `type question_type`, `config jsonb`, `required`, `allows_decline`, `position`, `variable`, `direction`, `weight numeric null`, `alert_rule jsonb`, `depends_on jsonb`, `conversational_hint jsonb`, `source`, `clinical_note`, `is_draft_content`, `active`; único `(test_id, code)` | HU005 |
| `question_options` | `id`, `question_id`, `value`, `label jsonb`, `score numeric`, `position`, `is_exclusive bool`; único `(question_id, value)` | HU005 |
| `scales`, `scale_options` | `code`, `name jsonb` · `scale_code`, `value`, `label jsonb`, `score`, `position` | HU031 |
| `assessments` | `id`, `test_id`, `test_version`, `patient_id`, `evaluator_id null`, `mode`, `status`, `consent_id`, `is_baseline`, `started_at`, `completed_at` | HU011 |
| `answers` | `id`, `assessment_id`, `question_id`, `value jsonb null`, `state answer_state`, `score numeric`, `source`, `confidence`, `evidence`, `needs_confirmation`, `answered_by`, `answered_at`; único `(assessment_id, question_id)` | HU014 |
| `answer_history` | copia de cada versión previa de `answers` (trigger) | HU014 |
| `section_notes` | `assessment_id`, `section_id`, `evaluator_id`, `note` | HU012 |
| `conversations`, `messages` | `state jsonb` · `role`, `content`, `tool_calls jsonb` | HU015/HU016 |
| `extraction_events` | `assessment_id`, `message_id`, `question_id`, `action`, `payload jsonb` | HU016 |
| `scoring_models` | `id`, `test_id`, `version text`, `status`, `weights jsonb`, `thresholds jsonb`, `published_at` | HU010/HU022 |
| `alert_rules` | `id`, `test_id`, `code`, `level alert_level`, `expression jsonb`, `message jsonb`, `active` | HU036 |
| `recommendation_templates` | `id`, `factor`, `profession null` (HU044), `horizon_days` (30/60/90), `body jsonb`, `status` (draft/approved) | HU010/HU023 |
| `assessment_results` | `assessment_id`, `findings`, `risk_factors`, `brain_index`, `recommendation_plan` (jsonb), `alert_level`, `completeness numeric`, `model_version`, `generated_at` | HU020–HU023 |
| `reminders` | `patient_id`, `assessment_id`, `due_at`, `kind`, `enabled` | HU023 |
| `safety_events` | `assessment_id`, `reason`, `message_id`, `created_at`, `reviewed_by` | HU019 |
| `audit_log` | `id bigserial`, `actor_id`, `action`, `entity`, `entity_id`, `diff jsonb`, `created_at` | HU024 |
| `data_requests` | `patient_id`, `kind` (export/delete), `status`, `requested_at`, `completed_at` | HU025 |
| `informant_invitations` | `assessment_id`, `email`, `token_hash`, `expires_at`, `used_at`, `revoked_at` | HU027 |
| `medications` | `id`, `name`, `atc_code`, `cognitive_flag bool`, `source`, `catalog_version` | HU039 |

### 7.4 RLS (resumen)

| Tabla | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| Estructura (`tests`, `test_sections`, `questions`, `question_options`, `scales`, `scoring_models`, `alert_rules`, `recommendation_templates`) | `superuser`: todo. Resto: solo tests `published`, y sin `weight`, `alert_rule`, `clinical_note` ni `score` (vista `questions_public`). | Solo `private.is_superuser()`. |
| `evaluator_patients` | `superuser`; el evaluador ve sus filas; el paciente ve las suyas. | Solo `superuser`. |
| `assessments` y dependientes (`answers`, `conversations`, `messages`, `section_notes`) | Paciente dueño, evaluador asignado al paciente o `superuser`. | Paciente dueño o evaluador asignado, solo si `status <> 'completed'`. Las escrituras de la IA usan `service_role` en el servidor. |
| `assessment_results`, `extraction_events`, `safety_events`, `answer_history` | Paciente dueño (salvo `extraction_events` y `safety_events`), evaluador asignado o `superuser`. | Solo `service_role`. |
| `professional_profiles` | El profesional ve su fila; `superuser` todas. | El profesional su fila; `superuser` todas. |
| `professional_patients` | El profesional ve las suyas; el paciente las suyas; `superuser` todas. | Solo `superuser`. |
| `assessments` y `assessment_results` (lectura del profesional) | Profesional asignado (`private.is_professional_of`), activo y con rol `professional`. **Sin** acceso a `answers`, `conversations`, `messages`, `section_notes`, `extraction_events` ni `safety_events`. | Ninguna. |
| `plan_goal_revisions` | Paciente dueño, profesionales asignados y `superuser`. | Solo `service_role`. |
| `audit_log` | Solo `superuser`. | Solo triggers (`security definer`). |

Las funciones auxiliares nuevas siguen el patrón existente en el esquema `private`: `private.is_evaluator_of(patient uuid)`, `private.is_professional_of(patient uuid)` y `private.can_access_assessment(assessment uuid)`.

---

## 8. Contratos compartidos (`shared/types/assessment.ts`)

```ts
export type Locale = 'es' | 'en'
export type LocalizedText = { es: string, en?: string }

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false'
  | 'numeric_scale' | 'agreement' | 'numeric_free' | 'open_text'

export interface QuestionOption { value: string, label: LocalizedText, score: number | null, isExclusive: boolean }

export interface Condition { questionCode: string, op: 'eq' | 'neq' | 'in' | 'any_eq', value: unknown }

export interface Question {
  code: string, type: QuestionType, required: boolean, allowsDecline: boolean,
  config: Record<string, unknown>, options: QuestionOption[],
  dependsOn: Condition | null, direction: 'higher_is_risk' | 'higher_is_protective' | 'neutral',
  weight: number | null, isDraftContent: boolean
}

export type AnswerValue = string | string[] | boolean | number
export type AnswerState = 'answered' | 'declined' | 'not_applicable'
export interface Answer { questionCode: string, value: AnswerValue | null, state: AnswerState }

export type ValidationResult = { ok: true, value: AnswerValue } | { ok: false, code: ValidationErrorCode }
export type ValidationErrorCode = 'required' | 'out_of_range' | 'unknown_option'
  | 'exclusive_conflict' | 'too_long' | 'wrong_type'

export type AlertLevel = 'green' | 'yellow' | 'orange' | 'red'
```

Los códigos de error son claves i18n (`errors.answer.<code>`), nunca textos.

---

## 9. Estrategia de pruebas

### 9.1 Infraestructura (prerrequisito de HU001)

- Dependencias de desarrollo: `@nuxt/test-utils`, `vitest`, `@vue/test-utils`, `happy-dom`, `vue-tsc`.
- `vitest.config.ts` con dos proyectos:
  - `unit`: entorno `node`, incluye `test/unit/**/*.test.ts` (funciones puras).
  - `nuxt`: `defineVitestProject` con entorno `nuxt`, incluye `test/nuxt/**/*.test.ts` (composables y componentes con `mountSuspended` y `mockNuxtImport`).
- Scripts en `package.json`: `test` (`vitest run`), `test:watch`, `typecheck` (`nuxt typecheck`).
- Pruebas de RLS: `supabase/tests/*.test.sql` con pgTAP (`supabase test db`). No reemplazan a las unitarias; verifican la capa de base de datos.

### 9.2 Convenciones

- Cada prueba se identifica como `T-HUxxx-nn` en su nombre: `it('T-HU013-04 rejects a number above max', …)`.
- Cada RF lista sus pruebas; cada prueba indica qué RF cubre. Un RF sin prueba bloquea la aprobación de la spec.
- Las funciones de `shared/utils` se prueban sin mocks. Los composables simulan `$fetch` o el cliente de Supabase con `mockNuxtImport`. Los handlers de `server/api` extraen su lógica a funciones puras que se prueban en `test/unit`.
- Los datos de prueba del Test 1 salen de `test/fixtures/test-1.ts`, generado desde `docs/test-1.md` (HU030), y de los perfiles de HU038.

### 9.3 Definición de verde

Una HU está **Implementada** cuando: todas sus pruebas `T-HUxxx-*` pasan; `pnpm test`, `pnpm lint` y `pnpm typecheck` pasan sin errores; y sus pruebas pgTAP (si las tiene) pasan.

---

## 10. Criterios transversales

Aplican a toda spec con interfaz, además de sus propios criterios:

- **Idioma:** ningún texto visible en componentes; todo en `i18n/locales/es.json` y `en.json` con las mismas claves.
- **Tema:** se ve correctamente en claro y oscuro (`colorMode` de Nuxt UI).
- **Responsive:** usable sin desplazamiento horizontal desde 320 px.
- **Accesibilidad:** contraste WCAG 2.1 AA, objetivos táctiles ≥ 44 px, navegación por teclado y etiquetas para lectores de pantalla.
- **Marca:** colores, tipografía y logotipo según `/manual-de-marca`.
- **Descargo:** toda vista de resultados muestra: *"Este resultado corresponde a una medición automatizada y no constituye un diagnóstico médico ni neuropsicológico."*

---

## 11. Formato de cada spec

```
# HUxxx · <título>
Metadatos: prioridad, épica, fase, dependencias, estado
1. Historia                 — Como / quiero / para
2. Criterios de aceptación  — CA-nn, en Dado / Cuando / Entonces
3. Requisitos funcionales   — RF-nn: regla verificable → CA que cubre → pruebas
4. Diseño técnico           — datos, lógica (firmas), API, interfaz, i18n
5. Pruebas unitarias        — T-HUxxx-nn: archivo, caso, esperado, RF
6. Fuera de alcance y preguntas abiertas
```

**Estados:** Borrador → Aprobada → Implementada. Solo cambia de estado quien aprueba (el usuario).

---

## 12. Índice de specs

| Spec | Historia | Prioridad | Sprint |
|---|---|---|---|
| [HU001](HU001-spec.md) | Inicio de sesión con roles | P0 | 1 |
| [HU002](HU002-spec.md) | Consentimiento informado antes de evaluar | P0 | 2 |
| [HU003](HU003-spec.md) | Crear un test | P0 | 1 |
| [HU004](HU004-spec.md) | Gestionar secciones de un test | P0 | 1 |
| [HU005](HU005-spec.md) | Crear preguntas de cada tipo | P0 | 1 |
| [HU006](HU006-spec.md) | Editar, duplicar, ordenar y desactivar preguntas | P0 | 1 |
| [HU007](HU007-spec.md) | Publicar, versionar y archivar un test | P0 | 1 |
| [HU008](HU008-spec.md) | Importar un test desde un archivo estructurado | P0 | 1 |
| [HU009](HU009-spec.md) | Vista previa del test | P1 | 4 |
| [HU010](HU010-spec.md) | Configurar reglas de puntaje, alertas y plantillas | P1 | 3 |
| [HU011](HU011-spec.md) | Paciente completa el test en un formulario | P0 | 2 |
| [HU012](HU012-spec.md) | Evaluador completa el test en nombre del paciente | P0 | 2 |
| [HU013](HU013-spec.md) | Validación y consistencia de respuestas | P0 | 2 |
| [HU014](HU014-spec.md) | Almacenamiento seguro de respuestas | P0 | 2 |
| [HU015](HU015-spec.md) | Conversación natural | P0 | 3 |
| [HU016](HU016-spec.md) | Slot-filling con function calling | P0 | 3 |
| [HU017](HU017-spec.md) | Mapeo de lenguaje natural a escalas | P0 | 3 |
| [HU018](HU018-spec.md) | Control de cobertura y cierre | P0 | 3 |
| [HU019](HU019-spec.md) | Seguridad y límites clínicos del asistente | P0 | 3 |
| [HU020](HU020-spec.md) | Hallazgos | P0 | 3 |
| [HU021](HU021-spec.md) | Riesgos y factores | P0 | 3 |
| [HU022](HU022-spec.md) | Índice Brain Intelligence | P0 | 3 |
| [HU023](HU023-spec.md) | Plan de recomendaciones | P0 | 3 |
| [HU024](HU024-spec.md) | Auditoría y trazabilidad | P0 | 1 |
| [HU025](HU025-spec.md) | Privacidad y derechos del titular | P0 | 3 |
| [HU026](HU026-spec.md) | Seguimiento longitudinal | P1 | 4 |
| [HU027](HU027-spec.md) | Cuestionario del informante | P2 | 4 |
| [HU028](HU028-spec.md) | Pruebas cognitivas digitales | P2 | 4 |
| [HU029](HU029-spec.md) | Panel de analítica | P2 | 4 |
| [HU030](HU030-spec.md) | Cargar el Test 1 | P0 | 2 |
| [HU031](HU031-spec.md) | Catálogo de escalas reutilizables | P0 | 1 |
| [HU032](HU032-spec.md) | Lógica condicional del Test 1 | P0 | 2 |
| [HU033](HU033-spec.md) | Pistas conversacionales | P0 | 2 |
| [HU034](HU034-spec.md) | Verificación y publicación del Test 1 | P0 | 2 |
| [HU035](HU035-spec.md) | Estado emocional con instrumento validado | P1 | 4 |
| [HU036](HU036-spec.md) | Alertas iniciales del Test 1 | P0 | 2 |
| [HU037](HU037-spec.md) | Recorrido completo end-to-end | P0 | 3 |
| [HU038](HU038-spec.md) | Datos de ejemplo | P1 | 3 |
| [HU039](HU039-spec.md) | Catálogo de medicamentos | P1 | 4 |
| [HU040](HU040-spec.md) | Asignar el rol de profesional | P1 | 4 |
| [HU041](HU041-spec.md) | Elegir la profesión al primer ingreso | P1 | 4 |
| [HU042](HU042-spec.md) | Asignar pacientes a un profesional | P1 | 4 |
| [HU043](HU043-spec.md) | Panel del profesional y lectura de resultados | P1 | 4 |
| [HU044](HU044-spec.md) | Revisión del plan por profesión | P1 | 4 |

---

## 13. Plan de entrega

Cuatro sprints que conservan el orden lógico del desarrollo: cada historia va después de todas sus dependencias. El detalle (orden interno, tareas, migraciones y criterios de salida) está en [`plan-tests.md`](plan-tests.md).

| Sprint | Contenido | Specs |
|---|---|---|
| **1 – Fundamentos y gestión de tests** | El equipo puede probar y desplegar con seguridad, y el `superuser` crea, importa, versiona y publica tests. | HU001, HU024, HU003, HU004, HU031, HU005, HU006, HU007, HU008 |
| **2 – Test 1 y respuestas por formulario** | El Test 1 queda cargado, validado y publicado, y un paciente o evaluador lo completa por formulario con datos seguros. | HU030, HU032, HU033, HU036, HU034, HU002, HU014, HU013, HU011, HU012 |
| **3 – Resultados y conversación** | Al completar se generan hallazgos, factores, índice y plan, con privacidad básica; el asistente llena el mismo Test 1 por conversación. Cierra el MVP. | HU038, HU022, HU021, HU020, HU023, HU010, HU025, HU016, HU019, HU017, HU018, HU015, HU037 |
| **4 – Profesionales y evolución** | Rol profesional con pacientes asignados y revisión del plan; medicamentos, vista previa, seguimiento, informante, pruebas digitales y analítica. | HU039, HU040, HU041, HU042, HU043, HU044, HU009, HU026, HU035, HU027, HU028, HU029 |

Las fases del plan original se agrupan así: Sprint 1 = Fase 0 + Fase 1; Sprint 2 = Fase 1b + Fase 2; Sprint 3 = Fase 3 + Fase 4; Sprint 4 = Fase 5 + Fase 6. El Sprint 3 cierra el MVP (las historias P0).


---

## 14. Definition of Done

- Spec en estado **Aprobada** antes de empezar.
- Todos los CA cumplidos y todas las pruebas `T-HUxxx-*` en verde.
- `pnpm test`, `pnpm lint` y `pnpm typecheck` sin errores.
- Migraciones nuevas aplicadas con RLS; pruebas pgTAP en verde; tipos regenerados.
- Textos en `es` y `en`; revisado en tema claro y oscuro y a 320 px.
- Spec cambiada a **Implementada**.

---

## 15. Decisiones

| ID | Decisión | Estado |
|---|---|---|
| D-1 | La lógica de dominio pura vive en `shared/utils/` (directorio de Nuxt 4 compartido entre app y servidor) para validar igual en cliente y servidor. La constitución ya se enmendó (principio 3). | Aprobada |
| D-2 | El contenido del test se guarda en `jsonb` `{ es, en }`; `en` es opcional y cae a `es`. | Propuesta |
| D-3 | `single_choice` y `multiple_choice` son tipos separados. | Propuesta |
| D-4 | Se mantienen los roles existentes `superuser`, `evaluator` y `user`. | Tomada (código existente) |
| D-5 | Las pruebas de RLS usan pgTAP vía la CLI de Supabase; no son una dependencia npm. | Propuesta |
| D-6 | Proveedor y modelo de LLM y región de procesamiento (plan §12.3). | Pendiente |
| D-19 | `professional` es un rol separado de `evaluator` (HU040). | Tomada |
| D-20 | La profesión vive en `professional_profiles` con enum `profession`, no en `profiles` (HU041). | Propuesta |
| D-21 | Las asignaciones del profesional van en `professional_patients`, aparte de `evaluator_patients` (HU042). | Propuesta |
| D-22 | El profesional ve una vista reducida de resultados y no accede a respuestas individuales (HU043). | Propuesta |
| D-23 | Las ediciones del plan se guardan como versiones en `plan_goal_revisions`; el resultado original no se modifica (HU044). | Propuesta |
| D-24 | La profesión es una declaración propia, sin verificación documental (HU041). | Tomada |

Las decisiones D-7 a D-18 están en [`plan-tests.md` §6](plan-tests.md#6-decisiones-técnicas), con su alternativa descartada.
