import { describe, expect, it } from 'vitest'
import { buildNewTest, mapDbError, normalizeTestInput } from '../../../shared/utils/tests'

const USER = 'd0000000-0000-0000-0000-0000000000d0'

describe('buildNewTest', () => {
  it('T-HU003-01 a new test is a draft at version 1 created by the current user', () => {
    const test = buildNewTest({ code: 'TEST_1', title: { es: 'Test uno' } }, USER)

    expect(test).toMatchObject({ status: 'draft', version: 1, created_by: USER, code: 'TEST_1' })
  })

  it('T-HU003-01 ignores status, version or author sent by the client', () => {
    const input = { code: 'TEST_1', title: { es: 'Test uno' }, status: 'published', version: 9, created_by: 'x' }
    const test = buildNewTest(input as never, USER)

    expect(test).toMatchObject({ status: 'draft', version: 1, created_by: USER })
  })

  it('T-HU003-01 trims the texts and stores an empty description as null', () => {
    const test = buildNewTest({ code: ' TEST_1 ', title: { es: '  Test uno ', en: ' ' }, description: { es: ' ' } }, USER)

    expect(test.code).toBe('TEST_1')
    expect(test.title).toEqual({ es: 'Test uno' })
    expect(test.description).toBeNull()
  })
})

describe('normalizeTestInput', () => {
  it('T-HU003-01 keeps the English text only when it is filled', () => {
    const input = normalizeTestInput({ code: 'TEST_1', title: { es: 'Uno', en: 'One' }, description: { es: 'Descripción' } })

    expect(input.title).toEqual({ es: 'Uno', en: 'One' })
    expect(input.description).toEqual({ es: 'Descripción' })
  })

  it('T-HU003-01 tolerates a body that is not an object', () => {
    expect(normalizeTestInput(null)).toEqual({ code: '', title: { es: '' }, description: null })
  })
})

describe('mapDbError', () => {
  it('T-HU003-04 a unique violation (23505) is reported on the code field', () => {
    expect(mapDbError({ code: '23505', message: 'duplicate key value violates unique constraint "tests_code_key"' }))
      .toEqual({ field: 'code', code: 'code_taken' })
  })

  it('T-HU003-04 an RLS rejection (42501) is forbidden and anything else is unknown', () => {
    expect(mapDbError({ code: '42501', message: 'permission denied' })).toEqual({ field: null, code: 'forbidden' })
    expect(mapDbError({ code: 'XX000', message: 'boom' })).toEqual({ field: null, code: 'unknown' })
  })
})
