import { describe, expect, it } from 'vitest'
import { mapSectionDbError, normalizeSectionInput, validateSectionInput } from '../../../shared/utils/tests'

const valid = { code: 'MOD_1', title: { es: 'Memoria' }, domain: 'cognition' }

function fieldsOf(input: Parameters<typeof validateSectionInput>[0]) {
  return validateSectionInput(input).errors.map(error => `${error.field}:${error.code}`)
}

describe('validateSectionInput', () => {
  it('HU004 CA-01 code, title and domain are required', () => {
    expect(validateSectionInput(valid).ok).toBe(true)
    expect(fieldsOf({ code: '', title: { es: '' }, domain: '' })).toEqual(['code:required', 'title:required', 'domain:required'])
  })

  it('HU004 the code uses upper case, digits and underscore (2–40)', () => {
    expect(fieldsOf({ ...valid, code: 'M' })).toEqual(['code:invalid_format'])
    expect(fieldsOf({ ...valid, code: 'mod 1' })).toEqual(['code:invalid_format'])
    expect(validateSectionInput({ ...valid, code: 'M1' }).ok).toBe(true)
  })

  it('HU004 the title follows the test title lengths and the domain is 2–60 characters', () => {
    expect(fieldsOf({ ...valid, title: { es: 'ab' } })).toEqual(['title:too_short'])
    expect(fieldsOf({ ...valid, domain: 'x' })).toEqual(['domain:too_short'])
    expect(fieldsOf({ ...valid, domain: 'x'.repeat(61) })).toEqual(['domain:too_long'])
  })

  it('HU004 a partial update only checks the fields that were sent', () => {
    expect(validateSectionInput({ title: { es: 'Nuevo título' } }, { partial: true }).ok).toBe(true)
    expect(fieldsOf({ code: 'x' } as never)).toContain('code:invalid_format')
  })
})

describe('normalizeSectionInput', () => {
  it('HU004 trims texts, upper-cases the code and drops unknown fields', () => {
    expect(normalizeSectionInput({ code: ' mod_1 ', title: { es: ' Memoria ', en: '' }, domain: ' cognition ', position: 9 }))
      .toEqual({ code: 'MOD_1', title: { es: 'Memoria' }, domain: 'cognition' })
  })

  it('HU004 keeps only the fields present in a partial body', () => {
    expect(normalizeSectionInput({ domain: 'sleep' }, { partial: true })).toEqual({ domain: 'sleep' })
  })
})

describe('mapSectionDbError', () => {
  it('T-HU004-02 a repeated code inside the test is section_code_taken', () => {
    expect(mapSectionDbError({ code: '23505', message: 'duplicate key value violates unique constraint "test_sections_test_code_key"' }))
      .toEqual({ field: 'code', code: 'section_code_taken' })
  })

  it('HU004 CA-05 the structure guard becomes new_version_required', () => {
    expect(mapSectionDbError({ code: 'P0001', message: 'new_version_required' })).toEqual({ field: null, code: 'new_version_required' })
    expect(mapSectionDbError({ code: '42501', message: 'denied' })).toEqual({ field: null, code: 'forbidden' })
    expect(mapSectionDbError({ code: 'XX', message: '' })).toEqual({ field: null, code: 'unknown' })
  })
})
