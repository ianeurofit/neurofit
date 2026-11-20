import { describe, expect, it } from 'vitest'
import { validateTestInput } from '../../../shared/utils/tests'

const valid = { code: 'TEST_1', title: { es: 'Test uno' } }

function fieldsOf(input: Parameters<typeof validateTestInput>[0]) {
  return validateTestInput(input).errors.map(error => `${error.field}:${error.code}`)
}

describe('validateTestInput', () => {
  it('T-HU003-02 the code must match ^[A-Z0-9_]{3,40}$', () => {
    expect(validateTestInput({ ...valid, code: 'ab' }).ok).toBe(false)
    expect(validateTestInput({ ...valid, code: 'TEST 1' }).ok).toBe(false)
    expect(validateTestInput({ ...valid, code: 'TEST_1' }).ok).toBe(true)
  })

  it('T-HU003-02 lower case and codes longer than 40 characters are invalid', () => {
    expect(fieldsOf({ ...valid, code: 'test_1' })).toEqual(['code:invalid_format'])
    expect(fieldsOf({ ...valid, code: 'A'.repeat(41) })).toEqual(['code:invalid_format'])
    expect(validateTestInput({ ...valid, code: 'A'.repeat(40) }).ok).toBe(true)
  })

  it('T-HU003-02 an empty code is required, not badly formatted', () => {
    expect(fieldsOf({ ...valid, code: '  ' })).toEqual(['code:required'])
  })

  it('T-HU003-03 titles of 2 and 121 characters are both invalid', () => {
    expect(fieldsOf({ ...valid, title: { es: 'ab' } })).toEqual(['title:too_short'])
    expect(fieldsOf({ ...valid, title: { es: 'a'.repeat(121) } })).toEqual(['title:too_long'])
  })

  it('T-HU003-03 titles of 3 and 120 characters are valid, and an empty one is required', () => {
    expect(validateTestInput({ ...valid, title: { es: 'abc' } }).ok).toBe(true)
    expect(validateTestInput({ ...valid, title: { es: 'a'.repeat(120) } }).ok).toBe(true)
    expect(fieldsOf({ ...valid, title: { es: ' ' } })).toEqual(['title:required'])
  })

  it('T-HU003-03 the English title, when given, follows the same length rules', () => {
    expect(fieldsOf({ ...valid, title: { es: 'Test uno', en: 'ab' } })).toEqual(['title.en:too_short'])
  })

  it('T-HU003-02 the description is optional but limited to 1000 characters', () => {
    expect(validateTestInput({ ...valid, description: null }).ok).toBe(true)
    expect(fieldsOf({ ...valid, description: { es: 'a'.repeat(1001) } })).toEqual(['description:too_long'])
  })

  it('T-HU003-02 reports every invalid field at once', () => {
    expect(fieldsOf({ code: 'ab', title: { es: '' } })).toEqual(['code:invalid_format', 'title:required'])
  })
})
