# Plan de implementación: Módulo de Evaluaciones — Neurofit IA

> **Reglas:** [`docs/constitution.md`](../docs/constitution.md) · **Especificación rectora:** [`specs.md`](specs.md) · **Specs por historia:** `HU001-spec.md` … `HU039-spec.md`  
> **Estado:** Borrador para aprobación · **Fecha:** 2026-10-09 · **Alcance de este documento:** planificar, no implementar

Este plan responde cuatro preguntas: **cómo se organiza el código** (§2), **cómo se organizan los datos** (§3), **en qué orden se construye** (§4–§5) y **por qué se decidió así** (§6), más **cómo se prueba** (§7). Cada tarea cita su spec y sus pruebas, como exige el principio 2 de la constitución.

---

## 1. Cómo usar y modificar este plan

- **Una HU, una spec, un bloque de tareas.** Si cambia una historia, se cambia primero su `HUXXX-spec.md` y después su bloque en §5.
- **Ids estables.** Las tareas son `TA-HUxxx-nn`, las pruebas `T-HUxxx-nn` y los requisitos `RF-nn`. Un id nunca se reutiliza; si una tarea se elimina, se tacha (`~~…~~`) y queda registrada.
- **Las tareas dicen qué, no cómo.** El detalle técnico vive en la sección 4 de cada spec; la tarea solo la referencia. Así un cambio de diseño toca un solo lugar.
- **Orden de cada tarea:** pruebas en rojo → implementación → pruebas en verde (principio 4).
- **Casillas:** `☐` pendiente · `◐` en curso · `☑` hecha. Se marcan al cerrar la tarea.
- **Mover una HU de sprint** exige comprobar en §4.3 que sus dependencias siguen antes que ella.

---

## 2. Estructura de módulos

Se organiza por **dominio**, no por tipo de archivo. Cada módulo agrupa lógica pura (`shared/utils/<módulo>/`), servidor (`server/api/…`, `server/utils/<módulo>/`), estado (`app/composables/`) e interfaz (`app/components/<módulo>/`).

| Módulo | Responsabilidad | HU | Tablas que posee |
|---|---|---|---|
| `access` | Roles, rutas protegidas, asignación evaluador–paciente, sesión | HU001 | `evaluator_patients` |
| `audit` | Registro de cambios por triggers y su consulta | HU024 | `audit_log` |
| `consent` | Versiones del consentimiento y aceptación | HU002 | `consent_versions`, `consents` |
| `catalog` | Tests, secciones, preguntas, opciones, escalas, versionado, importación, vista previa | HU003, HU004, HU005, HU006, HU007, HU008, HU009, HU031 | `tests`, `test_sections`, `questions`, `question_options`, `scales`, `scale_options` |
| `test1` | Carga, condiciones, pistas y verificación del Test 1 (contenido, no mecanismo) | HU030, HU032, HU033, HU034 | — (usa las de `catalog`) |
| `engine` | Motor del cuestionario: validación, condiciones, progreso, cobertura, puntaje por respuesta | HU013, HU032 | — |
| `assessment` | Evaluaciones, respuestas, formulario, notas del evaluador | HU011, HU012, HU014 | `assessments`, `answers`, `answer_history`, `section_notes` |
| `conversation` | Asistente, herramientas, mapeo de lenguaje natural, cobertura, seguridad | HU015, HU016, HU017, HU018, HU019 | `conversations`, `messages`, `extraction_events`, `safety_events` |
| `scoring` | Modelos de puntaje, alertas, plantillas y su edición | HU010, HU036 | `scoring_models`, `alert_rules`, `recommendation_templates` |
| `results` | Hallazgos, factores, índice, plan, recordatorios, comparación en el tiempo | HU020, HU021, HU022, HU023, HU026 | `assessment_results`, `reminders` |
| `privacy` | Exportar, eliminar, anonimizar y redactar datos | HU025 | `data_requests` |
| `extras` | Informante, pruebas digitales, analítica, instrumento emocional, medicamentos | HU027, HU028, HU029, HU035, HU039 | `informant_invitations`, `instruments`, `medications`, vistas `analytics_*` |
| `professional` | Rol profesional, profesión, pacientes asignados, lectura de resultados y revisión del plan por profesión | HU040, HU041, HU042, HU043, HU044 | `professional_profiles`, `professional_patients`, `plan_goal_revisions` |
| `quality` | Fixtures y recorrido end-to-end | HU037, HU038 | — |

### 2.1 Mapa de carpetas

| Carpeta | Contiene | Regla (constitución) |
|---|---|---|
| `shared/types/` | Contratos TypeScript (`specs.md` §8) | Sin lógica |
| `shared/utils/<módulo>/` | Funciones puras de dominio | Sin Vue, Nuxt ni Supabase (principio 3). **Requiere enmienda (D-1).** |
| `server/api/` | Endpoints delgados: autentican, llaman a `shared/` y escriben | Aquí está el único acceso a escritura |
| `server/utils/<módulo>/` | Guards, acceso a datos, cliente LLM | `service_role` solo aquí |
| `app/composables/` | Estado y llamadas a `server/api` | Los `.vue` no llaman a Supabase |
| `app/components/<módulo>/`, `app/pages/dashboard/…` | Presentación | Sin textos fijos: todo en `i18n/locales/` |
| `supabase/migrations/` · `supabase/tests/` | Esquema, RLS, seeds · pruebas pgTAP | Todo cambio de esquema es una migración (principio 5) |
| `test/unit/`, `test/nuxt/`, `test/e2e/`, `test/fixtures/` | Pruebas (§7) | Una prueba por RF |
| `scripts/` | Carga del Test 1 y datos de ejemplo | Nunca corren en producción (HU038) |

### 2.2 Dependencias permitidas entre módulos

```
shared/types  ←  shared/utils  ←  server/utils  ←  server/api
                       ↑                                 ↑
                 app/composables  ───────────────────────┘  (solo vía HTTP)
                       ↑
                 app/components, app/pages
```

- Las flechas son la **única** dirección de importación. `shared/` nunca importa de `app/` ni de `server/`.
- Entre módulos: `engine` no conoce a `assessment` ni a `conversation`; ambos lo usan. `results` lee `engine` y `scoring`. `conversation` usa `engine`, `assessment` y `privacy` (redacción). `catalog` no conoce a ninguno de los anteriores.
- Verificable: la prueba `T-HU014-06` falla si `app/` importa `service_role`, y se añade una prueba de arquitectura por sprint (TA-S1-04).

---

## 3. Modelo de datos en Supabase

La definición de columnas está en [`specs.md` §7.3](specs.md#73-tablas) y las políticas en [§7.4](specs.md#74-rls-resumen); aquí se fija **qué migración crea qué, en qué sprint y con qué dependencias**, para que el orden sea ejecutable.

### 3.1 Relaciones

```
profiles (existente) ─< evaluator_patients >─ profiles
scales ─< scale_options
tests ─< test_sections ─< questions ─< question_options
  │                          └─ depends_on → questions.code (mismo test)
  ├─< scoring_models   ├─< alert_rules   └─< assessments
consent_versions ─< consents ──────────────────┤
assessments ─┬─< answers ─< answer_history     │
             ├─< section_notes   ├─< conversations ─< messages
             ├─< extraction_events  ├─< safety_events
             ├─< assessment_results  ├─< reminders   └─< informant_invitations
recommendation_templates · medications · instruments · data_requests · audit_log (independientes)
```

### 3.2 Migraciones en orden de ejecución

Una migración por fila, con marca de tiempo creciente. **Ninguna tabla se crea antes que aquellas a las que referencia.**

| # | Sprint | Migración | Crea / cambia | Depende de | HU | Pruebas pgTAP |
|---|---|---|---|---|---|---|
| 01 | S1 | `evaluator_patients` | Tabla `evaluator_patients`; función `private.is_evaluator_of` | `profiles` (existe) | HU001 | RLS por rol |
| 02 | S1 | `audit_log` | Tabla `audit_log`; funciones `private.audit()` y `private.json_diff()` | — | HU024 | solo `superuser` lee; nadie escribe |
| 03 | S1 | `scales` | `scales`, `scale_options`; seed F5, IND, SNN, FC, CMP5; `check` de etiquetas `es`/`en` | — | HU031 | seed y `check` |
| 04 | S1 | `tests` | Enum `test_status`; `tests`; trigger de auditoría; RLS de estructura | audit_log | HU003 | borradores ocultos, unicidad, auditoría |
| 05 | S1 | `test_sections` | `test_sections`; trigger de auditoría | tests | HU004 | unicidad `(test_id, code)` |
| 06 | S1 | `questions` | Enums `question_type`, `question_direction`; `questions`, `question_options`; vista `questions_public` | test_sections, scales | HU005 | unicidad, columnas ocultas |
| 07 | S1 | `publish_test` | `tests.parent_test_id`; función `publish_test(test_id)` | questions | HU007 | publica y archiva en una transacción |
| 08 | S2 | `alert_rules` | Enum `alert_level`; `alert_rules`; seed `RAPID_DECLINE` y `NEW_FUNCTIONAL_LOSS` | tests | HU036 | reglas sembradas |
| 09 | S2 | `question_hints` | `questions.hint_status` | questions | HU033 | — |
| 10 | S2 | `consents` | `consent_versions`, `consents`; RLS del paciente (migración de `TA-S2-02`) | profiles | HU002 | cada paciente ve lo suyo |
| 11 | S2 | `assessments` | Enums `assessment_status`, `assessment_mode`; `assessments` (con `consent_id`); `private.can_access_assessment` (migración de `TA-S2-02`) | tests, consents, evaluator_patients | HU011 | acceso por dueño, asignación y rol |
| 12 | S2 | `answers` | Enums `answer_source`, `answer_state`; `answers`, `answer_history` y su trigger | assessments, questions | HU014 | unicidad, historial, aislamiento entre pacientes |
| 13 | S2 | `section_notes` | `section_notes` | assessments | HU012 | invisibles para `user` |
| 14 | S3 | `scoring_models` | `scoring_models`; seed del modelo 1.0.0 con pesos `null` | tests | HU022 | versión inmutable |
| 15 | S3 | `assessment_results` | `assessment_results`; solo `service_role` escribe | assessments, scoring_models | HU020 | `model_version` inmutable |
| 16 | S3 | `recommendation_templates` | `recommendation_templates`, `reminders` | assessments | HU023 | solo aprobadas se usan |
| 17 | S3 | `data_requests` | `data_requests` | profiles | HU025 | aislamiento |
| 18 | S3 | `conversations` | `conversations`, `messages` | assessments | HU015 | lectura por rol |
| 19 | S3 | `extraction_events` | `extraction_events` | messages, questions | HU016 | solo `service_role` escribe |
| 20 | S3 | `safety_events` | `safety_events` | messages | HU019 | lectura por evaluador y `superuser` |
| 21 | S3 | `abandon_job` | Tarea `pg_cron` que marca `abandoned` | assessments | HU018 | — |
| 22 | S4 | `medications` | `medications` con `source` y `catalog_version` obligatorios | — | HU039 | `not null` |
| 23 | S4 | `longitudinal` | `assessments.is_baseline` | assessments | HU026 | — |
| 24 | S4 | `instruments` | `instruments`; `questions.crisis_item` | questions | HU035 | — |
| 25 | S4 | `informant` | `informant_invitations`; valor `informant` en `answer_source` | answers | HU027 | solo hash del token |
| 26 | S4 | `tasks` | Valor `task` en `question_type`; `test_sections.instrument_status` | questions | HU028 | — |
| 27 | S4 | `analytics_views` | Vistas `analytics_*` (solo agregados) | assessments, answers | HU029 | solo `superuser` |
| 28 | S4 | `professional_role` | Valor `professional` en `user_role` (archivo propio); trigger de auditoría de cambios de rol en `profiles` | `profiles` (existe) | HU040 | enum, privilegios, auditoría de roles |
| 29 | S4 | `professional_profiles` | Enum `profession`; `professional_profiles`; triggers de rol y auditoría | professional_role | HU041 | RLS propia, profesiones válidas, rol obligatorio |
| 30 | S4 | `professional_patients` | `professional_patients`; `private.is_professional_of` | professional_profiles | HU042 | aislamiento y activación |
| 31 | S4 | `professional_read` | Políticas de lectura de `professional` sobre `assessments` y `assessment_results`; nueva versión de `consent_versions` con `shareWithProfessionals` | professional_patients, assessment_results, consents | HU043 | sin acceso a respuestas |
| 32 | S4 | `plan_goal_revisions` | `plan_goal_revisions`; `recommendation_templates.profession` y su seed | professional_read, recommendation_templates | HU044 | versiones, profesión de cada meta, aislamiento |

### 3.3 Reglas de datos que se aplican a todas las migraciones

- **RLS activo desde la creación** de la tabla; sin política no hay acceso. Las políticas siguen el patrón de `profiles` (funciones en el esquema `private`).
- **Escritura de estructura** solo con `private.is_superuser()`; **escritura de resultados, eventos de extracción y seguridad** solo con `service_role` desde `server/`.
- **Contenido visible** (títulos, preguntas, etiquetas, pistas, mensajes) como `jsonb` `{ es, en }`; `es` obligatorio.
- **Auditoría:** cada tabla de estructura declara su trigger en su propia migración.
- **Tipos:** tras cada migración se regeneran `app/types/database.types.ts`; ninguna migración llega a `main` sin sus pruebas pgTAP.
- **Seeds de catálogos** (escalas, alertas, modelo 1.0.0) van en migraciones; el **Test 1** y los **datos de ejemplo** van en scripts (`scripts/`), no en migraciones.

---

## 4. Sprints y su orden

### 4.1 Resumen

| Sprint | Nombre | Objetivo | HU | RF | Pruebas (unit / nuxt / pgTAP / e2e) |
|---|---|---|---|---|---|
| **S1** | Fundamentos y gestión de tests | El equipo puede probar y desplegar con seguridad, y el `superuser` crea, importa, versiona y publica tests. | 9 | 60 | 55 / 2 / 14 / 0 |
| **S2** | Test 1 y respuestas por formulario | El Test 1 queda cargado, validado y publicado, y un paciente o evaluador lo completa por formulario con datos seguros. | 10 | 59 | 55 / 6 / 9 / 0 |
| **S3** | Resultados y conversación | Al completar se generan hallazgos, factores, índice y plan, con privacidad básica; el asistente llena el mismo Test 1 por conversación. Cierra el MVP. | 13 | 75 | 66 / 6 / 3 / 4 |
| **S4** | Profesionales y evolución | Rol profesional con pacientes asignados y revisión del plan; medicamentos, vista previa, seguimiento, informante, pruebas digitales y analítica. | 12 | 83 | 59 / 9 / 19 / 0 |
| | **Total** | | **44** | **277** | **235 / 23 / 45 / 4** |

Los 4 sprints agrupan las ocho etapas del plan original **sin cambiar su orden**: Sprint 1 = Fase 0 + Fase 1; Sprint 2 = Fase 1b + Fase 2; Sprint 3 = Fase 3 + Fase 4; Sprint 4 = Fase 5 + Fase 6. **No se asignan fechas ni duración**: no hay datos del equipo para estimarlas. La carga por sprint (RF y pruebas) está en la tabla anterior.

### 4.2 Orden dentro de cada sprint

**S1 · Fundamentos y gestión de tests.** HU001 → HU024 → HU003 → HU004 → HU031 → HU005 → HU006 → HU007 → HU008

**S2 · Test 1 y respuestas por formulario.** HU030 → HU032 → HU033 → HU036 → HU034 → HU002 → HU014 → HU013 → HU011 → HU012

**S3 · Resultados y conversación.** HU038 → HU022 → HU021 → HU020 → HU023 → HU010 → HU025 → HU016 → HU019 → HU017 → HU018 → HU015 → HU037

**S4 · Profesionales y evolución.** HU039 → HU040 → HU041 → HU042 → HU043 → HU044 → HU009 → HU026 → HU035 → HU027 → HU028 → HU029


### 4.3 Ajustes al orden y a las dependencias (requieren tu aprobación)

Al ordenar con las dependencias escritas en las specs aparecieron ciclos y adelantos imposibles. Esta es la forma mínima de resolverlos; cada fila implica editar la spec indicada.

**A. Dependencias que se corrigen en las specs** (rompen ciclos):

| Spec | Cambio | Motivo |
|---|---|---|
| [HU031](HU031-spec.md) | quitar 5 | Las escalas son datos sembrados; `HU005` es quien las usa. Rompe el ciclo HU005 ↔ HU031. |
| [HU006](HU006-spec.md) | quitar 7 | Solo necesita el código `new_version_required`, no la clonación de HU007. |
| [HU007](HU007-spec.md) | añadir 6 | La validación de publicación usa `validateCondition` y `detectCycle` de HU006. |
| [HU022](HU022-spec.md) | quitar 10, añadir 14 | HU022 siembra `scoring_models` v1; HU010 solo los edita. Rompe el ciclo HU010 ↔ HU022. |
| [HU023](HU023-spec.md) | quitar 10 | HU023 siembra las plantillas; HU010 solo las edita. |
| [HU036](HU036-spec.md) | quitar 10 | HU036 crea y siembra `alert_rules`; HU010 solo las edita. |
| [HU010](HU010-spec.md) | añadir 36 | Edita las tablas que crean HU022, HU023 y HU036. |
| [HU037](HU037-spec.md) | añadir 15, 16, 17, 18, 19, 25 | El recorrido por conversación necesita el motor completo y la redacción de datos para el LLM. |

**B. Historias que cambian de lugar respecto del orden por fases original:**

| HU | Estaba | Pasa a | Motivo |
|---|---|---|---|
| [HU002](HU002-spec.md) | Fase 0 | **Sprint 2** | Vincula el consentimiento a una `assessment`, que no existe hasta el Sprint 2. El paciente no puede evaluarse antes, así que no se pierde nada. |
| [HU014](HU014-spec.md) | Fase 0 | **Sprint 2** | `answers` referencia a `assessments` y `questions`, creadas en el Sprint 1 y en el Sprint 2. Sus piezas puras (`computeScore`, `buildAnswerRow`) se prueban igual. |
| [HU025](HU025-spec.md) | Fase 5 | **Sprint 3** (antes de la conversación) | Es **P0** y `redactForLLM` es obligatorio antes de enviar texto al proveedor de IA. |
| [HU036](HU036-spec.md) | Fase 1b | Sprint 2 | Sin cambio de lugar; solo pierde la dependencia de HU010. |
| [HU037](HU037-spec.md) | Fase 4 | Sprint 3 (al final) | Sin cambio; el tramo por formulario (T-01, T-03, T-04) puede ejecutarse al cerrar el bloque de resultados del mismo sprint. |
| [HU040](HU040-spec.md)–[HU044](HU044-spec.md) | no existían | **Sprint 4** | Épica 10, añadida por pedido tuyo. Dependen como máximo del Sprint 3. |

**C. Piezas que quedan "diferidas" y se cierran en un sprint posterior:**

| Pieza | Se cierra en | Quién la cierra |
|---|---|---|
| `canFinish` y `coverage` con `visibleQuestions` ([HU032](HU032-spec.md) RF-03, T-06) | Sprint 2 | [HU011](HU011-spec.md) (existe `canFinish`) |
| Factor `medication_review` ([HU021](HU021-spec.md) RF-05, T-05) | Sprint 4 | [HU039](HU039-spec.md) |
| Migraciones `consents` ([HU002](HU002-spec.md)) y `assessments` ([HU011](HU011-spec.md)), que se ejecutan juntas | Sprint 2, primera tarea del bloque de formularios | `TA-S2-02` (antes de HU002) |

**D. Resultado de la verificación:** con los ajustes A y B, las 44 historias quedan **después** de todas sus dependencias. Sin ellos habría 5 dependencias hacia adelante.

### 4.4 Tareas de sprint (no pertenecen a una HU)

| Id | Sprint | Tarea | Por qué |
|---|---|---|---|
| TA-S1-01 | S1 | Alinear `package.json` con la lista de módulos aprobados: añadir `@nuxt/test-utils`, `vitest`, `@vue/test-utils`, `happy-dom` y `@nuxt/fonts`; decidir qué hacer con `motion-v` y `animejs`, que no están en la lista | Principio 1; sin pruebas no se puede empezar |
| TA-S1-02 | S1 | `vitest.config.ts` con proyectos `unit` y `nuxt`; scripts `test`, `test:watch`, `typecheck`; carpeta `test/` con una prueba de humo | specs.md §9.1 |
| TA-S1-03 | S1 | Configurar `supabase test db` (pgTAP) y un archivo de ejemplo en `supabase/tests/` | specs.md §9.1 |
| TA-S1-04 | S1 | Pruebas de arquitectura: `app/` no importa `service_role`; `shared/` no importa de `app/` ni `server/`; no hay `create table` fuera de `supabase/migrations/` | Verificables de los principios 3 y 5 |
| TA-S1-05 | S1 | Flujo de CI en Netlify: `pnpm lint`, `typecheck`, `test` y `supabase test db` antes del despliegue | HU037 RF-05 lo exige al final; conviene desde el inicio |
| TA-S1-06 | S1 | Enmendar la constitución (D-1: `shared/utils/`, ruta `specs/`) si se aprueba | Principio 2: primero se corrige la regla |
| TA-S1-07 | S1 | Plantilla de pantalla de gestión (`dashboard/tests/*`) con tabla, filtros y estados vacío/cargando/error, en `es` y `en` | La reutilizan HU003–HU008 |
| TA-S2-01 | S2 | Redacción de las pistas conversacionales del Test 1 por el equipo de psicología (`docs/test-1-hints.md`) | Bloquea HU033 y HU034; no es trabajo de código. Debe empezar durante el Sprint 1 |
| TA-S2-02 | S2 | Migraciones `consents` (las define HU002) y luego `assessments` (la define HU011), más la función `private.can_access_assessment` | Se necesitan juntas: `assessments.consent_id` referencia a `consents`. Van antes de HU002, HU014, HU013 y HU011, al empezar el bloque de formularios |
| TA-S3-01 | S3 | Definir con el equipo clínico los resultados esperados de cada perfil (`expected`) y los umbrales iniciales del semáforo | Bloquea HU038, HU020 y HU022; no es trabajo de código. Debe empezar durante el Sprint 2 |
| TA-S3-02 | S3 | Elegir proveedor y modelo de LLM y región (D-6); crear la interfaz `LlmClient` y su doble de pruebas | Bloquea HU015 en adelante; decidir antes de empezar el sprint |
| TA-S3-03 | S3 | Lista oficial de líneas de ayuda por país para HU019 | Contenido, no código |
| TA-S4-01 | S4 | Ampliar `AREAS` del middleware `roles.global.ts` y el selector de rol de la gestión de usuarios con el rol nuevo | Evita que el rol quede fuera de las rutas protegidas existentes; va primero |
| TA-S4-02 | S4 | Confirmar con psicología la correspondencia factor → profesión (HU044) y si el plan se muestra solo tras la revisión | Bloquea HU044; no es trabajo de código |
| TA-S4-03 | S4 | Redactar y validar con asesor legal la cláusula de compartir resultados con profesionales y publicar la nueva versión del consentimiento | Bloquea HU043; los pacientes existentes deberán aceptarla de nuevo |

### 4.5 Criterio de salida de cada sprint

Un sprint se cierra cuando: todas sus specs están **Implementadas**, `pnpm test`, `lint`, `typecheck` y `supabase test db` pasan, el sprint anterior sigue en verde y se revisó a mano en tema claro/oscuro y a 320 px lo que tiene interfaz.

| Sprint | Además se demuestra que |
|---|---|
| Sprint 1 | Un usuario de cada rol llega a su panel; un `user` no puede abrir ni escribir en rutas de gestión; CI corre en cada cambio; un `superuser` crea un test, lo importa, lo publica y crea la versión 2 sin afectar la 1 |
| Sprint 2 | `TEST_1` está publicado con 13 secciones y 124 preguntas y sus condiciones funcionan; un paciente con consentimiento lo completa por formulario y no puede leer datos de otro |
| Sprint 3 | Los tres perfiles de ejemplo producen los resultados esperados; el paciente exporta y elimina sus datos; el recorrido por conversación llena los mismos slots que el formulario y el caso de crisis detiene la captura; el e2e pasa. **Cierra el MVP** |
| Sprint 4 | El `superuser` crea un profesional; este elige su profesión, ve solo a sus pacientes asignados en solo lectura y su revisión del plan aparece al paciente; cada extra se activa sin cambiar el flujo base |

---

## 5. Tareas por historia de usuario

Cada bloque se lee de arriba abajo. **Cubre** indica qué pruebas se vuelven verdes o qué sección de la spec se implementa. **Tras** es la tarea previa dentro de la misma HU.

### Sprint 1 · Fundamentos y gestión de tests

*El equipo puede probar y desplegar con seguridad, y el `superuser` crea, importa, versiona y publica tests.*

#### HU001 · Inicio de sesión con roles · P0

Spec: [HU001-spec.md](HU001-spec.md) · Depende de: — · 11 RF · 13 pruebas (9 unit, 1 nuxt, 3 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU001-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/composables/useProfile.test.ts`, `test/unit/auth/auth.test.ts` | T-HU001-01…04, T-HU001-06…07, T-HU001-09…10, T-HU001-12…13 | — |
| `TA-HU001-02` | ☐ | Migración y RLS: `supabase/migrations/<ts>_create_evaluator_patients.sql`: tabla `evaluator_patients (evaluator_id, patient_id, assigned_by, created_at)`, PK `(evaluator_id, patient_id)`, RLS (§7.4) y función `private.is_evaluator_of(patient uuid)`; escribir las pruebas pgTAP primero | T-HU001-05, T-HU001-08, T-HU001-11 | TA-HU001-01 |
| `TA-HU001-03` | ☐ | Implementar en `shared/utils/auth.ts`: `resolveHomeRoute`, `canAccessArea`, `buildDashboardMenu`, `mapAuthError`, `safeRedirect`, `checkRoleAccess`, `validateAssignment` | §4 Lógica | TA-HU001-02 |
| `TA-HU001-04` | ☐ | Implementar en `server/utils/requireRole.ts`: `requireRole` | §4 Lógica | TA-HU001-03 |
| `TA-HU001-05` | ☐ | Endpoints: `GET /api/evaluator/patients` · `POST /api/admin/evaluator-patients` · `DELETE /api/admin/evaluator-patients/:evaluatorId/:patientId` | §4 API | TA-HU001-04 |
| `TA-HU001-06` | ☐ | Interfaz: Menú del layout `dashboard` construido con `buildDashboardMenu`; página `dashboard/pacientes/index.vue` (lista de pacientes asignados); en `dashboard/usuarios`, acción "Asignar evaluador". Textos en `es` y `en` (`auth.errors.*`, `dashboard.nav.*`, `patients.*`). | §4 Interfaz, §4 i18n | TA-HU001-05 |
| `TA-HU001-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU001-01…13 | TA-HU001-06 |

#### HU024 · Auditoría y trazabilidad · P0

Spec: [HU024-spec.md](HU024-spec.md) · Depende de: [HU001](HU001-spec.md) · 4 RF · 4 pruebas (1 unit, 0 nuxt, 3 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU024-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/audit/buildAuditQuery.test.ts` | T-HU024-04 | — |
| `TA-HU024-02` | ☐ | Migración y RLS: `<ts>_create_audit_log.sql`: tabla `audit_log`, función `private.audit()` y función `private.json_diff(old, new)`; escribir las pruebas pgTAP primero | T-HU024-01…03 | TA-HU024-01 |
| `TA-HU024-03` | ☐ | Implementar en `shared/utils/audit.ts`: `buildAuditQuery` | §4 Lógica | TA-HU024-02 |
| `TA-HU024-04` | ☐ | Endpoints: `GET /api/admin/audit` | §4 API | TA-HU024-03 |
| `TA-HU024-05` | ☐ | Interfaz: `pages/dashboard/auditoria.vue` con `UTable` y filtros. Textos en `es` y `en` (`audit.*`). | §4 Interfaz, §4 i18n | TA-HU024-04 |
| `TA-HU024-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU024-01…04 | TA-HU024-05 |

#### HU003 · Crear un test · P0

Spec: [HU003-spec.md](HU003-spec.md) · Depende de: [HU001](HU001-spec.md), [HU024](HU024-spec.md) · 6 RF · 7 pruebas (5 unit, 0 nuxt, 2 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU003-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/tests/createTest.test.ts`, `test/unit/tests/filterTests.test.ts`, `test/unit/tests/validateTestInput.test.ts` | T-HU003-01…04, T-HU003-07 | — |
| `TA-HU003-02` | ☐ | Migración y RLS: `<ts>_create_tests.sql`: enum `test_status`, tabla `tests` (§7.3), índice único en `code`, RLS de estructura; escribir las pruebas pgTAP primero | T-HU003-05…06 | TA-HU003-01 |
| `TA-HU003-03` | ☐ | Implementar en `shared/utils/tests.ts`: `validateTestInput`, `filterTests` | §4 Lógica | TA-HU003-02 |
| `TA-HU003-04` | ☐ | Implementar en `app/composables/useAdminTests.ts`: `useAdminTests` | §4 Lógica | TA-HU003-03 |
| `TA-HU003-05` | ☐ | Endpoints: `GET /api/admin/tests` · `POST /api/admin/tests` · `GET /api/tests` (publicados) | §4 API | TA-HU003-04 |
| `TA-HU003-06` | ☐ | Interfaz: `pages/dashboard/tests/index.vue` (lista con filtro) y `pages/dashboard/tests/nuevo.vue` (formulario `UForm`). Textos en `es` y `en` (`tests.admin.*`, `errors.test.*`). | §4 Interfaz, §4 i18n | TA-HU003-05 |
| `TA-HU003-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU003-01…07 | TA-HU003-06 |

#### HU004 · Gestionar secciones de un test · P0

Spec: [HU004-spec.md](HU004-spec.md) · Depende de: [HU003](HU003-spec.md) · 7 RF · 8 pruebas (6 unit, 0 nuxt, 2 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU004-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/shared/ordering.test.ts`, `test/unit/tests/assertStructureEditable.test.ts`, `test/unit/tests/deleteSection.test.ts` | T-HU004-01, T-HU004-03…07 | — |
| `TA-HU004-02` | ☐ | Migración y RLS: `<ts>_create_test_sections.sql`: tabla `test_sections` (§7.3) con RLS de estructura; escribir las pruebas pgTAP primero | T-HU004-02, T-HU004-08 | TA-HU004-01 |
| `TA-HU004-03` | ☐ | Implementar en `shared/utils/ordering.ts`: `reorder`, `nextPosition` | §4 Lógica | TA-HU004-02 |
| `TA-HU004-04` | ☐ | Implementar en `shared/utils/tests.ts`: `assertStructureEditable` | §4 Lógica | TA-HU004-03 |
| `TA-HU004-05` | ☐ | Endpoints: `POST/PATCH/DELETE /api/admin/tests/:id/sections[/:sectionId]` · `PATCH /api/admin/tests/:id/sections/order` | §4 API | TA-HU004-04 |
| `TA-HU004-06` | ☐ | Interfaz: `components/admin/tests/SectionList.vue` con arrastre (escritorio) y botones (móvil); confirmación con `UModal`. Textos en `es` y `en` (`tests.sections.*`). | §4 Interfaz, §4 i18n | TA-HU004-05 |
| `TA-HU004-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU004-01…08 | TA-HU004-06 |

#### HU031 · Catálogo de escalas reutilizables · P0

Spec: [HU031-spec.md](HU031-spec.md) · Depende de: — · 4 RF · 4 pruebas (2 unit, 0 nuxt, 2 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU031-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/questions/validateQuestionInput.test.ts`, `test/unit/scales/applyScale.test.ts` | T-HU031-02…03 | — |
| `TA-HU031-02` | ☐ | Migración y RLS: `<ts>_create_scales.sql`: tablas `scales` y `scale_options`, seed y `check (label ? 'es' and label ? 'en')`; escribir las pruebas pgTAP primero | T-HU031-01, T-HU031-04 | TA-HU031-01 |
| `TA-HU031-03` | ☐ | Implementar en `shared/utils/scales.ts`: `applyScale` | §4 Lógica | TA-HU031-02 |
| `TA-HU031-04` | ☐ | Endpoints: `GET /api/admin/scales` | §4 API | TA-HU031-03 |
| `TA-HU031-05` | ☐ | Interfaz: Selector de escala en `QuestionForm.vue`. Textos en `es` y `en` (Etiquetas en la BD; nombres de escala en `scales.*`). | §4 Interfaz, §4 i18n | TA-HU031-04 |
| `TA-HU031-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU031-01…04 | TA-HU031-05 |

#### HU005 · Crear preguntas de cada tipo · P0

Spec: [HU005-spec.md](HU005-spec.md) · Depende de: [HU004](HU004-spec.md), [HU031](HU031-spec.md) · 9 RF · 11 pruebas (9 unit, 1 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU005-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/composables/useQuestionEditor.test.ts`, `test/unit/questions/defaultConfig.test.ts`, `test/unit/questions/validateQuestionInput.test.ts` | T-HU005-01, T-HU005-03…11 | — |
| `TA-HU005-02` | ☐ | Migración y RLS: `<ts>_create_questions.sql`: enums `question_type` y `question_direction`; tablas `questions` y `question_options` (§7.3); vista `questions_public` sin `weight`, `alert_rule`, `clinical_note` ni `score`; escribir las pruebas pgTAP primero | T-HU005-02 | TA-HU005-01 |
| `TA-HU005-03` | ☐ | Implementar en `shared/utils/questions.ts`: `validateQuestionInput`, `defaultConfig` | §4 Lógica | TA-HU005-02 |
| `TA-HU005-04` | ☐ | Implementar en `app/composables/useQuestionEditor.ts`: `useQuestionEditor` | §4 Lógica | TA-HU005-03 |
| `TA-HU005-05` | ☐ | Endpoints: `POST/PATCH /api/admin/tests/:id/questions[/:questionId]` | §4 API | TA-HU005-04 |
| `TA-HU005-06` | ☐ | Interfaz: `components/admin/tests/QuestionForm.vue` con un subformulario por tipo (`config/*.vue`). Textos en `es` y `en` (`tests.questions.*`, `errors.question.*`). | §4 Interfaz, §4 i18n | TA-HU005-05 |
| `TA-HU005-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU005-01…11 | TA-HU005-06 |

#### HU006 · Editar, duplicar, ordenar y desactivar preguntas · P0

Spec: [HU006-spec.md](HU006-spec.md) · Depende de: [HU005](HU005-spec.md) · 7 RF · 9 pruebas (9 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU006-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/conditions/detectCycle.test.ts`, `test/unit/conditions/validateCondition.test.ts`, `test/unit/questions/assertQuestionChange.test.ts`, `test/unit/questions/buildQuestionnaire.test.ts`, `test/unit/questions/duplicateCode.test.ts`, `test/unit/shared/ordering.test.ts` | T-HU006-01…09 | — |
| `TA-HU006-02` | ☐ | Migración y RLS: Columna `questions.depends_on jsonb` (contrato `Condition`, §8) y `questions.active` | §4 Datos | TA-HU006-01 |
| `TA-HU006-03` | ☐ | Implementar en `shared/utils/questions.ts`: `assertQuestionChange`, `duplicateCode`, `buildQuestionnaire` | §4 Lógica | TA-HU006-02 |
| `TA-HU006-04` | ☐ | Implementar en `shared/utils/conditions.ts`: `validateCondition`, `detectCycle` | §4 Lógica | TA-HU006-03 |
| `TA-HU006-05` | ☐ | Endpoints: `PATCH /api/admin/questions/:id` · `POST /api/admin/questions/:id/duplicate` · `PATCH /api/admin/sections/:id/questions/order` | §4 API | TA-HU006-04 |
| `TA-HU006-06` | ☐ | Interfaz: Acciones por fila en `QuestionList.vue`: editar, duplicar, activar/desactivar, mover; editor de condición en `QuestionForm.vue`. Textos en `es` y `en` (`tests.questions.actions.*`, `errors.condition.*`). | §4 Interfaz, §4 i18n | TA-HU006-05 |
| `TA-HU006-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU006-01…09 | TA-HU006-06 |

#### HU007 · Publicar, versionar y archivar un test · P0

Spec: [HU007-spec.md](HU007-spec.md) · Depende de: [HU003](HU003-spec.md), [HU004](HU004-spec.md), [HU005](HU005-spec.md), [HU006](HU006-spec.md) · 6 RF · 7 pruebas (6 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU007-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/assessment/startAssessment.test.ts`, `test/unit/publish/cloneTestVersion.test.ts`, `test/unit/publish/validateForPublish.test.ts` | T-HU007-01…04, T-HU007-06…07 | — |
| `TA-HU007-02` | ☐ | Migración y RLS: `tests.parent_test_id`; función SQL `publish_test(test_id)` (`security definer`, solo `superuser`) que publica y archiva en una transacción; escribir las pruebas pgTAP primero | T-HU007-05 | TA-HU007-01 |
| `TA-HU007-03` | ☐ | Implementar en `shared/utils/publish.ts`: `validateForPublish`, `cloneTestVersion` | §4 Lógica | TA-HU007-02 |
| `TA-HU007-04` | ☐ | Endpoints: `POST /api/admin/tests/:id/publish` · `POST /api/admin/tests/:id/new-version` · `POST /api/admin/tests/:id/archive` | §4 API | TA-HU007-03 |
| `TA-HU007-05` | ☐ | Interfaz: Botón "Publicar" con panel de errores agrupado por sección; botón "Nueva versión" en tests publicados. Textos en `es` y `en` (`tests.publish.*`). | §4 Interfaz, §4 i18n | TA-HU007-04 |
| `TA-HU007-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU007-01…07 | TA-HU007-05 |

#### HU008 · Importar un test desde un archivo estructurado · P0

Spec: [HU008-spec.md](HU008-spec.md) · Depende de: [HU005](HU005-spec.md), [HU031](HU031-spec.md) · 6 RF · 8 pruebas (8 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU008-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/importer/mapDocType.test.ts`, `test/unit/importer/parseTestMarkdown.test.ts`, `test/unit/importer/planUpsert.test.ts`, `test/unit/importer/previewImport.test.ts`, `test/unit/importer/runImport.test.ts`, `test/unit/tests/assertStructureEditable.test.ts` | T-HU008-01…08 | — |
| `TA-HU008-02` | ☐ | Implementar en `shared/utils/importer.ts`: `parseTestMarkdown`, `previewImport`, `planUpsert`, `mapDocType` | §4 Lógica | TA-HU008-01 |
| `TA-HU008-03` | ☐ | Endpoints: `POST /api/admin/tests/:id/import` (`?dryRun=true` devuelve solo la vista previa) | §4 API | TA-HU008-02 |
| `TA-HU008-04` | ☐ | Interfaz: `components/admin/tests/ImportDialog.vue`: subir archivo → vista previa → confirmar. Textos en `es` y `en` (`tests.import.*`). | §4 Interfaz, §4 i18n | TA-HU008-03 |
| `TA-HU008-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU008-01…08 | TA-HU008-04 |

### Sprint 2 · Test 1 y respuestas por formulario

*El Test 1 queda cargado, validado y publicado, y un paciente o evaluador lo completa por formulario con datos seguros.*

#### HU030 · Cargar el Test 1 con sus 13 módulos y 124 preguntas · P0

Spec: [HU030-spec.md](HU030-spec.md) · Depende de: [HU008](HU008-spec.md), [HU031](HU031-spec.md) · 6 RF · 7 pruebas (7 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU030-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/importer/planUpsert.test.ts`, `test/unit/test1/test1Structure.test.ts` | T-HU030-01…07 | — |
| `TA-HU030-02` | ☐ | Migración y RLS: Script `scripts/seed-test-1.ts`; no crea tablas | §4 Datos | TA-HU030-01 |
| `TA-HU030-03` | ☐ | Implementar en `scripts/seed-test-1.ts`: `seedTest1` | §4 Lógica | TA-HU030-02 |
| `TA-HU030-04` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU030-01…07 | TA-HU030-03 |

#### HU032 · Lógica condicional y exclusión del Test 1 · P0

Spec: [HU032-spec.md](HU032-spec.md) · Depende de: [HU006](HU006-spec.md), [HU030](HU030-spec.md) · 5 RF · 8 pruebas (8 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU032-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/answers/applyExclusive.test.ts`, `test/unit/conditions/reconcileHidden.test.ts`, `test/unit/conditions/test1Conditions.test.ts`, `test/unit/progress/canFinish.test.ts` | T-HU032-01…08 | — |
| `TA-HU032-02` | ☐ | Migración y RLS: `depends_on` del Test 1 cargado por HU030 | §4 Datos | TA-HU032-01 |
| `TA-HU032-03` | ☐ | Implementar en `shared/utils/conditions.ts`: `isVisible`, `visibleQuestions`, `reconcileHidden` | §4 Lógica | TA-HU032-02 |
| `TA-HU032-04` | ☐ | Interfaz: Las preguntas aparecen u ocultan con `@formkit/auto-animate`. | §4 Interfaz, §4 i18n | TA-HU032-03 |
| `TA-HU032-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU032-01…08 | TA-HU032-04 |

#### HU033 · Pistas conversacionales para todas las preguntas · P0

Spec: [HU033-spec.md](HU033-spec.md) · Depende de: [HU030](HU030-spec.md) · 4 RF · 5 pruebas (5 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU033-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/hints/isSensitive.test.ts`, `test/unit/hints/validateHint.test.ts`, `test/unit/llm/prompt.test.ts`, `test/unit/publish/validateForPublish.test.ts` | T-HU033-01…05 | — |
| `TA-HU033-02` | ☐ | Migración y RLS: `questions.hint_status`; pistas del Test 1 en `docs/test-1-hints.md` (lo redacta psicología) cargadas por el mismo importador | §4 Datos | TA-HU033-01 |
| `TA-HU033-03` | ☐ | Implementar en `shared/utils/hints.ts`: `validateHint`, `isSensitive` | §4 Lógica | TA-HU033-02 |
| `TA-HU033-04` | ☐ | Endpoints: `PATCH /api/admin/questions/:id/hint` | §4 API | TA-HU033-03 |
| `TA-HU033-05` | ☐ | Interfaz: Editor de pistas en `QuestionForm.vue` con pestañas `es`/`en`. Textos en `es` y `en` (`tests.hints.*`). | §4 Interfaz, §4 i18n | TA-HU033-04 |
| `TA-HU033-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU033-01…05 | TA-HU033-05 |

#### HU036 · Alertas iniciales del Test 1 · P0

Spec: [HU036-spec.md](HU036-spec.md) · Depende de: [HU030](HU030-spec.md) · 4 RF · 5 pruebas (4 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU036-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/alerts/evaluateAlerts.test.ts`, `test/unit/alerts/maxLevel.test.ts`, `test/unit/repo/noHardcodedThresholds.test.ts` | T-HU036-01…04 | — |
| `TA-HU036-02` | ☐ | Migración y RLS: `<ts>_create_alert_rules.sql`: enum `alert_level`, tabla `alert_rules` y seed de las dos reglas; escribir las pruebas pgTAP primero | T-HU036-05 | TA-HU036-01 |
| `TA-HU036-03` | ☐ | Implementar en `shared/utils/alerts.ts`: `evaluateAlerts`, `maxLevel` | §4 Lógica | TA-HU036-02 |
| `TA-HU036-04` | ☐ | Interfaz: Alertas en `FindingsList.vue` y en `pages/dashboard/evaluador.vue`. Textos en `es` y `en` (Mensajes de alerta en `alert_rules.message` (`es`/`en`)). | §4 Interfaz, §4 i18n | TA-HU036-03 |
| `TA-HU036-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU036-01…05 | TA-HU036-04 |

#### HU034 · Verificación de integridad y publicación del Test 1 · P0

Spec: [HU034-spec.md](HU034-spec.md) · Depende de: [HU007](HU007-spec.md), [HU030](HU030-spec.md), [HU032](HU032-spec.md), [HU033](HU033-spec.md) · 4 RF · 5 pruebas (4 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU034-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/publish/groupErrors.test.ts`, `test/unit/publish/validateTest1.test.ts` | T-HU034-01…04 | — |
| `TA-HU034-02` | ☐ | Pruebas pgTAP de RLS y restricciones | T-HU034-05 | TA-HU034-01 |
| `TA-HU034-03` | ☐ | Implementar en `shared/utils/publish.ts`: `validateTest1`, `groupErrors` | §4 Lógica | TA-HU034-02 |
| `TA-HU034-04` | ☐ | Interfaz: Panel de errores y advertencias en la página del test. Textos en `es` y `en` (`tests.publish.*`). | §4 Interfaz, §4 i18n | TA-HU034-03 |
| `TA-HU034-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU034-01…05 | TA-HU034-04 |

#### HU002 · Consentimiento informado antes de evaluar · P0

Spec: [HU002-spec.md](HU002-spec.md) · Depende de: [HU001](HU001-spec.md) · 8 RF · 8 pruebas (5 unit, 2 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU002-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/composables/useConsent.test.ts`, `test/unit/assessment/startAssessment.test.ts`, `test/unit/consent/consent.test.ts`, `test/unit/i18n/localize.test.ts` | T-HU002-01…07 | — |
| `TA-HU002-02` | ☐ | Migración y RLS (se ejecuta en `TA-S2-02`): `<ts>_create_consents.sql`: `consent_versions (version pk, body jsonb, published_at)` y `consents (id, patient_id, version, accepted_at)`; RLS: el paciente lee y crea solo los suyos; `superuser` lee todo; escribir las pruebas pgTAP primero | T-HU002-08 | TA-HU002-01 |
| `TA-HU002-03` | ☐ | Implementar en `shared/utils/consent.ts`: `hasValidConsent`, `validateConsentBody` | §4 Lógica | TA-HU002-02 |
| `TA-HU002-04` | ☐ | Implementar en `shared/utils/i18n.ts`: `localize` | §4 Lógica | TA-HU002-03 |
| `TA-HU002-05` | ☐ | Implementar en `app/composables/useConsent.ts`: `useConsent` | §4 Lógica | TA-HU002-04 |
| `TA-HU002-06` | ☐ | Endpoints: `GET /api/consents/current` · `POST /api/consents` · `GET /api/consents/me` | §4 API | TA-HU002-05 |
| `TA-HU002-07` | ☐ | Interfaz: `components/assessment/ConsentGate.vue` (modal bloqueante antes de iniciar); historial en el perfil del paciente. Textos en `es` y `en` (`consent.*`). | §4 Interfaz, §4 i18n | TA-HU002-06 |
| `TA-HU002-08` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU002-01…08 | TA-HU002-07 |

#### HU014 · Almacenamiento seguro de respuestas · P0

Spec: [HU014-spec.md](HU014-spec.md) · Depende de: [HU001](HU001-spec.md) · 7 RF · 8 pruebas (6 unit, 0 nuxt, 2 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU014-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/answers/buildAnswerRow.test.ts`, `test/unit/privacy/anonymize.test.ts`, `test/unit/repo/migrationsOnly.test.ts`, `test/unit/repo/serviceRoleBoundary.test.ts`, `test/unit/score/computeScore.test.ts` | T-HU014-01…04, T-HU014-07…08 | — |
| `TA-HU014-02` | ☐ | Migración y RLS: `<ts>_create_answers.sql`: enums `answer_source`, `answer_state`; tablas `answers` y `answer_history` (trigger `before update`); RLS por `private.can_access_assessment`; escribir las pruebas pgTAP primero | T-HU014-05…06 | TA-HU014-01 |
| `TA-HU014-03` | ☐ | Implementar en `shared/utils/score.ts`: `computeScore` | §4 Lógica | TA-HU014-02 |
| `TA-HU014-04` | ☐ | Implementar en `server/utils/answers.ts`: `buildAnswerRow` | §4 Lógica | TA-HU014-03 |
| `TA-HU014-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU014-01…08 | TA-HU014-04 |

#### HU013 · Validación y consistencia de respuestas · P0

Spec: [HU013-spec.md](HU013-spec.md) · Depende de: [HU005](HU005-spec.md) · 6 RF · 8 pruebas (7 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU013-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/answers/applyExclusive.test.ts`, `test/unit/answers/assertWritable.test.ts`, `test/unit/answers/saveAnswerHandler.test.ts`, `test/unit/answers/validateAnswer.test.ts` | T-HU013-01…05, T-HU013-07…08 | — |
| `TA-HU013-02` | ☐ | Migración y RLS: Restricción única `answers (assessment_id, question_id)`; escribir las pruebas pgTAP primero | T-HU013-06 | TA-HU013-01 |
| `TA-HU013-03` | ☐ | Implementar en `shared/utils/validateAnswer.ts`: `validateAnswer`, `applyExclusive` | §4 Lógica | TA-HU013-02 |
| `TA-HU013-04` | ☐ | Implementar en `server/utils/answers.ts`: `assertWritable` | §4 Lógica | TA-HU013-03 |
| `TA-HU013-05` | ☐ | Endpoints: `PUT /api/assessments/:id/answers/:questionCode` | §4 API | TA-HU013-04 |
| `TA-HU013-06` | ☐ | Interfaz: Mensajes de error bajo cada control con `errors.answer.<code>`. Textos en `es` y `en` (`errors.answer.*`). | §4 Interfaz, §4 i18n | TA-HU013-05 |
| `TA-HU013-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU013-01…08 | TA-HU013-06 |

#### HU011 · Paciente completa el test en un formulario amigable · P0

Spec: [HU011-spec.md](HU011-spec.md) · Depende de: [HU002](HU002-spec.md), [HU007](HU007-spec.md), [HU013](HU013-spec.md), [HU014](HU014-spec.md) · 9 RF · 9 pruebas (6 unit, 3 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU011-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/QuestionField.test.ts`, `test/nuxt/composables/useAssessment.test.ts`, `test/unit/assessment/completeAssessment.test.ts`, `test/unit/progress/canFinish.test.ts`, `test/unit/progress/firstPending.test.ts`, `test/unit/progress/sectionProgress.test.ts` | T-HU011-01…09 | — |
| `TA-HU011-02` | ☐ | Migración y RLS (se ejecuta en `TA-S2-02`): `<ts>_create_assessments.sql`: enums `assessment_status`, `assessment_mode`; tabla `assessments` (§7.3) con RLS | §4 Datos | TA-HU011-01 |
| `TA-HU011-03` | ☐ | Implementar en `shared/utils/progress.ts`: `firstPending`, `canFinish`, `sectionProgress` | §4 Lógica | TA-HU011-02 |
| `TA-HU011-04` | ☐ | Implementar en `app/composables/useAssessment.ts`: `useAssessment` | §4 Lógica | TA-HU011-03 |
| `TA-HU011-05` | ☐ | Endpoints: `POST /api/assessments` · `GET /api/assessments/:id` · `PUT /api/assessments/:id/answers/:questionCode` · `POST /api/assessments/:id/complete` | §4 API | TA-HU011-04 |
| `TA-HU011-06` | ☐ | Interfaz: `pages/dashboard/evaluacion/[id].vue`, `components/assessment/{SectionStep,QuestionField,ProgressBar,FinishScreen}.vue`. Textos en `es` y `en` (`assessment.form.*`). | §4 Interfaz, §4 i18n | TA-HU011-05 |
| `TA-HU011-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU011-01…09 | TA-HU011-06 |

#### HU012 · Evaluador completa el test en nombre del paciente · P0

Spec: [HU012-spec.md](HU012-spec.md) · Depende de: [HU011](HU011-spec.md) · 6 RF · 7 pruebas (3 unit, 1 nuxt, 3 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU012-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/pages/evaluatorAssessment.test.ts`, `test/unit/access/answerSource.test.ts`, `test/unit/access/canAccessAssessment.test.ts`, `test/unit/progress/firstPending.test.ts` | T-HU012-01…02, T-HU012-04, T-HU012-07 | — |
| `TA-HU012-02` | ☐ | Migración y RLS: `<ts>_create_section_notes.sql`: tabla `section_notes` con RLS (solo evaluador asignado y `superuser`); escribir las pruebas pgTAP primero | T-HU012-03, T-HU012-05…06 | TA-HU012-01 |
| `TA-HU012-03` | ☐ | Implementar en `shared/utils/access.ts`: `canAccessAssessment`, `answerSourceFor` | §4 Lógica | TA-HU012-02 |
| `TA-HU012-04` | ☐ | Endpoints: `PUT /api/assessments/:id/sections/:sectionId/note` | §4 API | TA-HU012-03 |
| `TA-HU012-05` | ☐ | Interfaz: `pages/dashboard/pacientes/[patientId]/evaluacion/[id].vue`; insignia de fuente en `QuestionField`. Textos en `es` y `en` (`assessment.evaluator.*`). | §4 Interfaz, §4 i18n | TA-HU012-04 |
| `TA-HU012-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU012-01…07 | TA-HU012-05 |

### Sprint 3 · Resultados y conversación

*Al completar se generan hallazgos, factores, índice y plan, con privacidad básica; el asistente llena el mismo Test 1 por conversación. Cierra el MVP.*

#### HU038 · Datos de ejemplo para pruebas y demostración · P1

Spec: [HU038-spec.md](HU038-spec.md) · Depende de: [HU030](HU030-spec.md) · 4 RF · 4 pruebas (4 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU038-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/fixtures/assertNotProduction.test.ts`, `test/unit/fixtures/profiles.test.ts`, `test/unit/results/brainIndex.test.ts` | T-HU038-01…04 | — |
| `TA-HU038-02` | ☐ | Migración y RLS: Script `scripts/seed-demo.ts` | §4 Datos | TA-HU038-01 |
| `TA-HU038-03` | ☐ | Implementar en `scripts/seed-demo.ts`: `assertNotProduction` | §4 Lógica | TA-HU038-02 |
| `TA-HU038-04` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU038-01…04 | TA-HU038-03 |

#### HU022 · Índice Brain Intelligence (Neurofit Brain Score™) · P0

Spec: [HU022-spec.md](HU022-spec.md) · Depende de: [HU014](HU014-spec.md) · 7 RF · 7 pruebas (6 unit, 1 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU022-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/BrainIndexCard.test.ts`, `test/unit/results/brainIndex.test.ts` | T-HU022-01…07 | — |
| `TA-HU022-02` | ☐ | Migración y RLS: `assessment_results.brain_index`, `completeness`, `model_version` | §4 Datos | TA-HU022-01 |
| `TA-HU022-03` | ☐ | Implementar en `shared/utils/brainIndex.ts`: `computeBrainIndex` | §4 Lógica | TA-HU022-02 |
| `TA-HU022-04` | ☐ | Interfaz: `components/results/BrainIndexCard.vue`. Textos en `es` y `en` (`results.index.*`). | §4 Interfaz, §4 i18n | TA-HU022-03 |
| `TA-HU022-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU022-01…07 | TA-HU022-04 |

#### HU021 · Riesgos y factores · P0

Spec: [HU021-spec.md](HU021-spec.md) · Depende de: [HU022](HU022-spec.md) · 5 RF · 5 pruebas (5 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU021-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/results/buildResult.test.ts`, `test/unit/results/classifyFactors.test.ts` | T-HU021-01…05 | — |
| `TA-HU021-02` | ☐ | Implementar en `shared/utils/factors.ts`: `FACTOR_MAP`, `classifyFactors` | §4 Lógica | TA-HU021-01 |
| `TA-HU021-03` | ☐ | Interfaz: `components/results/FactorsPanel.vue` con dos bloques (señales actuales y riesgo futuro). Textos en `es` y `en` (`results.factors.*`). | §4 Interfaz, §4 i18n | TA-HU021-02 |
| `TA-HU021-04` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU021-01…05 | TA-HU021-03 |

#### HU020 · Hallazgos · P0

Spec: [HU020-spec.md](HU020-spec.md) · Depende de: [HU022](HU022-spec.md), [HU036](HU036-spec.md) · 7 RF · 7 pruebas (5 unit, 2 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU020-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/ResultLevel.test.ts`, `test/nuxt/pages/results.test.ts`, `test/unit/results/buildFindings.test.ts`, `test/unit/results/findingText.test.ts`, `test/unit/results/potentialArea.test.ts`, `test/unit/results/sortFindings.test.ts` | T-HU020-01…07 | — |
| `TA-HU020-02` | ☐ | Migración y RLS: `<ts>_create_assessment_results.sql`: tabla `assessment_results` (§7.3), solo `service_role` escribe | §4 Datos | TA-HU020-01 |
| `TA-HU020-03` | ☐ | Implementar en `shared/utils/findings.ts`: `domainScores`, `buildFindings`, `sortFindings`, `findingText` | §4 Lógica | TA-HU020-02 |
| `TA-HU020-04` | ☐ | Endpoints: `POST /api/assessments/:id/results` (se llama al completar) · `GET /api/assessments/:id/results` | §4 API | TA-HU020-03 |
| `TA-HU020-05` | ☐ | Interfaz: `components/results/{FindingsList,ResultLevel,ResultsDisclaimer}.vue`. Textos en `es` y `en` (`results.findings.*`, `results.levels.*`). | §4 Interfaz, §4 i18n | TA-HU020-04 |
| `TA-HU020-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU020-01…07 | TA-HU020-05 |

#### HU023 · Plan de recomendaciones · P0

Spec: [HU023-spec.md](HU023-spec.md) · Depende de: [HU021](HU021-spec.md) · 6 RF · 7 pruebas (7 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU023-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/plan/buildPlan.test.ts`, `test/unit/plan/editPlan.test.ts`, `test/unit/plan/planPdf.test.ts`, `test/unit/plan/referralFor.test.ts`, `test/unit/plan/reminderDates.test.ts`, `test/unit/plan/selectTemplates.test.ts` | T-HU023-01…07 | — |
| `TA-HU023-02` | ☐ | Migración y RLS: `<ts>_create_reminders.sql`: tabla `reminders` con RLS del paciente | §4 Datos | TA-HU023-01 |
| `TA-HU023-03` | ☐ | Implementar en `shared/utils/plan.ts`: `selectTemplates`, `buildPlan`, `referralFor`, `reminderDates` | §4 Lógica | TA-HU023-02 |
| `TA-HU023-04` | ☐ | Endpoints: `GET /api/assessments/:id/plan` · `PATCH /api/assessments/:id/plan` · `PATCH /api/reminders/:id` | §4 API | TA-HU023-03 |
| `TA-HU023-05` | ☐ | Interfaz: `components/results/PlanTimeline.vue`. Textos en `es` y `en` (`results.plan.*`). | §4 Interfaz, §4 i18n | TA-HU023-04 |
| `TA-HU023-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU023-01…07 | TA-HU023-05 |

#### HU010 · Configurar reglas de puntaje, alertas y plantillas de recomendación · P1

Spec: [HU010-spec.md](HU010-spec.md) · Depende de: [HU005](HU005-spec.md), [HU022](HU022-spec.md), [HU023](HU023-spec.md), [HU036](HU036-spec.md) · 5 RF · 6 pruebas (5 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU010-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/results/recalculate.test.ts`, `test/unit/scoring/scoringConfig.test.ts` | T-HU010-01…03, T-HU010-05…06 | — |
| `TA-HU010-02` | ☐ | Migración y RLS: `<ts>_create_scoring.sql`: tablas `scoring_models` y `recommendation_templates` con RLS de estructura; escribir las pruebas pgTAP primero | T-HU010-04 | TA-HU010-01 |
| `TA-HU010-03` | ☐ | Implementar en `shared/utils/scoringConfig.ts`: `validateWeight`, `validateAlertRule`, `bumpVersion`, `validateTemplate` | §4 Lógica | TA-HU010-02 |
| `TA-HU010-04` | ☐ | Endpoints: `PATCH /api/admin/questions/:id/scoring` · `POST /api/admin/scoring-models/publish` · `CRUD /api/admin/recommendation-templates` · `POST /api/admin/results/:assessmentId/recalculate` | §4 API | TA-HU010-03 |
| `TA-HU010-05` | ☐ | Interfaz: `pages/dashboard/tests/[id]/puntaje.vue` y `pages/dashboard/plantillas.vue`. Textos en `es` y `en` (`scoring.*`, `templates.*`). | §4 Interfaz, §4 i18n | TA-HU010-04 |
| `TA-HU010-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU010-01…06 | TA-HU010-05 |

#### HU025 · Privacidad y derechos del titular · P0

Spec: [HU025-spec.md](HU025-spec.md) · Depende de: [HU014](HU014-spec.md) · 5 RF · 5 pruebas (4 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU025-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/i18n/keysParity.test.ts`, `test/unit/privacy/anonymize.test.ts`, `test/unit/privacy/buildExport.test.ts`, `test/unit/privacy/redactForLLM.test.ts` | T-HU025-01…02, T-HU025-04…05 | — |
| `TA-HU025-02` | ☐ | Migración y RLS: `<ts>_create_data_requests.sql`: tabla `data_requests` con RLS del paciente; escribir las pruebas pgTAP primero | T-HU025-03 | TA-HU025-01 |
| `TA-HU025-03` | ☐ | Implementar en `shared/utils/privacy.ts`: `redactForLLM`, `buildExport` | §4 Lógica | TA-HU025-02 |
| `TA-HU025-04` | ☐ | Implementar en `server/utils/privacy.ts`: `anonymizePatient` | §4 Lógica | TA-HU025-03 |
| `TA-HU025-05` | ☐ | Endpoints: `GET /api/me/export` · `POST /api/me/delete-request` | §4 API | TA-HU025-04 |
| `TA-HU025-06` | ☐ | Interfaz: Sección "Mis datos" en el perfil del paciente. Textos en `es` y `en` (`privacy.*`). | §4 Interfaz, §4 i18n | TA-HU025-05 |
| `TA-HU025-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU025-01…05 | TA-HU025-06 |

#### HU016 · Slot-filling con function calling y salidas estructuradas · P0

Spec: [HU016-spec.md](HU016-spec.md) · Depende de: [HU013](HU013-spec.md), [HU014](HU014-spec.md) · 9 RF · 10 pruebas (10 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU016-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/llm/conversationState.test.ts`, `test/unit/llm/decideSave.test.ts`, `test/unit/llm/runTool.test.ts`, `test/unit/llm/tools.test.ts`, `test/unit/repo/serviceRoleBoundary.test.ts` | T-HU016-01…10 | — |
| `TA-HU016-02` | ☐ | Migración y RLS: `<ts>_create_extraction_events.sql` con RLS (solo `service_role` escribe) | §4 Datos | TA-HU016-01 |
| `TA-HU016-03` | ☐ | Implementar en `server/utils/llm/tools/index.ts`: `TOOLS`, `runTool` | §4 Lógica | TA-HU016-02 |
| `TA-HU016-04` | ☐ | Implementar en `server/utils/llm/tools/saveAnswer.ts`: `decideSave` | §4 Lógica | TA-HU016-03 |
| `TA-HU016-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU016-01…10 | TA-HU016-04 |

#### HU019 · Seguridad y límites clínicos del asistente · P0

Spec: [HU019-spec.md](HU019-spec.md) · Depende de: [HU016](HU016-spec.md) · 5 RF · 6 pruebas (5 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU019-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/llm/bindContext.test.ts`, `test/unit/llm/processTurn.test.ts`, `test/unit/safety/crisisResources.test.ts`, `test/unit/safety/detectCrisis.test.ts` | T-HU019-01…05 | — |
| `TA-HU019-02` | ☐ | Migración y RLS: `<ts>_create_safety_events.sql` con RLS (evaluador asignado y `superuser` leen); escribir las pruebas pgTAP primero | T-HU019-06 | TA-HU019-01 |
| `TA-HU019-03` | ☐ | Implementar en `shared/utils/safety.ts`: `detectCrisis`, `crisisResources` | §4 Lógica | TA-HU019-02 |
| `TA-HU019-04` | ☐ | Implementar en `server/utils/llm/tools/index.ts`: `bindContext` | §4 Lógica | TA-HU019-03 |
| `TA-HU019-05` | ☐ | Endpoints: `GET /api/admin/safety-events` · `PATCH /api/admin/safety-events/:id` (marcar revisado) | §4 API | TA-HU019-04 |
| `TA-HU019-06` | ☐ | Interfaz: `components/assessment/CrisisCard.vue`; alerta en el panel del evaluador. Textos en `es` y `en` (`safety.*`). | §4 Interfaz, §4 i18n | TA-HU019-05 |
| `TA-HU019-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU019-01…06 | TA-HU019-06 |

#### HU017 · Mapeo de lenguaje natural a escalas · P0

Spec: [HU017-spec.md](HU017-spec.md) · Depende de: [HU016](HU016-spec.md), [HU033](HU033-spec.md) · 6 RF · 6 pruebas (6 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU017-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/nl/extractNumber.test.ts`, `test/unit/nl/mapFrequency.test.ts`, `test/unit/nl/mapOptions.test.ts`, `test/unit/nl/mapYesNo.test.ts`, `test/unit/nl/regressionSuite.test.ts` | T-HU017-01…06 | — |
| `TA-HU017-02` | ☐ | Migración y RLS: Ejemplos por pregunta en `questions.conversational_hint.examples` (HU033) | §4 Datos | TA-HU017-01 |
| `TA-HU017-03` | ☐ | Implementar en `shared/utils/nlMapping.ts`: `mapFrequency`, `mapYesNo`, `mapOptions`, `extractNumber` | §4 Lógica | TA-HU017-02 |
| `TA-HU017-04` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU017-01…06 | TA-HU017-03 |

#### HU018 · Control de cobertura y cierre de la conversación · P0

Spec: [HU018-spec.md](HU018-spec.md) · Depende de: [HU016](HU016-spec.md), [HU032](HU032-spec.md) · 5 RF · 5 pruebas (4 unit, 1 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU018-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/composables/useAssessment.test.ts`, `test/unit/coverage/coverage.test.ts`, `test/unit/coverage/shouldAbandon.test.ts`, `test/unit/llm/processTurn.test.ts`, `test/unit/llm/prompt.test.ts` | T-HU018-01…05 | — |
| `TA-HU018-02` | ☐ | Migración y RLS: Tarea programada (`pg_cron`) que marca `abandoned` diariamente | §4 Datos | TA-HU018-01 |
| `TA-HU018-03` | ☐ | Implementar en `shared/utils/coverage.ts`: `coverage`, `isComplete`, `shouldAbandon` | §4 Lógica | TA-HU018-02 |
| `TA-HU018-04` | ☐ | Endpoints: `POST /api/assessments/:id/mode` (`{ mode: 'mixed' }`) | §4 API | TA-HU018-03 |
| `TA-HU018-05` | ☐ | Interfaz: Indicador discreto de avance en `ChatPanel.vue` (sin números de pregunta). Textos en `es` y `en` (`assessment.chat.summary.*`). | §4 Interfaz, §4 i18n | TA-HU018-04 |
| `TA-HU018-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU018-01…05 | TA-HU018-05 |

#### HU015 · Conversación natural que captura respuestas sin parecer un formulario · P0

Spec: [HU015-spec.md](HU015-spec.md) · Depende de: [HU016](HU016-spec.md), [HU017](HU017-spec.md), [HU018](HU018-spec.md), [HU019](HU019-spec.md), [HU033](HU033-spec.md) · 6 RF · 6 pruebas (4 unit, 2 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU015-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/ChatActions.test.ts`, `test/nuxt/components/ChatPanel.test.ts`, `test/unit/llm/processTurn.test.ts`, `test/unit/llm/prompt.test.ts`, `test/unit/safety/assertNoDiagnosis.test.ts` | T-HU015-01…06 | — |
| `TA-HU015-02` | ☐ | Migración y RLS: `<ts>_create_conversations.sql`: tablas `conversations` y `messages` con RLS por evaluación | §4 Datos | TA-HU015-01 |
| `TA-HU015-03` | ☐ | Implementar en `server/utils/llm/prompt.ts`: `buildSystemPrompt`, `selectNextTopics` | §4 Lógica | TA-HU015-02 |
| `TA-HU015-04` | ☐ | Implementar en `shared/utils/safety.ts`: `assertNoDiagnosis` | §4 Lógica | TA-HU015-03 |
| `TA-HU015-05` | ☐ | Endpoints: `POST /api/assessments/:id/conversation/messages` (stream de la respuesta) | §4 API | TA-HU015-04 |
| `TA-HU015-06` | ☐ | Interfaz: `components/assessment/ChatPanel.vue`, `ChatMessage.vue`, `ChatActions.vue`. Textos en `es` y `en` (`assessment.chat.*`). | §4 Interfaz, §4 i18n | TA-HU015-05 |
| `TA-HU015-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU015-01…06 | TA-HU015-06 |

#### HU037 · Recorrido completo de prueba (end-to-end) · P0

Spec: [HU037-spec.md](HU037-spec.md) · Depende de: [HU011](HU011-spec.md), [HU020](HU020-spec.md), [HU021](HU021-spec.md), [HU022](HU022-spec.md), [HU023](HU023-spec.md), [HU034](HU034-spec.md), [HU038](HU038-spec.md), [HU015](HU015-spec.md), [HU016](HU016-spec.md), [HU017](HU017-spec.md), [HU018](HU018-spec.md), [HU019](HU019-spec.md), [HU025](HU025-spec.md) · 5 RF · 5 pruebas (1 unit, 0 nuxt, 0 pgTAP, 4 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU037-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/e2e/test1-access.test.ts`, `test/e2e/test1-chat.test.ts`, `test/e2e/test1-form.test.ts`, `test/unit/repo/ciWorkflow.test.ts` | T-HU037-01…05 | — |
| `TA-HU037-02` | ☐ | Migración y RLS: Base local de Supabase con migraciones y seed de HU030 y HU038 | §4 Datos | TA-HU037-01 |
| `TA-HU037-03` | ☐ | Implementar en `server/utils/llm/mock.ts`: `createMockLlm` | §4 Lógica | TA-HU037-02 |
| `TA-HU037-04` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU037-01…05 | TA-HU037-03 |

### Sprint 4 · Profesionales y evolución

*Rol profesional con pacientes asignados y revisión del plan; medicamentos, vista previa, seguimiento, informante, pruebas digitales y analítica.*

#### HU039 · Catálogo de medicamentos para el cruce cognitivo · P1

Spec: [HU039-spec.md](HU039-spec.md) · Depende de: [HU030](HU030-spec.md) · 4 RF · 4 pruebas (2 unit, 1 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU039-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/MedicationInput.test.ts`, `test/unit/medications/matchMedications.test.ts` | T-HU039-01…03 | — |
| `TA-HU039-02` | ☐ | Migración y RLS: `<ts>_create_medications.sql`: tabla `medications` con `not null` en `source` y `catalog_version`; escribir las pruebas pgTAP primero | T-HU039-04 | TA-HU039-01 |
| `TA-HU039-03` | ☐ | Implementar en `shared/utils/medications.ts`: `normalizeName`, `matchMedications` | §4 Lógica | TA-HU039-02 |
| `TA-HU039-04` | ☐ | Endpoints: `GET /api/medications?q=` | §4 API | TA-HU039-03 |
| `TA-HU039-05` | ☐ | Interfaz: `components/assessment/MedicationInput.vue` con `UInputMenu`. Textos en `es` y `en` (`medications.*`). | §4 Interfaz, §4 i18n | TA-HU039-04 |
| `TA-HU039-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU039-01…04 | TA-HU039-05 |

#### HU040 · Asignar el rol de profesional · P1

Spec: [HU040-spec.md](HU040-spec.md) · Depende de: [HU001](HU001-spec.md), [HU024](HU024-spec.md) · 10 RF · 11 pruebas (7 unit, 0 nuxt, 4 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU040-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/auth/auth.test.ts`, `test/unit/i18n/keysParity.test.ts`, `test/unit/roles/adminUsersHandler.test.ts`, `test/unit/roles/planRoleChange.test.ts`, `test/unit/roles/roles.test.ts` | T-HU040-02…06, T-HU040-09, T-HU040-11 | — |
| `TA-HU040-02` | ☐ | Migración y RLS: `<ts>_add_professional_role.sql` (solo el valor del enum) y `<ts>_audit_profile_roles.sql` (trigger de auditoría sobre `profiles`); escribir las pruebas pgTAP primero | T-HU040-01, T-HU040-07…08, T-HU040-10 | TA-HU040-01 |
| `TA-HU040-03` | ☐ | Implementar en `shared/utils/roles.ts`: `planRoleChange` | §4 Lógica | TA-HU040-02 |
| `TA-HU040-04` | ☐ | Endpoints: Se amplían `POST /api/admin/users` y `PATCH /api/admin/users/:id` | §4 API | TA-HU040-03 |
| `TA-HU040-05` | ☐ | Interfaz: Selector de rol en `dashboard/usuarios/nuevo.vue` y en la edición; página `dashboard/profesional/index.vue` (inicio). Textos en `es` y `en` (`roles.professional.*`, `dashboard.professional.*`). | §4 Interfaz, §4 i18n | TA-HU040-04 |
| `TA-HU040-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU040-01…11 | TA-HU040-05 |

#### HU041 · Elegir la profesión al primer ingreso · P1

Spec: [HU041-spec.md](HU041-spec.md) · Depende de: [HU040](HU040-spec.md) · 10 RF · 12 pruebas (7 unit, 1 nuxt, 4 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU041-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/composables/useProfessional.test.ts`, `test/unit/auth/auth.test.ts`, `test/unit/i18n/keysParity.test.ts`, `test/unit/professional/professionHandler.test.ts`, `test/unit/professional/professional.test.ts` | T-HU041-02…07, T-HU041-11…12 | — |
| `TA-HU041-02` | ☐ | Migración y RLS: `<ts>_create_professional_profiles.sql`: enum `profession`, tabla `professional_profiles`, triggers de rol y de auditoría, RLS; escribir las pruebas pgTAP primero | T-HU041-01, T-HU041-08…10 | TA-HU041-01 |
| `TA-HU041-03` | ☐ | Implementar en `shared/utils/professional.ts`: `validateProfession`, `needsProfession`, `filterUsersByProfession` | §4 Lógica | TA-HU041-02 |
| `TA-HU041-04` | ☐ | Implementar en `app/composables/useProfessional.ts`: `useProfessional` | §4 Lógica | TA-HU041-03 |
| `TA-HU041-05` | ☐ | Endpoints: `PUT /api/professional/profession` · `PATCH /api/admin/users/:id/profession` · `GET /api/professional/me` | §4 API | TA-HU041-04 |
| `TA-HU041-06` | ☐ | Interfaz: `pages/dashboard/profesional/profesion.vue` (tres tarjetas de elección), sección "Mi profesión" en el perfil, columna y filtro en `dashboard/usuarios`. Textos en `es` y `en` (`professions.*`, `dashboard.professional.profession.*`). | §4 Interfaz, §4 i18n | TA-HU041-05 |
| `TA-HU041-07` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU041-01…12 | TA-HU041-06 |

#### HU042 · Asignar pacientes a un profesional · P1

Spec: [HU042-spec.md](HU042-spec.md) · Depende de: [HU040](HU040-spec.md), [HU041](HU041-spec.md) · 8 RF · 9 pruebas (4 unit, 0 nuxt, 5 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU042-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/professional/assignment.test.ts`, `test/unit/professional/assignmentHandler.test.ts` | T-HU042-01…03, T-HU042-07 | — |
| `TA-HU042-02` | ☐ | Migración y RLS: `<ts>_create_professional_patients.sql`: tabla, trigger de validación de roles, trigger de auditoría, RLS y `private.is_professional_of`; escribir las pruebas pgTAP primero | T-HU042-04…06, T-HU042-08…09 | TA-HU042-01 |
| `TA-HU042-03` | ☐ | Implementar en `shared/utils/professional.ts`: `validateProfessionalAssignment`, `listAccessGrants` | §4 Lógica | TA-HU042-02 |
| `TA-HU042-04` | ☐ | Endpoints: `POST/DELETE /api/admin/professional-patients` · `GET /api/professional/patients` · `GET /api/me/professionals` | §4 API | TA-HU042-03 |
| `TA-HU042-05` | ☐ | Interfaz: Pestaña "Pacientes" en el detalle del profesional (`dashboard/usuarios/[id]`), `dashboard/profesional/pacientes.vue` y sección "Quién ve mis resultados" en el perfil del paciente. Textos en `es` y `en` (`professional.patients.*`, `privacy.access.*`). | §4 Interfaz, §4 i18n | TA-HU042-04 |
| `TA-HU042-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU042-01…09 | TA-HU042-05 |

#### HU043 · Panel del profesional y lectura de resultados · P1

Spec: [HU043-spec.md](HU043-spec.md) · Depende de: [HU042](HU042-spec.md), [HU020](HU020-spec.md), [HU021](HU021-spec.md), [HU022](HU022-spec.md), [HU023](HU023-spec.md), [HU025](HU025-spec.md), [HU002](HU002-spec.md) · 10 RF · 11 pruebas (9 unit, 1 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU043-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/pages/professionalPatient.test.ts`, `test/unit/consent/consent.test.ts`, `test/unit/professional/professionalHandlers.test.ts`, `test/unit/professional/recordAccess.test.ts`, `test/unit/professional/summarizePatient.test.ts`, `test/unit/professional/toProfessionalView.test.ts` | T-HU043-01…05, T-HU043-07…11 | — |
| `TA-HU043-02` | ☐ | Migración y RLS: `<ts>_professional_read_policies.sql`: políticas de lectura para `professional` sobre `assessments` y `assessment_results`; `<ts>_consent_sharing.sql`: nueva versión de `consent_versions` con la sección `shareWithProfessionals`; escribir las pruebas pgTAP primero | T-HU043-06 | TA-HU043-01 |
| `TA-HU043-03` | ☐ | Implementar en `shared/utils/professionalView.ts`: `summarizePatient`, `toProfessionalView` | §4 Lógica | TA-HU043-02 |
| `TA-HU043-04` | ☐ | Implementar en `shared/utils/consent.ts`: `hasSharingConsent` | §4 Lógica | TA-HU043-03 |
| `TA-HU043-05` | ☐ | Implementar en `server/utils/audit.ts`: `recordAccess` | §4 Lógica | TA-HU043-04 |
| `TA-HU043-06` | ☐ | Endpoints: `GET /api/professional/patients` · `GET /api/professional/patients/:patientId/results` | §4 API | TA-HU043-05 |
| `TA-HU043-07` | ☐ | Interfaz: `dashboard/profesional/index.vue` (tarjetas de pacientes con alertas) y `dashboard/profesional/pacientes/[patientId].vue` (ficha de solo lectura). Textos en `es` y `en` (`professional.panel.*`, `professional.patient.*`). | §4 Interfaz, §4 i18n | TA-HU043-06 |
| `TA-HU043-08` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU043-01…11 | TA-HU043-07 |

#### HU044 · Revisión del plan por profesión · P1

Spec: [HU044-spec.md](HU044-spec.md) · Depende de: [HU043](HU043-spec.md), [HU023](HU023-spec.md) · 10 RF · 10 pruebas (6 unit, 1 nuxt, 3 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU044-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/PlanTimeline.test.ts`, `test/unit/plan/buildPlan.test.ts`, `test/unit/plan/canEditGoal.test.ts`, `test/unit/plan/planReview.test.ts`, `test/unit/plan/validateGoalEdit.test.ts` | T-HU044-01, T-HU044-03…07, T-HU044-10 | — |
| `TA-HU044-02` | ☐ | Migración y RLS: `<ts>_create_plan_goal_revisions.sql`: tabla `plan_goal_revisions`, columna `recommendation_templates.profession`, seed de `FACTOR_PROFESSION` en las plantillas, RLS y trigger de auditoría; escribir las pruebas pgTAP primero | T-HU044-02, T-HU044-08…09 | TA-HU044-01 |
| `TA-HU044-03` | ☐ | Implementar en `shared/utils/planReview.ts`: `canEditGoal`, `validateGoalEdit`, `applyRevisions` | §4 Lógica | TA-HU044-02 |
| `TA-HU044-04` | ☐ | Endpoints: `PATCH /api/professional/patients/:patientId/plan/goals/:goalId` · `POST /api/professional/patients/:patientId/plan/goals/:goalId/review` | §4 API | TA-HU044-03 |
| `TA-HU044-05` | ☐ | Interfaz: Editor de metas en la ficha del profesional; insignia "Revisado por…" en `PlanTimeline.vue`. Textos en `es` y `en` (`professional.plan.*`, `results.plan.reviewedBy`). | §4 Interfaz, §4 i18n | TA-HU044-04 |
| `TA-HU044-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU044-01…10 | TA-HU044-05 |

#### HU009 · Vista previa del test · P1

Spec: [HU009-spec.md](HU009-spec.md) · Depende de: [HU005](HU005-spec.md), [HU011](HU011-spec.md) · 5 RF · 5 pruebas (1 unit, 4 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU009-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/PreviewChat.test.ts`, `test/nuxt/components/PreviewToolbar.test.ts`, `test/nuxt/composables/useAssessmentPreview.test.ts`, `test/unit/assessment/memoryAnswerStore.test.ts` | T-HU009-01…05 | — |
| `TA-HU009-02` | ☐ | Implementar en `app/composables/useAssessmentPreview.ts`: `useAssessmentPreview` | §4 Lógica | TA-HU009-01 |
| `TA-HU009-03` | ☐ | Implementar en `app/utils/memoryAnswerStore.ts`: `createMemoryAnswerStore` | §4 Lógica | TA-HU009-02 |
| `TA-HU009-04` | ☐ | Endpoints: `GET /api/admin/tests/:id/tree` (cualquier estado, solo `superuser`) | §4 API | TA-HU009-03 |
| `TA-HU009-05` | ☐ | Interfaz: `pages/dashboard/tests/[id]/vista-previa.vue` con barra de controles. Textos en `es` y `en` (`tests.preview.*`). | §4 Interfaz, §4 i18n | TA-HU009-04 |
| `TA-HU009-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU009-01…05 | TA-HU009-05 |

#### HU026 · Seguimiento longitudinal · P1

Spec: [HU026-spec.md](HU026-spec.md) · Depende de: [HU022](HU022-spec.md) · 5 RF · 5 pruebas (5 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU026-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/longitudinal/baseline.test.ts`, `test/unit/longitudinal/compareResults.test.ts`, `test/unit/longitudinal/nextAllowedDate.test.ts` | T-HU026-01…05 | — |
| `TA-HU026-02` | ☐ | Migración y RLS: `assessments.is_baseline` | §4 Datos | TA-HU026-01 |
| `TA-HU026-03` | ☐ | Implementar en `shared/utils/longitudinal.ts`: `nextAllowedDate`, `compareResults` | §4 Lógica | TA-HU026-02 |
| `TA-HU026-04` | ☐ | Endpoints: `GET /api/me/history` | §4 API | TA-HU026-03 |
| `TA-HU026-05` | ☐ | Interfaz: `components/results/EvolutionChart.vue`. Textos en `es` y `en` (`results.evolution.*`). | §4 Interfaz, §4 i18n | TA-HU026-04 |
| `TA-HU026-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU026-01…05 | TA-HU026-05 |

#### HU035 · Módulo Estado emocional con instrumento validado · P1

Spec: [HU035-spec.md](HU035-spec.md) · Depende de: [HU007](HU007-spec.md), [HU034](HU034-spec.md) · 5 RF · 5 pruebas (5 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU035-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/instruments/crisisTriggered.test.ts`, `test/unit/instruments/scoreInstrument.test.ts`, `test/unit/publish/cloneTestVersion.test.ts`, `test/unit/test1/test1Structure.test.ts` | T-HU035-01…05 | — |
| `TA-HU035-02` | ☐ | Migración y RLS: `questions.crisis_item boolean`; tabla `instruments (code, name, version, license, scoring jsonb)` | §4 Datos | TA-HU035-01 |
| `TA-HU035-03` | ☐ | Implementar en `shared/utils/instruments.ts`: `scoreInstrument`, `crisisTriggered` | §4 Lógica | TA-HU035-02 |
| `TA-HU035-04` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU035-01…05 | TA-HU035-03 |

#### HU027 · Cuestionario del informante o familiar · P2

Spec: [HU027-spec.md](HU027-spec.md) · Depende de: [HU011](HU011-spec.md) · 6 RF · 5 pruebas (4 unit, 1 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU027-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/nuxt/components/FinishScreen.test.ts`, `test/unit/informant/checkInvitation.test.ts`, `test/unit/informant/createInvitation.test.ts`, `test/unit/informant/informantPayload.test.ts`, `test/unit/results/buildResult.test.ts` | T-HU027-01…05 | — |
| `TA-HU027-02` | ☐ | Migración y RLS: `<ts>_create_informant.sql`: tabla `informant_invitations`; valor `informant` añadido a `answer_source` | §4 Datos | TA-HU027-01 |
| `TA-HU027-03` | ☐ | Implementar en `server/utils/informant.ts`: `createInvitation`, `checkInvitation` | §4 Lógica | TA-HU027-02 |
| `TA-HU027-04` | ☐ | Endpoints: `POST /api/assessments/:id/informant-invitations` · `DELETE /api/informant-invitations/:id` · `GET/POST /api/informant/:token` | §4 API | TA-HU027-03 |
| `TA-HU027-05` | ☐ | Interfaz: `pages/informante/[token].vue` (sin sesión). Textos en `es` y `en` (`informant.*`). | §4 Interfaz, §4 i18n | TA-HU027-04 |
| `TA-HU027-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU027-01…05 | TA-HU027-05 |

#### HU028 · Pruebas cognitivas digitales · P2

Spec: [HU028-spec.md](HU028-spec.md) · Depende de: [HU005](HU005-spec.md), [HU007](HU007-spec.md) · 5 RF · 5 pruebas (5 unit, 0 nuxt, 0 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU028-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/i18n/keysParity.test.ts`, `test/unit/results/brainIndex.test.ts`, `test/unit/tasks/checkDevice.test.ts`, `test/unit/tasks/interpretTask.test.ts`, `test/unit/tasks/recordTrial.test.ts` | T-HU028-01…05 | — |
| `TA-HU028-02` | ☐ | Migración y RLS: Valor `task` en `question_type`; `test_sections.instrument_status` | §4 Datos | TA-HU028-01 |
| `TA-HU028-03` | ☐ | Implementar en `shared/utils/tasks.ts`: `recordTrial`, `interpretTask`, `checkDevice` | §4 Lógica | TA-HU028-02 |
| `TA-HU028-04` | ☐ | Interfaz: `components/assessment/tasks/*` (uno por tarea). Textos en `es` y `en` (`tasks.*`). | §4 Interfaz, §4 i18n | TA-HU028-03 |
| `TA-HU028-05` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU028-01…05 | TA-HU028-04 |

#### HU029 · Panel de analítica para super admin · P2

Spec: [HU029-spec.md](HU029-spec.md) · Depende de: [HU011](HU011-spec.md), [HU015](HU015-spec.md) · 5 RF · 5 pruebas (4 unit, 0 nuxt, 1 pgTAP, 0 e2e)

| Tarea | | Descripción | Cubre | Tras |
|---|---|---|---|---|
| `TA-HU029-01` | ☐ | Escribir primero las pruebas y verlas fallar: `test/unit/analytics/metrics.test.ts`, `test/unit/analytics/suppress.test.ts`, `test/unit/analytics/toCsv.test.ts` | T-HU029-01…03, T-HU029-05 | — |
| `TA-HU029-02` | ☐ | Migración y RLS: `<ts>_create_analytics_views.sql`: vistas agregadas `analytics_completion`, `analytics_dropoff`; escribir las pruebas pgTAP primero | T-HU029-04 | TA-HU029-01 |
| `TA-HU029-03` | ☐ | Implementar en `shared/utils/analytics.ts`: `completionRate`, `dropOffByQuestion`, `suppressSmallGroups`, `toCsv` | §4 Lógica | TA-HU029-02 |
| `TA-HU029-04` | ☐ | Endpoints: `GET /api/admin/analytics` · `GET /api/admin/analytics.csv` | §4 API | TA-HU029-03 |
| `TA-HU029-05` | ☐ | Interfaz: `pages/dashboard/analitica.vue`. Textos en `es` y `en` (`analytics.*`). | §4 Interfaz, §4 i18n | TA-HU029-04 |
| `TA-HU029-06` | ☐ | Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; revisar tema claro/oscuro y 320 px si hay interfaz; pasar la spec a **Implementada**. | T-HU029-01…05 | TA-HU029-05 |

---

## 6. Decisiones técnicas

Cada decisión indica la alternativa que se descartó y por qué, para poder reabrirla si cambia el contexto. Las marcadas **Pendiente** necesitan tu aprobación.

| Id | Decisión | Justificación | Alternativa descartada | Estado |
|---|---|---|---|---|
| D-1 | Lógica pura en `shared/utils/` (carpeta compartida de Nuxt 4). | Cliente y servidor ejecutan **la misma** validación, el mismo puntaje y las mismas condiciones; las reglas se prueban sin levantar Nuxt. | Duplicar la lógica en `app/utils/` y `server/utils/`: se desincroniza. Dejarla solo en `server/`: el formulario no podría mostrar errores ni ocultar preguntas sin ir al servidor. | Aprobada (constitución enmendada) |
| D-2 | Contenido del test en `jsonb` `{ es, en }`, con `en` opcional. | Un test es un documento con un único conjunto de ids; el idioma es una propiedad del texto. Cumple el principio 6 sin duplicar preguntas. | Tablas de traducción por entidad: más tablas y más uniones. Solo español: contradice el requisito de dos idiomas. | Propuesta |
| D-3 | `single_choice` y `multiple_choice` como tipos distintos. | La validación, el puntaje y el control de interfaz son diferentes; un indicador `allow_multiple` obliga a bifurcar en cada función. | Un tipo con `allow_multiple` (como en `plan-test.md`): menos tipos, pero más condicionales en todas partes. | Propuesta |
| D-4 | Mantener los roles existentes `superuser`, `evaluator`, `user`. | Ya hay datos, políticas y middleware con esos nombres. | Renombrar a `super_admin`/`evaluador`/`paciente`: migración de enum y cambios sin beneficio funcional. | Tomada |
| D-5 | Pruebas de RLS con pgTAP (`supabase test db`). | RLS es la última defensa y solo se puede probar contra Postgres real. No añade dependencias npm. | Probar RLS con mocks en Vitest: no verifica nada real. Playwright contra la API: lento y se usa solo para e2e. | Propuesta |
| D-6 | Proveedor de LLM detrás de una interfaz `LlmClient`. | Aún no se eligió proveedor; la interfaz permite el doble de pruebas (HU037) y cambiar de proveedor sin tocar el motor. | Acoplar el motor a un SDK: más rápido hoy, caro de cambiar. | Pendiente (proveedor y región) |
| D-7 | Las respuestas se escriben por `server/api`, no desde el cliente. | Validación, puntaje, condiciones, cobertura y bloqueo de evaluaciones cerradas se ejecutan en un solo lugar de confianza; el mismo camino sirve a formulario, evaluador y conversación. | Escribir desde el cliente con RLS: más simple, pero la validación y las condiciones dependerían del navegador. | Propuesta |
| D-8 | Vista `questions_public` para el cliente. | RLS filtra filas, no columnas; la vista es la forma de ocultar pesos, reglas y notas clínicas. | Columnas separadas en otra tabla: duplica el modelo. Ocultarlas solo en la API: un error expone datos. | Propuesta |
| D-9 | Versionar tests **clonando** el árbol (`cloneTestVersion`). | Cada versión es inmutable una vez publicada; las respuestas apuntan a filas que nunca cambian. Reproducibilidad simple. | Versionado por fila con vigencia (columnas `valid_from/valid_to`): menos copias, pero consultas y RLS más complejas y riesgo de mutar historia. | Propuesta |
| D-10 | Condiciones como **datos** declarativos (una condición por pregunta), no código. | Se validan, se muestran en la interfaz de gestión y se detectan ciclos. El Test 1 solo necesita igualdad, `in` y "alguna vale X". | Mini-lenguaje o expresiones evaluadas: potentes pero inseguras y difíciles de validar. | Propuesta |
| D-11 | Pesos, umbrales, alertas y plantillas en tablas versionadas (`scoring_models`, `alert_rules`, `recommendation_templates`). | El documento base exige ajustarlos tras la validación clínica sin reconstruir la plataforma. | Constantes en código: cambiar un peso exigiría un despliegue y se perdería trazabilidad. | Tomada (requisito) |
| D-12 | Resultados calculados **al completar**, guardados e inmutables. | Reproducibles, auditables y rápidos de leer; recalcular crea una fila nueva con otra `model_version`. | Calcular en cada lectura: siempre al día pero cambia el resultado que vio el paciente y no deja rastro. | Propuesta |
| D-13 | Slot-filling con herramientas del modelo, validadas y ejecutadas por el servidor. | El modelo propone; el servidor valida, decide y escribe. Cada acción queda en `extraction_events`. El modelo no tiene credenciales. | Dejar que el modelo escriba en la base: inseguro. Extraer con expresiones regulares tras la charla: frágil y rompe la naturalidad. | Propuesta |
| D-14 | Auditoría con **triggers** en la base. | Ningún camino de escritura (API, SQL manual, scripts) la evita. | Auditar en la aplicación: se omite en cualquier ruta nueva. | Propuesta |
| D-15 | Tareas programadas con `pg_cron` de Supabase (abandono de evaluaciones). | Vive junto a los datos y no requiere exponer credenciales en otra función. | Funciones programadas de Netlify: necesitan la clave `service_role` fuera de la base. | Propuesta |
| D-16 | Importar el Test 1 desde `docs/test-1.md` con un analizador propio. | Hay una sola fuente de verdad que psicología ya revisó; evita mantener dos copias. | Convertir a CSV/JSON a mano: se desincroniza del documento aprobado. Digitar en la interfaz: 124 preguntas a mano. | Propuesta |
| D-17 | Pruebas e2e con `@nuxt/test-utils/e2e`. | Ya está en la lista aprobada; evita una dependencia nueva. | Playwright o Cypress: mejores herramientas de navegador, pero violan el principio 1 sin aprobación. | Propuesta |
| D-19 | El profesional es un rol **separado** de `evaluator` (`professional` en `user_role`). | El evaluador escribe respuestas en nombre del paciente; el profesional solo lee y revisa su parte del plan. Permisos distintos con un rol distinto evitan condiciones por campo en cada política. | Reemplazar `evaluator`: migrar datos y rutas sin necesidad. Un evaluador con campo "profesión": mezclaría escritura y lectura bajo el mismo rol. | Tomada (tu decisión) |
| D-20 | Profesión en la tabla `professional_profiles` con enum `profession`. | Evita ensuciar `profiles` y su política de actualización por el dueño; el enum impide valores inválidos desde la base. | Columna `profession` en `profiles`: la llenaría cualquier rol y exigiría un guard extra. Texto libre: sin validación ni filtros fiables. | Propuesta |
| D-21 | Asignaciones del profesional en `professional_patients`, aparte de `evaluator_patients`. | Las asignaciones de evaluador (HU001, Sprint 1) ya están especificadas; tienen permisos de escritura, las del profesional son de lectura. | Una tabla común con tipo de vínculo: obliga a reabrir HU001 y mezcla políticas de escritura y lectura. | Propuesta |
| D-22 | El profesional ve una vista reducida de resultados (`toProfessionalView`) y no tiene acceso a respuestas individuales. | Minimiza datos de salud sensibles (sustancias, estado emocional) y simplifica la RLS. | Dar acceso a las respuestas de los dominios de su profesión: más útil clínicamente pero más complejo y más expuesto. Queda como pregunta abierta. | Propuesta |
| D-23 | Las ediciones del plan se guardan como versiones en `plan_goal_revisions`. | Conserva la inmutabilidad de `assessment_results` (D-12) y el historial de quién cambió qué. | Editar `recommendation_plan` en el resultado: se pierde la versión generada y la trazabilidad. | Propuesta |
| D-24 | La profesión es una declaración propia del profesional, sin verificación documental. | Es lo que pediste; el `superuser` puede corregirla. | Verificar con tarjeta profesional: más control, más trabajo y datos personales adicionales. | Tomada (tu decisión); verificación abierta |
| D-18 | Exportar el plan a PDF en el servidor (HU023, P1). | Mantiene el contenido y el descargo fuera del cliente. | Imprimir desde el navegador: sin control del formato. **Cualquier librería de PDF es una dependencia nueva y se aprueba aparte.** | Pendiente |

---

## 7. Estrategia de tests

Principio 4: **toda lógica nueva o modificada lleva unit tests con `@nuxt/test-utils` (Vitest)** en el mismo cambio. Total planificado: **307 pruebas** (235 unit, 23 nuxt, 45 pgTAP, 4 e2e).

### 7.1 Niveles

| Nivel | Dónde | Qué prueba | Entorno | Velocidad |
|---|---|---|---|---|
| **Unit puro** | `test/unit/` | Funciones de `shared/utils` y `server/utils` | `node`, sin mocks | milisegundos |
| **Nuxt** | `test/nuxt/` | Composables y componentes (`mountSuspended`, `mockNuxtImport`) | `nuxt` + `happy-dom` | segundos |
| **Base de datos** | `supabase/tests/` | RLS, restricciones, triggers, funciones SQL | Postgres local (pgTAP) | segundos |
| **End-to-end** | `test/e2e/` | Recorrido del Test 1 con perfiles de ejemplo | Nuxt + Supabase local + LLM simulado | minutos |

### 7.2 Reglas

1. **Trazabilidad:** HU → CA → RF → T. Un RF sin prueba bloquea la aprobación de la spec (el generador de specs ya lo verifica).
2. **Nombre:** `it('T-HU013-04 …')`; el id permite encontrar la prueba desde la spec y viceversa.
3. **Orden:** la prueba se escribe antes y se ve fallar; la tarea `TA-HUxxx-01` de cada HU lo recuerda.
4. **Lógica sin I/O:** si algo es difícil de probar sin mocks, está en la capa equivocada (principio 3). Los endpoints delegan en funciones puras que sí se prueban.
5. **Mocks solo en los bordes:** `$fetch`, el cliente de Supabase y el `LlmClient`. Nunca se simula una función de `shared/`.
6. **Datos:** `test/fixtures/test-1.ts` se genera con el mismo analizador que carga el Test 1 (HU030) y los tres perfiles viven en `test/fixtures/profiles/` (HU038). No se escriben datos a mano en cada prueba.
7. **Idiomas:** una prueba de paridad (`keysParity`) falla si una clave existe en `es` y no en `en`, o al revés.

### 7.3 Pruebas transversales (existen desde el Sprint 1 y crecen)

| Prueba | Garantiza |
|---|---|
| Arquitectura (TA-S1-04) | Dirección de importaciones, `service_role` solo en servidor, esquema solo por migraciones |
| Paridad i18n | `es` y `en` tienen las mismas claves |
| Sin umbrales fijos | Ningún código de regla ni peso aparece en `shared/` o `server/` |
| RLS por rol | Para cada tabla: `user`, `evaluator` y `superuser` ven y escriben solo lo previsto |
| Regresión de lenguaje natural | ≥ 90 % de aciertos en `es` y `en` (HU017) |
| Seguridad del asistente | 100 % de aciertos en crisis e inyección de instrucciones (HU019) |

### 7.4 Puertas de calidad

| Momento | Se ejecuta | Bloquea si falla |
|---|---|---|
| Antes de cerrar una tarea | `pnpm test` (unit + nuxt) del archivo afectado | La tarea |
| Antes de cerrar una HU | `pnpm test`, `pnpm lint`, `pnpm typecheck`, `supabase test db` | La HU |
| En cada cambio (CI) | Todo lo anterior | La integración |
| Antes de desplegar a Netlify | Lo anterior + e2e (desde el Sprint 3, donde se completa el recorrido por conversación) | El despliegue |

**Cobertura:** no se fija un porcentaje global. La puerta es "todo RF tiene su prueba". Se propone medirla solo en `shared/utils/` y exigir ≥ 90 % de líneas, por ser la lógica de negocio; se decide al aprobar este plan.

### 7.5 Lo que las pruebas automáticas no cubren (revisión manual por sprint)

- Tema claro/oscuro y 320 px de las pantallas nuevas.
- Fidelidad a la marca según `/manual-de-marca`.
- Redacción de los textos clínicos por el equipo de psicología.
- Calidad conversacional del asistente (muestras revisadas por una persona).

---

## 8. Riesgos y pendientes

| Riesgo / pendiente | Efecto | Mitigación o responsable |
|---|---|---|
| Pistas conversacionales sin redactar (TA-S2-01) | Bloquea publicar el Test 1 | Psicología; empezar en el Sprint 1 |
| Resultados esperados y umbrales sin definir (TA-S3-01) | Bloquea hallazgos e índice | Equipo clínico; empezar en el Sprint 2 |
| Proveedor de LLM no elegido (D-6) | Bloquea la conversación (Sprint 3) | Decidir antes de empezar el Sprint 3 |
| Instrumento emocional sin elegir (HU035) | El Módulo 9 se publica como borrador sin peso | Psicología; no bloquea el MVP |
| Módulos de `package.json` fuera de la constitución | Incumple el principio 1 | TA-S1-01 |
| Contenido del test solo en español | Incumple el requisito de dos idiomas si debe estar traducido | Decidir el alcance de D-2 |
| Texto legal del consentimiento y Ley 1581 | Bloquea producción, no desarrollo | Asesor legal |
| Librería de PDF (D-18) | Dependencia nueva | Aprobar o diferir HU023 CA-06 |
| Correspondencia factor → profesión sin validar (HU044) | Metas asignadas a la profesión equivocada | TA-S4-02, psicología |
| Consentimiento existente no cubre compartir con profesionales (HU043) | Los profesionales no verían resultados de pacientes que ya aceptaron | TA-S4-03; nueva versión del consentimiento |

## 9. Decisiones que necesito de ti

1. **§4.3 A y B:** ¿apruebas los cambios de dependencias y los tres cambios de sprint (HU002, HU014, HU025)?
2. **D-1:** ¿enmendamos la constitución para permitir `shared/utils/` y fijar `specs/` como ruta de las specs?
3. **TA-S1-01:** ¿qué hacemos con `motion-v` y `animejs`, que no están en la lista de módulos aprobados?
4. **D-2:** ¿el contenido del test debe existir también en inglés desde el inicio?
5. **§7.4:** ¿fijamos ≥ 90 % de cobertura en `shared/utils/`?
6. **Sprint 4:** ¿el profesional puede ver las respuestas de los dominios de su profesión, o solo resultados? ¿El plan se muestra al paciente solo cuando un profesional lo revisó? ¿Se confirma la correspondencia factor → profesión de HU044?
7. **Sprint 4:** ¿los profesionales (HU040–HU044) se quedan en el Sprint 4 o se adelantan al Sprint 3, después de HU025? No hay conflicto de dependencias en ninguno de los dos casos.

