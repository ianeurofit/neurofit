import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import TestsPage from '~/pages/dashboard/tests/index.vue'

const tests = [
  { id: '1', code: 'DRAFT_A', title: { es: 'Test borrador' }, description: null, version: 1, status: 'draft', created_at: '2026-11-20T10:00:00Z' },
  { id: '2', code: 'PUB_B', title: { es: 'Test publicado' }, description: null, version: 2, status: 'published', created_at: '2026-11-19T10:00:00Z' },
]

describe('dashboard/tests', () => {
  beforeEach(() => {
    clearNuxtData()
  })

  it('HU003 shows a loading state while the list is requested', async () => {
    registerEndpoint('/api/admin/tests', () => new Promise(() => {}))

    const wrapper = await mountSuspended(TestsPage)

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('T-HU003-07 CA-06 lists code, title, version and status of each test', async () => {
    registerEndpoint('/api/admin/tests', () => tests)

    const wrapper = await mountSuspended(TestsPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))
    const table = wrapper.find('[data-test="table"]').text()

    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(table).toContain('DRAFT_A')
    expect(table).toContain('Test publicado')
    expect(table).toContain('v2')
    expect(wrapper.findAll('[data-test="card"]')).toHaveLength(2)
  })

  it('HU004 each test links to its structure page', async () => {
    registerEndpoint('/api/admin/tests', () => tests)

    const wrapper = await mountSuspended(TestsPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))

    expect(wrapper.find('[data-test="table"] a[href$="/dashboard/tests/1"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="cards"] a[href$="/dashboard/tests/2"]').exists()).toBe(true)
  })

  it('HU003 shows the empty state with a link to create the first test', async () => {
    registerEndpoint('/api/admin/tests', () => [])

    const wrapper = await mountSuspended(TestsPage)
    await vi.waitFor(() => expect(wrapper.find('[role="status"]').exists()).toBe(false))

    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('a[href="/dashboard/tests/nuevo"]').exists()).toBe(true)
  })

  it('HU003 shows an error with a retry action', async () => {
    registerEndpoint('/api/admin/tests', () => {
      throw createError({ statusCode: 500 })
    })

    const wrapper = await mountSuspended(TestsPage)
    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
  })

  it('HU003 never shows raw translation keys', async () => {
    registerEndpoint('/api/admin/tests', () => tests)

    const wrapper = await mountSuspended(TestsPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))

    expect(wrapper.text()).not.toMatch(/\b(tests|errors|management)\.[a-z]/)
  })
})
