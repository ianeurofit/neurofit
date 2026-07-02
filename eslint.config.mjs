// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Add your own rule overrides here
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
)
