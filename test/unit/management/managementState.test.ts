import { describe, expect, it } from 'vitest'
import { resolveListState, validateRequired } from '../../../shared/utils/management'

describe('resolveListState', () => {
  const base = { pending: false, error: false, count: 3, hasFilters: false }

  it('HU003 shows loading before anything else', () => {
    expect(resolveListState({ ...base, pending: true, error: true, count: 0 })).toBe('loading')
  })

  it('HU003 shows the error when the request failed', () => {
    expect(resolveListState({ ...base, error: true })).toBe('error')
  })

  it('HU003 distinguishes an empty catalogue from empty filter results', () => {
    expect(resolveListState({ ...base, count: 0 })).toBe('empty')
    expect(resolveListState({ ...base, count: 0, hasFilters: true })).toBe('emptyFiltered')
  })

  it('HU003 is ready when there are rows', () => {
    expect(resolveListState(base)).toBe('ready')
  })
})

describe('validateRequired', () => {
  it('HU003 reports one error per empty required field', () => {
    const errors = validateRequired({ name: ' ', slug: 'abc', note: '' }, ['name', 'slug'])

    expect(errors).toEqual([{ name: 'name', code: 'required' }])
  })

  it('HU003 treats null, undefined and blank strings as empty', () => {
    const errors = validateRequired({ a: null, b: undefined, c: '  ' }, ['a', 'b', 'c'])

    expect(errors.map(error => error.name)).toEqual(['a', 'b', 'c'])
  })

  it('HU003 accepts zero and false as filled values', () => {
    expect(validateRequired({ n: 0, ok: false }, ['n', 'ok'])).toEqual([])
  })

  it('HU003 reports a missing key as empty', () => {
    expect(validateRequired({}, ['name'])).toEqual([{ name: 'name', code: 'required' }])
  })
})
