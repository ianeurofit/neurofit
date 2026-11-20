# Plan funcional: Módulo de Evaluaciones (Tests) — Neurofit IA

> **Proyecto:** neurofitia.com · **Stack:** Nuxt 4 + Supabase (Postgres, Auth, RLS) + LLM con function calling
> **Documento base:** `EVALUACIÓN NEUROLÓGICA-NeurofitIA.md` (Especificación funcional V1.0, 80 preguntas) · **Contenido del Test 1:** [`test-1.md`](test-1.md) (13 módulos, 124 preguntas)
> **Versión del plan:** 1.0 · **Fecha:** 2026-10-05 · **Estado:** Borrador para validación

---

## 1. Resumen y objetivo

Construir un módulo de **Evaluaciones** que permita:

1. **Crear y administrar tests** (solo `super_admin`). Cada test tiene **secciones** y cada sección tiene **preguntas**.
2. **Almacenar en Supabase** toda la estructura (tests, secciones, preguntas, opciones) y todas las **respuestas** de pacientes.
3. **Capturar respuestas** de dos formas:
   - **Fase 1 – Formularios amigables:** el paciente (o un evaluador en su nombre) completa el test paso a paso.
   - **Fase 2 – Conversación natural (objetivo final):** la IA conversa de forma cotidiana y, mediante un **motor conversacional con slot-filling** (function calling / structured outputs), guarda en la base de datos cada respuesta en cuanto la identifica, **sin que el paciente perciba que llena un formulario**.
4. **Generar resultados** a partir de las respuestas: **Hallazgos → Riesgos y Factores → Índice Brain Intelligence (Neurofit Brain Score™) → Plan de Recomendaciones**.

> **Principio rector (del documento base):** Neurofit IA **no diagnostica**. Los resultados son un índice de riesgo y señales de posible deterioro cognitivo, siempre con descargo y recomendación de valoración profesional cuando corresponda. Los pesos y puntos de corte están **pendientes de validación clínica** y deben ser configurables sin reconstruir la plataforma.

---

## 2. Alcance

### Dentro del alcance (MVP)
- CRUD de tests, secciones y preguntas (super admin).
- 4 tipos de pregunta solicitados (ver §4).
- Carga inicial (seed) de la **Preevaluación inicial** desde el `.md` adjunto (~80 preguntas).
- Formularios de respuesta para paciente y evaluador.
- Persistencia en Supabase con RLS.
- Motor conversacional con slot-filling que escribe respuestas en BD.
- Generación de Hallazgos, Riesgos y Factores, Índice Brain Intelligence y Plan de Recomendaciones.
- Consentimiento informado y auditoría.

### Fuera del alcance (por ahora)
- Pruebas cognitivas digitales interactivas (memoria de palabras, atención, etc.): se diseñan en una fase posterior (Ruta A/B del documento base).
- Cuestionario del informante/familiar (queda como historia futura, §10).
- Validación psicométrica de pesos y puntos de corte.
- Diagnóstico clínico de cualquier tipo.

---

## 3. Roles y permisos

| Rol | Descripción | Permisos |
|---|---|---|
| `super_admin` | Equipo de psicólogos / dueños del producto | **Único** que crea, edita, publica, archiva tests, secciones y preguntas; configura pesos, reglas y plantillas de recomendación; ve todas las evaluaciones. |
| `evaluador` | Profesional que aplica el test a un paciente | Crear una evaluación para un paciente asignado, completar el formulario, ver resultados de sus pacientes. **No** edita la estructura del test. |
| `profesional` | Psicólogo/a, fisioterapeuta o nutricionista (elige su profesión al primer ingreso) | Lee los resultados de los pacientes que el `super_admin` le asigna, **sin** ver respuestas individuales, y revisa las metas del plan de su profesión. **No** crea ni completa evaluaciones y **no** edita la estructura del test. El `super_admin` es el único que le asigna el rol. |
| `paciente` | Usuario final | Completa **solo** sus propias evaluaciones (formulario o conversación) y ve sus propios resultados. **No** ve ni edita la estructura del test. |

**Regla clave:** la gestión del módulo (estructura de tests) es exclusiva de `super_admin`; se aplica en la UI **y** en la base de datos con RLS (nunca solo en el frontend).

---

## 4. Tipos de pregunta

| Tipo (`question_type`) | Descripción | Valor almacenado | Ejemplo del documento base |
|---|---|---|---|
| `multiple_choice` | Selección múltiple (una o varias opciones). Flag `allow_multiple`. | Lista de `option_id` | Historial médico (hipertensión, diabetes…), tipo de actividad física |
| `true_false` | Falso / Verdadero (o Sí / No en la UI). | `boolean` | ¿Fumas actualmente? |
| `numeric_scale` | Numérico de **1 a 10** (límites configurables `min`/`max`). | `numeric` | Autoevaluación de memoria, nivel de estrés |
| `agreement` | Aceptación: de **"Totalmente en desacuerdo" a "Totalmente de acuerdo"** (escala Likert de 5 puntos por defecto). | `integer` (1–5) | "Me cuesta concentrarme en una conversación" |

### Extensiones recomendadas (a confirmar)
El documento base contiene preguntas que **no encajan** en los 4 tipos anteriores. Para cubrirlas sin perder información se proponen dos tipos adicionales y una convención:

- `open_text` — respuesta abierta (ej. FUNC_012, pregunta 80 "¿Qué cambio cognitivo te preocupa más?"). Es además la materia prima del análisis de lenguaje natural.
- `numeric_free` — numérico libre sin escala 1–10 (edad, horas de sueño, peso, talla, edad de inicio de síntomas).
- **Escalas de frecuencia 0–4** (Nunca / Rara vez / A veces / A menudo / Siempre) y **Independiente / Necesita ayuda**: se modelan como `multiple_choice` de una sola opción con `score` por opción, o como `agreement` con etiquetas personalizadas (`labels` por pregunta).

> **Decisión pendiente:** ¿aprobar `open_text` y `numeric_free` en el MVP? Sin ellos, ~15 preguntas del documento base no podrán cargarse.

---

## 5. Modelo de datos (Supabase / Postgres)

### 5.1 Diagrama lógico

```
tests ─┬─< test_sections ─┬─< questions ─┬─< question_options
       │                  │              └─ (scoring_rules)
       │
       └─< assessments ─┬─< answers
                        ├─< conversations ─< messages
                        ├─< extraction_events   (auditoría de slot-filling)
                        └─< assessment_results ─┬─ findings
                                                ├─ risk_factors
                                                ├─ brain_index
                                                └─ recommendation_plans
profiles (role: super_admin | evaluador | paciente)
```

### 5.2 Esquema SQL propuesto

```sql
-- Roles
create type user_role as enum ('super_admin', 'evaluador', 'paciente');
create type question_type as enum
  ('multiple_choice', 'true_false', 'numeric_scale', 'agreement', 'open_text', 'numeric_free');
create type test_status as enum ('draft', 'published', 'archived');
create type assessment_status as enum ('not_started', 'in_progress', 'completed', 'abandoned');
create type answer_source as enum ('form', 'conversation', 'evaluator');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'paciente',
  full_name text,
  created_at timestamptz default now()
);

create table tests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- ej. 'PREEVAL_V1'
  title text not null,
  description text,
  version int not null default 1,
  status test_status not null default 'draft',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table test_sections (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests(id) on delete cascade,
  code text not null,                        -- ej. 'MEM', 'ATT', 'FUNC'
  title text not null,
  description text,
  domain text,                               -- dominio cognitivo / de salud cerebral
  position int not null,
  unique (test_id, code)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references test_sections(id) on delete cascade,
  code text not null,                        -- ej. 'MEM_001'
  prompt text not null,                      -- texto formal de la pregunta
  conversational_hint text,                  -- guía para que la IA la formule de forma natural
  type question_type not null,
  config jsonb not null default '{}',        -- min, max, allow_multiple, labels, unit, etc.
  required boolean not null default true,
  position int not null,
  variable text,                             -- ej. 'memoria_reciente'
  direction text check (direction in ('higher_is_risk','higher_is_protective','neutral')),
  weight numeric,                            -- pendiente de validación clínica
  triggers_alert boolean default false,
  alert_rule jsonb,                          -- ej. {"op":">=","value":3}
  source text,                               -- 'propio' | 'instrumento validado'
  clinical_note text,
  depends_on jsonb,                          -- lógica condicional (mostrar si ...)
  active boolean default true,
  unique (section_id, code)
);

create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  value text not null,                       -- valor interno
  label text not null,                       -- texto visible
  score numeric,                             -- puntaje por opción
  position int not null,
  unique (question_id, value)
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests(id),
  test_version int not null,                 -- congela la versión aplicada
  patient_id uuid not null references profiles(id),
  evaluator_id uuid references profiles(id), -- null si lo llena el paciente
  mode text check (mode in ('form','conversation','mixed')) default 'form',
  status assessment_status not null default 'not_started',
  consent_id uuid,                           -- referencia al consentimiento aceptado
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_id uuid not null references questions(id),
  value jsonb not null,                      -- {"v": 3} | {"v": true} | {"v": ["opt1","opt2"]} | {"v":"texto"}
  score numeric,                             -- calculado
  source answer_source not null,
  confidence numeric,                        -- 0..1 (solo conversación)
  evidence text,                             -- fragmento del paciente que sustenta la respuesta
  needs_confirmation boolean default false,
  answered_at timestamptz default now(),
  unique (assessment_id, question_id)        -- upsert: una respuesta vigente por pregunta
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  state jsonb not null default '{}',         -- slots pendientes, tema actual, contadores
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text check (role in ('user','assistant','tool','system')) not null,
  content text,
  tool_calls jsonb,
  created_at timestamptz default now()
);

create table extraction_events (             -- bitácora de cada guardado hecho por la IA
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  message_id uuid references messages(id),
  question_id uuid references questions(id),
  action text,                               -- 'saved' | 'updated' | 'needs_confirmation' | 'rejected'
  payload jsonb,
  created_at timestamptz default now()
);

create table assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  findings jsonb,                            -- Hallazgos
  risk_factors jsonb,                        -- Riesgos y Factores (riesgo / protectores)
  brain_index jsonb,                         -- Índice Brain Intelligence + por dominio
  recommendation_plan jsonb,                 -- Plan 30/60/90 días
  alert_level text check (alert_level in ('green','yellow','orange','red')),
  model_version text,                        -- versión del algoritmo/pesos
  generated_at timestamptz default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id),
  version text not null,
  accepted_at timestamptz default now()
);

create table audit_log (
  id bigserial primary key,
  actor_id uuid,
  action text,
  entity text,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz default now()
);
```

### 5.3 Políticas RLS (resumen)

```sql
-- Helper
create function auth_role() returns user_role language sql stable as
$$ select role from profiles where id = auth.uid() $$;

-- tests / test_sections / questions / question_options
--   SELECT: todos los autenticados, solo si tests.status = 'published'
--           (super_admin ve todos, incluidos draft/archived)
--   INSERT / UPDATE / DELETE: SOLO auth_role() = 'super_admin'

-- assessments
--   SELECT: paciente (patient_id = auth.uid()) | evaluador (evaluator_id = auth.uid()) | super_admin
--   INSERT: paciente para sí mismo | evaluador | super_admin
--   UPDATE: solo mientras status <> 'completed' (paciente / evaluador dueño) | super_admin

-- answers / conversations / messages / extraction_events
--   Acceso por pertenencia a la assessment (misma regla que assessments).
--   La escritura desde la IA se hace SOLO con service_role en el servidor (Nitro), nunca desde el cliente.

-- assessment_results
--   SELECT: paciente dueño | evaluador asignado | super_admin
--   INSERT / UPDATE: solo service_role
```

> El paciente **nunca** debe poder leer `weight`, `alert_rule`, `clinical_note` ni `score` de las preguntas: exponerlas mediante una **vista** (`questions_public`) o columnas restringidas.

---

## 6. Historias de usuario

**Convenciones:** criterios de aceptación en formato *Dado / Cuando / Entonces*. Prioridad: **P0** (MVP), **P1** (siguiente), **P2** (futuro).

### Épica 1 — Acceso, roles y consentimiento

#### HU-01 · Inicio de sesión con roles · P0
**Como** usuario de Neurofit **quiero** iniciar sesión y ser dirigido a mi área según mi rol **para** ver solo lo que me corresponde.

**Criterios de aceptación**
- **Dado** un usuario con rol `paciente`, **cuando** inicia sesión, **entonces** accede al panel de paciente y no ve ninguna opción de gestión de tests.
- **Dado** un usuario `evaluador`, **cuando** inicia sesión, **entonces** ve la lista de sus pacientes asignados y puede iniciar evaluaciones.
- **Dado** un usuario `super_admin`, **cuando** inicia sesión, **entonces** ve además la sección "Gestión de evaluaciones".
- **Dado** un usuario sin rol de `super_admin`, **cuando** intenta abrir una ruta de gestión (por URL directa o API), **entonces** recibe 403 y la BD rechaza la operación por RLS.

#### HU-02 · Consentimiento informado antes de evaluar · P0
**Como** paciente **quiero** leer y aceptar cómo se usarán mis datos **para** decidir con confianza si continúo.

**Criterios de aceptación**
- **Dado** un paciente sin consentimiento vigente, **cuando** intenta iniciar una evaluación, **entonces** se le muestra el consentimiento y no puede continuar hasta aceptarlo.
- **Dado** que acepta, **cuando** confirma, **entonces** se registra `consents` con versión y fecha, y se vincula a la `assessment`.
- **Dado** que el texto del consentimiento cambia de versión, **cuando** el paciente inicia una nueva evaluación, **entonces** se le pide aceptar la versión nueva.
- El consentimiento explica explícitamente que el resultado **no es un diagnóstico médico**.

---

### Épica 2 — Gestión de tests (solo super admin)

#### HU-03 · Crear un test · P0
**Como** super admin **quiero** crear un test con título, descripción y código **para** organizar las evaluaciones de la plataforma.

**Criterios de aceptación**
- **Dado** que estoy en "Gestión de evaluaciones", **cuando** creo un test con título y código únicos, **entonces** se guarda en estado `draft`.
- **Dado** un código ya existente, **cuando** intento guardar, **entonces** veo un error claro y no se crea el test.
- Un test en `draft` **no** es visible para pacientes ni evaluadores.
- Queda registro en `audit_log` (quién y cuándo).

#### HU-04 · Gestionar secciones de un test · P0
**Como** super admin **quiero** agregar, editar, reordenar y eliminar secciones **para** agrupar las preguntas por dominio (Memoria, Atención, Sueño, etc.).

**Criterios de aceptación**
- **Dado** un test, **cuando** agrego una sección con título, código y dominio, **entonces** aparece en la posición indicada.
- **Dado** varias secciones, **cuando** las reordeno (arrastrar y soltar), **entonces** `position` se actualiza y el orden se refleja en los formularios.
- **Dado** una sección con preguntas, **cuando** intento eliminarla, **entonces** el sistema pide confirmación y avisa cuántas preguntas se eliminarán.
- **Dado** un test con evaluaciones ya respondidas, **cuando** intento eliminar una sección, **entonces** el sistema lo bloquea y sugiere archivar/crear nueva versión.

#### HU-05 · Crear preguntas de cada tipo · P0
**Como** super admin **quiero** crear preguntas de tipo selección múltiple, falso/verdadero, numérica 1–10 y de aceptación **para** modelar la preevaluación.

**Criterios de aceptación**
- **Dado** una sección, **cuando** creo una pregunta, **entonces** debo definir: código, texto, tipo, obligatoriedad y (opcional) variable, dirección, peso, alerta y pista conversacional.
- **Selección múltiple:** requiere ≥ 2 opciones; puedo marcar "permitir varias" y asignar puntaje por opción.
- **Falso/Verdadero:** se almacena como booleano; las etiquetas visibles ("Sí/No" o "Verdadero/Falso") son configurables.
- **Numérica 1–10:** `min` y `max` configurables (por defecto 1 y 10) con etiquetas opcionales en los extremos.
- **Aceptación:** escala de 5 puntos con etiquetas editables (por defecto "Totalmente en desacuerdo" → "Totalmente de acuerdo").
- **Dado** un código de pregunta duplicado en la misma sección, **cuando** guardo, **entonces** se rechaza.
- Todo se persiste en Supabase y es visible en la vista previa inmediatamente.

#### HU-06 · Editar, duplicar, ordenar y desactivar preguntas · P0
**Como** super admin **quiero** modificar el ciclo de vida de una pregunta **para** mantener el test actualizado sin perder datos históricos.

**Criterios de aceptación**
- **Dado** una pregunta sin respuestas, **cuando** la edito, **entonces** los cambios aplican directamente.
- **Dado** una pregunta con respuestas, **cuando** cambio su **tipo u opciones**, **entonces** el sistema exige crear una **nueva versión del test** (las respuestas históricas siguen ligadas a la versión original).
- **Dado** una pregunta, **cuando** la duplico, **entonces** se crea una copia con código sufijado y en `draft`.
- **Dado** una pregunta, **cuando** la desactivo, **entonces** deja de mostrarse en nuevas evaluaciones pero se conservan las respuestas previas.
- Soporta **lógica condicional** simple ("mostrar si FUNC_011 = Sí").

#### HU-07 · Publicar, versionar y archivar un test · P0
**Como** super admin **quiero** publicar una versión estable del test **para** que pacientes y evaluadores puedan usarla.

**Criterios de aceptación**
- **Dado** un test en `draft`, **cuando** lo publico, **entonces** pasa a `published`, valida que cada sección tenga ≥ 1 pregunta y cada pregunta cumpla su configuración mínima; si falla, muestra la lista de errores.
- **Dado** un test publicado, **cuando** necesito cambios estructurales, **entonces** se crea la versión `n+1` en `draft` sin afectar la versión en uso.
- **Dado** un test archivado, **cuando** un paciente intenta iniciarlo, **entonces** no está disponible, pero los resultados históricos siguen accesibles.
- Cada `assessment` guarda `test_version` para reproducibilidad.

#### HU-08 · Importar la preevaluación inicial desde el .md · P0
**Como** super admin **quiero** cargar en bloque las ~80 preguntas del documento base **para** no digitarlas una por una.

**Criterios de aceptación**
- **Dado** el archivo estructurado (CSV/JSON/MD con ID, dominio, pregunta, tipo, opciones, variable, puntuación, peso, alerta), **cuando** lo importo, **entonces** se crean secciones y preguntas con sus opciones.
- La importación muestra **vista previa y errores** (filas inválidas, tipos no soportados) antes de confirmar.
- Es **idempotente**: reimportar no duplica; actualiza por `code`.
- Las preguntas del documento con escala 0–4 quedan mapeadas con sus puntajes por opción; las de "Independiente / Necesita ayuda" quedan como selección única.
- Los pesos quedan en `null` con la marca "pendiente de validación".

#### HU-09 · Vista previa del test · P1
**Como** super admin **quiero** previsualizar el test como lo verá un paciente (formulario y modo conversación) **para** validarlo antes de publicar.

**Criterios de aceptación**
- La vista previa no crea datos reales de pacientes (modo simulación).
- Permite ver el recorrido en móvil y escritorio.
- En modo conversación muestra qué pregunta (slot) se llenó con cada mensaje.

#### HU-10 · Configurar reglas de puntaje, alertas y plantillas de recomendación · P1
**Como** super admin **quiero** editar pesos, direcciones, umbrales de alerta y plantillas de recomendación **para** ajustar el algoritmo cuando se valide clínicamente, sin tocar código.

**Criterios de aceptación**
- Cambios de pesos/umbrales se guardan con versión (`model_version`) y registro de auditoría.
- Los resultados ya generados conservan la `model_version` con la que se calcularon.
- Puedo recalcular manualmente un resultado con la versión vigente.

---

### Épica 3 — Respuesta mediante formularios (Fase 1)

#### HU-11 · Paciente completa el test en un formulario amigable · P0
**Como** paciente **quiero** responder el test en un formulario claro, por pasos y sin presión **para** completarlo cómodamente a mi ritmo.

**Criterios de aceptación**
- Una **sección por pantalla** (o pocas preguntas por pantalla) con **barra de progreso** y lenguaje cálido y sencillo.
- **Controles accesibles por tipo:** botones grandes para selección y V/F; control deslizante o botones 1–10 para numérica; escala con etiquetas legibles para aceptación.
- Tipografía grande, alto contraste, objetivos táctiles amplios (pensado para adultos mayores y familiares), compatible con móvil.
- **Guardado automático** al responder cada pregunta; si cierro la ventana puedo **retomar** donde quedé.
- Puedo **volver atrás** y cambiar respuestas antes de finalizar.
- Las preguntas obligatorias sin responder impiden finalizar y se señalan con un mensaje amable.
- Puedo elegir **"Prefiero no responder"** en preguntas sensibles (sustancias, salud emocional) cuando la pregunta lo permita.
- Al finalizar se muestra una pantalla de agradecimiento y paso siguiente (ver resultados).

#### HU-12 · Evaluador completa el test en nombre del paciente · P0
**Como** evaluador **quiero** llenar el test durante una consulta **para** registrar las respuestas del paciente.

**Criterios de aceptación**
- Solo puedo abrir evaluaciones de pacientes **asignados** a mí.
- Cada respuesta se marca con `source = 'evaluator'` y mi `evaluator_id`.
- Puedo guardar y retomar; veo qué respondió el paciente por su cuenta (si aplica) diferenciado por fuente.
- Puedo agregar una observación clínica por sección (campo opcional).

#### HU-13 · Validación y consistencia de respuestas · P0
**Como** sistema **quiero** validar cada respuesta contra la configuración de su pregunta **para** garantizar datos íntegros.

**Criterios de aceptación**
- Numéricas fuera de `min`/`max` se rechazan con mensaje claro (en cliente y servidor).
- Selección múltiple exige al menos una opción cuando la pregunta es obligatoria; opciones excluyentes ("Ninguno") deshabilitan las demás.
- Una respuesta se **actualiza** (upsert) sin crear duplicados por `(assessment_id, question_id)`.
- Los datos se validan **en el servidor** aunque el cliente ya los haya validado.

---

### Épica 4 — Persistencia en Supabase

#### HU-14 · Almacenamiento seguro de respuestas · P0
**Como** equipo Neurofit **quiero** que toda respuesta quede guardada en Supabase con trazabilidad **para** analizarla, auditarla y calcular resultados.

**Criterios de aceptación**
- Cada respuesta guarda: valor, puntaje calculado, fuente (`form` | `conversation` | `evaluator`), fecha y, si aplica, confianza y evidencia.
- RLS impide que un paciente lea o escriba respuestas de otro.
- Los datos sensibles (salud, sustancias) se almacenan cifrados en reposo (Supabase) y se accede a ellos solo por rol autorizado.
- Eliminar una cuenta permite **borrar o anonimizar** sus respuestas según política de privacidad.
- Existe respaldo y registro de auditoría de cambios sobre la estructura del test.

---

### Épica 5 — Motor conversacional con slot-filling (Fase 2, objetivo final)

#### HU-15 · Conversación natural que captura respuestas sin que parezca un formulario · P0
**Como** paciente **quiero** conversar con el asistente de Neurofit como en una charla cotidiana **para** compartir mi situación sin sentir que lleno un cuestionario.

**Criterios de aceptación**
- El asistente **no** enumera preguntas ni muestra "pregunta 12 de 80"; formula **una idea a la vez**, con tono cálido y lenguaje cotidiano (usa el `conversational_hint` de cada pregunta).
- Reconoce y registra **varias respuestas en un mismo mensaje** ("duermo unas 5 horas y casi siempre me despierto de madrugada" → completa SLP_001 y SLP_003).
- Adapta el orden según lo que el paciente cuenta (no obliga al orden de las secciones) pero **garantiza cobertura** de todas las preguntas obligatorias antes de cerrar.
- El paciente puede **escribir libremente** o hablar (voz a texto, P1) y puede pedir pasar a otro tema.
- El asistente **jamás** emite diagnósticos ni promete resultados clínicos durante la charla.

#### HU-16 · Slot-filling con function calling / structured outputs · P0
**Como** equipo técnico **quiero** que el modelo llene "slots" (preguntas) mediante llamadas a funciones con salida estructurada **para** que cada respuesta se guarde de forma confiable y auditable.

**Funciones (tools) del agente**

| Función | Propósito |
|---|---|
| `get_conversation_state()` | Devuelve slots llenos, pendientes, siguiente tema sugerido y banderas. |
| `save_answer(question_code, value, confidence, evidence)` | Guarda/actualiza la respuesta de una pregunta (upsert). |
| `flag_for_confirmation(question_code, interpreted_value)` | Marca una respuesta ambigua para confirmar con naturalidad. |
| `mark_not_answered(question_code, reason)` | El paciente prefiere no responder / no sabe. |
| `escalate_safety(reason)` | Activa el protocolo de seguridad (ver HU-19). |
| `finish_assessment()` | Solo permitido cuando todas las preguntas obligatorias están resueltas. |

**Criterios de aceptación**
- **Dado** que el paciente da información que responde una pregunta, **cuando** el modelo tiene suficiente certeza, **entonces** llama a `save_answer` con el valor **normalizado al tipo** de la pregunta (entero 1–5, booleano, número 1–10, lista de `option_id`) y la persiste en `answers` con `source = 'conversation'`.
- La salida de cada función se valida con **esquemas estrictos** (JSON Schema/Zod); si no cumple, se rechaza y el modelo reintenta.
- El **servidor** (no el modelo) escribe en Supabase usando `service_role`; el modelo nunca accede directo a la base.
- Cada guardado queda en `extraction_events` con el `message_id` de origen y la `evidence` (cita del paciente).
- **Dado** una confianza inferior al umbral configurable (ej. < 0.75), **entonces** no se guarda como definitiva: se llama a `flag_for_confirmation` y el asistente confirma de forma natural ("¿Dirías que eso te pasa a menudo o solo a veces?").
- **Dado** que el paciente corrige una respuesta anterior, **entonces** se actualiza el valor y se conserva el historial en `extraction_events`.
- El estado de slots se mantiene en `conversations.state` y permite **retomar** la conversación después.
- Una respuesta ya guardada no se vuelve a preguntar salvo corrección o contradicción detectada.

#### HU-17 · Mapeo de lenguaje natural a escalas · P0
**Como** sistema **quiero** traducir expresiones cotidianas a los valores de cada tipo de pregunta **para** que el paciente no tenga que "elegir un número".

**Criterios de aceptación**
- Para `agreement` y escalas de frecuencia, el modelo mapea frases ("casi siempre", "a veces me pasa", "nunca me ha pasado") a su valor, apoyado en ejemplos definidos en `config`.
- Para `numeric_scale` 1–10, si el paciente no da un número, el asistente propone un anclaje natural ("si 1 es nada y 10 es muchísimo…") antes de guardar.
- Para `true_false`, solo se guarda ante una afirmación/negación clara; en caso contrario se pide aclaración.
- Para `multiple_choice`, se mapean menciones a las opciones existentes; lo que no corresponda a ninguna opción se guarda como "otro" con texto.
- Existe un **conjunto de pruebas de regresión** (frases → valor esperado) por tipo de pregunta.

#### HU-18 · Control de cobertura y cierre de la conversación · P0
**Como** paciente **quiero** que el asistente sepa cuándo terminó **para** no repetir ni alargar la charla innecesariamente.

**Criterios de aceptación**
- El asistente mantiene un tablero interno de cobertura por sección; no cierra hasta que las preguntas obligatorias estén `answered` o `declined`.
- Al cerrar, resume con calidez lo conversado y pide confirmación antes de generar resultados.
- Si el paciente abandona, la `assessment` queda `in_progress` y puede retomarse; tras un tiempo configurable pasa a `abandoned`.
- El paciente puede **cambiar a modo formulario** en cualquier momento para completar lo pendiente (las respuestas ya capturadas aparecen precargadas y editables).

#### HU-19 · Seguridad y límites clínicos del asistente · P0
**Como** equipo clínico **quiero** que el asistente respete límites éticos **para** proteger a los pacientes.

**Criterios de aceptación**
- **Dado** un mensaje con señales de crisis (ideación suicida, autolesión, emergencia neurológica aguda como pérdida súbita de habla o debilidad facial), **entonces** el asistente suspende la captura, responde con empatía, muestra recursos de ayuda/urgencias de Colombia y registra la alerta para el equipo.
- El asistente **nunca** afirma "tienes Alzheimer/demencia"; usa el lenguaje del documento base ("señales que requieren seguimiento", "se recomienda valoración profesional").
- Incluye el descargo: *"Este resultado corresponde a una medición automatizada y no constituye un diagnóstico médico ni neuropsicológico."*
- Ante intentos de manipular el asistente (prompt injection, pedir que ignore reglas), mantiene su rol y no altera datos fuera de `save_answer`.
- Todas las conversaciones se registran para revisión por el equipo autorizado.

---

### Épica 6 — Resultados

> Los resultados se generan al completar la evaluación (formulario o conversación) y se guardan en `assessment_results`. Flujo: **Respuestas → Hallazgos → Riesgos y Factores → Índice Brain Intelligence → Plan de Recomendaciones.**

#### HU-20 · Hallazgos · P0
**Como** paciente/evaluador **quiero** ver los hallazgos principales de la evaluación **para** entender qué señales se identificaron.

**Criterios de aceptación**
- Presenta hallazgos **por dominio** (memoria, atención, funciones ejecutivas, idioma, orientación/visoespacial, funcionalidad, sueño, emoción, etc.) con un semáforo: 🟢 sin señales relevantes · 🟡 requiere seguimiento · 🟠 valoración profesional recomendada · 🔴 valoración profesional prioritaria.
- Cada hallazgo cita **qué respuestas** lo originan (trazabilidad para el evaluador).
- Incluye hallazgos derivados de texto libre (ej. pregunta 80) clasificados como "ámbito potencialmente afectado", **nunca** como diagnóstico.
- Las alertas por reglas (`triggers_alert`, ej. "cambios rápidos") se destacan arriba con acción sugerida.
- Redacción en lenguaje claro, sin tecnicismos para el paciente; versión detallada para el evaluador.

#### HU-21 · Riesgos y Factores · P0
**Como** paciente/evaluador **quiero** ver los factores de riesgo y los factores protectores **para** saber en qué puedo actuar.

**Criterios de aceptación**
- Separa claramente **factores de riesgo modificables** (sedentarismo, sueño, nutrición, tabaco/alcohol, aislamiento social, hipertensión/diabetes, salud emocional) de **no modificables** (edad, antecedentes familiares) y **factores protectores** (actividad cognitiva, social, artística/NeuroArte, actividad física).
- Cada factor muestra su nivel (bajo/medio/alto) y las preguntas que lo sustentan.
- El **riesgo futuro** y las **señales cognitivas actuales** se presentan por separado (dos motores distintos, según el documento base), para no mezclarlos.
- Datos aislados (presión, glucosa, colesterol) **no** se interpretan como diagnóstico.

#### HU-22 · Índice Brain Intelligence (Neurofit Brain Score™) · P0
**Como** paciente **quiero** ver un índice resumen de la salud de mi cerebro **para** tener una referencia clara y poder compararla en el tiempo.

**Criterios de aceptación**
- Calcula un índice general y **subíndices** por dominio a partir de puntajes y pesos configurables (sin hardcodear).
- Muestra el índice **junto con** el desglose visual (perfil cognitivo, salud cerebral, funcionalidad); nunca un número aislado.
- Si los pesos aún no están validados, el índice se muestra como **"preliminar / línea base"** con la leyenda correspondiente.
- Guarda la `model_version` usada; recalcular con otra versión no sobrescribe resultados anteriores.
- Si faltan respuestas, el índice indica su **nivel de completitud/confianza** en vez de asumir valores.
- **No** se denomina "diagnóstico"; el nombre comercial final (Brain Score / Brain Intelligence) queda por confirmar.

#### HU-23 · Plan de Recomendaciones · P0
**Como** paciente **quiero** recibir un plan personalizado **para** saber qué hacer a partir de mis resultados.

**Criterios de aceptación**
- Genera un **plan 30/60/90 días** con metas concretas por cada factor modificable detectado (ej. baja actividad física → meta semanal; sueño irregular → higiene del sueño; baja estimulación cognitiva → actividades; aislamiento → actividades sociales; factor protector artístico → mantener NeuroArte).
- Las recomendaciones salen de **plantillas aprobadas por el equipo de psicólogos** (gestionadas por super admin); la IA personaliza el tono pero no inventa intervenciones clínicas.
- Incluye, cuando corresponda, la **recomendación de derivación profesional** y su urgencia.
- Programa **recordatorios de reevaluación** (30/60/90/180 días).
- El evaluador puede revisar y ajustar el plan antes/después de entregarlo (P1).
- El plan se puede descargar/compartir en PDF (P1).

---

### Épica 7 — Seguridad, privacidad y auditoría

#### HU-24 · Auditoría y trazabilidad · P0
**Como** super admin **quiero** un registro de cambios **para** saber quién modificó qué en la estructura del test, pesos y resultados.

**Criterios de aceptación**
- `audit_log` registra creación/edición/eliminación/publicación de tests, secciones, preguntas, pesos y plantillas, con actor, fecha y diff.
- El registro es de solo lectura, accesible solo para `super_admin`.

#### HU-25 · Privacidad y derechos del titular · P0
**Como** paciente **quiero** controlar mis datos **para** sentirme seguro al compartir información de salud.

**Criterios de aceptación**
- Puedo **descargar** mis respuestas y resultados y **solicitar su eliminación**.
- Las respuestas sensibles se muestran solo a quienes tienen autorización explícita.
- El tratamiento de datos cumple la normativa aplicable en Colombia (Ley 1581 de 2012 y reglamentación sobre datos sensibles de salud) — **a validar con asesor legal**.
- Los datos enviados al proveedor del LLM se minimizan (sin identificadores directos) y se documenta el proveedor y su política de retención.

---

### Épica 8 — Evolución (futuro)

#### HU-26 · Seguimiento longitudinal · P1
**Como** paciente **quiero** repetir la evaluación cada 6–12 meses y ver cómo cambió respecto a mi línea base **para** monitorear mi evolución.
- La primera evaluación se marca como **línea base**; las siguientes muestran variación por dominio.

#### HU-27 · Cuestionario del informante/familiar · P2
**Como** paciente **quiero** invitar a un familiar a responder preguntas sobre los cambios que observa **para** complementar mi autopercepción.
- Genera un enlace independiente y de un solo uso; el informante no accede a los datos del paciente.

#### HU-28 · Pruebas cognitivas digitales · P2
Integración de la batería cognitiva (instrumentos validados o Neurofit™ en desarrollo) como nuevas secciones/tipos de pregunta del mismo módulo.

#### HU-29 · Panel de analítica para super admin · P2
Métricas de uso: tasa de finalización, abandono por pregunta, tiempo promedio, preguntas con más aclaraciones en el modo conversacional.

---

### Épica 9 — Puesta en marcha del Test 1 (ecosistema listo)

> Objetivo: una vez construido el ecosistema (Épicas 1–6), el **Test 1** queda cargado, validado y publicado, y un paciente puede completarlo y recibir resultados. Contenido en [`test-1.md`](test-1.md): **13 módulos, 124 preguntas** (incluye las 80 numeradas de `EVALUACIÓN NEUROLÓGICA-NeurofitIA.md`). Esta épica concreta y amplía HU-08.

#### HU-30 · Cargar el Test 1 con sus 13 módulos y 124 preguntas · P0
**Como** super admin **quiero** cargar el Test 1 desde `test-1.md` **para** tener la preevaluación completa en Supabase sin digitarla.

**Criterios de aceptación**
- **Dado** `test-1.md`, **cuando** ejecuto la carga, **entonces** se crea el test `TEST_1` en `draft` con **13 secciones** (DAT, ANT, MEM, ATT, EXEC, LANG, ORI, FUNC, EMO, SLP, PHY, NUT, SOCCOG) en el orden del documento y **124 preguntas** con sus opciones y puntajes.
- Cada pregunta conserva su `code` (ej. `MEM_001`), su referencia al documento base (P1–P80, cuando exista) y su `type` correcto (F5/IND → selección única con `score`; SN → V/F; NUM → `numeric_free`; OPEN → `open_text`).
- La carga es **idempotente** (upsert por `code`) y reporta un resumen: secciones, preguntas por tipo, filas rechazadas.
- Pesos en `null` ("pendiente de validación"); direcciones (`higher_is_risk` / `higher_is_protective` / `neutral`) según cada módulo.
- Se verifica con un test unitario que el conteo por módulo coincide con `test-1.md`.

#### HU-31 · Catálogo de escalas reutilizables · P0
**Como** super admin **quiero** escalas predefinidas (Frecuencia 0–4, Independiente/Necesita ayuda, Sí/No/No lo sé, Frecuencia de consumo) **para** no recrear las mismas opciones en cada pregunta.

**Criterios de aceptación**
- Al crear una pregunta puedo elegir una escala del catálogo y se copian sus opciones y puntajes.
- Cambiar el catálogo no altera preguntas ya creadas ni respuestas históricas.
- Las etiquetas de cada escala están en los archivos i18n `es` y `en`.

#### HU-32 · Lógica condicional y exclusión del Test 1 · P0
**Como** paciente **quiero** que solo me pregunten lo que aplica a mí **para** no responder cosas irrelevantes.

**Criterios de aceptación**
- Se aplican las condiciones definidas en `test-1.md`: `DAT_010` si `DAT_009` = No; `DAT_014` si hay cambios notados; `GEN_002/003` si `GEN_001` = Sí; `MED_002` si `MED_001` = Sí; `SUB_002` si `SUB_001` = No; `SUB_004` si `SUB_003` = Sí; `FUNC_011/013` si alguna actividad "Necesita ayuda"; `FUNC_012` si `FUNC_011` = Sí.
- Una pregunta oculta por condición no cuenta como obligatoria pendiente ni en formulario ni en conversación.
- Si el paciente cambia una respuesta que oculta preguntas, las respuestas ocultas se marcan como no aplicables (no se borran de forma silenciosa).
- Las opciones excluyentes ("Ninguna") funcionan en `HIS_001` y `PHY_003`.

#### HU-33 · Pistas conversacionales para todas las preguntas · P0
**Como** equipo clínico **quiero** una pista de conversación por pregunta **para** que el asistente (HU-15) la formule de forma natural.

**Criterios de aceptación**
- Las 124 preguntas del Test 1 tienen `conversational_hint`; la publicación (HU-34) se bloquea si falta alguna.
- Las preguntas de escala incluyen 2–3 ejemplos de frases → valor para el mapeo de HU-17.
- Las preguntas sensibles (SUB, EMO, DAT_011) indican cómo introducirlas con tacto y que se puede declinar.

#### HU-34 · Verificación de integridad y publicación del Test 1 · P0
**Como** super admin **quiero** una verificación automática antes de publicar **para** no liberar un test incompleto.

**Criterios de aceptación**
- Valida: 13 secciones, ≥ 1 pregunta por sección, tipos y opciones válidos, referencias de condiciones existentes, `conversational_hint` completo, sin códigos duplicados.
- Si algo falla, lista los errores por módulo y pregunta; no publica.
- Si pasa, cambia a `published` (v1), queda en `audit_log` y es visible para pacientes y evaluadores.
- Los módulos o preguntas marcados **borrador** (EMO) se publican con advertencia visible al super admin y **sin peso** en el índice.

#### HU-35 · Módulo Estado emocional con instrumento validado · P1
**Como** psicólogo **quiero** reemplazar los ítems borrador del Módulo 9 por un instrumento validado **para** cumplir el criterio clínico del documento base.

**Criterios de aceptación**
- Puedo sustituir `EMO_001–009` por los ítems del instrumento elegido creando una nueva versión del test, sin perder respuestas de la versión anterior.
- El puntaje del instrumento se calcula con su método oficial y se guarda como resultado del módulo.
- Se registra la fuente y licencia del instrumento en la pregunta (`source`).

#### HU-36 · Alertas iniciales del Test 1 · P0
**Como** equipo clínico **quiero** alertas configuradas desde el primer día **para** que las señales prioritarias no pasen desapercibidas.

**Criterios de aceptación**
- `DAT_014` = "Han empeorado rápidamente" genera alerta de nivel 🟠 como mínimo (regla `alert_rule` editable por HU-10).
- Un cambio nuevo en funcionalidad (`FUNC_011` = Sí) con ≥ 2 actividades en "Necesita ayuda" genera alerta 🟠.
- Las alertas aparecen en Hallazgos (HU-20) y en el panel del evaluador, con el texto de descargo.
- Los umbrales son datos en BD, no código.

#### HU-37 · Recorrido completo de prueba (smoke test end-to-end) · P0
**Como** equipo técnico **quiero** un recorrido automatizado con el Test 1 **para** confirmar que el ecosistema funciona de principio a fin.

**Criterios de aceptación**
- **Dado** un paciente de prueba con consentimiento, **cuando** completa el Test 1 por formulario (con datos de ejemplo definidos en pruebas), **entonces** se guardan las 124 respuestas (las no aplicables como tal), la evaluación pasa a `completed` y se generan Hallazgos, Riesgos y Factores, Índice y Plan.
- El mismo recorrido por conversación (con LLM simulado) llena los mismos slots y cierra con `finish_assessment()`.
- Un paciente no puede leer respuestas de otro (prueba de RLS) y solo `super_admin` modifica el test.
- Funciona en ES y EN, en tema claro/oscuro y a 360 px de ancho.
- Corre en CI antes de cada despliegue a Netlify.

#### HU-38 · Datos de ejemplo para pruebas y demostración · P1
**Como** equipo **quiero** perfiles de ejemplo (sin señales, con señales de seguimiento, con alerta) **para** probar resultados y demostrar el producto sin datos reales.

**Criterios de aceptación**
- Existen al menos 3 conjuntos de respuestas del Test 1 con el resultado esperado por dominio.
- Se cargan solo en entornos de desarrollo y pruebas, nunca en producción.
- Sirven como casos de regresión para el cálculo del índice (HU-22).

#### HU-39 · Catálogo de medicamentos para el cruce cognitivo · P1
**Como** paciente **quiero** indicar mis medicamentos desde una lista **para** que el sistema detecte los que pueden afectar la cognición sin que la IA los "adivine".

**Criterios de aceptación**
- `MED_002` permite buscar y elegir de un catálogo, o escribir uno libre.
- El cruce con una base farmacológica marca medicamentos relevantes y lo muestra como factor en Riesgos y Factores, sin recomendar suspenderlos.
- Si no hay catálogo disponible, el texto libre se guarda y queda pendiente de revisión por el evaluador.

### Épica 10 — Profesionales de la salud

> Un rol nuevo, `profesional`, para psicólogos, fisioterapeutas y nutricionistas. Lee los resultados de los pacientes que se le asignan y revisa la parte del plan de su profesión. No completa evaluaciones ni edita la estructura del test. Es distinto del `evaluador`.

#### HU-40 · Asignar el rol de profesional · P1
**Como** super admin **quiero** crear usuarios con el rol `profesional` o cambiar a este rol a un usuario existente **para** habilitar a psicólogos, fisioterapeutas y nutricionistas en la plataforma.

**Criterios de aceptación**
- **Dado** un `super_admin` en la gestión de usuarios, **cuando** crea un usuario y elige el rol "Profesional", **entonces** el perfil queda con `role = 'professional'`, activo, y aparece en la lista con ese rol.
- **Dado** un usuario existente, **cuando** el `super_admin` cambia su rol a "Profesional", **entonces** conserva su cuenta y datos; si el rol anterior tenía asignaciones de pacientes, se pide confirmación indicando cuántas se eliminarán.
- **Dado** un usuario que no es `super_admin`, **cuando** intenta asignar o cambiar un rol (interfaz, API o SQL), **entonces** se rechaza; un profesional tampoco puede cambiar su propio rol.
- **Dado** un profesional activo, **cuando** inicia sesión, **entonces** llega a su panel `/dashboard/profesional`; no ve gestión de tests, usuarios ni auditoría, y una ruta no permitida lo devuelve a su inicio.
- **Dado** un profesional desactivado, **cuando** intenta iniciar sesión, **entonces** se cierra su sesión con el mensaje de cuenta inactiva.
- **Dado** el rol nuevo, **cuando** se muestra en listas, formularios o selectores, **entonces** aparece traducido (`es` y `en`) con icono y color propios.
- **Dado** una asignación o un cambio de rol, **cuando** se guarda, **entonces** queda en `audit_log` con el usuario afectado y los roles anterior y nuevo.

**Fuera de alcance:** Roles personalizados creados por el super admin. Un usuario con dos roles a la vez.

**Depende de:** HU-01, HU-24

#### HU-41 · Elegir la profesión al primer ingreso · P1
**Como** profesional **quiero** elegir mi profesión (psicólogo/a, fisioterapeuta o nutricionista) al entrar por primera vez **para** que la plataforma me muestre lo que corresponde a mi área.

**Criterios de aceptación**
- **Dado** un profesional sin profesión elegida, **cuando** inicia sesión, **entonces** se le lleva a la pantalla de elección y no puede abrir otra vista del panel hasta elegir.
- La pantalla ofrece exactamente tres opciones (Psicólogo/a, Fisioterapeuta, Nutricionista) y elegir una es obligatoria.
- **Dado** que confirma su elección, **cuando** se guarda, **entonces** pasa a su panel y en los siguientes ingresos no se le vuelve a pedir.
- **Dado** un profesional con profesión, **cuando** abre su perfil, **entonces** puede cambiarla; el cambio queda en `audit_log`.
- Un valor distinto de los tres se rechaza en el cliente, en el servidor y en la base de datos.
- Solo el propio profesional y el `super_admin` pueden leer o cambiar su profesión; el `super_admin` puede corregirla desde la gestión de usuarios.
- La lista de usuarios del `super_admin` muestra la profesión de cada profesional y permite filtrar por ella.

**Fuera de alcance:** Profesiones adicionales (se añaden con una migración y una clave de traducción). Verificación de títulos o tarjeta profesional.

**Depende de:** HU-40

#### HU-42 · Asignar pacientes a un profesional · P1
**Como** super admin **quiero** asignar pacientes a un profesional **para** que solo vea a las personas que atiende.

**Criterios de aceptación**
- **Dado** un `super_admin`, **cuando** abre un profesional en la gestión de usuarios, **entonces** puede asignarle uno o varios pacientes y retirárselos.
- Solo pueden asignarse pacientes con rol `paciente` a profesionales activos con rol `profesional`; cualquier otra combinación se rechaza con un mensaje claro.
- Un paciente puede tener varios profesionales y un profesional varios pacientes; la misma pareja no se repite.
- **Dado** un profesional, **cuando** abre "Mis pacientes", **entonces** ve solo los pacientes asignados a él.
- **Dado** un paciente, **cuando** abre su perfil, **entonces** ve qué profesionales (nombre y profesión) pueden ver sus resultados.
- **Dado** que se desactiva a un profesional o se le cambia el rol, **cuando** ocurre, **entonces** sus asignaciones dejan de dar acceso de inmediato.
- Cada asignación y cada retiro queda en `audit_log`.

**Fuera de alcance:** Autoasignación por parte del profesional o solicitud de acceso del profesional al paciente. Que el paciente revoque el acceso (ver pregunta abierta).

**Depende de:** HU-40, HU-41

#### HU-43 · Panel del profesional y lectura de resultados · P1
**Como** profesional **quiero** ver los resultados de mis pacientes asignados **para** orientar mi atención desde mi área.

**Criterios de aceptación**
- **Dado** un profesional, **cuando** abre su panel, **entonces** ve sus pacientes asignados con el estado de su última evaluación (sin evaluar, en curso, completada), el nivel de alerta más alto y la fecha.
- **Dado** un paciente asignado con una evaluación completada, **cuando** abre su ficha, **entonces** ve Hallazgos, Riesgos y factores, Índice y Plan, con el descargo y la versión del modelo.
- El acceso es de solo lectura: el profesional no crea, completa ni edita evaluaciones ni respuestas.
- El profesional no ve respuestas individuales, mensajes de conversación, notas del evaluador ni las respuestas que originan cada hallazgo.
- **Dado** un paciente no asignado, **cuando** el profesional intenta abrir su ficha (URL o API), **entonces** recibe 403 y la base de datos no devuelve filas.
- **Dado** un paciente sin evaluaciones completadas, **cuando** se abre su ficha, **entonces** se indica que aún no hay resultados.
- Las alertas activas de sus pacientes aparecen destacadas en el panel.
- **Dado** un paciente cuyo consentimiento vigente no incluye compartir con profesionales, **cuando** el profesional abre su ficha, **entonces** ve que falta el consentimiento y ningún resultado.
- Cada apertura de una ficha queda registrada en `audit_log` con el profesional, el paciente y la fecha.

**Fuera de alcance:** Contacto o mensajería entre profesional y paciente. Ver respuestas individuales (ver pregunta abierta).

**Depende de:** HU-42, HU-20, HU-21, HU-22, HU-23, HU-25, HU-02

#### HU-44 · Revisión del plan por profesión · P1
**Como** profesional **quiero** revisar y ajustar las metas del plan que corresponden a mi profesión **para** que el paciente reciba indicaciones validadas por un especialista de su área.

**Criterios de aceptación**
- Cada meta del plan lleva la profesión que le corresponde según el factor que la origina; las que no pertenecen a ninguna quedan como generales.
- **Dado** un profesional asignado, **cuando** abre el plan de un paciente, **entonces** ve todas las metas pero solo puede editar las de su profesión.
- **Dado** que edita una meta, **cuando** guarda, **entonces** se crea una nueva versión con autor y fecha y la anterior se conserva.
- El profesional no puede eliminar la recomendación de derivación profesional ni cambiar el nivel de alerta.
- El texto ajustado no puede contener un diagnóstico; si lo contiene, se rechaza.
- **Dado** que marca una meta como revisada, **cuando** el paciente ve su plan, **entonces** lee "Revisado por <profesión>" con la fecha; las no revisadas indican "Generado automáticamente".
- **Dado** un profesional de otra profesión o no asignado, **cuando** intenta editar o revisar esa meta, **entonces** recibe 403 y la base de datos lo impide.
- Cada versión y cada revisión queda en `audit_log` y el `super_admin` puede consultar quién revisó qué.

**Fuera de alcance:** Que el plan espere la revisión antes de mostrarse al paciente (ver pregunta abierta). Crear metas nuevas que no salgan de una plantilla.

**Depende de:** HU-43, HU-23

---

## 7. Diseño del motor conversacional (slot-filling)

### 7.1 Concepto
Cada **pregunta activa** del test es un **slot**. La conversación es un bucle que:

```
mensaje del paciente
   ↓
[1] Cargar estado (slots llenos / pendientes / en confirmación)
   ↓
[2] LLM interpreta el mensaje + contexto + definiciones de slots pendientes
   ↓
[3] LLM invoca tools (save_answer / flag_for_confirmation / escalate_safety …)
   ↓
[4] Servidor valida (esquema + rango + tipo) y escribe en Supabase
   ↓
[5] Se actualiza el estado y se decide el siguiente tema (planificador)
   ↓
[6] LLM redacta la siguiente intervención natural (sin sonar a formulario)
```

### 7.2 Componentes
- **Planificador de diálogo (determinista):** decide qué slots perseguir a continuación según cobertura, dependencias (`depends_on`) y relevancia contextual. El LLM redacta; **no** decide por sí solo qué falta.
- **Extractor:** LLM con salida estructurada que devuelve `{question_code, value, confidence, evidence}` por cada slot detectado en el mensaje.
- **Normalizador/validador:** convierte el valor al tipo exacto de la pregunta y verifica rangos/opciones.
- **Gestor de confirmación:** maneja ambigüedades de forma natural, sin pedir "confirma tu respuesta a la pregunta X".
- **Guardia de seguridad:** detecta crisis y mensajes fuera de alcance; fuerza el protocolo (HU-19).
- **Generador de resultados:** proceso separado (no conversacional) que lee `answers` y produce hallazgos, riesgos y factores, índice y plan.

### 7.3 Ejemplo de esquema de tool (structured output)

```json
{
  "name": "save_answer",
  "description": "Guarda la respuesta del paciente a una pregunta del test cuando hay evidencia suficiente.",
  "parameters": {
    "type": "object",
    "properties": {
      "question_code": { "type": "string", "description": "Código de la pregunta, ej. MEM_001" },
      "value": {
        "description": "Valor normalizado según el tipo de la pregunta",
        "oneOf": [
          { "type": "integer", "minimum": 1, "maximum": 10 },
          { "type": "boolean" },
          { "type": "array", "items": { "type": "string" } },
          { "type": "string" }
        ]
      },
      "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
      "evidence": { "type": "string", "description": "Cita textual breve del paciente que sustenta la respuesta" }
    },
    "required": ["question_code", "value", "confidence", "evidence"]
  }
}
```

### 7.4 Ejemplo de interacción

> **Asistente:** ¡Hola, María! Cuéntame, ¿cómo has estado últimamente con el día a día?
> **Paciente:** Pues bien, aunque últimamente se me olvidan cosas, ayer le pregunté a mi hija lo mismo tres veces.
> *→ `save_answer(MEM_009, agreement=4, conf=0.82, evidence="le pregunté a mi hija lo mismo tres veces")`*
> *→ `flag_for_confirmation(MEM_001, ...)` (se menciona olvido, intensidad ambigua)*
> **Asistente:** Eso le pasa a mucha gente, no te preocupes. ¿Dirías que esos olvidos te ocurren a menudo o más bien de vez en cuando?

El paciente nunca ve códigos, escalas ni numeración.

### 7.5 Reglas anti-"formulario"
- Máximo **una pregunta abierta** por turno; evitar listas y opciones numeradas.
- Reformular con ejemplos de la vida diaria; empatía antes de profundizar.
- Variar la forma de preguntar y no repetir estructuras.
- Nunca decir "pregunta X de Y" ni mostrar porcentaje de avance en este modo.

---

## 8. Requisitos no funcionales

| Área | Requisito |
|---|---|
| **Seguridad** | RLS en todas las tablas; escritura de IA solo vía `service_role` en servidor; claves nunca expuestas al cliente; límite de tasa por usuario. |
| **Privacidad** | Consentimiento versionado; minimización de datos hacia el LLM; derecho de acceso/eliminación; cifrado en tránsito y reposo. |
| **Accesibilidad** | WCAG 2.1 AA; texto grande, alto contraste, navegación por teclado y lector de pantalla; pensado para adultos mayores. |
| **Rendimiento** | Respuesta del asistente < 4 s (p95) por turno; guardado de formulario < 500 ms. |
| **Disponibilidad** | Guardado parcial y reanudación ante fallos de red. |
| **Idioma** | Español (Colombia) por defecto; arquitectura lista para i18n. |
| **Trazabilidad** | Versionado de tests y de modelo de puntuación; auditoría de cambios y de cada slot guardado por IA. |
| **Calidad del LLM** | Suite de evaluación (frases → valores esperados), pruebas de seguridad (crisis, inyección) y revisión humana de muestras. |
| **Mantenibilidad** | Pesos, umbrales y plantillas fuera del código (en BD). |

---

## 9. Plan de entrega sugerido

Cuatro sprints, en el orden lógico del desarrollo (cada historia después de sus dependencias). El detalle está en [`specs/plan-tests.md`](../specs/plan-tests.md).

| Sprint | Contenido | Historias |
|---|---|---|
| **Sprint 1 – Fundamentos y gestión de tests** | Esquema, roles, RLS, auditoría y pruebas; CRUD de tests, secciones y preguntas; escalas; versionado; importación | HU-01, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-24, HU-31 |
| **Sprint 2 – Test 1 y respuestas por formulario** | Carga, condiciones, pistas, alertas y publicación del Test 1; consentimiento; almacenamiento y validación de respuestas; formularios de paciente y evaluador | HU-02, HU-11, HU-12, HU-13, HU-14, HU-30, HU-32, HU-33, HU-34, HU-36 |
| **Sprint 3 – Resultados y conversación** | Hallazgos, riesgos y factores, índice, plan, reglas y datos de ejemplo; privacidad; motor conversacional (slot-filling, mapeo, cobertura, seguridad); recorrido end-to-end | HU-10, HU-15, HU-16, HU-17, HU-18, HU-19, HU-20, HU-21, HU-22, HU-23, HU-25, HU-37, HU-38 |
| **Sprint 4 – Profesionales y evolución** | Rol profesional (profesión, pacientes asignados, lectura de resultados, revisión del plan); medicamentos; vista previa; seguimiento; informante; pruebas digitales; analítica; instrumento emocional | HU-09, HU-26, HU-27, HU-28, HU-29, HU-35, HU-39, HU-40, HU-41, HU-42, HU-43, HU-44 |

El Sprint 3 cierra el MVP (todas las historias P0). Las fases anteriores (0, 1, 1b, 2, 3, 4, 5 y 6) se agrupan así: Sprint 1 = Fase 0 + Fase 1; Sprint 2 = Fase 1b + Fase 2; Sprint 3 = Fase 3 + Fase 4; Sprint 4 = Fase 5 + Fase 6.

> Se recomienda construir **primero los formularios (Sprint 2)**: sirven de base para validar el modelo de datos y funcionan como "modo respaldo" del motor conversacional.

---

## 10. Definition of Done (por historia)

- Criterios de aceptación cumplidos y verificados.
- Pruebas automatizadas (unitarias de validación/puntaje; e2e de flujos clave; pruebas de políticas RLS por rol).
- RLS revisada: un paciente no accede a datos de otro y solo `super_admin` modifica la estructura.
- Revisión de accesibilidad y de textos por el equipo de psicólogos.
- Para historias del motor conversacional: suite de evaluación del LLM aprobada y revisión de seguridad.
- Documentación actualizada.

---

## 11. Riesgos y supuestos

| Riesgo / supuesto | Mitigación |
|---|---|
| El paciente puede responder de forma ambigua o contradictoria en la conversación | Umbral de confianza, confirmación natural, historial en `extraction_events`, modo formulario como respaldo. |
| Pesos y puntos de corte aún no validados clínicamente | Marcar resultados como preliminares; mantenerlos configurables; planear estudio de validación. |
| Riesgo de que el resultado se interprete como diagnóstico | Lenguaje controlado, descargos visibles, revisión legal y clínica de textos. |
| Datos sensibles de salud | Minimización, consentimiento, RLS, cifrado, asesoría legal (Ley 1581). |
| Alucinaciones o errores del LLM al guardar datos | Esquemas estrictos, validación en servidor, evidencia obligatoria, pruebas de regresión. |
| Preguntas del documento base que no encajan en los 4 tipos | Aprobar `open_text` y `numeric_free` (§4). |
| El documento base tiene errores de redacción y el módulo emocional no tiene ítems definitivos | Corrección marcada en `test-1.md` (⚑), revisión de psicología y HU-35. |

---

## 12. Preguntas abiertas para el equipo

1. ¿Se aprueban los tipos adicionales `open_text` y `numeric_free` en el MVP?
2. Nombre oficial del índice: ¿**Neurofit Brain Score™** o **Índice Brain Intelligence**?
3. ¿Qué proveedor/modelo de LLM se usará y en qué región se procesarán los datos?
4. ¿El evaluador es un rol interno del equipo de psicólogos o también externo (clínicas aliadas)? ¿Los pacientes se asignan a evaluadores manualmente?
5. ¿Quién valida las plantillas de recomendación y cada cuánto se revisan?
6. ¿El paciente podrá ver su Índice inmediatamente o solo tras revisión del evaluador (según nivel de alerta)?
7. ¿Se requiere voz (voz a texto / texto a voz) desde la primera versión del modo conversacional?
8. Módulo 9 (Estado emocional): ¿qué instrumento validado se usará y quién gestiona su licencia?
9. ~~¿Se aprueban las redacciones corregidas (⚑) y las opciones propuestas (†) de `test-1.md`?~~ **Aprobado** por el usuario.
10. ¿Se incluyen hidratación, grasas saturadas y regularidad de comidas en el Módulo 12?
11. Profesionales: ¿ven las respuestas de los dominios de su profesión o solo resultados? Hoy solo resultados.
12. Profesionales: ¿el plan se muestra al paciente solo cuando un profesional lo revisó? Hoy se muestra de inmediato.
13. Profesionales: ¿se confirma la correspondencia factor → profesión (psicología: salud emocional, estimulación cognitiva, socialización y sueño; fisioterapia: actividad física y tiempo sentado; nutrición: alimentación y salud metabólica; general: tabaco/alcohol, medicamentos y derivación)?
14. Profesionales: ¿puede el paciente revocar el acceso de un profesional y se valida la profesión con documento? Hoy no.
15. Profesionales: texto legal de compartir resultados con profesionales, a validar con asesor legal (obliga a una nueva versión del consentimiento).
