import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import AuditPage from '~/pages/dashboard/auditoria.vue'

mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => ({
    select: () => ({
      in: () => ({ order: async () => ({ data: [{ id: 'd0', full_name: 'Admin', email: 'admin@test.local' }], error: null }) }),
    }),
  }),
}))

const items = [
  {
    id: 2,
    actor_id: 'd0',
    action: 'update',
    entity: 'questions',
    entity_id: null,
    diff: { prompt: { old: 'first', new: 'second' } },
    created_at: '2026-10-09T12:00:00Z',
    actor: { id: 'd0', full_name: 'Admin', email: 'admin@test.local' },
  },
  {
    id: 1,
    actor_id: null,
    action: 'insert',
    entity: 'evaluator_patients',
    entity_id: null,
    diff: { patient_id: { old: null, new: 'c1' } },
    created_at: '2026-10-09T11:00:00Z',
    actor: null,
  },
]

describe('dashboard/auditoria', () => {
  beforeEach(() => {
    clearNuxtData()
  })

  it('HU024 shows a loading state while the log is requested', async () => {
    registerEndpoint('/api/admin/audit', () => new Promise(() => {}))

    const wrapper = await mountSuspended(AuditPage)

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('HU024 lists each change with its actor, action, entity and what changed', async () => {
    registerEndpoint('/api/admin/audit', () => ({ items, total: 2, page: 1, pageSize: 50 }))

    const wrapper = await mountSuspended(AuditPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))
    const text = wrapper.text()

    expect(text).toContain('Admin')
    expect(text).toContain('prompt: first → second')
    expect(text).toContain('patient_id: c1')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('HU024 names the system as the actor when a change has no user session', async () => {
    registerEndpoint('/api/admin/audit', () => ({ items, total: 2, page: 1, pageSize: 50 }))

    const wrapper = await mountSuspended(AuditPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))

    expect(wrapper.text()).toMatch(/Sistema|System/)
  })

  it('HU024 shows an empty state when nothing was recorded', async () => {
    registerEndpoint('/api/admin/audit', () => ({ items: [], total: 0, page: 1, pageSize: 50 }))

    const wrapper = await mountSuspended(AuditPage)

    await vi.waitFor(() => expect(wrapper.text()).toMatch(/Aún no hay cambios registrados|No changes have been recorded yet/))
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('HU024 shows an error with a retry button when the request fails', async () => {
    registerEndpoint('/api/admin/audit', () => {
      throw createError({ statusCode: 500 })
    })

    const wrapper = await mountSuspended(AuditPage)

    await vi.waitFor(() => expect(wrapper.text()).toMatch(/No pudimos cargar la auditoría|We couldn't load the audit log/))
    expect(wrapper.text()).toMatch(/Reintentar|Try again/)
  })

  it('HU024 offers the filters by entity, user and date range', async () => {
    registerEndpoint('/api/admin/audit', () => ({ items, total: 2, page: 1, pageSize: 50 }))

    const wrapper = await mountSuspended(AuditPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))

    expect(wrapper.findAll('input[type="date"]')).toHaveLength(2)
    expect(wrapper.text()).toMatch(/Entidad|Entity/)
    expect(wrapper.text()).toMatch(/Usuario|User/)
  })

  it('HU024 renders no raw translation key', async () => {
    registerEndpoint('/api/admin/audit', () => ({ items, total: 2, page: 1, pageSize: 50 }))

    const wrapper = await mountSuspended(AuditPage)
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))

    expect(wrapper.text()).not.toMatch(/\baudit\.[a-zA-Z_.]+/)
  })
})
