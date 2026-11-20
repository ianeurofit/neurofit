import { describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

const patients = [
  { id: '1', full_name: 'Carlos Gómez', email: 'carlos@test.local', is_active: true, assigned_at: '2026-01-02T00:00:00Z' },
  { id: '2', full_name: null, email: 'ana@test.local', is_active: true, assigned_at: '2026-01-03T00:00:00Z' },
]

describe('useAssignedPatients', () => {
  it('HU001 loads the patients assigned to the evaluator', async () => {
    registerEndpoint('/api/evaluator/patients', () => ({ patients }))

    const state = useAssignedPatients()
    await state.refresh()

    expect(state.patients.value).toHaveLength(2)
    expect(state.pending.value).toBe(false)
    expect(state.hasError.value).toBe(false)
  })

  it('HU001 filters the loaded patients by the search term', async () => {
    registerEndpoint('/api/evaluator/patients', () => ({ patients }))

    const state = useAssignedPatients()
    await state.refresh()
    state.search.value = 'ana'

    expect(state.filtered.value.map(p => p.id)).toEqual(['2'])
  })

  it('HU001 reports an error state when the request fails', async () => {
    registerEndpoint('/api/evaluator/patients', () => {
      throw createError({ statusCode: 500 })
    })

    const state = useAssignedPatients()
    await state.refresh()

    expect(state.hasError.value).toBe(true)
    expect(state.patients.value).toEqual([])
  })
})
