import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SectionList from '~/components/admin/tests/SectionList.vue'

const sections = ['A', 'B', 'C'].map((code, index) => ({
  id: `s${index + 1}`, test_id: 't', code, title: { es: `Módulo ${code}` }, domain: 'cognition', position: index + 1, question_count: index,
}))
const props = { sections, pending: false, error: false, editable: true }

describe('SectionList', () => {
  it('HU004 shows a loading state', async () => {
    const wrapper = await mountSuspended(SectionList, { props: { ...props, pending: true } })

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="section"]')).toHaveLength(0)
  })

  it('HU004 shows the error and emits retry', async () => {
    const wrapper = await mountSuspended(SectionList, { props: { ...props, error: true } })

    await wrapper.find('[role="alert"] button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('HU004 shows the empty state with an add action', async () => {
    const wrapper = await mountSuspended(SectionList, { props: { ...props, sections: [] } })

    expect(wrapper.find('[data-test="empty"]').exists()).toBe(true)
    await wrapper.find('[data-test="empty"] button').trigger('click')
    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('CA-03 lists the sections in order with position, code, title and question count', async () => {
    const wrapper = await mountSuspended(SectionList, { props })
    const rows = wrapper.findAll('[data-test="section"]')

    expect(rows).toHaveLength(3)
    expect(rows[0]!.text()).toContain('1')
    expect(rows[0]!.text()).toContain('Módulo A')
    expect(rows[2]!.text()).toContain('C')
    expect(wrapper.text()).not.toMatch(/tests\.sections\./)
  })

  it('T-HU004-03 up and down buttons emit a move, disabled at the edges', async () => {
    const wrapper = await mountSuspended(SectionList, { props })
    const up = wrapper.findAll('[data-test="move-up"]')
    const down = wrapper.findAll('[data-test="move-down"]')

    expect(up[0]!.attributes('disabled')).toBeDefined()
    expect(down[2]!.attributes('disabled')).toBeDefined()
    await down[0]!.trigger('click')
    await up[2]!.trigger('click')
    expect(wrapper.emitted('move')).toEqual([[0, 1], [2, 1]])
  })

  it('T-HU004-03 dragging a row onto another emits the move on desktop', async () => {
    const wrapper = await mountSuspended(SectionList, { props })
    const rows = wrapper.findAll('[data-test="section"]')

    expect(rows[0]!.attributes('draggable')).toBe('true')
    await rows[0]!.trigger('dragstart')
    await rows[2]!.trigger('dragover')
    await rows[2]!.trigger('drop')
    expect(wrapper.emitted('move')).toEqual([[0, 2]])
  })

  it('HU004 edit and delete emit the section', async () => {
    const wrapper = await mountSuspended(SectionList, { props })

    await wrapper.findAll('[data-test="edit"]')[1]!.trigger('click')
    await wrapper.findAll('[data-test="delete"]')[1]!.trigger('click')
    expect(wrapper.emitted('edit')![0]![0]).toMatchObject({ id: 's2' })
    expect(wrapper.emitted('remove')![0]![0]).toMatchObject({ id: 's2' })
  })

  it('HU004 CA-05 a test that is not editable shows no edit controls', async () => {
    const wrapper = await mountSuspended(SectionList, { props: { ...props, editable: false } })

    expect(wrapper.findAll('[data-test="move-up"], [data-test="edit"], [data-test="delete"], [data-test="add"]')).toHaveLength(0)
    expect(wrapper.findAll('[data-test="section"]')[0]!.attributes('draggable')).toBe('false')
  })
})
