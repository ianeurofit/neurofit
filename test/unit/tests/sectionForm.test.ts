import { describe, expect, it } from 'vitest'
import { formToSectionInput, sectionErrorToFormField, sectionToForm } from '../../../shared/utils/tests'

describe('section form helpers', () => {
  it('HU004 turns the flat form into the section input', () => {
    expect(formToSectionInput({ code: 'mod_1', titleEs: 'Memoria', titleEn: '', domain: 'cognition' }))
      .toEqual({ code: 'MOD_1', title: { es: 'Memoria' }, domain: 'cognition' })
  })

  it('HU004 fills the form from an existing section', () => {
    expect(sectionToForm({ code: 'MOD_1', title: { es: 'Memoria', en: 'Memory' }, domain: 'cognition' }))
      .toEqual({ code: 'MOD_1', titleEs: 'Memoria', titleEn: 'Memory', domain: 'cognition' })
  })

  it('HU004 each error lands on its form field', () => {
    expect(sectionErrorToFormField('code')).toBe('code')
    expect(sectionErrorToFormField('title')).toBe('titleEs')
    expect(sectionErrorToFormField('title.en')).toBe('titleEn')
    expect(sectionErrorToFormField('domain')).toBe('domain')
  })
})
