# Tareas de implementación — Módulo de Evaluaciones

> **Reglas:** [`docs/constitution.md`](../docs/constitution.md) · **Especificación:** [`specs.md`](specs.md) · **Plan:** [`plan-tests.md`](plan-tests.md) · **Specs:** `HU001-spec.md` … `HU044-spec.md`  
> **Estado:** Borrador para aprobación · **Fecha:** 2026-10-09 · Este documento solo planifica: no contiene código

Lista de chequeo para ejecutar el plan paso a paso. Cada tarea es pequeña y se completa de una vez, tiene sus pruebas y pertenece a un solo sprint.

---

## Cómo usar esta lista

1. **Una tarea a la vez, en el orden en que aparecen.** El orden ya respeta las dependencias entre historias y entre tareas.
2. **Ciclo de cada tarea (principio 4):** escribir la prueba y verla fallar → implementar lo mínimo → verla en verde → marcar la casilla cambiando `[ ]` por `[x]`.
3. **Tamaño de la tarea.** Si una tarea resulta demasiado grande para completarse de una vez, se detiene, se divide en dos y se agrega `TK-…-NNb` justo debajo; no se sigue de largo.
4. **Pruebas.** El campo *Tests* lista los ids `T-HUxxx-nn` de la spec que esa tarea deja en verde. Una tarea de prueba escribe la prueba y la lógica que la satisface; los archivos de lógica de cada historia están en su línea "Lógica en".
5. **Spec primero (principio 2).** Si al implementar algo no coincide con la spec, se corrige y aprueba la spec antes de seguir.
6. **Cierre de historia.** Cuando todas las tareas de una HU están marcadas, su última tarea (`Cierre`) cambia la spec a **Implementada** y se actualiza su estado también en `plan-tests.md`.
7. **Bloqueos externos.** No consumen tiempo de código, pero hay que marcarlos para saber que el trabajo que desbloquean puede empezar.
8. **Ids.** `TK-HUxxx-nn` pertenece a una historia; `TK-Sn-nn` a un bloque previo del sprint; `TK-Sn-Xn` a la verificación de salida. Los ids no se reutilizan; si se elimina una tarea, se tacha.

### Etiquetas de las tareas

| Descripción empieza por | Qué se hace |
|---|---|
| Escribir las pruebas pgTAP | Pruebas de RLS, restricciones o triggers; quedan en rojo hasta la migración |
| Migración | Cambio de esquema en `supabase/migrations/`; hace pasar las pgTAP y regenera `database.types.ts` |
| Escribir la prueba unit / Nuxt / e2e | Prueba en su archivo y la lógica mínima hasta verde |
| Endpoint | Ruta en `server/api/` con `requireRole`, validación compartida y códigos 401/403/422 |
| Claves de traducción | Mismas claves en `es.json` y `en.json` |
| Interfaz | Página o componente con Nuxt UI, estados y textos vía i18n |
| Revisión manual | Tema claro/oscuro, 320 px, teclado, contraste y marca |
| Cierre | Comandos de calidad y paso de la spec a Implementada |

---

## Resumen por sprint

| Sprint | Nombre | HU | Tareas |
|---|---|---|---|
| 1 | Fundamentos y gestión de tests | 9 | 138 |
| 2 | Test 1 y respuestas por formulario | 10 | 120 |
| 3 | Resultados y conversación | 13 | 151 |
| 4 | Profesionales y evolución | 12 | 161 |
| | **Total** | **44** | **570** |


---

## Sprint 1 · Fundamentos y gestión de tests

*El equipo puede probar y desplegar con seguridad, y el `superuser` crea, importa, versiona y publica tests.*  
Etapas del plan original: Fase 0 + Fase 1.

### Bloqueos externos del Sprint 1 (no son tareas de código)

- [ ] Psicología empieza a redactar las pistas conversacionales del Test 1 (`docs/test-1-hints.md`) — *Bloquea HU033 (Sprint 2); conviene iniciarla ahora*
- [ ] Decisión sobre la enmienda de la constitución (D-1) y sobre `motion-v`/`animejs` — *Bloquea las tareas de preparación del entorno*

### Bloque previo · Preparación del entorno

*Antes de HU001: sin pruebas ni CI no se puede cumplir el principio 4.*

- [x] **TK-S1-01** · Enmendar `docs/constitution.md`: permitir `shared/utils/` en el principio 3 y fijar `specs/` como ruta de las specs *(requiere tu aprobación, D-1)*
- [x] **TK-S1-02** · Añadir a `package.json` las dependencias de desarrollo `@nuxt/test-utils`, `vitest`, `@vue/test-utils` y `happy-dom`; ejecutar `pnpm install`
- [x] **TK-S1-03** · Añadir el módulo aprobado `@nuxt/fonts` y comprobar que `nuxt prepare` y `pnpm lint` siguen pasando
- [x] **TK-S1-04** · Aplicar tu decisión sobre `motion-v` y `animejs` (no están en la lista aprobada): retirarlos o añadirlos a la constitución
- [x] **TK-S1-05** · `vitest.config.ts`: proyecto `unit` (entorno `node`, `test/unit/**/*.test.ts`)
- [x] **TK-S1-06** · `vitest.config.ts`: proyecto `nuxt` con `defineVitestProject` y `happy-dom` (`test/nuxt/**/*.test.ts`)
- [x] **TK-S1-07** · Scripts `test`, `test:watch` y `typecheck` en `package.json`
- [x] **TK-S1-08** · Prueba de humo: una prueba unit y una prueba Nuxt que pasan con `pnpm test`
- [x] **TK-S1-09** · Configurar `supabase test db` (pgTAP) y un archivo de ejemplo en `supabase/tests/` que pasa
- [x] **TK-S1-10** · Prueba de arquitectura 1: ningún archivo de `app/` importa `serverSupabaseServiceRole` ni `service_role`
- [x] **TK-S1-11** · Prueba de arquitectura 2: `shared/` no importa de `app/` ni de `server/`
- [x] **TK-S1-12** · Prueba de arquitectura 3: no hay `create table` fuera de `supabase/migrations/`
- [x] **TK-S1-13** · CI en Netlify: flujo con `pnpm lint`, `pnpm typecheck` y `pnpm test` antes del despliegue
- [x] **TK-S1-14** · CI: añadir `supabase test db` y bloquear el despliegue si algo falla

### HU001 · Inicio de sesión con roles · P0

Spec: [HU001-spec.md](HU001-spec.md) · Requiere: ninguna · Lógica en: `shared/utils/auth.ts`, `server/utils/requireRole.ts`

> `T-HU001-11` (el rol `evaluator` no puede insertar en `tests`) se ejecuta en HU003, cuando existe la tabla `tests`.

- [x] **TK-HU001-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/evaluator_patients.test.sql`: evaluador A consulta `evaluator_patients` → solo ve sus filas · Tests: T-HU001-05
- [x] **TK-HU001-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/profiles.test.sql`: un `user` actualiza su propio `role` → error de privilegios · Tests: T-HU001-08
- [x] **TK-HU001-03** · Migración: `supabase/migrations/<ts>_create_evaluator_patients.sql`: tabla `evaluator_patients (evaluator_id, patient_id, assigned_by, created_at)`, PK `(evaluator_id,…. Regenerar `database.types.ts`
- [x] **TK-HU001-04** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: resolveHomeRoute para cada rol → ruta de `ROLE_HOME`; canAccessArea(`dashboard-tests`) con `superuser`, `evaluator` y `user` → true, false, false · Tests: T-HU001-01…02
- [x] **TK-HU001-05** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: buildDashboardMenu(`user`) → sin "tests" ni "patients"; buildDashboardMenu(`evaluator`) y (`superuser`) → `patients` sin `tests`; `superuser` incluye `tests` · Tests: T-HU001-03…04
- [x] **TK-HU001-06** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: validateAssignment con evaluador de rol `user` → `ok: false`; mapAuthError con "Invalid login credentials" y "User not found" → la misma clave · Tests: T-HU001-06…07
- [x] **TK-HU001-07** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: checkRoleAccess(null, …) → 401; checkRoleAccess con rol no permitido y con perfil inactivo → 403 en ambos casos · Tests: T-HU001-09…10
- [x] **TK-HU001-08** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: safeRedirect('//evil.com'), ('https://x.y') y ('/dashboard/usuario') → `/dashboard`, `/dashboard`, `/dashboard/usuario` · Tests: T-HU001-12
- [x] **TK-HU001-09** · Escribir la prueba Nuxt en `test/nuxt/composables/useProfile.test.ts` y la lógica mínima hasta verde: signOut() → `profile` = null y `navigateTo('/login')` · Tests: T-HU001-13
- [x] **TK-HU001-10** · Endpoint `GET /api/evaluator/patients`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU001-05
- [x] **TK-HU001-11** · Endpoint `POST /api/admin/evaluator-patients`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU001-06
- [x] **TK-HU001-12** · Endpoint `DELETE /api/admin/evaluator-patients/:evaluatorId/:patientId`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU001-06
- [x] **TK-HU001-13** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `auth.errors.*`, `dashboard.nav.*`, `patients.*`
- [x] **TK-HU001-14** · Interfaz `dashboard/pacientes/index.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU001-15** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU001-16** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU001-01…10, T-HU001-12…13

### HU024 · Auditoría y trazabilidad · P0

Spec: [HU024-spec.md](HU024-spec.md) · Requiere: HU001 · Lógica en: `shared/utils/audit.ts`

- [x] **TK-HU024-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: actualizar el título de una pregunta → fila con actor y `diff` solo con `prompt`; tablas de estructura sin trigger de auditoría → ninguna; `superuser` inserta en `audit_log` y `evaluator` lo lee → rechazado; 0 filas · Tests: T-HU024-01…03
- [x] **TK-HU024-02** · Migración: `<ts>_create_audit_log.sql`: tabla `audit_log`, función `private.audit()` y función `private.json_diff(old, new)`. Regenerar `database.types.ts`
- [x] **TK-HU024-03** · Escribir la prueba unit en `test/unit/audit/buildAuditQuery.test.ts` y la lógica mínima hasta verde: filtros de entidad y rango, página 2 → rango y offset correctos · Tests: T-HU024-04
- [x] **TK-HU024-04** · Endpoint `GET /api/admin/audit`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU024-04
- [x] **TK-HU024-05** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `audit.*`
- [x] **TK-HU024-06** · Interfaz `pages/dashboard/auditoria.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU024-07** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU024-08** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU024-01…04

### Bloque previo · Plantillas de gestión de tests

*Antes de HU003: las reutilizan HU003 a HU008.*

- [x] **TK-S1-15** · Plantilla de lista de gestión (`dashboard/tests/*`): tabla con filtros, estados vacío/cargando/error y diseño de tarjetas bajo 640 px, en `es` y `en`
- [x] **TK-S1-16** · Plantilla de formulario de gestión con `UForm`: errores por campo, botón de guardar con estado de carga y textos vía i18n

### HU003 · Crear un test · P0

Spec: [HU003-spec.md](HU003-spec.md) · Requiere: HU001, HU024 · Lógica en: `shared/utils/tests.ts`, `app/composables/useAdminTests.ts`

- [x] **TK-HU003-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/tests_structure.test.sql`: `user` consulta un test en `draft` → 0 filas · Tests: T-HU003-05
- [x] **TK-HU003-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: insertar un test → 1 fila en `audit_log` con `action = insert` · Tests: T-HU003-06
- [x] **TK-HU003-03** · Escribir en rojo las pruebas pgTAP de `supabase/tests/tests_structure.test.sql`: `evaluator` inserta en `tests` → rechazado por RLS · Tests: T-HU001-11
- [x] **TK-HU003-04** · Migración: `<ts>_create_tests.sql`: enum `test_status`, tabla `tests` (§7.3), índice único en `code`, RLS de estructura. Regenerar `database.types.ts`
- [x] **TK-HU003-05** · Escribir la prueba unit en `test/unit/tests/createTest.test.ts` y la lógica mínima hasta verde: buildNewTest(input, userId) → `status: draft`, `version: 1`, `created_by: userId` · Tests: T-HU003-01
- [x] **TK-HU003-06** · Escribir la prueba unit en `test/unit/tests/validateTestInput.test.ts` y la lógica mínima hasta verde: código 'ab', 'TEST 1', 'TEST_1' → inválido, inválido, válido; título de 2 y de 121 caracteres → ambos inválidos · Tests: T-HU003-02…03
- [x] **TK-HU003-07** · Escribir la prueba unit en `test/unit/tests/createTest.test.ts` y la lógica mínima hasta verde: mapDbError con violación de unicidad (23505) → `{ field: 'code', code: 'code_taken' }` · Tests: T-HU003-04
- [x] **TK-HU003-08** · Escribir la prueba unit en `test/unit/tests/filterTests.test.ts` y la lógica mínima hasta verde: filterTests(lista, 'draft') → solo los `draft` · Tests: T-HU003-07
- [x] **TK-HU003-09** · Endpoint `GET /api/admin/tests`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU003-01
- [x] **TK-HU003-10** · Endpoint `POST /api/admin/tests`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU003-01
- [x] **TK-HU003-11** · Endpoint `GET /api/tests`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU003-05
- [x] **TK-HU003-12** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.admin.*`, `errors.test.*`
- [x] **TK-HU003-13** · Interfaz `pages/dashboard/tests/index.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU003-14** · Interfaz `pages/dashboard/tests/nuevo.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU003-15** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU003-16** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU003-01…07, T-HU001-11

### HU004 · Gestionar secciones de un test · P0

Spec: [HU004-spec.md](HU004-spec.md) · Requiere: HU003 · Lógica en: `shared/utils/ordering.ts`, `shared/utils/tests.ts`

- [x] **TK-HU004-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/tests_structure.test.sql`: insertar dos secciones con el mismo código en un test → error de unicidad · Tests: T-HU004-02
- [x] **TK-HU004-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: actualizar una sección → fila en `audit_log` con `diff` · Tests: T-HU004-08
- [x] **TK-HU004-03** · Migración: `<ts>_create_test_sections.sql`: tabla `test_sections` (§7.3) con RLS de estructura. Regenerar `database.types.ts`
- [x] **TK-HU004-04** · Escribir la prueba unit en `test/unit/shared/ordering.test.ts` y la lógica mínima hasta verde: nextPosition([]) y con posiciones [1,2,3] → 1 y 4; reorder de 4 elementos moviendo el 0 al 2 → posiciones 1,2,3,4 con el orden nuevo · Tests: T-HU004-01, T-HU004-03
- [x] **TK-HU004-05** · Escribir la prueba unit en `test/unit/shared/ordering.test.ts` y la lógica mínima hasta verde: reorder con índice fuera de rango → lista sin cambios · Tests: T-HU004-04
- [x] **TK-HU004-06** · Escribir la prueba unit en `test/unit/tests/deleteSection.test.ts` y la lógica mínima hasta verde: planDeleteSection con 5 preguntas y sin confirmar → `{ needsConfirm: true, questionCount: 5 }` · Tests: T-HU004-05
- [x] **TK-HU004-07** · Escribir la prueba unit en `test/unit/tests/assertStructureEditable.test.ts` y la lógica mínima hasta verde: test `published` y test `draft` con respuestas → `new_version_required` en ambos; test `draft` sin respuestas → `ok: true` · Tests: T-HU004-06…07
- [x] **TK-HU004-08** · Endpoint `POST /api/admin/tests/:id/sections[/:sectionId]`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU004-01
- [x] **TK-HU004-09** · Endpoint `PATCH /api/admin/tests/:id/sections[/:sectionId]`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU004-01
- [x] **TK-HU004-10** · Endpoint `DELETE /api/admin/tests/:id/sections[/:sectionId]`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU004-01
- [x] **TK-HU004-11** · Endpoint `PATCH /api/admin/tests/:id/sections/order`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU004-01
- [x] **TK-HU004-12** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.sections.*`
- [x] **TK-HU004-13** · Interfaz `components/admin/tests/SectionList.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU004-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU004-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU004-01…08

### HU031 · Catálogo de escalas reutilizables · P0

Spec: [HU031-spec.md](HU031-spec.md) · Requiere: ninguna · Lógica en: `shared/utils/scales.ts`

- [x] **TK-HU031-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/scales.test.sql`: escalas sembradas → F5, IND, SNN, FC y CMP5 con sus opciones; insertar opción sin `en` → violación del `check` · Tests: T-HU031-01, T-HU031-04
- [x] **TK-HU031-02** · Migración: `<ts>_create_scales.sql`: tablas `scales` y `scale_options`, seed y `check (label ? 'es' and label ? 'en')`. Regenerar `database.types.ts`
- [x] **TK-HU031-03** · Escribir la prueba unit en `test/unit/scales/applyScale.test.ts` y la lógica mínima hasta verde: aplicar F5 y luego modificar la escala → la copia no cambia · Tests: T-HU031-02
- [x] **TK-HU031-04** · Escribir la prueba unit en `test/unit/questions/validateQuestionInput.test.ts` y la lógica mínima hasta verde: opciones copiadas con una etiqueta editada → válido · Tests: T-HU031-03
- [x] **TK-HU031-05** · Endpoint `GET /api/admin/scales`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [x] **TK-HU031-06** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `scales.*`
- [x] **TK-HU031-07** · Interfaz `QuestionForm.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU031-08** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU031-09** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU031-01…04

### HU005 · Crear preguntas de cada tipo · P0

Spec: [HU005-spec.md](HU005-spec.md) · Requiere: HU004, HU031 · Lógica en: `shared/utils/questions.ts`, `app/composables/useQuestionEditor.ts`

- [x] **TK-HU005-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/tests_structure.test.sql`: mismo código en dos secciones del mismo test → error de unicidad · Tests: T-HU005-02
- [x] **TK-HU005-02** · Migración: `<ts>_create_questions.sql`: enums `question_type` y `question_direction`; tablas `questions` y `question_options` (§7.3); vista `questions_public` sin `weight`,…. Regenerar `database.types.ts`
- [x] **TK-HU005-03** · Escribir la prueba unit en `test/unit/questions/validateQuestionInput.test.ts` y la lógica mínima hasta verde: pregunta sin `prompt.es` → error `required` en `prompt`; `single_choice` con 1 opción → error `min_options` · Tests: T-HU005-01, T-HU005-03
- [x] **TK-HU005-04** · Escribir la prueba unit en `test/unit/questions/validateQuestionInput.test.ts` y la lógica mínima hasta verde: `multiple_choice` con valores repetidos y con `exclusiveValues` inexistente → errores `duplicate_option` y `unknown_option`; `true_false` sin `labels.false` → error en `config.labels` · Tests: T-HU005-04…05
- [x] **TK-HU005-05** · Escribir la prueba unit en `test/unit/questions/validateQuestionInput.test.ts` y la lógica mínima hasta verde: `numeric_scale` con min 10 y max 1 → error `min_gte_max`; `agreement` con 4 etiquetas → error `labels_count` · Tests: T-HU005-06…07
- [x] **TK-HU005-06** · Escribir la prueba unit en `test/unit/questions/defaultConfig.test.ts` y la lógica mínima hasta verde: defaultConfig para cada tipo → valores por defecto de §5 · Tests: T-HU005-08
- [x] **TK-HU005-07** · Escribir la prueba unit en `test/unit/questions/validateQuestionInput.test.ts` y la lógica mínima hasta verde: `open_text` con `maxLength` 0 y `numeric_free` con min > max → dos errores; pregunta con 3 campos inválidos → 3 errores en una sola llamada · Tests: T-HU005-09…10
- [x] **TK-HU005-08** · Escribir la prueba Nuxt en `test/nuxt/composables/useQuestionEditor.test.ts` y la lógica mínima hasta verde: save() exitoso → `preview` contiene la pregunta nueva · Tests: T-HU005-11
- [x] **TK-HU005-09** · Endpoint `POST /api/admin/tests/:id/questions[/:questionId]`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [x] **TK-HU005-10** · Endpoint `PATCH /api/admin/tests/:id/questions[/:questionId]`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [x] **TK-HU005-11** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.questions.*`, `errors.question.*`
- [x] **TK-HU005-12** · Interfaz `components/admin/tests/QuestionForm.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU005-13** · Interfaz `config/*.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU005-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU005-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU005-01…11

### HU006 · Editar, duplicar, ordenar y desactivar preguntas · P0

Spec: [HU006-spec.md](HU006-spec.md) · Requiere: HU005 · Lógica en: `shared/utils/questions.ts`, `shared/utils/conditions.ts`

- [x] **TK-HU006-01** · Migración: Columna `questions.depends_on jsonb` (contrato `Condition`, §8) y `questions.active`. Regenerar `database.types.ts`
- [x] **TK-HU006-02** · Escribir la prueba unit en `test/unit/questions/assertQuestionChange.test.ts` y la lógica mínima hasta verde: cambiar `prompt` sin respuestas → `ok: true`; cambiar `type` con respuestas → `new_version_required` · Tests: T-HU006-01…02
- [x] **TK-HU006-03** · Escribir la prueba unit en `test/unit/questions/duplicateCode.test.ts` y la lógica mínima hasta verde: duplicateCode('MEM_001', ['MEM_001','MEM_001_COPY']) → 'MEM_001_COPY2' · Tests: T-HU006-03
- [x] **TK-HU006-04** · Escribir la prueba unit en `test/unit/questions/buildQuestionnaire.test.ts` y la lógica mínima hasta verde: una pregunta inactiva entre tres → devuelve 2 en orden · Tests: T-HU006-04
- [x] **TK-HU006-05** · Escribir la prueba unit en `test/unit/conditions/validateCondition.test.ts` y la lógica mínima hasta verde: condición sobre un código inexistente → `unknown_question`; condición `eq` 'Quizás' sobre una `true_false` → `invalid_value` · Tests: T-HU006-05…06
- [x] **TK-HU006-06** · Escribir la prueba unit en `test/unit/conditions/detectCycle.test.ts` y la lógica mínima hasta verde: A depende de B y B de A → ['A','B']; cadena A → B → C sin ciclo → null · Tests: T-HU006-07…08
- [x] **TK-HU006-07** · Escribir la prueba unit en `test/unit/shared/ordering.test.ts` y la lógica mínima hasta verde: reorder sobre preguntas → posiciones consecutivas · Tests: T-HU006-09
- [x] **TK-HU006-08** · Endpoint `PATCH /api/admin/questions/:id`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [x] **TK-HU006-09** · Endpoint `POST /api/admin/questions/:id/duplicate`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [x] **TK-HU006-10** · Endpoint `PATCH /api/admin/sections/:id/questions/order`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [x] **TK-HU006-11** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.questions.actions.*`, `errors.condition.*`
- [x] **TK-HU006-12** · Interfaz `QuestionList.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU006-13** · Interfaz `QuestionForm.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU006-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU006-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU006-01…09

### HU007 · Publicar, versionar y archivar un test · P0

Spec: [HU007-spec.md](HU007-spec.md) · Requiere: HU003, HU004, HU005, HU006 · Lógica en: `shared/utils/publish.ts`

- [x] **TK-HU007-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/publish_test.test.sql`: publicar v2 con v1 publicada → v1 `archived`, v2 `published` · Tests: T-HU007-05
- [x] **TK-HU007-02** · Migración: `tests.parent_test_id`; función SQL `publish_test(test_id)` (`security definer`, solo `superuser`) que publica y archiva en una transacción. Regenerar `database.types.ts`
- [x] **TK-HU007-03** · Escribir la prueba unit en `test/unit/publish/validateForPublish.test.ts` y la lógica mínima hasta verde: sección sin preguntas activas → error `empty_section` con el código de la sección; test con 2 problemas distintos → 2 errores · Tests: T-HU007-01…02
- [x] **TK-HU007-04** · Escribir la prueba unit en `test/unit/publish/validateForPublish.test.ts` y la lógica mínima hasta verde: test válido → [] · Tests: T-HU007-03
- [x] **TK-HU007-05** · Escribir la prueba unit en `test/unit/publish/cloneTestVersion.test.ts` y la lógica mínima hasta verde: clonar test v1 con condiciones → v2 `draft`, mismos códigos, condiciones intactas, `parent_test_id` = v1 · Tests: T-HU007-04
- [x] **TK-HU007-06** · Escribir la prueba unit en `test/unit/assessment/startAssessment.test.ts` y la lógica mínima hasta verde: iniciar evaluación de un test `archived` → `test_unavailable`; buildAssessment(test v3) → `test_version: 3` · Tests: T-HU007-06…07
- [x] **TK-HU007-07** · Endpoint `POST /api/admin/tests/:id/publish`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU007-03
- [x] **TK-HU007-08** · Endpoint `POST /api/admin/tests/:id/new-version`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU007-03
- [x] **TK-HU007-09** · Endpoint `POST /api/admin/tests/:id/archive`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU007-03
- [x] **TK-HU007-10** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.publish.*`
- [x] **TK-HU007-11** · Interfaz: Botón "Publicar" con panel de errores agrupado por sección; botón "Nueva versión" en tests publicados
- [x] **TK-HU007-12** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU007-13** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU007-01…07

### HU008 · Importar un test desde un archivo estructurado · P0

Spec: [HU008-spec.md](HU008-spec.md) · Requiere: HU005, HU031 · Lógica en: `shared/utils/importer.ts`

- [x] **TK-HU008-01** · Escribir la prueba unit en `test/unit/importer/parseTestMarkdown.test.ts` y la lógica mínima hasta verde: fragmento con 2 módulos y 5 filas → 2 secciones, 5 preguntas · Tests: T-HU008-01
- [x] **TK-HU008-02** · Escribir la prueba unit en `test/unit/importer/previewImport.test.ts` y la lógica mínima hasta verde: fila con tipo `XYZ` en la línea 12 → error `unsupported_type` en línea 12; conteo por tipo → totales por `question_type` correctos · Tests: T-HU008-02…03
- [x] **TK-HU008-03** · Escribir la prueba unit en `test/unit/importer/runImport.test.ts` y la lógica mínima hasta verde: importación con un error → no se llama a ninguna escritura · Tests: T-HU008-04
- [x] **TK-HU008-04** · Escribir la prueba unit en `test/unit/importer/planUpsert.test.ts` y la lógica mínima hasta verde: reimportar el mismo archivo → todo "sin cambios"; archivo con un texto cambiado y una pregunta nueva → 1 actualizar, 1 crear · Tests: T-HU008-05…06
- [x] **TK-HU008-05** · Escribir la prueba unit en `test/unit/importer/mapDocType.test.ts` y la lógica mínima hasta verde: cada token del documento → tipo y escala esperados; `XYZ` → null · Tests: T-HU008-07
- [x] **TK-HU008-06** · Escribir la prueba unit en `test/unit/tests/assertStructureEditable.test.ts` y la lógica mínima hasta verde: importar sobre test `published` → `new_version_required` · Tests: T-HU008-08
- [x] **TK-HU008-07** · Endpoint `POST /api/admin/tests/:id/import`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU008-04
- [x] **TK-HU008-08** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.import.*`
- [x] **TK-HU008-09** · Interfaz `components/admin/tests/ImportDialog.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [x] **TK-HU008-10** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [x] **TK-HU008-11** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; marcar la spec como **Implementada** · Tests: T-HU008-01…08

### Verificación de salida del Sprint 1

Se marca cuando todas las tareas anteriores del sprint están hechas y los siguientes puntos se comprueban a mano:

- [x] **TK-S1-X1** · Un usuario de cada rol llega a su panel; un `user` no puede abrir ni escribir en rutas de gestión
- [ ] **TK-S1-X2** (pendiente: subir `.github/workflows/ci.yml` y `supabase/config.toml` a GitHub y exigir los jobs `checks` y `database` en la protección de `main`; los pasos ya pasan en una copia limpia) · CI corre en cada cambio y bloquea si algo falla
- [x] **TK-S1-X3** · Un `superuser` crea un test, lo importa, lo publica y crea la versión 2 sin afectar la 1
- [x] **TK-S1-X4** · `pnpm test`, `pnpm lint`, `pnpm typecheck` y `supabase test db` pasan; el sprint anterior sigue en verde

---

## Sprint 2 · Test 1 y respuestas por formulario

*El Test 1 queda cargado, validado y publicado, y un paciente o evaluador lo completa por formulario con datos seguros.*  
Etapas del plan original: Fase 1b + Fase 2.

### Bloqueos externos del Sprint 2 (no son tareas de código)

- [ ] Pistas conversacionales del Test 1 redactadas y aprobadas por psicología — *Bloquea HU033 y HU034*
- [ ] Equipo clínico empieza a definir los resultados esperados por perfil y los umbrales iniciales del semáforo — *Bloquea HU038, HU020 y HU022 (Sprint 3)*

### HU030 · Cargar el Test 1 con sus 13 módulos y 124 preguntas · P0

Spec: [HU030-spec.md](HU030-spec.md) · Requiere: HU008, HU031 · Lógica en: `scripts/seed-test-1.ts`

- [ ] **TK-HU030-01** · Migración: Script `scripts/seed-test-1.ts`; no crea tablas. Regenerar `database.types.ts`
- [ ] **TK-HU030-02** · Escribir la prueba unit en `test/unit/test1/test1Structure.test.ts` y la lógica mínima hasta verde: secciones de `docs/test-1.md` → DAT, ANT, MEM, ATT, EXEC, LANG, ORI, FUNC, EMO, SLP, PHY, NUT, SOCCOG en orden; conteo por sección → 14, 11, 11, 7, 8, 6, 5, 13, 9, 7, 6, 16, 11 (124) · Tests: T-HU030-01…02
- [ ] **TK-HU030-03** · Escribir la prueba unit en `test/unit/test1/test1Structure.test.ts` y la lógica mínima hasta verde: `doc_ref` presentes → P1–P80 sin huecos; opciones de MEM_001 y FUNC_001 → F5 con 0–4; IND con 0–1 · Tests: T-HU030-03…04
- [ ] **TK-HU030-04** · Escribir la prueba unit en `test/unit/test1/test1Structure.test.ts` y la lógica mínima hasta verde: preguntas EMO → todas `isDraftContent` · Tests: T-HU030-05
- [ ] **TK-HU030-05** · Escribir la prueba unit en `test/unit/importer/planUpsert.test.ts` y la lógica mínima hasta verde: ejecutar el plan dos veces sobre Test 1 → la segunda vez todo "sin cambios" · Tests: T-HU030-06
- [ ] **TK-HU030-06** · Escribir la prueba unit en `test/unit/test1/test1Structure.test.ts` y la lógica mínima hasta verde: pesos → todos null · Tests: T-HU030-07
- [ ] **TK-HU030-07** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU030-01…07

### HU032 · Lógica condicional y exclusión del Test 1 · P0

Spec: [HU032-spec.md](HU032-spec.md) · Requiere: HU006, HU030 · Lógica en: `shared/utils/conditions.ts`

- [ ] **TK-HU032-01** · Migración: `depends_on` del Test 1 cargado por HU030. Regenerar `database.types.ts`
- [ ] **TK-HU032-02** · Escribir la prueba unit en `test/unit/conditions/test1Conditions.test.ts` y la lógica mínima hasta verde: `DAT_009` = false / true → `DAT_010` visible / oculta; `DAT_013` = 'no_changes' → `DAT_014` oculta · Tests: T-HU032-01…02
- [ ] **TK-HU032-03** · Escribir la prueba unit en `test/unit/conditions/test1Conditions.test.ts` y la lógica mínima hasta verde: `GEN_001` = yes / no → `GEN_002`, `GEN_003` visibles / ocultas; `MED_001`, `SUB_001`, `SUB_003` → `MED_002`, `SUB_002`, `SUB_004` según `docs/test-1.md` · Tests: T-HU032-03…04
- [ ] **TK-HU032-04** · Escribir la prueba unit en `test/unit/conditions/test1Conditions.test.ts` y la lógica mínima hasta verde: FUNC_004 = needs_help, FUNC_011 = false → `FUNC_011` y `FUNC_013` visibles, `FUNC_012` oculta · Tests: T-HU032-05
- [ ] **TK-HU032-05** · Escribir la prueba unit en `test/unit/progress/canFinish.test.ts` y la lógica mínima hasta verde: Test 1 con `DAT_009` = true y `DAT_010` sin responder → `ok: true` si lo demás está resuelto · Tests: T-HU032-06
- [ ] **TK-HU032-06** · Escribir la prueba unit en `test/unit/conditions/reconcileHidden.test.ts` y la lógica mínima hasta verde: `GEN_001` cambia a no con `GEN_002` respondida → ['GEN_002'] (solo las ya respondidas) · Tests: T-HU032-07
- [ ] **TK-HU032-07** · Escribir la prueba unit en `test/unit/answers/applyExclusive.test.ts` y la lógica mínima hasta verde: HIS_001: marcar 'none' con dos afecciones → ['none'] · Tests: T-HU032-08
- [ ] **TK-HU032-08** · Interfaz: Las preguntas aparecen u ocultan con `@formkit/auto-animate`
- [ ] **TK-HU032-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU032-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU032-01…08

### HU033 · Pistas conversacionales para todas las preguntas · P0

Spec: [HU033-spec.md](HU033-spec.md) · Requiere: HU030 · Lógica en: `shared/utils/hints.ts`

- [ ] **TK-HU033-01** · Migración: `questions.hint_status`; pistas del Test 1 en `docs/test-1-hints.md` (lo redacta psicología) cargadas por el mismo importador. Regenerar `database.types.ts`
- [ ] **TK-HU033-02** · Escribir la prueba unit en `test/unit/hints/validateHint.test.ts` y la lógica mínima hasta verde: pista sin `en` → `missing_locale`; pregunta F5 con 1 ejemplo en `es` → `examples_count` · Tests: T-HU033-01…02
- [ ] **TK-HU033-03** · Escribir la prueba unit en `test/unit/hints/isSensitive.test.ts` y la lógica mínima hasta verde: 'SUB_003', 'EMO_001', 'DAT_011', 'MEM_001' → true, true, true, false · Tests: T-HU033-03
- [ ] **TK-HU033-04** · Escribir la prueba unit en `test/unit/llm/prompt.test.ts` y la lógica mínima hasta verde: pendiente sensible → el prompt incluye la instrucción de tacto · Tests: T-HU033-04
- [ ] **TK-HU033-05** · Escribir la prueba unit en `test/unit/publish/validateForPublish.test.ts` y la lógica mínima hasta verde: pregunta con `hint_status: draft` → error `hint_not_approved` · Tests: T-HU033-05
- [ ] **TK-HU033-06** · Endpoint `PATCH /api/admin/questions/:id/hint`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU033-07** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.hints.*`
- [ ] **TK-HU033-08** · Interfaz `QuestionForm.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU033-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU033-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU033-01…05

### HU036 · Alertas iniciales del Test 1 · P0

Spec: [HU036-spec.md](HU036-spec.md) · Requiere: HU030 · Lógica en: `shared/utils/alerts.ts`

- [ ] **TK-HU036-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/alert_rules.test.sql`: reglas sembradas → RAPID_DECLINE y NEW_FUNCTIONAL_LOSS activas · Tests: T-HU036-05
- [ ] **TK-HU036-02** · Migración: `<ts>_create_alert_rules.sql`: enum `alert_level`, tabla `alert_rules` y seed de las dos reglas. Regenerar `database.types.ts`
- [ ] **TK-HU036-03** · Escribir la prueba unit en `test/unit/alerts/evaluateAlerts.test.ts` y la lógica mínima hasta verde: `DAT_014` = 'worse_fast' y = 'worse_slow' → alerta `orange`; ninguna; FUNC_011 = true con 1 y con 2 actividades `needs_help` → ninguna; `orange` · Tests: T-HU036-01…02
- [ ] **TK-HU036-04** · Escribir la prueba unit en `test/unit/alerts/maxLevel.test.ts` y la lógica mínima hasta verde: alertas `yellow` y `orange` → `orange` · Tests: T-HU036-03
- [ ] **TK-HU036-05** · Escribir la prueba unit en `test/unit/repo/noHardcodedThresholds.test.ts` y la lógica mínima hasta verde: buscar los códigos de regla en `shared/` y `server/` → ninguna coincidencia fuera de pruebas · Tests: T-HU036-04
- [ ] **TK-HU036-06** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `alert_rules.message`, `es`, `en`
- [ ] **TK-HU036-07** · Interfaz `FindingsList.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU036-08** · Interfaz `pages/dashboard/evaluador.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU036-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU036-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU036-01…05

### HU034 · Verificación de integridad y publicación del Test 1 · P0

Spec: [HU034-spec.md](HU034-spec.md) · Requiere: HU007, HU030, HU032, HU033 · Lógica en: `shared/utils/publish.ts`

- [ ] **TK-HU034-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/publish_test.test.sql`: publicar TEST_1 v1 → estado `published` y fila en `audit_log` · Tests: T-HU034-05
- [ ] **TK-HU034-02** · Escribir la prueba unit en `test/unit/publish/validateTest1.test.ts` y la lógica mínima hasta verde: fixture del Test 1 con pistas aprobadas → sin errores y con advertencia de EMO; sin la sección NUT → error `missing_section` NUT · Tests: T-HU034-01…02
- [ ] **TK-HU034-03** · Escribir la prueba unit en `test/unit/publish/validateTest1.test.ts` y la lógica mínima hasta verde: condición a `XXX_999` → error `unknown_question` · Tests: T-HU034-03
- [ ] **TK-HU034-04** · Escribir la prueba unit en `test/unit/publish/groupErrors.test.ts` y la lógica mínima hasta verde: 3 errores en 2 secciones → 2 grupos · Tests: T-HU034-04
- [ ] **TK-HU034-05** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.publish.*`
- [ ] **TK-HU034-06** · Interfaz: Panel de errores y advertencias en la página del test
- [ ] **TK-HU034-07** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU034-08** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU034-01…05

### Bloque previo · Migraciones compartidas de consentimiento y evaluaciones

*Antes de HU002: `assessments.consent_id` referencia a `consents`; las necesitan HU002, HU011, HU012, HU013 y HU014.*

- [ ] **TK-S2-01** · Migración `consent_versions` y `consents` con RLS del paciente (sus pruebas pgTAP se escriben en HU002)
- [ ] **TK-S2-02** · Migración de enums `assessment_status` y `assessment_mode` y de la tabla `assessments` (con `consent_id`)
- [ ] **TK-S2-03** · Función `private.can_access_assessment` y políticas RLS de `assessments` (paciente dueño, evaluador asignado, `superuser`); sus pruebas pgTAP se escriben en HU012

### HU002 · Consentimiento informado antes de evaluar · P0

Spec: [HU002-spec.md](HU002-spec.md) · Requiere: HU001 · Lógica en: `shared/utils/consent.ts`, `shared/utils/i18n.ts`, `app/composables/useConsent.ts`

- [ ] **TK-HU002-01** · Escribir (la migración compartida ya existe; si fallan, corregirla) las pruebas pgTAP de `supabase/tests/consents.test.sql`: paciente A consulta consentimientos → solo ve los suyos · Tests: T-HU002-08
- Migración compartida: ya cubierta en el bloque previo del sprint (ver `TK-S2-01` a `TK-S2-03`)
- [ ] **TK-HU002-02** · Escribir la prueba unit en `test/unit/consent/consent.test.ts` y la lógica mínima hasta verde: hasValidConsent sin consentimientos → false; hasValidConsent con versión anterior y con versión vigente → false, true · Tests: T-HU002-01…02
- [ ] **TK-HU002-03** · Escribir la prueba unit en `test/unit/assessment/startAssessment.test.ts` y la lógica mínima hasta verde: crear evaluación sin consentimiento vigente → error `consent_required` · Tests: T-HU002-03
- [ ] **TK-HU002-04** · Escribir la prueba Nuxt en `test/nuxt/composables/useConsent.test.ts` y la lógica mínima hasta verde: accept(assessmentId) → llama `POST /api/consents` con la versión vigente y el id · Tests: T-HU002-04
- [ ] **TK-HU002-05** · Escribir la prueba Nuxt en `test/nuxt/composables/useConsent.test.ts` y la lógica mínima hasta verde: reject() → no llama a `$fetch` y navega al panel · Tests: T-HU002-05
- [ ] **TK-HU002-06** · Escribir la prueba unit en `test/unit/i18n/localize.test.ts` y la lógica mínima hasta verde: localize({ es: 'Hola' }, 'en') → 'Hola' (respaldo) · Tests: T-HU002-06
- [ ] **TK-HU002-07** · Escribir la prueba unit en `test/unit/consent/consent.test.ts` y la lógica mínima hasta verde: validateConsentBody sin la sección `noDiagnosis` → `ok: false` · Tests: T-HU002-07
- [ ] **TK-HU002-08** · Endpoint `GET /api/consents/current`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU002-09** · Endpoint `POST /api/consents`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU002-04, T-HU002-08
- [ ] **TK-HU002-10** · Endpoint `GET /api/consents/me`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU002-08
- [ ] **TK-HU002-11** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `consent.*`
- [ ] **TK-HU002-12** · Interfaz `components/assessment/ConsentGate.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU002-13** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU002-14** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU002-01…08

### HU014 · Almacenamiento seguro de respuestas · P0

Spec: [HU014-spec.md](HU014-spec.md) · Requiere: HU001 · Lógica en: `shared/utils/score.ts`, `server/utils/answers.ts`

- [ ] **TK-HU014-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/answers.test.sql`: paciente A lee y escribe respuestas de B → 0 filas y error · Tests: T-HU014-05
- [ ] **TK-HU014-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/questions_public.test.sql`: `user` selecciona `weight` en `questions_public` → columna inexistente · Tests: T-HU014-06
- [ ] **TK-HU014-03** · Migración: `<ts>_create_answers.sql`: enums `answer_source`, `answer_state`; tablas `answers` y `answer_history` (trigger `before update`); RLS por `private.can_access_assessment`. Regenerar `database.types.ts`
- [ ] **TK-HU014-04** · Escribir la prueba unit en `test/unit/answers/buildAnswerRow.test.ts` y la lógica mínima hasta verde: respuesta de conversación con confianza → fila con `source`, `confidence`, `evidence` y `score` · Tests: T-HU014-01
- [ ] **TK-HU014-05** · Escribir la prueba unit en `test/unit/score/computeScore.test.ts` y la lógica mínima hasta verde: single F5 "A menudo", multiple con 2 opciones, numeric 7, open_text → 3, suma, 7, null; respuesta `declined` → null · Tests: T-HU014-02…03
- [ ] **TK-HU014-06** · Escribir la prueba unit en `test/unit/repo/migrationsOnly.test.ts` y la lógica mínima hasta verde: buscar `create table` fuera de `supabase/migrations` → ninguna coincidencia · Tests: T-HU014-04
- [ ] **TK-HU014-07** · Escribir la prueba unit en `test/unit/repo/serviceRoleBoundary.test.ts` y la lógica mínima hasta verde: buscar `serverSupabaseServiceRole` en `app/` → ninguna coincidencia · Tests: T-HU014-07
- [ ] **TK-HU014-08** · Escribir la prueba unit en `test/unit/privacy/anonymize.test.ts` y la lógica mínima hasta verde: anonymizeAnswers(filas) → `evidence` y textos en null · Tests: T-HU014-08
- [ ] **TK-HU014-09** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU014-01…08

### HU013 · Validación y consistencia de respuestas · P0

Spec: [HU013-spec.md](HU013-spec.md) · Requiere: HU005 · Lógica en: `shared/utils/validateAnswer.ts`, `server/utils/answers.ts`

- [ ] **TK-HU013-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/answers.test.sql`: insertar dos respuestas a la misma pregunta → error de unicidad · Tests: T-HU013-06
- [ ] **TK-HU013-02** · Migración: Restricción única `answers (assessment_id, question_id)`. Regenerar `database.types.ts`
- [ ] **TK-HU013-03** · Escribir la prueba unit en `test/unit/answers/validateAnswer.test.ts` y la lógica mínima hasta verde: numeric_scale 1–10 con 0, 1, 10, 11 → error, ok, ok, error; single_choice con valor inexistente y con ['a','b'] → `unknown_option`, `wrong_type` · Tests: T-HU013-01…02
- [ ] **TK-HU013-04** · Escribir la prueba unit en `test/unit/answers/validateAnswer.test.ts` y la lógica mínima hasta verde: multiple_choice ['none','hta'] con 'none' exclusivo → `exclusive_conflict` · Tests: T-HU013-03
- [ ] **TK-HU013-05** · Escribir la prueba unit en `test/unit/answers/applyExclusive.test.ts` y la lógica mínima hasta verde: seleccionar 'none' con ['hta','dm'] marcadas → ['none'] · Tests: T-HU013-04
- [ ] **TK-HU013-06** · Escribir la prueba unit en `test/unit/answers/validateAnswer.test.ts` y la lógica mínima hasta verde: open_text '  hola  ', texto de 1001 caracteres y '' obligatorio → 'hola', `too_long`, `required` · Tests: T-HU013-05
- [ ] **TK-HU013-07** · Escribir la prueba unit en `test/unit/answers/saveAnswerHandler.test.ts` y la lógica mínima hasta verde: valor fuera de rango enviado a la API → 422 `out_of_range` · Tests: T-HU013-07
- [ ] **TK-HU013-08** · Escribir la prueba unit en `test/unit/answers/assertWritable.test.ts` y la lógica mínima hasta verde: evaluación completada y pregunta de otra versión → `assessment_closed`, `question_not_in_version` · Tests: T-HU013-08
- [ ] **TK-HU013-09** · Endpoint `PUT /api/assessments/:id/answers/:questionCode`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU013-07
- [ ] **TK-HU013-10** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `errors.answer.*`
- [ ] **TK-HU013-11** · Interfaz: Mensajes de error bajo cada control con `errors.answer.<code>`
- [ ] **TK-HU013-12** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU013-13** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU013-01…08

### HU011 · Paciente completa el test en un formulario amigable · P0

Spec: [HU011-spec.md](HU011-spec.md) · Requiere: HU002, HU007, HU013, HU014 · Lógica en: `shared/utils/progress.ts`, `app/composables/useAssessment.ts`

- Migración compartida: ya cubierta en el bloque previo del sprint (ver `TK-S2-01` a `TK-S2-03`)
- [ ] **TK-HU011-01** · Escribir la prueba unit en `test/unit/progress/sectionProgress.test.ts` y la lógica mínima hasta verde: sección 3 de 13 → `{ current: 3, total: 13, percent: 23 }` · Tests: T-HU011-01
- [ ] **TK-HU011-02** · Escribir la prueba Nuxt en `test/nuxt/components/QuestionField.test.ts` y la lógica mínima hasta verde: montar cada tipo → renderiza el control esperado · Tests: T-HU011-02
- [ ] **TK-HU011-03** · Escribir la prueba Nuxt en `test/nuxt/composables/useAssessment.test.ts` y la lógica mínima hasta verde: dos cambios en menos de 400 ms → una sola llamada a `saveAnswer` y estado `saved` · Tests: T-HU011-03
- [ ] **TK-HU011-04** · Escribir la prueba unit en `test/unit/progress/firstPending.test.ts` y la lógica mínima hasta verde: obligatorias 1 y 3 respondidas, 2 pendiente → código de la 2 · Tests: T-HU011-04
- [ ] **TK-HU011-05** · Escribir la prueba Nuxt en `test/nuxt/composables/useAssessment.test.ts` y la lógica mínima hasta verde: goTo(1) con estado `in_progress` y con `completed` → navega; no navega · Tests: T-HU011-05
- [ ] **TK-HU011-06** · Escribir la prueba unit en `test/unit/progress/canFinish.test.ts` y la lógica mínima hasta verde: una obligatoria pendiente → `ok: false` con su código; obligatoria con `declined` → `ok: true` · Tests: T-HU011-06…07
- [ ] **TK-HU011-07** · Escribir la prueba unit en `test/unit/assessment/completeAssessment.test.ts` y la lógica mínima hasta verde: completar con todo resuelto → `status: completed`, `completed_at` definido; guardar respuesta en evaluación `completed` → `assessment_closed` · Tests: T-HU011-08…09
- [ ] **TK-HU011-08** · Endpoint `POST /api/assessments`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU011-08…09
- [ ] **TK-HU011-09** · Endpoint `GET /api/assessments/:id`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU011-08…09
- [ ] **TK-HU011-10** · Endpoint `PUT /api/assessments/:id/answers/:questionCode`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU011-08…09
- [ ] **TK-HU011-11** · Endpoint `POST /api/assessments/:id/complete`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU011-08…09
- [ ] **TK-HU011-12** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `assessment.form.*`
- [ ] **TK-HU011-13** · Interfaz `pages/dashboard/evaluacion/[id].vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU011-14** · Interfaz `components/assessment/SectionStep.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU011-15** · Interfaz `components/assessment/QuestionField.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU011-02
- [ ] **TK-HU011-16** · Interfaz `components/assessment/ProgressBar.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU011-17** · Interfaz `components/assessment/FinishScreen.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU011-18** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU011-19** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU011-01…09

### HU012 · Evaluador completa el test en nombre del paciente · P0

Spec: [HU012-spec.md](HU012-spec.md) · Requiere: HU011 · Lógica en: `shared/utils/access.ts`

- [ ] **TK-HU012-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/assessments.test.sql`: evaluador no asignado lee `answers` → 0 filas · Tests: T-HU012-03
- [ ] **TK-HU012-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/answers.test.sql`: actualizar una respuesta existente → la versión previa aparece en `answer_history` · Tests: T-HU012-05
- [ ] **TK-HU012-03** · Escribir en rojo las pruebas pgTAP de `supabase/tests/section_notes.test.sql`: `user` consulta `section_notes` → 0 filas · Tests: T-HU012-06
- [ ] **TK-HU012-04** · Migración: `<ts>_create_section_notes.sql`: tabla `section_notes` con RLS (solo evaluador asignado y `superuser`). Regenerar `database.types.ts`
- [ ] **TK-HU012-05** · Escribir la prueba Nuxt en `test/nuxt/pages/evaluatorAssessment.test.ts` y la lógica mínima hasta verde: montar la página del evaluador → usa `SectionStep` y `QuestionField` · Tests: T-HU012-01
- [ ] **TK-HU012-06** · Escribir la prueba unit en `test/unit/access/canAccessAssessment.test.ts` y la lógica mínima hasta verde: evaluador con y sin asignación → true, false · Tests: T-HU012-02
- [ ] **TK-HU012-07** · Escribir la prueba unit en `test/unit/access/answerSource.test.ts` y la lógica mínima hasta verde: answerSourceFor('evaluator','form') → 'evaluator' · Tests: T-HU012-04
- [ ] **TK-HU012-08** · Escribir la prueba unit en `test/unit/progress/firstPending.test.ts` y la lógica mínima hasta verde: retomar con respuestas mixtas de paciente y evaluador → primera pendiente correcta · Tests: T-HU012-07
- [ ] **TK-HU012-09** · Endpoint `PUT /api/assessments/:id/sections/:sectionId/note`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU012-10** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `assessment.evaluator.*`
- [ ] **TK-HU012-11** · Interfaz `pages/dashboard/pacientes/[patientId]/evaluacion/[id].vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU012-12** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU012-13** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU012-01…07

### Verificación de salida del Sprint 2

Se marca cuando todas las tareas anteriores del sprint están hechas y los siguientes puntos se comprueban a mano:

- [ ] **TK-S2-X1** · `TEST_1` está publicado con 13 secciones y 124 preguntas y sus condiciones funcionan
- [ ] **TK-S2-X2** · Un paciente con consentimiento completa el Test 1 por formulario
- [ ] **TK-S2-X3** · Un paciente no puede leer datos de otro (pgTAP en verde)
- [ ] **TK-S2-X4** · `pnpm test`, `pnpm lint`, `pnpm typecheck` y `supabase test db` pasan; el sprint anterior sigue en verde

---

## Sprint 3 · Resultados y conversación

*Al completar se generan hallazgos, factores, índice y plan, con privacidad básica; el asistente llena el mismo Test 1 por conversación. Cierra el MVP.*  
Etapas del plan original: Fase 3 + Fase 4.

### Bloqueos externos del Sprint 3 (no son tareas de código)

- [ ] Resultados esperados por perfil y umbrales iniciales del semáforo definidos por el equipo clínico — *Bloquea HU038, HU020 y HU022*
- [ ] Proveedor y modelo de LLM y región de procesamiento decididos (D-6) — *Bloquea HU015 a HU019 y HU037*
- [ ] Lista oficial de líneas de ayuda por país — *Bloquea HU019*
- [ ] Texto legal del consentimiento revisado por asesor legal — *Bloquea producción, no desarrollo*

### HU038 · Datos de ejemplo para pruebas y demostración · P1

Spec: [HU038-spec.md](HU038-spec.md) · Requiere: HU030 · Lógica en: `scripts/seed-demo.ts`

- [ ] **TK-HU038-01** · Migración: Script `scripts/seed-demo.ts`. Regenerar `database.types.ts`
- [ ] **TK-HU038-02** · Escribir la prueba unit en `test/unit/fixtures/profiles.test.ts` y la lógica mínima hasta verde: cada perfil contra `visibleQuestions` → sin preguntas aplicables sin respuesta; cada perfil → tiene `expected` con dominios, factores y alerta · Tests: T-HU038-01…02
- [ ] **TK-HU038-03** · Escribir la prueba unit en `test/unit/fixtures/assertNotProduction.test.ts` y la lógica mínima hasta verde: env 'production' y 'development' → lanza; no lanza · Tests: T-HU038-03
- [ ] **TK-HU038-04** · Escribir la prueba unit en `test/unit/results/brainIndex.test.ts` y la lógica mínima hasta verde: perfiles como entrada → usan `expected` de los fixtures · Tests: T-HU038-04
- [ ] **TK-HU038-05** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU038-01…04

### HU022 · Índice Brain Intelligence (Neurofit Brain Score™) · P0

Spec: [HU022-spec.md](HU022-spec.md) · Requiere: HU014 · Lógica en: `shared/utils/brainIndex.ts`

- [ ] **TK-HU022-01** · Migración: `assessment_results.brain_index`, `completeness`, `model_version`. Regenerar `database.types.ts`
- [ ] **TK-HU022-02** · Escribir la prueba unit en `test/unit/results/brainIndex.test.ts` y la lógica mínima hasta verde: perfiles de HU038 → índices esperados ± 0,5 · Tests: T-HU022-01
- [ ] **TK-HU022-03** · Escribir la prueba Nuxt en `test/nuxt/components/BrainIndexCard.test.ts` y la lógica mínima hasta verde: montar sin subíndices → no renderiza el número · Tests: T-HU022-02
- [ ] **TK-HU022-04** · Escribir la prueba unit en `test/unit/results/brainIndex.test.ts` y la lógica mínima hasta verde: modelo con un peso null → `preliminary: true`; completitud 0,75 y 0,85 → `overall` null; número · Tests: T-HU022-03…04
- [ ] **TK-HU022-05** · Escribir la prueba unit en `test/unit/results/brainIndex.test.ts` y la lógica mínima hasta verde: resultado → `modelVersion` = versión del modelo; respuestas EMO extremas → mismo índice que sin ellas · Tests: T-HU022-05…06
- [ ] **TK-HU022-06** · Escribir la prueba unit en `test/unit/results/brainIndex.test.ts` y la lógica mínima hasta verde: calcular dos veces la misma entrada → resultados iguales · Tests: T-HU022-07
- [ ] **TK-HU022-07** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `results.index.*`
- [ ] **TK-HU022-08** · Interfaz `components/results/BrainIndexCard.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU022-02
- [ ] **TK-HU022-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU022-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU022-01…07

### HU021 · Riesgos y factores · P0

Spec: [HU021-spec.md](HU021-spec.md) · Requiere: HU022 · Lógica en: `shared/utils/factors.ts`

- [ ] **TK-HU021-01** · Escribir la prueba unit en `test/unit/results/classifyFactors.test.ts` y la lógica mínima hasta verde: perfil con sedentarismo, antecedente familiar y lectura frecuente → uno en cada grupo; factor sueño → `level` y `evidence` con códigos SLP · Tests: T-HU021-01…02
- [ ] **TK-HU021-02** · Escribir la prueba unit en `test/unit/results/buildResult.test.ts` y la lógica mínima hasta verde: resultado completo → `cognitive_signals` y `future_risk` separados · Tests: T-HU021-03
- [ ] **TK-HU021-03** · Escribir la prueba unit en `test/unit/results/classifyFactors.test.ts` y la lógica mínima hasta verde: solo presión 160/100, sin otros factores → ningún factor `high`; medicamento con `cognitive_flag` → factor `medication_review` · Tests: T-HU021-04…05
- [ ] **TK-HU021-04** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `results.factors.*`
- [ ] **TK-HU021-05** · Interfaz `components/results/FactorsPanel.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU021-06** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU021-07** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; marcar la spec como **Implementada** · Tests: T-HU021-01…05

### HU020 · Hallazgos · P0

Spec: [HU020-spec.md](HU020-spec.md) · Requiere: HU022, HU036 · Lógica en: `shared/utils/findings.ts`

- [ ] **TK-HU020-01** · Migración: `<ts>_create_assessment_results.sql`: tabla `assessment_results` (§7.3), solo `service_role` escribe. Regenerar `database.types.ts`
- [ ] **TK-HU020-02** · Escribir la prueba unit en `test/unit/results/buildFindings.test.ts` y la lógica mínima hasta verde: perfiles "sin señales" y "alerta" de HU038 → niveles esperados por dominio · Tests: T-HU020-01
- [ ] **TK-HU020-03** · Escribir la prueba Nuxt en `test/nuxt/components/ResultLevel.test.ts` y la lógica mínima hasta verde: nivel `orange` → renderiza ícono y texto · Tests: T-HU020-02
- [ ] **TK-HU020-04** · Escribir la prueba unit en `test/unit/results/buildFindings.test.ts` y la lógica mínima hasta verde: dominio memoria con MEM_001 y MEM_004 altos → `evidence` contiene ambos códigos · Tests: T-HU020-03
- [ ] **TK-HU020-05** · Escribir la prueba unit en `test/unit/results/potentialArea.test.ts` y la lógica mínima hasta verde: clasificación devuelta con texto de diagnóstico → se reemplaza por texto seguro · Tests: T-HU020-04
- [ ] **TK-HU020-06** · Escribir la prueba unit en `test/unit/results/sortFindings.test.ts` y la lógica mínima hasta verde: hallazgos y una alerta `orange` → la alerta queda primera · Tests: T-HU020-05
- [ ] **TK-HU020-07** · Escribir la prueba unit en `test/unit/results/findingText.test.ts` y la lógica mínima hasta verde: audiencia `patient` y `evaluator` → claves i18n distintas · Tests: T-HU020-06
- [ ] **TK-HU020-08** · Escribir la prueba Nuxt en `test/nuxt/pages/results.test.ts` y la lógica mínima hasta verde: montar la página de resultados → contiene `ResultsDisclaimer` · Tests: T-HU020-07
- [ ] **TK-HU020-09** · Endpoint `POST /api/assessments/:id/results`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU020-10** · Endpoint `GET /api/assessments/:id/results`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU020-11** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `results.findings.*`, `results.levels.*`
- [ ] **TK-HU020-12** · Interfaz `components/results/FindingsList.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU020-13** · Interfaz `components/results/ResultLevel.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU020-02
- [ ] **TK-HU020-14** · Interfaz `components/results/ResultsDisclaimer.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU020-15** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU020-16** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU020-01…07

### HU023 · Plan de recomendaciones · P0

Spec: [HU023-spec.md](HU023-spec.md) · Requiere: HU021 · Lógica en: `shared/utils/plan.ts`

- [ ] **TK-HU023-01** · Migración: `<ts>_create_reminders.sql`: tabla `reminders` con RLS del paciente. Regenerar `database.types.ts`
- [ ] **TK-HU023-02** · Escribir la prueba unit en `test/unit/plan/buildPlan.test.ts` y la lógica mínima hasta verde: 2 factores modificables → metas en los 3 horizontes para ambos · Tests: T-HU023-01
- [ ] **TK-HU023-03** · Escribir la prueba unit en `test/unit/plan/selectTemplates.test.ts` y la lógica mínima hasta verde: plantillas `draft` y `approved` del mismo factor → solo la `approved` · Tests: T-HU023-02
- [ ] **TK-HU023-04** · Escribir la prueba unit en `test/unit/plan/buildPlan.test.ts` y la lógica mínima hasta verde: reescritura del LLM sin la meta → se usa la plantilla original · Tests: T-HU023-03
- [ ] **TK-HU023-05** · Escribir la prueba unit en `test/unit/plan/referralFor.test.ts` y la lógica mínima hasta verde: los 4 niveles → los 4 valores · Tests: T-HU023-04
- [ ] **TK-HU023-06** · Escribir la prueba unit en `test/unit/plan/reminderDates.test.ts` y la lógica mínima hasta verde: desde 2026-01-01 → 4 fechas: +30, +60, +90, +180 días · Tests: T-HU023-05
- [ ] **TK-HU023-07** · Escribir la prueba unit en `test/unit/plan/editPlan.test.ts` y la lógica mínima hasta verde: editar el plan → versión anterior conservada · Tests: T-HU023-06
- [ ] **TK-HU023-08** · Escribir la prueba unit en `test/unit/plan/planPdf.test.ts` y la lógica mínima hasta verde: generar PDF de un plan → buffer que empieza por `%PDF` · Tests: T-HU023-07
- [ ] **TK-HU023-09** · Endpoint `GET /api/assessments/:id/plan`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU023-10** · Endpoint `PATCH /api/assessments/:id/plan`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU023-11** · Endpoint `PATCH /api/reminders/:id`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU023-12** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `results.plan.*`
- [ ] **TK-HU023-13** · Interfaz `components/results/PlanTimeline.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU023-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU023-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU023-01…07

### HU010 · Configurar reglas de puntaje, alertas y plantillas de recomendación · P1

Spec: [HU010-spec.md](HU010-spec.md) · Requiere: HU005, HU022, HU023, HU036 · Lógica en: `shared/utils/scoringConfig.ts`

- [ ] **TK-HU010-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/assessment_results.test.sql`: `superuser` actualiza `model_version` de un resultado → rechazado · Tests: T-HU010-04
- [ ] **TK-HU010-02** · Migración: `<ts>_create_scoring.sql`: tablas `scoring_models` y `recommendation_templates` con RLS de estructura. Regenerar `database.types.ts`
- [ ] **TK-HU010-03** · Escribir la prueba unit en `test/unit/scoring/scoringConfig.test.ts` y la lógica mínima hasta verde: validateWeight(-1), (null), (2.5) → inválido, válido, válido; regla `>= 3` sobre una `true_false` → `incompatible_operator` · Tests: T-HU010-01…02
- [ ] **TK-HU010-04** · Escribir la prueba unit en `test/unit/scoring/scoringConfig.test.ts` y la lógica mínima hasta verde: bumpVersion('1.2.0', 'minor') → '1.3.0' · Tests: T-HU010-03
- [ ] **TK-HU010-05** · Escribir la prueba unit en `test/unit/results/recalculate.test.ts` y la lógica mínima hasta verde: recalcular con versión nueva → devuelve un resultado nuevo; el anterior no cambia · Tests: T-HU010-05
- [ ] **TK-HU010-06** · Escribir la prueba unit en `test/unit/scoring/scoringConfig.test.ts` y la lógica mínima hasta verde: validateTemplate con `horizon_days` 45 y sin `body.en` → 2 errores · Tests: T-HU010-06
- [ ] **TK-HU010-07** · Endpoint `PATCH /api/admin/questions/:id/scoring`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU010-08** · Endpoint `POST /api/admin/scoring-models/publish`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU010-09** · Endpoint `CRUD /api/admin/recommendation-templates`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU010-10** · Endpoint `POST /api/admin/results/:assessmentId/recalculate`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU010-05
- [ ] **TK-HU010-11** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `scoring.*`, `templates.*`
- [ ] **TK-HU010-12** · Interfaz `pages/dashboard/tests/[id]/puntaje.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU010-13** · Interfaz `pages/dashboard/plantillas.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU010-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU010-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU010-01…06

### HU025 · Privacidad y derechos del titular · P0

Spec: [HU025-spec.md](HU025-spec.md) · Requiere: HU014 · Lógica en: `shared/utils/privacy.ts`, `server/utils/privacy.ts`

- [ ] **TK-HU025-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/answers.test.sql`: evaluador no asignado lee respuestas SUB → 0 filas · Tests: T-HU025-03
- [ ] **TK-HU025-02** · Migración: `<ts>_create_data_requests.sql`: tabla `data_requests` con RLS del paciente. Regenerar `database.types.ts`
- [ ] **TK-HU025-03** · Escribir la prueba unit en `test/unit/privacy/buildExport.test.ts` y la lógica mínima hasta verde: fuente con datos de 2 pacientes → solo los del solicitante · Tests: T-HU025-01
- [ ] **TK-HU025-04** · Escribir la prueba unit en `test/unit/privacy/anonymize.test.ts` y la lógica mínima hasta verde: procesar solicitud de eliminación → llama a anonimizar y a borrar la cuenta · Tests: T-HU025-02
- [ ] **TK-HU025-05** · Escribir la prueba unit en `test/unit/privacy/redactForLLM.test.ts` y la lógica mínima hasta verde: 'Soy Ana Pérez, ana@x.com, 3001234567, CC 1020304050' → sin nombre, correo, teléfono ni documento · Tests: T-HU025-04
- [ ] **TK-HU025-06** · Escribir la prueba unit en `test/unit/i18n/keysParity.test.ts` y la lógica mínima hasta verde: claves `privacy.aiProvider.*` → existen en `es` y `en` · Tests: T-HU025-05
- [ ] **TK-HU025-07** · Endpoint `GET /api/me/export`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU025-01
- [ ] **TK-HU025-08** · Endpoint `POST /api/me/delete-request`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU025-02
- [ ] **TK-HU025-09** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `privacy.*`
- [ ] **TK-HU025-10** · Interfaz: Sección "Mis datos" en el perfil del paciente
- [ ] **TK-HU025-11** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU025-12** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU025-01…05

### Bloque previo · Cliente de IA

*Antes de HU016: el motor conversacional no se acopla a un proveedor (D-6).*

- [ ] **TK-S3-01** · Definir la interfaz `LlmClient` y sus tipos (mensaje, llamada de herramienta, respuesta en flujo) en `server/utils/llm/`; sin proveedor concreto
- [ ] **TK-S3-02** · Doble de pruebas `createMockLlm(script)` que devuelve llamadas de herramienta predefinidas, con una prueba que lo demuestra

### HU016 · Slot-filling con function calling y salidas estructuradas · P0

Spec: [HU016-spec.md](HU016-spec.md) · Requiere: HU013, HU014 · Lógica en: `server/utils/llm/tools/index.ts`, `server/utils/llm/tools/saveAnswer.ts`

- [ ] **TK-HU016-01** · Migración: `<ts>_create_extraction_events.sql` con RLS (solo `service_role` escribe). Regenerar `database.types.ts`
- [ ] **TK-HU016-02** · Escribir la prueba unit en `test/unit/llm/tools.test.ts` y la lógica mínima hasta verde: nombres de `TOOLS` y llamada a `delete_answer` → los 6 nombres; `unknown_tool` · Tests: T-HU016-01
- [ ] **TK-HU016-03** · Escribir la prueba unit en `test/unit/llm/decideSave.test.ts` y la lógica mínima hasta verde: confianza 0,9 con valor válido → 'save'; confianza 0,6 → 'confirm' · Tests: T-HU016-02…03
- [ ] **TK-HU016-04** · Escribir la prueba unit en `test/unit/llm/decideSave.test.ts` y la lógica mínima hasta verde: valor 7 en una F5 → `{ reject: 'unknown_option' }` · Tests: T-HU016-04
- [ ] **TK-HU016-05** · Escribir la prueba unit en `test/unit/llm/runTool.test.ts` y la lógica mínima hasta verde: tercer argumento inválido en el mismo turno → deja de reintentar y responde al paciente · Tests: T-HU016-05
- [ ] **TK-HU016-06** · Escribir la prueba unit en `test/unit/repo/serviceRoleBoundary.test.ts` y la lógica mínima hasta verde: imports de `server/utils/llm` → no expone el cliente fuera de `tools/` · Tests: T-HU016-06
- [ ] **TK-HU016-07** · Escribir la prueba unit en `test/unit/llm/runTool.test.ts` y la lógica mínima hasta verde: save_answer exitoso → crea `extraction_events` con `action: saved`; corrección de SLP_001 de 5 a 6 → upsert con 6 y evento `updated` · Tests: T-HU016-07…08
- [ ] **TK-HU016-08** · Escribir la prueba unit en `test/unit/llm/runTool.test.ts` y la lógica mínima hasta verde: finish_assessment con 2 pendientes → `pending_required` · Tests: T-HU016-09
- [ ] **TK-HU016-09** · Escribir la prueba unit en `test/unit/llm/conversationState.test.ts` y la lógica mínima hasta verde: serializar y restaurar el estado → objeto idéntico · Tests: T-HU016-10
- [ ] **TK-HU016-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU016-01…10

### HU019 · Seguridad y límites clínicos del asistente · P0

Spec: [HU019-spec.md](HU019-spec.md) · Requiere: HU016 · Lógica en: `shared/utils/safety.ts`, `server/utils/llm/tools/index.ts`

- [ ] **TK-HU019-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/messages.test.sql`: `superuser` lee mensajes de cualquier evaluación → filas visibles · Tests: T-HU019-06
- [ ] **TK-HU019-02** · Migración: `<ts>_create_safety_events.sql` con RLS (evaluador asignado y `superuser` leen). Regenerar `database.types.ts`
- [ ] **TK-HU019-03** · Escribir la prueba unit en `test/unit/safety/detectCrisis.test.ts` y la lógica mínima hasta verde: 'no quiero seguir viviendo', 'se me durmió la cara de repente', 'hoy dormí mal' → `self_harm`, `acute_neuro`, null · Tests: T-HU019-01
- [ ] **TK-HU019-04** · Escribir la prueba unit en `test/unit/llm/processTurn.test.ts` y la lógica mínima hasta verde: mensaje con crisis y datos de sueño → no guarda respuestas, crea `safety_events` y devuelve recursos · Tests: T-HU019-02
- [ ] **TK-HU019-05** · Escribir la prueba unit en `test/unit/safety/crisisResources.test.ts` y la lógica mínima hasta verde: crisisResources('CO','es') → incluye la línea nacional de Colombia · Tests: T-HU019-03
- [ ] **TK-HU019-06** · Escribir la prueba unit en `test/unit/llm/processTurn.test.ts` y la lógica mínima hasta verde: respuesta del modelo con diagnóstico → se envía la respuesta segura · Tests: T-HU019-04
- [ ] **TK-HU019-07** · Escribir la prueba unit en `test/unit/llm/bindContext.test.ts` y la lógica mínima hasta verde: `save_answer` con otro `assessment_id` → se reemplaza por el de la sesión · Tests: T-HU019-05
- [ ] **TK-HU019-08** · Endpoint `GET /api/admin/safety-events`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU019-09** · Endpoint `PATCH /api/admin/safety-events/:id`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU019-10** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `safety.*`
- [ ] **TK-HU019-11** · Interfaz `components/assessment/CrisisCard.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU019-12** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU019-13** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU019-01…06

### HU017 · Mapeo de lenguaje natural a escalas · P0

Spec: [HU017-spec.md](HU017-spec.md) · Requiere: HU016, HU033 · Lógica en: `shared/utils/nlMapping.ts`

- [ ] **TK-HU017-01** · Migración: Ejemplos por pregunta en `questions.conversational_hint.examples` (HU033). Regenerar `database.types.ts`
- [ ] **TK-HU017-02** · Escribir la prueba unit en `test/unit/nl/mapFrequency.test.ts` y la lógica mínima hasta verde: 'casi siempre', 'a veces me pasa', 'never' → Siempre/A menudo, A veces, Nunca · Tests: T-HU017-01
- [ ] **TK-HU017-03** · Escribir la prueba unit en `test/unit/nl/extractNumber.test.ts` y la lógica mínima hasta verde: 'bastante' → null · Tests: T-HU017-02
- [ ] **TK-HU017-04** · Escribir la prueba unit en `test/unit/nl/mapYesNo.test.ts` y la lógica mínima hasta verde: 'sí, claro', 'no', 'depende' → true, false, null · Tests: T-HU017-03
- [ ] **TK-HU017-05** · Escribir la prueba unit en `test/unit/nl/mapOptions.test.ts` y la lógica mínima hasta verde: 'camino y nado, y hago tai chi' → values ['walk','swim'], other 'tai chi' · Tests: T-HU017-04
- [ ] **TK-HU017-06** · Escribir la prueba unit en `test/unit/nl/extractNumber.test.ts` y la lógica mínima hasta verde: 'unas 5 horas y media', 'entre 5 y 6' → 5,5; 5,5 con confianza reducida · Tests: T-HU017-05
- [ ] **TK-HU017-07** · Escribir la prueba unit en `test/unit/nl/regressionSuite.test.ts` y la lógica mínima hasta verde: suite completa es y en → aciertos ≥ 90 % · Tests: T-HU017-06
- [ ] **TK-HU017-08** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `shared/utils/nlMapping/{es,en}.ts`
- [ ] **TK-HU017-09** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU017-01…06

### HU018 · Control de cobertura y cierre de la conversación · P0

Spec: [HU018-spec.md](HU018-spec.md) · Requiere: HU016, HU032 · Lógica en: `shared/utils/coverage.ts`

- [ ] **TK-HU018-01** · Migración: Tarea programada (`pg_cron`) que marca `abandoned` diariamente. Regenerar `database.types.ts`
- [ ] **TK-HU018-02** · Escribir la prueba unit en `test/unit/coverage/coverage.test.ts` y la lógica mínima hasta verde: sección con 1 respondida, 1 declinada y 1 oculta de 3 → 3/3 resueltas · Tests: T-HU018-01
- [ ] **TK-HU018-03** · Escribir la prueba unit en `test/unit/llm/prompt.test.ts` y la lógica mínima hasta verde: pendientes con una `needs_confirmation` ya respondida → solo esa respondida aparece · Tests: T-HU018-02
- [ ] **TK-HU018-04** · Escribir la prueba unit en `test/unit/llm/processTurn.test.ts` y la lógica mínima hasta verde: cobertura completa sin confirmación del paciente → no se llama `finish_assessment` · Tests: T-HU018-03
- [ ] **TK-HU018-05** · Escribir la prueba unit en `test/unit/coverage/shouldAbandon.test.ts` y la lógica mínima hasta verde: 31 y 29 días sin actividad → true, false · Tests: T-HU018-04
- [ ] **TK-HU018-06** · Escribir la prueba Nuxt en `test/nuxt/composables/useAssessment.test.ts` y la lógica mínima hasta verde: switchToForm() con 5 respuestas de conversación → `mode: mixed` y 5 respuestas precargadas · Tests: T-HU018-05
- [ ] **TK-HU018-07** · Endpoint `POST /api/assessments/:id/mode`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU018-08** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `assessment.chat.summary.*`
- [ ] **TK-HU018-09** · Interfaz `ChatPanel.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU018-10** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU018-11** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU018-01…05

### HU015 · Conversación natural que captura respuestas sin parecer un formulario · P0

Spec: [HU015-spec.md](HU015-spec.md) · Requiere: HU016, HU017, HU018, HU019, HU033 · Lógica en: `server/utils/llm/prompt.ts`, `shared/utils/safety.ts`

- [ ] **TK-HU015-01** · Migración: `<ts>_create_conversations.sql`: tablas `conversations` y `messages` con RLS por evaluación. Regenerar `database.types.ts`
- [ ] **TK-HU015-02** · Escribir la prueba unit en `test/unit/llm/prompt.test.ts` y la lógica mínima hasta verde: 3 preguntas pendientes en `en` → el prompt contiene sus 3 pistas, ninguna otra, y la instrucción de idioma; pendientes de SLP y MEM tras hablar de sueño → primero los SLP · Tests: T-HU015-01…02
- [ ] **TK-HU015-03** · Escribir la prueba unit en `test/unit/llm/processTurn.test.ts` y la lógica mínima hasta verde: turno con 2 llamadas `save_answer` (SLP_001, SLP_003) → 2 respuestas guardadas en orden · Tests: T-HU015-03
- [ ] **TK-HU015-04** · Escribir la prueba unit en `test/unit/safety/assertNoDiagnosis.test.ts` y la lógica mínima hasta verde: 'Tienes Alzheimer' y 'Sueles dormir 6 horas' → no seguro, seguro · Tests: T-HU015-04
- [ ] **TK-HU015-05** · Escribir la prueba Nuxt en `test/nuxt/components/ChatActions.test.ts` y la lógica mínima hasta verde: pulsar "pasar al formulario" → emite `switch-to-form` · Tests: T-HU015-05
- [ ] **TK-HU015-06** · Escribir la prueba Nuxt en `test/nuxt/components/ChatPanel.test.ts` y la lógica mínima hasta verde: montar con 2 mensajes → renderiza sin errores y con roles `log`/`status` accesibles · Tests: T-HU015-06
- [ ] **TK-HU015-07** · Endpoint `POST /api/assessments/:id/conversation/messages`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU015-08** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `assessment.chat.*`
- [ ] **TK-HU015-09** · Interfaz `components/assessment/ChatPanel.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU015-06
- [ ] **TK-HU015-10** · Interfaz `ChatMessage.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU015-11** · Interfaz `ChatActions.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU015-05
- [ ] **TK-HU015-12** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU015-13** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU015-01…06

### HU037 · Recorrido completo de prueba (end-to-end) · P0

Spec: [HU037-spec.md](HU037-spec.md) · Requiere: HU011, HU020, HU021, HU022, HU023, HU034, HU038, HU015, HU016, HU017, HU018, HU019, HU025 · Lógica en: `server/utils/llm/mock.ts`

- [ ] **TK-HU037-01** · Migración: Base local de Supabase con migraciones y seed de HU030 y HU038. Regenerar `database.types.ts`
- [ ] **TK-HU037-02** · Escribir la prueba e2e en `test/e2e/test1-form.test.ts` y la lógica mínima hasta verde: perfil "sin señales", "seguimiento" y "alerta" → resultado igual al esperado · Tests: T-HU037-01
- [ ] **TK-HU037-03** · Escribir la prueba e2e en `test/e2e/test1-chat.test.ts` y la lógica mínima hasta verde: guion de conversación del perfil "seguimiento" → mismos slots y `completed` · Tests: T-HU037-02
- [ ] **TK-HU037-04** · Escribir la prueba e2e en `test/e2e/test1-access.test.ts` y la lógica mínima hasta verde: paciente B y evaluador no autorizados → 403 en ambos · Tests: T-HU037-03
- [ ] **TK-HU037-05** · Escribir la prueba e2e en `test/e2e/test1-form.test.ts` y la lógica mínima hasta verde: matriz idioma × tema a 320 px → sin errores ni desbordes horizontales · Tests: T-HU037-04
- [ ] **TK-HU037-06** · Escribir la prueba unit en `test/unit/repo/ciWorkflow.test.ts` y la lógica mínima hasta verde: archivo de CI → contiene los pasos `pnpm test` y e2e antes de desplegar · Tests: T-HU037-05
- [ ] **TK-HU037-07** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU037-01…05

### Verificación de salida del Sprint 3

Se marca cuando todas las tareas anteriores del sprint están hechas y los siguientes puntos se comprueban a mano:

- [ ] **TK-S3-X1** · Los tres perfiles de ejemplo producen los resultados esperados
- [ ] **TK-S3-X2** · El paciente exporta y elimina sus datos
- [ ] **TK-S3-X3** · El recorrido por conversación llena los mismos slots que el formulario
- [ ] **TK-S3-X4** · El caso de crisis detiene la captura y muestra recursos
- [ ] **TK-S3-X5** · La suite e2e pasa en CI. **Cierra el MVP**
- [ ] **TK-S3-X6** · `pnpm test`, `pnpm lint`, `pnpm typecheck` y `supabase test db` pasan; el sprint anterior sigue en verde

---

## Sprint 4 · Profesionales y evolución

*Rol profesional con pacientes asignados y revisión del plan; medicamentos, vista previa, seguimiento, informante, pruebas digitales y analítica.*  
Etapas del plan original: Fase 5 + Fase 6.

### Bloqueos externos del Sprint 4 (no son tareas de código)

- [ ] Psicología confirma la correspondencia factor → profesión y si el plan se muestra solo tras la revisión — *Bloquea HU044*
- [ ] Asesor legal valida la cláusula de compartir resultados con profesionales y se publica la nueva versión del consentimiento — *Bloquea HU043*
- [ ] Instrumento validado para el Módulo 9 elegido y licenciado — *Bloquea HU035*
- [ ] Fuente y licencia de la base farmacológica; instrumentos de las pruebas digitales; preguntas del cuestionario del informante — *Bloquean HU039, HU028 y HU027*

### Bloque previo · Rutas protegidas para el rol nuevo

*Antes de HU040: evita que el rol quede fuera de las rutas existentes.*

- [ ] **TK-S4-01** · Ampliar `AREAS` de `app/middleware/roles.global.ts` con las rutas `dashboard-profesional*` para `professional` · Tests: T-HU040-03
- [ ] **TK-S4-02** · Añadir `professional` al selector de rol de `dashboard/usuarios/nuevo.vue` y de la edición de usuarios

### HU040 · Asignar el rol de profesional · P1

Spec: [HU040-spec.md](HU040-spec.md) · Requiere: HU001, HU024 · Lógica en: `shared/utils/roles.ts`, `app/types/user.ts`, `shared/utils/auth.ts`

- [ ] **TK-HU040-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/roles.test.sql`: valores del enum `user_role` → incluye `professional` · Tests: T-HU040-01
- [ ] **TK-HU040-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/profiles.test.sql`: un `professional` actualiza su propio `role` → error de privilegios; un `professional` consulta `profiles` → solo su fila · Tests: T-HU040-07…08
- [ ] **TK-HU040-03** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: cambiar el rol de un usuario → fila con rol anterior y nuevo · Tests: T-HU040-10
- [ ] **TK-HU040-04** · Migración `<ts>_add_professional_role.sql` según §4 Datos de la spec; hacer pasar las pruebas pgTAP del grupo anterior
- [ ] **TK-HU040-05** · Migración `<ts>_audit_profile_roles.sql` según §4 Datos de la spec; hacer pasar las pruebas pgTAP del grupo anterior
- [ ] **TK-HU040-06** · Escribir la prueba unit en `test/unit/roles/roles.test.ts` y la lógica mínima hasta verde: mapas de roles y assertRole → cada rol tiene inicio, color e icono; `professional` válido, `admin` inválido · Tests: T-HU040-02
- [ ] **TK-HU040-07** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: canAccessArea y buildDashboardMenu con `professional` → solo su área; menú sin gestión · Tests: T-HU040-03
- [ ] **TK-HU040-08** · Escribir la prueba unit en `test/unit/roles/planRoleChange.test.ts` y la lógica mínima hasta verde: evaluator con 3 pacientes pasa a professional → `needsConfirm: true`, `removed: 3`; user pasa a professional → `needsConfirm: false` · Tests: T-HU040-04…05
- [ ] **TK-HU040-09** · Escribir la prueba unit en `test/unit/roles/adminUsersHandler.test.ts` y la lógica mínima hasta verde: crear usuario con rol `professional` como `superuser` y como `evaluator` → creado; 403 · Tests: T-HU040-06
- [ ] **TK-HU040-10** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: checkRoleAccess con profesional inactivo → 403 · Tests: T-HU040-09
- [ ] **TK-HU040-11** · Escribir la prueba unit en `test/unit/i18n/keysParity.test.ts` y la lógica mínima hasta verde: claves `roles.professional.*` → existen en `es` y `en` · Tests: T-HU040-11
- [ ] **TK-HU040-12** · Endpoint `POST /api/admin/users`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU040-04…06
- [ ] **TK-HU040-13** · Endpoint `PATCH /api/admin/users/:id`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU040-04…06
- [ ] **TK-HU040-14** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `roles.professional.*`, `dashboard.professional.*`
- [ ] **TK-HU040-15** · Interfaz `dashboard/usuarios/nuevo.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU040-16** · Interfaz `dashboard/profesional/index.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU040-17** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU040-18** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU040-01…11

### HU041 · Elegir la profesión al primer ingreso · P1

Spec: [HU041-spec.md](HU041-spec.md) · Requiere: HU040 · Lógica en: `shared/utils/professional.ts`, `shared/utils/auth.ts`, `app/composables/useProfessional.ts`

- [ ] **TK-HU041-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/professional_profiles.test.sql`: enum `profession` y tabla `professional_profiles` → existen con los tres valores y una fila por profesional; profesional A lee y modifica la fila de B; un `user` lee la tabla → rechazado; 0 filas; insertar fila para un `user`; cambiar el rol de un profesional → rechazado; la fila desaparece · Tests: T-HU041-01, T-HU041-08…09
- [ ] **TK-HU041-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: cambiar la profesión → fila en `audit_log` con valor anterior y nuevo · Tests: T-HU041-10
- [ ] **TK-HU041-03** · Migración: `<ts>_create_professional_profiles.sql`: enum `profession`, tabla `professional_profiles`, triggers de rol y de auditoría, RLS. Regenerar `database.types.ts`
- [ ] **TK-HU041-04** · Escribir la prueba unit en `test/unit/professional/professional.test.ts` y la lógica mínima hasta verde: needsProfession para profesional con y sin fila, y para un `user` → true, false, false · Tests: T-HU041-02
- [ ] **TK-HU041-05** · Escribir la prueba unit en `test/unit/auth/auth.test.ts` y la lógica mínima hasta verde: resolvePostLoginRoute de profesional sin profesión → `/dashboard/profesional/profesion` · Tests: T-HU041-03
- [ ] **TK-HU041-06** · Escribir la prueba unit en `test/unit/professional/professional.test.ts` y la lógica mínima hasta verde: validateProfession('psychologist'), ('doctor'), (null) → ok, `invalid_profession`, `invalid_profession` · Tests: T-HU041-04
- [ ] **TK-HU041-07** · Escribir la prueba Nuxt en `test/nuxt/composables/useProfessional.test.ts` y la lógica mínima hasta verde: select('nutritionist') → llama a `PUT /api/professional/profession` y actualiza el estado · Tests: T-HU041-05
- [ ] **TK-HU041-08** · Escribir la prueba unit en `test/unit/professional/professionHandler.test.ts` y la lógica mínima hasta verde: guardar profesión como `professional` y como `user` → guardado; 403; superuser corrige la profesión de otro profesional → guardado · Tests: T-HU041-06…07
- [ ] **TK-HU041-09** · Escribir la prueba unit en `test/unit/professional/professional.test.ts` y la lógica mínima hasta verde: filterUsersByProfession con 4 usuarios → solo los de esa profesión · Tests: T-HU041-11
- [ ] **TK-HU041-10** · Escribir la prueba unit en `test/unit/i18n/keysParity.test.ts` y la lógica mínima hasta verde: claves `professions.*` → existen en `es` y `en` · Tests: T-HU041-12
- [ ] **TK-HU041-11** · Endpoint `PUT /api/professional/profession`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU041-05…06
- [ ] **TK-HU041-12** · Endpoint `PATCH /api/admin/users/:id/profession`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU041-07
- [ ] **TK-HU041-13** · Endpoint `GET /api/professional/me`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU041-14** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `professions.*`, `dashboard.professional.profession.*`
- [ ] **TK-HU041-15** · Interfaz `pages/dashboard/profesional/profesion.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU041-16** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU041-17** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU041-01…12

### HU042 · Asignar pacientes a un profesional · P1

Spec: [HU042-spec.md](HU042-spec.md) · Requiere: HU040, HU041 · Lógica en: `shared/utils/professional.ts`

- [ ] **TK-HU042-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/professional_patients.test.sql`: clave primaria compuesta y claves foráneas → duplicado y perfil inexistente rechazados; profesional A consulta asignaciones; paciente consulta las suyas → solo las propias; `evaluator` y `professional` insertan una asignación → rechazado por RLS · Tests: T-HU042-04…06
- [ ] **TK-HU042-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/professional_patients.test.sql`: is_professional_of con profesional desactivado y con rol cambiado → false en ambos · Tests: T-HU042-08
- [ ] **TK-HU042-03** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: asignar y retirar → dos filas en `audit_log` · Tests: T-HU042-09
- [ ] **TK-HU042-04** · Migración: `<ts>_create_professional_patients.sql`: tabla, trigger de validación de roles, trigger de auditoría, RLS y `private.is_professional_of`. Regenerar `database.types.ts`
- [ ] **TK-HU042-05** · Escribir la prueba unit en `test/unit/professional/assignment.test.ts` y la lógica mínima hasta verde: profesional activo con paciente `user` → `ok: true`; evaluador como profesional; profesional inactivo; paciente con rol `evaluator` → `invalid_professional`, `invalid_professional`, `invalid_patient` · Tests: T-HU042-01…02
- [ ] **TK-HU042-06** · Escribir la prueba unit en `test/unit/professional/assignmentHandler.test.ts` y la lógica mínima hasta verde: asignar dos veces la misma pareja → una sola fila, sin error · Tests: T-HU042-03
- [ ] **TK-HU042-07** · Escribir la prueba unit en `test/unit/professional/assignment.test.ts` y la lógica mínima hasta verde: listAccessGrants con 2 filas → nombre y profesión de cada profesional · Tests: T-HU042-07
- [ ] **TK-HU042-08** · Endpoint `POST /api/admin/professional-patients`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU042-03
- [ ] **TK-HU042-09** · Endpoint `DELETE /api/admin/professional-patients`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU042-03
- [ ] **TK-HU042-10** · Endpoint `GET /api/professional/patients`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU042-05
- [ ] **TK-HU042-11** · Endpoint `GET /api/me/professionals`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU042-05, T-HU042-07
- [ ] **TK-HU042-12** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `professional.patients.*`, `privacy.access.*`
- [ ] **TK-HU042-13** · Interfaz `dashboard/profesional/pacientes.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU042-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU042-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU042-01…09

### HU043 · Panel del profesional y lectura de resultados · P1

Spec: [HU043-spec.md](HU043-spec.md) · Requiere: HU042, HU020, HU021, HU022, HU023, HU025, HU002 · Lógica en: `shared/utils/professionalView.ts`, `shared/utils/consent.ts`, `server/utils/audit.ts`

- [ ] **TK-HU043-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/professional_patients.test.sql`: profesional asignado lee `assessment_results`; no asignado; lee `answers` → filas visibles; 0 filas; 0 filas · Tests: T-HU043-06
- [ ] **TK-HU043-02** · Migración `<ts>_professional_read_policies.sql` según §4 Datos de la spec; hacer pasar las pruebas pgTAP del grupo anterior
- [ ] **TK-HU043-03** · Migración `<ts>_consent_sharing.sql` según §4 Datos de la spec; hacer pasar las pruebas pgTAP del grupo anterior
- [ ] **TK-HU043-04** · Escribir la prueba unit en `test/unit/professional/summarizePatient.test.ts` y la lógica mínima hasta verde: tres evaluaciones, la última completada con alerta `orange` → estado `completed`, alerta `orange`, fecha de la última; paciente sin evaluaciones → estado `none` · Tests: T-HU043-01…02
- [ ] **TK-HU043-05** · Escribir la prueba unit en `test/unit/professional/professionalHandlers.test.ts` y la lógica mínima hasta verde: listar pacientes de un profesional con 2 asignados → dos resúmenes; resultados de un paciente no asignado → 403 · Tests: T-HU043-03…04
- [ ] **TK-HU043-06** · Escribir la prueba unit en `test/unit/professional/toProfessionalView.test.ts` y la lógica mínima hasta verde: resultado con evidencia y respuestas → la vista no contiene `evidence` ni respuestas · Tests: T-HU043-05
- [ ] **TK-HU043-07** · Escribir la prueba unit en `test/unit/professional/professionalHandlers.test.ts` y la lógica mínima hasta verde: crear o editar una respuesta como `professional` → 403 · Tests: T-HU043-07
- [ ] **TK-HU043-08** · Escribir la prueba unit en `test/unit/consent/consent.test.ts` y la lógica mínima hasta verde: hasSharingConsent con versión sin y con `shareWithProfessionals` → false, true · Tests: T-HU043-08
- [ ] **TK-HU043-09** · Escribir la prueba unit en `test/unit/professional/professionalHandlers.test.ts` y la lógica mínima hasta verde: ficha de paciente sin consentimiento de compartir → `consent_missing_sharing` y cuerpo vacío · Tests: T-HU043-09
- [ ] **TK-HU043-10** · Escribir la prueba unit en `test/unit/professional/recordAccess.test.ts` y la lógica mínima hasta verde: abrir una ficha → una fila de acceso con profesional, paciente y recurso · Tests: T-HU043-10
- [ ] **TK-HU043-11** · Escribir la prueba Nuxt en `test/nuxt/pages/professionalPatient.test.ts` y la lógica mínima hasta verde: montar la ficha en carga, vacío y error → muestra el estado correcto en cada caso · Tests: T-HU043-11
- [ ] **TK-HU043-12** · Endpoint `GET /api/professional/patients`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU043-03…04
- [ ] **TK-HU043-13** · Endpoint `GET /api/professional/patients/:patientId/results`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU043-03…04
- [ ] **TK-HU043-14** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `professional.panel.*`, `professional.patient.*`
- [ ] **TK-HU043-15** · Interfaz `dashboard/profesional/index.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU043-16** · Interfaz `dashboard/profesional/pacientes/[patientId].vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU043-17** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU043-18** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU043-01…11

### HU044 · Revisión del plan por profesión · P1

Spec: [HU044-spec.md](HU044-spec.md) · Requiere: HU043, HU023 · Lógica en: `shared/utils/plan.ts`, `shared/utils/planReview.ts`

- [ ] **TK-HU044-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/recommendation_templates.test.sql`: plantillas sembradas → cada factor con su profesión; tabaco/alcohol y derivación sin profesión · Tests: T-HU044-02
- [ ] **TK-HU044-02** · Escribir en rojo las pruebas pgTAP de `supabase/tests/plan_goal_revisions.test.sql`: profesional no asignado lee y escribe; paciente ajeno lee → 0 filas y rechazo · Tests: T-HU044-08
- [ ] **TK-HU044-03** · Escribir en rojo las pruebas pgTAP de `supabase/tests/audit_log.test.sql`: insertar una revisión → fila en `audit_log` · Tests: T-HU044-09
- [ ] **TK-HU044-04** · Migración: `<ts>_create_plan_goal_revisions.sql`: tabla `plan_goal_revisions`, columna `recommendation_templates.profession`, seed de `FACTOR_PROFESSION` en las plantillas, RLS y…. Regenerar `database.types.ts`
- [ ] **TK-HU044-05** · Escribir la prueba unit en `test/unit/plan/buildPlan.test.ts` y la lógica mínima hasta verde: plan con factores de actividad física, nutrición y sueño → metas con profesión fisioterapia, nutrición y psicología · Tests: T-HU044-01
- [ ] **TK-HU044-06** · Escribir la prueba unit en `test/unit/plan/canEditGoal.test.ts` y la lógica mínima hasta verde: fisioterapeuta asignado sobre meta de actividad física y sobre meta de nutrición → true, false; profesional no asignado; profesional inactivo → false, false · Tests: T-HU044-03…04
- [ ] **TK-HU044-07** · Escribir la prueba unit en `test/unit/plan/validateGoalEdit.test.ts` y la lógica mínima hasta verde: edición que cambia la derivación; edición con "tienes Alzheimer" → `immutable_field`; `diagnosis_not_allowed` · Tests: T-HU044-05
- [ ] **TK-HU044-08** · Escribir la prueba unit en `test/unit/plan/planReview.test.ts` y la lógica mínima hasta verde: segunda edición de la misma meta → versión 2 y la 1 conservada; marcar revisada la última versión → `reviewedBy` con profesión y fecha · Tests: T-HU044-06…07
- [ ] **TK-HU044-09** · Escribir la prueba Nuxt en `test/nuxt/components/PlanTimeline.test.ts` y la lógica mínima hasta verde: meta revisada y no revisada → insignia "Revisado por" o "Generado automáticamente" · Tests: T-HU044-10
- [ ] **TK-HU044-10** · Endpoint `PATCH /api/professional/patients/:patientId/plan/goals/:goalId`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU044-06
- [ ] **TK-HU044-11** · Endpoint `POST /api/professional/patients/:patientId/plan/goals/:goalId/review`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU044-06
- [ ] **TK-HU044-12** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `professional.plan.*`, `results.plan.reviewedBy`
- [ ] **TK-HU044-13** · Interfaz `PlanTimeline.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU044-10
- [ ] **TK-HU044-14** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU044-15** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU044-01…10

### HU039 · Catálogo de medicamentos para el cruce cognitivo · P1

Spec: [HU039-spec.md](HU039-spec.md) · Requiere: HU030 · Lógica en: `shared/utils/medications.ts`

- [ ] **TK-HU039-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/medications.test.sql`: insertar sin `source` → violación de `not null` · Tests: T-HU039-04
- [ ] **TK-HU039-02** · Migración: `<ts>_create_medications.sql`: tabla `medications` con `not null` en `source` y `catalog_version`. Regenerar `database.types.ts`
- [ ] **TK-HU039-03** · Escribir la prueba Nuxt en `test/nuxt/components/MedicationInput.test.ts` y la lógica mínima hasta verde: escribir 'lora' con catálogo de ejemplo → sugiere el medicamento y permite texto libre · Tests: T-HU039-01
- [ ] **TK-HU039-04** · Escribir la prueba unit en `test/unit/medications/matchMedications.test.ts` y la lógica mínima hasta verde: 'Clonazepám' contra catálogo con 'clonazepam' marcado → coincidencia con `cognitive_flag: true`; 'remedio casero' → `pending_review` · Tests: T-HU039-02…03
- [ ] **TK-HU039-05** · Endpoint `GET /api/medications?q=`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU039-06** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `medications.*`
- [ ] **TK-HU039-07** · Interfaz `components/assessment/MedicationInput.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n · Tests: T-HU039-01
- [ ] **TK-HU039-08** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU039-09** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU039-01…04

### HU009 · Vista previa del test · P1

Spec: [HU009-spec.md](HU009-spec.md) · Requiere: HU005, HU011 · Lógica en: `app/composables/useAssessmentPreview.ts`, `app/utils/memoryAnswerStore.ts`

- [ ] **TK-HU009-01** · Escribir la prueba Nuxt en `test/nuxt/composables/useAssessmentPreview.test.ts` y la lógica mínima hasta verde: responder 3 preguntas → `$fetch` nunca se llama con `/api/assessments` · Tests: T-HU009-01
- [ ] **TK-HU009-02** · Escribir la prueba Nuxt en `test/nuxt/components/PreviewToolbar.test.ts` y la lógica mínima hasta verde: cambiar idioma y tema → emite `update:locale` y `update:colorMode` · Tests: T-HU009-02
- [ ] **TK-HU009-03** · Escribir la prueba Nuxt en `test/nuxt/composables/useAssessmentPreview.test.ts` y la lógica mínima hasta verde: responder `DAT_009 = false` → `DAT_010` pasa a visible · Tests: T-HU009-03
- [ ] **TK-HU009-04** · Escribir la prueba Nuxt en `test/nuxt/components/PreviewChat.test.ts` y la lógica mínima hasta verde: mensaje con `filledCodes` → muestra las insignias de esos códigos · Tests: T-HU009-04
- [ ] **TK-HU009-05** · Escribir la prueba unit en `test/unit/assessment/memoryAnswerStore.test.ts` y la lógica mínima hasta verde: reset() tras guardar respuestas → store vacío · Tests: T-HU009-05
- [ ] **TK-HU009-06** · Endpoint `GET /api/admin/tests/:id/tree`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU009-07** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tests.preview.*`
- [ ] **TK-HU009-08** · Interfaz `pages/dashboard/tests/[id]/vista-previa.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU009-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU009-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde; marcar la spec como **Implementada** · Tests: T-HU009-01…05

### HU026 · Seguimiento longitudinal · P1

Spec: [HU026-spec.md](HU026-spec.md) · Requiere: HU022 · Lógica en: `shared/utils/longitudinal.ts`

- [ ] **TK-HU026-01** · Migración: `assessments.is_baseline`. Regenerar `database.types.ts`
- [ ] **TK-HU026-02** · Escribir la prueba unit en `test/unit/longitudinal/baseline.test.ts` y la lógica mínima hasta verde: primera y segunda evaluación → true, false · Tests: T-HU026-01
- [ ] **TK-HU026-03** · Escribir la prueba unit en `test/unit/longitudinal/nextAllowedDate.test.ts` y la lógica mínima hasta verde: última el 2026-01-31 → 2026-07-31 · Tests: T-HU026-02
- [ ] **TK-HU026-04** · Escribir la prueba unit en `test/unit/longitudinal/compareResults.test.ts` y la lógica mínima hasta verde: memoria 60 → 63 y 60 → 50 → `same`, `worse`; versiones con un código distinto → el código aparece en `excluded` · Tests: T-HU026-03…04
- [ ] **TK-HU026-05** · Escribir la prueba unit en `test/unit/longitudinal/compareResults.test.ts` y la lógica mínima hasta verde: caída de 15 puntos → alerta `orange` · Tests: T-HU026-05
- [ ] **TK-HU026-06** · Endpoint `GET /api/me/history`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU026-07** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `results.evolution.*`
- [ ] **TK-HU026-08** · Interfaz `components/results/EvolutionChart.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU026-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU026-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU026-01…05

### HU035 · Módulo Estado emocional con instrumento validado · P1

Spec: [HU035-spec.md](HU035-spec.md) · Requiere: HU007, HU034 · Lógica en: `shared/utils/instruments.ts`

- [ ] **TK-HU035-01** · Migración: `questions.crisis_item boolean`; tabla `instruments (code, name, version, license, scoring jsonb)`. Regenerar `database.types.ts`
- [ ] **TK-HU035-02** · Escribir la prueba unit en `test/unit/publish/cloneTestVersion.test.ts` y la lógica mínima hasta verde: nueva versión con ítems EMO sustituidos → v1 intacta, v2 con los ítems nuevos · Tests: T-HU035-01
- [ ] **TK-HU035-03** · Escribir la prueba unit en `test/unit/instruments/scoreInstrument.test.ts` y la lógica mínima hasta verde: instrumento de 9 ítems 0–3, todos en 2 → puntaje 18 y su categoría; ítem invertido → se invierte antes de sumar · Tests: T-HU035-02…03
- [ ] **TK-HU035-04** · Escribir la prueba unit en `test/unit/test1/test1Structure.test.ts` y la lógica mínima hasta verde: preguntas del instrumento → `source` con licencia y `allowsDecline: true` · Tests: T-HU035-04
- [ ] **TK-HU035-05** · Escribir la prueba unit en `test/unit/instruments/crisisTriggered.test.ts` y la lógica mínima hasta verde: ítem de crisis en 0 y en 1 → false, true · Tests: T-HU035-05
- [ ] **TK-HU035-06** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `instruments.*`
- [ ] **TK-HU035-07** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU035-01…05

### HU027 · Cuestionario del informante o familiar · P2

Spec: [HU027-spec.md](HU027-spec.md) · Requiere: HU011 · Lógica en: `server/utils/informant.ts`

- [ ] **TK-HU027-01** · Migración: `<ts>_create_informant.sql`: tabla `informant_invitations`; valor `informant` añadido a `answer_source`. Regenerar `database.types.ts`
- [ ] **TK-HU027-02** · Escribir la prueba Nuxt en `test/nuxt/components/FinishScreen.test.ts` y la lógica mínima hasta verde: pulsar "Ahora no" → no llama a la API · Tests: T-HU027-01
- [ ] **TK-HU027-03** · Escribir la prueba unit en `test/unit/informant/createInvitation.test.ts` y la lógica mínima hasta verde: crear invitación → token de 64 hex, hash distinto del token, vence en 7 días · Tests: T-HU027-02
- [ ] **TK-HU027-04** · Escribir la prueba unit en `test/unit/informant/checkInvitation.test.ts` y la lógica mínima hasta verde: vencida, usada, revocada y válida → `expired`, `used`, `revoked`, `ok` · Tests: T-HU027-03
- [ ] **TK-HU027-05** · Escribir la prueba unit en `test/unit/informant/informantPayload.test.ts` y la lógica mínima hasta verde: payload de la ruta pública → sin campos del paciente · Tests: T-HU027-04
- [ ] **TK-HU027-06** · Escribir la prueba unit en `test/unit/results/buildResult.test.ts` y la lógica mínima hasta verde: respuestas con `source: informant` → en el bloque `informant` · Tests: T-HU027-05
- [ ] **TK-HU027-07** · Endpoint `POST /api/assessments/:id/informant-invitations`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU027-08** · Endpoint `DELETE /api/informant-invitations/:id`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU027-03
- [ ] **TK-HU027-09** · Endpoint `GET /api/informant/:token`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU027-03
- [ ] **TK-HU027-10** · Endpoint `POST /api/informant/:token`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec · Tests: T-HU027-03
- [ ] **TK-HU027-11** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `informant.*`
- [ ] **TK-HU027-12** · Interfaz `pages/informante/[token].vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU027-13** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU027-14** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU027-01…05

### HU028 · Pruebas cognitivas digitales · P2

Spec: [HU028-spec.md](HU028-spec.md) · Requiere: HU005, HU007 · Lógica en: `shared/utils/tasks.ts`

- [ ] **TK-HU028-01** · Migración: Valor `task` en `question_type`; `test_sections.instrument_status`. Regenerar `database.types.ts`
- [ ] **TK-HU028-02** · Escribir la prueba unit en `test/unit/results/brainIndex.test.ts` y la lógica mínima hasta verde: sección `experimental` con resultados → no cambia el índice · Tests: T-HU028-01
- [ ] **TK-HU028-03** · Escribir la prueba unit en `test/unit/tasks/recordTrial.test.ts` y la lógica mínima hasta verde: 3 ensayos (2 correctos) → `correct: 2`, `errors: 1`, 3 tiempos · Tests: T-HU028-02
- [ ] **TK-HU028-04** · Escribir la prueba unit en `test/unit/tasks/interpretTask.test.ts` y la lógica mínima hasta verde: instrumento sin `cutoffs` → solo datos en bruto · Tests: T-HU028-03
- [ ] **TK-HU028-05** · Escribir la prueba unit en `test/unit/tasks/checkDevice.test.ts` y la lógica mínima hasta verde: ancho 320 y puntero `none` → false · Tests: T-HU028-04
- [ ] **TK-HU028-06** · Escribir la prueba unit en `test/unit/i18n/keysParity.test.ts` y la lógica mínima hasta verde: claves `tasks.*` → existen en `es` y `en` · Tests: T-HU028-05
- [ ] **TK-HU028-07** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `tasks.*`
- [ ] **TK-HU028-08** · Interfaz: `components/assessment/tasks/*` (uno por tarea)
- [ ] **TK-HU028-09** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU028-10** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU028-01…05

### HU029 · Panel de analítica para super admin · P2

Spec: [HU029-spec.md](HU029-spec.md) · Requiere: HU011, HU015 · Lógica en: `shared/utils/analytics.ts`

- [ ] **TK-HU029-01** · Escribir en rojo las pruebas pgTAP de `supabase/tests/analytics.test.sql`: `evaluator` consulta `analytics_completion` → rechazado · Tests: T-HU029-04
- [ ] **TK-HU029-02** · Migración: `<ts>_create_analytics_views.sql`: vistas agregadas `analytics_completion`, `analytics_dropoff`. Regenerar `database.types.ts`
- [ ] **TK-HU029-03** · Escribir la prueba unit en `test/unit/analytics/metrics.test.ts` y la lógica mínima hasta verde: 10 evaluaciones, 7 completadas → 0,7; filtro modo `conversation` → solo filas de conversación · Tests: T-HU029-01…02
- [ ] **TK-HU029-04** · Escribir la prueba unit en `test/unit/analytics/suppress.test.ts` y la lógica mínima hasta verde: grupos de 3 y de 8 → solo el de 8 · Tests: T-HU029-03
- [ ] **TK-HU029-05** · Escribir la prueba unit en `test/unit/analytics/toCsv.test.ts` y la lógica mínima hasta verde: valor con coma y comillas → campo escapado · Tests: T-HU029-05
- [ ] **TK-HU029-06** · Endpoint `GET /api/admin/analytics`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU029-07** · Endpoint `GET /api/admin/analytics.csv`: autentica con `requireRole`, valida con la lógica compartida y responde 401/403/422 según la spec
- [ ] **TK-HU029-08** · Claves de traducción en `i18n/locales/es.json` y `en.json` con las mismas claves: `analytics.*`
- [ ] **TK-HU029-09** · Interfaz `pages/dashboard/analitica.vue`: estructura con Nuxt UI, estados cargando/vacío/error y textos solo vía i18n
- [ ] **TK-HU029-10** · Revisión manual de la interfaz: tema claro y oscuro, 320 px sin desplazamiento horizontal, teclado, contraste y marca
- [ ] **TK-HU029-11** · Cierre: `pnpm test`, `pnpm lint` y `pnpm typecheck` en verde y `supabase test db`; marcar la spec como **Implementada** · Tests: T-HU029-01…05

### Verificación de salida del Sprint 4

Se marca cuando todas las tareas anteriores del sprint están hechas y los siguientes puntos se comprueban a mano:

- [ ] **TK-S4-X1** · El `superuser` crea un profesional; este elige su profesión
- [ ] **TK-S4-X2** · El profesional ve solo a sus pacientes asignados, en solo lectura y sin respuestas individuales
- [ ] **TK-S4-X3** · La revisión del plan por un profesional aparece al paciente como "Revisado por…"
- [ ] **TK-S4-X4** · Cada extra (medicamentos, vista previa, seguimiento, informante, pruebas, analítica) se activa sin cambiar el flujo base
- [ ] **TK-S4-X5** · `pnpm test`, `pnpm lint`, `pnpm typecheck` y `supabase test db` pasan; el sprint anterior sigue en verde
