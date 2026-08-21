// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',

  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/eslint', '@formkit/auto-animate/nuxt', '@nuxt/image', 'nuxt-gtag', '@nuxtjs/supabase', '@nuxtjs/i18n', 'motion-v/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Neurofit IA | Brain Intelligence',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ],
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Neurofit IA utiliza inteligencia artificial para analizar variables cognitivas, emocionales, conductuales y de estilo de vida, generando indicadores de salud cerebral, alertas tempranas y recomendaciones personalizadas.'
        }
      ]
    }
  },

  i18n: {
    baseUrl: 'https://neurofitia.com',
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'es', language: 'es-CO', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    bundle: {
      optimizeTranslationDirective: false
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'neurofit_i18n',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'es'
    }
  },

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/dashboard(/*)?', '/en/dashboard(/*)?'],
      // `include` ya limita la proteccion a las rutas del panel (es y en)
      exclude: [],
      saveRedirectToCookie: true
    }
  },

  ui: {
    colorMode: true
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  },
  gtag: {
    id: 'G-J3S9JXFVCN'
  },
  
  eslint: {
    config: {
      stylistic: true
    }
  }
})