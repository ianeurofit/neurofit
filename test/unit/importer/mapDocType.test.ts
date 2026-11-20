import { describe, expect, it } from 'vitest'
import { mapDocType } from '../../../shared/utils/importer'

describe('mapDocType', () => {
  it('T-HU008-07 every token of the document maps to its type and scale', () => {
    expect(mapDocType('F5')).toEqual({ type: 'single_choice', scaleCode: 'F5' })
    expect(mapDocType('IND')).toEqual({ type: 'single_choice', scaleCode: 'IND' })
    expect(mapDocType('SNN')).toEqual({ type: 'single_choice', scaleCode: 'SNN' })
    expect(mapDocType('FC')).toEqual({ type: 'single_choice', scaleCode: 'FC' })
    expect(mapDocType('OU')).toEqual({ type: 'single_choice' })
    expect(mapDocType('OM')).toEqual({ type: 'multiple_choice' })
    expect(mapDocType('SN')).toEqual({ type: 'true_false' })
    expect(mapDocType('NUM')).toEqual({ type: 'numeric_free' })
    expect(mapDocType('OPEN')).toEqual({ type: 'open_text' })
  })

  it('T-HU008-07 an unknown token is null; case and spaces do not matter', () => {
    expect(mapDocType('XYZ')).toBeNull()
    expect(mapDocType('')).toBeNull()
    expect(mapDocType(' f5 ')).toEqual({ type: 'single_choice', scaleCode: 'F5' })
  })
})
