# Neurofit AI — Landing Page

Landing page construida con **Nuxt 4** + **Nuxt UI v3**, siguiendo el diseño y contenido de las 11 imágenes de
referencia proporcionadas (hero, problema, solución, dimensiones evaluadas, Brain Score™, audiencias, misión/visión,
beneficios, equipo, newsletter y footer).

## Stack

- **Nuxt 4** (estructura `app/`)
- **@nuxt/ui** — componentes de interfaz (UButton, UCard, UAlert, UInput, USelect, UCheckbox, USwitch, etc.)
- **@nuxt/icon** — iconos `lucide` y `simple-icons`
- **@nuxt/eslint** — linting
- **@nuxtjs/auto-animate** — transiciones automáticas en listas/estadísticas (`v-auto-animate`)

## Cómo correrlo

Este entorno no tiene acceso a internet, así que el proyecto no fue compilado ni se instalaron dependencias aquí.
En tu máquina, con Node 18+:

```bash
npm install
npm run dev
```

Luego abre `http://localhost:3000`.

Para producción:

```bash
npm run build
npm run preview
```

## Estructura

```
app/
  app.config.ts          # tokens de color de marca para Nuxt UI (verde Neurofit)
  app.vue                # <UApp> raíz
  assets/css/main.css    # paleta de marca (--color-brand-*), fondo oscuro (ink), utilidades
  composables/
    useCountUp.ts         # animación de conteo ascendente al entrar en viewport
  components/
    layout/
      AppHeader.vue       # navbar con switch de tema claro/oscuro
      AppFooter.vue       # footer (imagen 11)
    sections/
      HeroSection.vue          # imagen 1
      ProblemSection.vue       # imagen 2
      SolutionSection.vue      # imagen 3
      EvaluationSection.vue    # imagen 4
      BrainScoreSection.vue    # imagen 5
      AudienceSection.vue      # imagen 6
      MissionVisionSection.vue # imagen 8
      BenefitsSection.vue      # imagen 7
      TeamSection.vue          # imagen 9
      NewsletterSection.vue    # imagen 10
    ui/
      SectionEyebrow.vue  # etiqueta numerada "0X. TÍTULO"
      FeatureCard.vue     # tarjeta icono + título + descripción, reutilizada en varias secciones
      StatCounter.vue     # cifra animada (conteo ascendente) reutilizada en stats
      StatRing.vue        # gauge circular del Brain Score
      DimensionBar.vue    # barra de progreso animada (Cognición, Salud emocional, etc.)
  pages/
    index.vue             # ensambla todas las secciones
```

## Notas de diseño

- **Paleta**: verde marca (`brand-500 #17b45c`) sobre fondo oscuro casi negro (`ink-950`) en hero/footer/newsletter,
  y fondo blanco/gris muy claro en el resto, replicando el contraste de las capturas.
- **Tema claro/oscuro**: switch (`USwitch`) en la navbar, usa `useColorMode()` (incluido con `@nuxt/ui`), con clases
  `dark:` en cada componente.
- **Interactividad de cifras**: `useCountUp` anima cada número desde 0 hasta su valor real cuando entra en el
  viewport (Brain Score, dimensiones, estadísticas del equipo, +10/+50/+1M/100%, etc.), y `v-auto-animate` suaviza
  los cambios de esos valores en el DOM.
- **Componentización**: `FeatureCard`, `StatCounter`, `StatRing` y `DimensionBar` se reutilizan en 5+ secciones para
  evitar duplicar marcado.
- La foto de la fundadora (imagen 9) se representó con un avatar de marca en vez de una fotografía, ya que no se
  incluyó el archivo de imagen para usar como asset del proyecto. Puedes reemplazar `UAvatar` en `TeamSection.vue`
  por `<img src="/team/marisol.jpg">` colocando la foto en `public/team/`.

## Pendiente / personalización rápida

- Ajusta los enlaces reales del formulario de newsletter y del CTA "Solicitar acceso" en `AppHeader.vue`.
- Reemplaza `info@neurofitai.com` / WhatsApp / redes sociales en `AppFooter.vue` si cambian.
- El icono central del hero y de "El problema" son ilustrativos (`i-lucide-brain-circuit`, `i-lucide-scan-face`);
  puedes sustituirlos por una ilustración SVG de red neuronal si quieres el efecto exacto de las imágenes.

## Sistema de usuarios (Supabase + RLS)

### Configuración

Copia `.env.example` a `.env` y completa `SUPABASE_SERVICE_KEY` con la clave
`service_role` del proyecto (Supabase Dashboard → Project Settings → API Keys).
Sin esa clave, el panel funciona en modo lectura: crear, editar y eliminar
usuarios devuelve error 500 desde `/api/admin/*`.

### Roles y rutas

| Rol | Valor en BD | Panel |
| --- | --- | --- |
| Superusuario | `superuser` | `/dashboard/superusuario` + `/dashboard/usuarios` |
| Evaluador | `evaluator` | `/dashboard/evaluador` |
| Usuario | `user` | `/dashboard/usuario` |

La landing (`/`), `/politicas` y `/newslatter` siguen siendo públicas. `/dashboard`
redirige automáticamente al panel del rol de quien inicia sesión, y el middleware
global `app/middleware/roles.global.ts` impide entrar al panel de otro rol.

### Seguridad

- `public.profiles` tiene RLS activo: cada persona sólo lee su propio perfil;
  superusuarios y evaluadores leen todos; sólo el superusuario inserta, actualiza
  cualquier perfil y elimina.
- El trigger `on_auth_user_created` crea el perfil con rol `user` siempre, así el
  registro público no puede auto asignarse un rol.
- El trigger `profiles_guard_privileges` bloquea cualquier cambio de `role` o
  `is_active` hecho por quien no es superusuario.
- Los helpers (`private.is_superuser()`, `private.is_staff()`) viven en el esquema
  `private`, fuera de la API REST.
- Las rutas `/api/admin/users*` verifican el rol en el servidor antes de usar la
  clave `service_role`; nadie puede cambiar su propio rol ni borrarse a sí mismo.

Las migraciones están en `supabase/migrations/`.

## Internacionalización (español / inglés)

El sitio usa `@nuxtjs/i18n` con la estrategia `prefix_except_default`:

- Español (`es`, por defecto): `/`, `/politicas`, `/login`, `/dashboard/...`
- Inglés (`en`): `/en`, `/en/politicas`, `/en/login`, `/en/dashboard/...`

Los textos viven en [`i18n/locales/es.json`](i18n/locales/es.json) y
[`i18n/locales/en.json`](i18n/locales/en.json). Ambos archivos tienen exactamente
las mismas claves; al añadir una cadena hay que agregarla en los dos.

- Textos con énfasis en medio de la frase usan `<i18n-t keypath="...">` con slots,
  para que cada idioma pueda ordenar las palabras a su manera.
- Las listas se leen con `tm()` + `rt()`.
- Los enlaces internos se construyen con `localePath('/ruta')` y el selector de
  idioma es [`app/components/LangSwitcher.vue`](app/components/LangSwitcher.vue).
- El título de cada página del panel se define con
  `definePageMeta({ titleKey: 'dashboard.titles.x' })`.
- `useLocaleHead` en `app/app.vue` genera `lang`, `canonical` y los `hreflang`
  (`baseUrl` está configurado en `nuxt.config.ts`).

El idioma del navegador se detecta solo en la raíz y se recuerda en la cookie
`neurofit_i18n`.
