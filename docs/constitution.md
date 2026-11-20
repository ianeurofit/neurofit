# Constitución de NeuroFit
Principios innegociables. Toda spec, plan y tarea debe cumplirlos; si no puede, primero se enmienda este documento.

## 1. Simplicidad del stack
- Stack cerrado: Nuxt 4 + TypeScript estricto, alojado en Netlify, con Supabase como única base de datos y auth.
- Solo módulos aprobados: @nuxt/eslint, icon, fonts, ui, image, test-utils, @nuxtjs/i18n, supabase, seo, @formkit/auto-animate, nuxt-gtag, @tresjs/nuxt, nuxt-aos, motion-v, animejs.
- Una dependencia nueva exige justificación en el plan y aprobación. Verificable: `package.json` no contiene nada fuera de la lista.
- Los agentes consultan los skills `nuxt`, `nuxt-ui` y `supabase` (en `.claude/skills`) antes de implementar.

## 2. Spec y código
- No se escribe código sin una spec aprobada en `specs/`. Cada tarea cita su spec y su criterio de aceptación.
- Si código y spec divergen, se corrige y aprueba la spec primero, y después el código.

## 3. Lógica e interfaz
- La lógica vive en `shared/utils/` (funciones puras, sin Vue ni Supabase), `app/composables/`, `app/utils/` y `server/` (TypeScript sin markup). Los `.vue` solo presentan y delegan.
- Ningún componente llama a Supabase directamente. Verificable: `grep useSupabase` en `*.vue` no devuelve nada.

## 4. Unit tests
- Toda lógica nueva o modificada lleva unit tests con @nuxt/test-utils (Vitest) en el mismo cambio; `pnpm test`, `pnpm lint` y `pnpm typecheck` pasan antes de cerrar la tarea.

## 5. Persistencia
- Todo dato persistente vive en Supabase. El esquema cambia solo con migraciones versionadas en `supabase/migrations/`.
- RLS activo en toda tabla, sin secretos en el cliente y con tipos generados desde la base.

## 6. Idioma
- Código, identificadores, comentarios y commits en inglés. Specs y docs en español.
- Ningún texto visible en componentes: todo va en `i18n/` con `en` y `es` en archivos separados y las mismas claves.

## 7. Marca y UI
- Cada vista y componente soporta tema claro/oscuro, es responsive mobile-first (320 px en adelante) y sigue el manual de marca HTML.
