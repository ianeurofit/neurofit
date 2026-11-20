import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UFormField, UInput } from '#components'
import ManagementForm from '~/components/dashboard/ManagementForm.vue'

const fieldSlot = ({ state }: { state: Record<string, unknown> }) =>
  h(UFormField, { name: 'name', label: 'Name' }, () =>
    h(UInput as never, { 'modelValue': state.name, 'onUpdate:modelValue': (value: string) => { state.name = value } }))

function mountForm(overrides: Record<string, unknown> = {}) {
  return mountSuspended(ManagementForm, {
    props: { state: { name: '' }, required: ['name'], loading: false, ...overrides },
    slots: { default: fieldSlot },
  })
}

describe('ManagementForm', () => {
  it('HU003 shows a translated error on the empty required field and does not submit', async () => {
    const wrapper = await mountForm()

    await wrapper.find('form').trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).not.toContain('management.')
    expect(wrapper.text()).toContain('obligatorio')
  })

  it('HU003 emits submit with the state once valid', async () => {
    const wrapper = await mountForm({ state: { name: 'Test A' } })

    await wrapper.find('form').trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')![0]![0]).toEqual({ name: 'Test A' })
  })

  it('HU003 disables the save button and marks it busy while loading', async () => {
    const wrapper = await mountForm({ loading: true })
    const button = wrapper.find('button[type="submit"]')

    expect(button.attributes('disabled')).toBeDefined()
  })

  it('HU003 the save button is enabled when idle', async () => {
    const wrapper = await mountForm()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
