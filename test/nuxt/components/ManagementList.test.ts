import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ManagementList from '~/components/dashboard/ManagementList.vue'

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
]
const rows = [
  { id: '1', name: 'Alpha', status: 'draft' },
  { id: '2', name: 'Beta', status: 'published' },
]
const props = { columns, items: rows, pending: false, error: false, hasFilters: false }

describe('ManagementList', () => {
  it('HU003 shows a loading state without table or cards', async () => {
    const wrapper = await mountSuspended(ManagementList, { props: { ...props, pending: true } })

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('HU003 shows the error and emits retry', async () => {
    const wrapper = await mountSuspended(ManagementList, { props: { ...props, error: true } })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    await wrapper.find('[role="alert"] button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('HU003 shows the empty state, and the filtered one with a clear action', async () => {
    const empty = await mountSuspended(ManagementList, { props: { ...props, items: [] } })
    expect(empty.find('table').exists()).toBe(false)
    expect(empty.text()).not.toContain('management.')

    const filtered = await mountSuspended(ManagementList, { props: { ...props, items: [], hasFilters: true } })
    await filtered.find('[data-test="clear-filters"]').trigger('click')
    expect(filtered.emitted('clearFilters')).toHaveLength(1)
  })

  it('HU003 renders a table row and a card per item, cards only below 640 px', async () => {
    const wrapper = await mountSuspended(ManagementList, {
      props,
      slots: { card: `<template #card="{ item }"><b>{{ item.name }}</b></template>` },
    })

    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    const cards = wrapper.findAll('[data-test="card"]')
    expect(cards).toHaveLength(2)
    expect(wrapper.find('[data-test="cards"]').classes()).toContain('sm:hidden')
    expect(wrapper.find('[data-test="table"]').classes()).toContain('hidden')
    expect(cards[0]!.text()).toContain('Alpha')
  })

  it('HU003 renders the filters slot and never leaks translation keys', async () => {
    const wrapper = await mountSuspended(ManagementList, {
      props: { ...props, hasFilters: true },
      slots: { filters: '<input data-test="f" />' },
    })

    expect(wrapper.find('[data-test="f"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/management\.[a-z]/)
  })
})
