import { describe, expect, it } from 'vitest'
import { formToTestInput, localizedText, testErrorToFormField } from '../../../shared/utils/tests'

describe('formToTestInput', () => {
  it('T-HU003-01 turns the flat form state into the localized input', () => {
    const input = formToTestInput({ code: 'test_1', titleEs: 'Uno', titleEn: '', descriptionEs: 'Algo', descriptionEn: '' })

    expect(input).toEqual({ code: 'TEST_1', title: { es: 'Uno' }, description: { es: 'Algo' } })
  })

  it('T-HU003-01 drops an empty description', () => {
    const input = formToTestInput({ code: 'A_1', titleEs: 'Uno', titleEn: 'One', descriptionEs: ' ', descriptionEn: '' })

    expect(input).toEqual({ code: 'A_1', title: { es: 'Uno', en: 'One' }, description: null })
  })
})

describe('testErrorToFormField', () => {
  it('T-HU003-04 each error lands on its form field', () => {
    expect(testErrorToFormField('code')).toBe('code')
    expect(testErrorToFormField('title')).toBe('titleEs')
    expect(testErrorToFormField('title.en')).toBe('titleEn')
    expect(testErrorToFormField('description')).toBe('descriptionEs')
    expect(testErrorToFormField('description.en')).toBe('descriptionEn')
  })
})

describe('localizedText', () => {
  it('HU003 uses the active locale and falls back to Spanish', () => {
    expect(localizedText({ es: 'Uno', en: 'One' }, 'en')).toBe('One')
    expect(localizedText({ es: 'Uno' }, 'en')).toBe('Uno')
    expect(localizedText({ es: 'Uno', en: 'One' }, 'es')).toBe('Uno')
    expect(localizedText(null, 'es')).toBe('')
  })
})
