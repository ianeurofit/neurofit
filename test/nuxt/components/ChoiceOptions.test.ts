import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import ChoiceOptions from '~/components/admin/tests/config/ChoiceOptions.vue'
import type { QuestionOption } from '#shared/types/assessment'

const f5 = {
  code: 'F5',
  name: { es: 'Frecuencia 0–4', en: 'Frequency 0–4' },
  options: ['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Siempre'].map((es, index) => ({
    value: `v${index}`, label: { es, en: `EN ${es}` }, score: index, position: index + 1,
  })),
}

async function mountForm(options: QuestionOption[] = []) {
  const wrapper = await mountSuspended(ChoiceOptions, { props: { options, 'onUpdate:options': (value: QuestionOption[]) => wrapper.setProps({ options: value }) } })
  return wrapper
}

describe('ChoiceOptions · scale selector', () => {
  beforeEach(() => {
    clearNuxtData()
    registerEndpoint('/api/admin/scales', () => [f5])
  })

  it('HU031 shows a loading state while the catalogue is requested', async () => {
    registerEndpoint('/api/admin/scales', () => new Promise(() => {}))
    const wrapper = await mountForm()

    expect(wrapper.find('[data-test="scales-loading"]').exists()).toBe(true)
  })

  it('HU031 shows an error with retry when the catalogue fails', async () => {
    registerEndpoint('/api/admin/scales', () => {
      throw createError({ statusCode: 500 })
    })
    const wrapper = await mountForm()

    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
  })

  it('HU031 shows the empty state when the question has no options yet', async () => {
    const wrapper = await mountForm()
    await vi.waitFor(() => expect(wrapper.find('[data-test="scale-select"]').exists()).toBe(true))

    expect(wrapper.find('[data-test="options-empty"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/(scales|tests\.questions)\.[a-z]/)
  })

  it('CA-02 applying a scale copies its options and scores into the question', async () => {
    const wrapper = await mountForm()
    await vi.waitFor(() => expect(wrapper.find('[data-test="scale-select"]').exists()).toBe(true))

    await (wrapper.vm as unknown as { applyScaleCode: (code: string) => void }).applyScaleCode('F5')
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="option"]')).toHaveLength(5))

    const emitted = wrapper.emitted('update:options')!.at(-1)![0] as Array<{ label: { es: string }, score: number }>
    expect(emitted.map(option => option.label.es)).toEqual(['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Siempre'])
    expect(emitted[4]!.score).toBe(4)
  })

  it('T-HU031-03 a copied option can be edited and stays valid', async () => {
    const wrapper = await mountForm()
    await vi.waitFor(() => expect(wrapper.find('[data-test="scale-select"]').exists()).toBe(true))
    await (wrapper.vm as unknown as { applyScaleCode: (code: string) => void }).applyScaleCode('F5')
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="option"]')).toHaveLength(5))

    await wrapper.find('[name="options.2.label.es"]').setValue('Algunas veces')

    const emitted = wrapper.emitted('update:options')!.at(-1)![0] as Array<{ label: { es: string } }>
    expect(emitted[2]!.label.es).toBe('Algunas veces')
    expect(wrapper.findAll('[data-test="option-error"]')).toHaveLength(0)
  })

  it('T-HU031-03 an emptied label shows its error next to the option', async () => {
    const options = [
      { value: 'a', label: { es: 'Uno', en: 'One' }, score: 0, isExclusive: false },
      { value: 'b', label: { es: '', en: 'Two' }, score: 1, isExclusive: false },
    ]
    const wrapper = await mountForm(options)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="option"]')).toHaveLength(2))

    expect(wrapper.findAll('[data-test="option-error"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="option-error"]').text()).not.toMatch(/errors\.|tests\./)
  })

  it('HU031 an option can be added and removed', async () => {
    const wrapper = await mountForm()
    await vi.waitFor(() => expect(wrapper.find('[data-test="add-option"]').exists()).toBe(true))

    await wrapper.find('[data-test="add-option"]').trigger('click')
    await wrapper.find('[data-test="add-option"]').trigger('click')
    expect(wrapper.findAll('[data-test="option"]')).toHaveLength(2)

    await wrapper.findAll('[data-test="remove-option"]')[0]!.trigger('click')
    expect(wrapper.findAll('[data-test="option"]')).toHaveLength(1)
  })
})
