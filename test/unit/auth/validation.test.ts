import { describe, expect, it } from 'vitest'
import { isUuid } from '../../../shared/utils/validation'

describe('isUuid', () => {
  it('HU001 accepts a canonical UUID', () => {
    expect(isUuid('a0000000-0000-0000-0000-00000000000a')).toBe(true)
    expect(isUuid('C0000000-0000-4000-8000-0000000000C1')).toBe(true)
  })

  it('HU001 rejects anything else', () => {
    expect(isUuid('')).toBe(false)
    expect(isUuid('not-a-uuid')).toBe(false)
    expect(isUuid('a0000000-0000-0000-0000-00000000000a; drop table')).toBe(false)
    expect(isUuid(undefined)).toBe(false)
    expect(isUuid(42)).toBe(false)
  })
})
