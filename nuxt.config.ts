// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',

  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/eslint', '@formkit/auto-animate/nuxt', '@nuxt/image'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Neurofit AI | Brain Intelligence',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Neurofit AI utiliza inteligencia artificial para analizar variables cognitivas, emocionales, conductuales y de estilo de vida, generando indicadores de salud cerebral, alertas tempranas y recomendaciones personalizadas.'
        }
      ]
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

  eslint: {
    config: {
      stylistic: true
    }
  }
})