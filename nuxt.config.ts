// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',

  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/eslint', '@formkit/auto-animate/nuxt', '@nuxt/image', 'nuxt-gtag','@nuxt/content'],

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