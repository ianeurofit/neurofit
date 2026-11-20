import { describe, expect, it } from 'vitest'
import { QUESTION_TYPES, defaultConfig, validateQuestionInput } from '../../../shared/utils/questions'

describe('defaultConfig', () => {
  it('T-HU005-08 every type starts with the defaults of specs.md §5', () => {
    expect(defaultConfig('single_choice')).toEqual({})
    expect(defaultConfig('multiple_choice')).toEqual({ exclusiveValues: [] })
    expect(defaultConfig('true_false')).toEqual({ labels: { true: { es: 'Sí', en: 'Yes' }, false: { es: 'No', en: 'No' } } })
    expect(defaultConfig('numeric_scale')).toEqual({ min: 1, max: 10 })
    expect(defaultConfig('numeric_free')).toEqual({})
    expect(defaultConfig('open_text')).toEqual({ maxLength: 1000 })

    const agreement = defaultConfig('agreement') as { labels: Array<{ es: string, en: string }> }
    expect(agreement.labels).toHaveLength(5)
    expect(agreement.labels[0]).toEqual({ es: 'Totalmente en desacuerdo', en: 'Strongly disagree' })
    expect(agreement.labels[4]).toEqual({ es: 'Totalmente de acuerdo', en: 'Strongly agree' })
  })

  it('T-HU005-08 the defaults of the non-choice types are valid as they are', () => {
    for (const type of QUESTION_TYPES.filter(type => !['single_choice', 'multiple_choice'].includes(type))) {
      const result = validateQuestionInput({ code: 'Q_01', prompt: { es: 'Pregunta' }, type, required: true, config: defaultConfig(type) })
      expect(result.errors, type).toEqual([])
    }
  })

  it('T-HU005-08 each call returns a fresh copy', () => {
    const first = defaultConfig('agreement') as { labels: Array<{ es: string }> }
    first.labels[0]!.es = 'Cambiado'

    expect((defaultConfig('agreement') as { labels: Array<{ es: string }> }).labels[0]!.es).toBe('Totalmente en desacuerdo')
  })
})
