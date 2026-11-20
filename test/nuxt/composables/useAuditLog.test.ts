import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'

const profiles = [
  { id: 'd0000000-0000-0000-0000-0000000000d0', full_name: 'Admin', email: 'admin@test.local' },
  { id: 'a0000000-0000-0000-0000-00000000000a', full_name: null, email: 'evaluator@test.local' },
]

mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => ({
    select: () => ({
      in: () => ({ order: async () => ({ data: profiles, error: null }) }),
    }),
  }),
}))

const row = (id: number) => ({
  id,
  actor_id: profiles[0]!.id,
  action: 'update',
  entity: 'questions',
  entity_id: null,
  diff: { prompt: { old: 'a', new: 'b' } },
  created_at: '2026-10-09T12:00:00Z',
  actor: profiles[0],
})

const requests: Array<Record<string, string>> = []

describe('useAuditLog', () => {
  beforeEach(() => {
    requests.length = 0
    clearNuxtData()
    registerEndpoint('/api/admin/audit', (event) => {
      requests.push(Object.fromEntries(new URL(event.path, 'http://localhost').searchParams))
      return { items: [row(2), row(1)], total: 120, page: 1, pageSize: 50 }
    })
  })

  it('HU024 loads the first page of the audit log', async () => {
    const audit = useAuditLog()
    await audit.refresh()

    expect(audit.items.value).toHaveLength(2)
    expect(audit.total.value).toBe(120)
    expect(audit.pages.value).toBe(3)
    expect(audit.hasError.value).toBe(false)
  })

  it('HU024 sends only the filters that were set', async () => {
    const audit = useAuditLog()
    audit.filters.entity = 'questions'
    audit.filters.from = '2026-01-01'

    await vi.waitFor(() => expect(requests.some(r => r.entity === 'questions' && r.from === '2026-01-01')).toBe(true))

    const filtered = requests.find(r => r.entity === 'questions' && r.from === '2026-01-01')!
    expect(filtered).not.toHaveProperty('actor')
    expect(filtered).not.toHaveProperty('to')
  })

  it('HU024 goes back to page 1 when a filter changes', async () => {
    const audit = useAuditLog()
    audit.filters.page = 3
    audit.filters.entity = 'tests'
    await vi.waitFor(() => expect(audit.filters.page).toBe(1))
  })

  it('HU024 clears every filter', () => {
    const audit = useAuditLog()
    audit.filters.entity = 'tests'
    audit.filters.actor = profiles[0]!.id
    audit.filters.from = '2026-01-01'
    audit.filters.to = '2026-02-01'

    audit.clearFilters()

    expect(audit.filters).toMatchObject({ entity: 'all', actor: 'all', from: '', to: '', page: 1 })
    expect(audit.hasFilters.value).toBe(false)
  })

  it('HU024 knows when filters are active', () => {
    const audit = useAuditLog()
    expect(audit.hasFilters.value).toBe(false)

    audit.filters.actor = profiles[0]!.id

    expect(audit.hasFilters.value).toBe(true)
  })

  it('HU024 lists the users that can appear as actors', async () => {
    const audit = useAuditLog()
    await vi.waitFor(() => expect(audit.actorOptions.value.length).toBeGreaterThan(1))

    expect(audit.actorOptions.value[0]?.value).toBe('all')
    expect(audit.actorOptions.value[0]?.label).toBeTruthy()
    expect(audit.actorOptions.value.map(option => option.label)).toContain('evaluator@test.local')
  })

  it('HU024 reports an error state when the request fails', async () => {
    registerEndpoint('/api/admin/audit', () => {
      throw createError({ statusCode: 500 })
    })

    const audit = useAuditLog()
    await audit.refresh()

    expect(audit.hasError.value).toBe(true)
    expect(audit.items.value).toEqual([])
  })
})
