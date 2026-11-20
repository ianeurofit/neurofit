import { describe, expect, it } from 'vitest'
import { filterPatients } from '../../../shared/utils/patients'

const patients = [
  { id: '1', full_name: 'Carlos Gómez', email: 'carlos@test.local', is_active: true, assigned_at: '2026-01-02T00:00:00Z' },
  { id: '2', full_name: null, email: 'ana.perez@test.local', is_active: true, assigned_at: '2026-01-03T00:00:00Z' },
  { id: '3', full_name: 'María Pérez', email: 'maria@test.local', is_active: false, assigned_at: '2026-01-04T00:00:00Z' },
]

describe('filterPatients', () => {
  it('HU001 returns everyone when the search is empty or blank', () => {
    expect(filterPatients(patients, '')).toHaveLength(3)
    expect(filterPatients(patients, '   ')).toHaveLength(3)
  })

  it('HU001 matches the name, ignoring case and accents', () => {
    expect(filterPatients(patients, 'GOMEZ').map(p => p.id)).toEqual(['1'])
    expect(filterPatients(patients, 'maría').map(p => p.id)).toEqual(['3'])
  })

  it('HU001 matches the email, also for patients without a name', () => {
    expect(filterPatients(patients, 'ana.perez').map(p => p.id)).toEqual(['2'])
  })

  it('HU001 returns an empty list when nothing matches', () => {
    expect(filterPatients(patients, 'zzz')).toEqual([])
  })

  it('HU001 does not mutate the original list', () => {
    const copy = [...patients]
    filterPatients(patients, 'carlos')

    expect(patients).toEqual(copy)
  })
})
