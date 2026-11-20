import { describe, expect, it } from 'vitest'
import { TEST_STATUSES, filterTests, isTestStatus } from '../../../shared/utils/tests'

const list = [
  { code: 'A', status: 'draft' as const },
  { code: 'B', status: 'published' as const },
  { code: 'C', status: 'draft' as const },
  { code: 'D', status: 'archived' as const },
]

describe('filterTests', () => {
  it('T-HU003-07 filtering by draft keeps only the drafts', () => {
    expect(filterTests(list, 'draft').map(test => test.code)).toEqual(['A', 'C'])
  })

  it('T-HU003-07 without a status it returns the whole list', () => {
    expect(filterTests(list)).toHaveLength(4)
  })

  it('T-HU003-07 does not mutate the given list', () => {
    const copy = [...list]
    filterTests(list, 'published')
    expect(list).toEqual(copy)
  })
})

describe('isTestStatus', () => {
  it('T-HU003-07 recognises the three statuses only', () => {
    expect(TEST_STATUSES).toEqual(['draft', 'published', 'archived'])
    expect(isTestStatus('draft')).toBe(true)
    expect(isTestStatus('deleted')).toBe(false)
    expect(isTestStatus(undefined)).toBe(false)
  })
})
