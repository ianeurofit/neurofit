import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'

const Hello = defineComponent({
  setup: () => () => h('p', { 'data-test': 'hello' }, 'hola'),
})

describe('nuxt project', () => {
  it('TK-S1-08 mounts a component inside the Nuxt environment', async () => {
    const wrapper = await mountSuspended(Hello)

    expect(wrapper.get('[data-test="hello"]').text()).toBe('hola')
    expect(typeof window).not.toBe('undefined')
  })

  it('TK-S1-08 exposes the Nuxt app and its runtime config', () => {
    const config = useRuntimeConfig()

    expect(config).toBeDefined()
    expect(useNuxtApp().$config).toBeDefined()
  })
})
