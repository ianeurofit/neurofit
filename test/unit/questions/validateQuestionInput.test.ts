import { describe, expect, it } from 'vitest'
import { validateQuestionInput } from '../../../shared/utils/questions'
import { applyScale } from '../../../shared/utils/scales'

const f5 = {
  code: 'F5',
  name: { es: 'Frecuencia', en: 'Frequency' },
  options: ['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Siempre'].map((es, index) => ({
    value: `v${index}`, label: { es, en: es }, score: index, position: index + 1,
  })),
}

const base = { code: 'MEM_001', prompt: { es: '¿Olvidas conversaciones?' }, type: 'single_choice' as const, required: true }

function codes(input: Parameters<typeof validateQuestionInput>[0]) {
  return validateQuestionInput(input).errors.map(error => `${error.field}:${error.code}`)
}

describe('validateQuestionInput · options copied from a scale', () => {
  it('T-HU031-03 options copied from a scale with one label edited are valid', () => {
    const options = applyScale(f5)
    options[2]!.label.es = 'Algunas veces'
    options[2]!.score = 2.5

    expect(validateQuestionInput({ ...base, options })).toEqual({ ok: true, errors: [] })
  })

  it('T-HU031-03 an option whose label was emptied is reported on that option', () => {
    const options = applyScale(f5)
    options[1]!.label.es = ' '

    expect(codes({ ...base, options })).toEqual(['options.1.label:required'])
  })

  it('T-HU031-03 editing a label into a duplicate is reported', () => {
    const options = applyScale(f5)
    options[1]!.label.es = 'Nunca'

    expect(codes({ ...base, options })).toEqual(['options.1.label:duplicate_option'])
  })

  it('T-HU031-03 repeated values and fewer than two options are reported', () => {
    const options = applyScale(f5)
    options[4]!.value = 'v0'

    expect(codes({ ...base, options })).toEqual(['options.4.value:duplicate_option'])
    expect(codes({ ...base, options: options.slice(0, 1) })).toEqual(['options:min_options'])
  })

  it('T-HU031-03 a score that is not a finite number is invalid; null is allowed', () => {
    const options = applyScale(f5)
    options[0]!.score = null
    options[1]!.score = Number.NaN

    expect(codes({ ...base, options })).toEqual(['options.1.score:invalid_score'])
  })
})

const options = (...values: string[]) => values.map((value, index) => ({ value, label: { es: `Opción ${index + 1}` }, score: index, isExclusive: false }))

function only(input: Parameters<typeof validateQuestionInput>[0]) {
  return codes({ ...base, ...input })
}

describe('validateQuestionInput · HU005', () => {
  it('T-HU005-01 a question without prompt.es has a required error on prompt', () => {
    expect(only({ ...base, type: 'open_text', prompt: { es: ' ', en: 'Only English' }, config: { maxLength: 1000 } })).toEqual(['prompt:required'])
  })

  it('T-HU005-01 code, prompt, type and required are mandatory; the rest is optional', () => {
    const minimal = { code: 'OPEN_001', prompt: { es: '¿Algo más?' }, type: 'open_text' as const, required: false, config: { maxLength: 1000 } }
    expect(validateQuestionInput(minimal)).toEqual({ ok: true, errors: [] })

    const empty = { code: '', prompt: { es: '' }, type: '' as never, required: undefined as never }
    expect(codes(empty)).toEqual(['code:required', 'prompt:required', 'type:required', 'required:required'])
  })

  it('T-HU005-01 the code follows ^[A-Z0-9_]{2,40}$ and an unknown type is rejected', () => {
    expect(only({ ...base, code: 'mem 1', options: options('a', 'b') })).toEqual(['code:invalid_format'])
    expect(only({ ...base, type: 'slider' as never })).toEqual(['type:invalid_type'])
  })

  it('T-HU005-03 single_choice with one option has a min_options error', () => {
    expect(only({ ...base, type: 'single_choice', options: options('a') })).toEqual(['options:min_options'])
    expect(only({ ...base, type: 'single_choice', options: options('a', 'b') })).toEqual([])
  })

  it('T-HU005-04 multiple_choice with repeated values and an unknown exclusive value', () => {
    expect(only({ ...base, type: 'multiple_choice', options: options('a', 'a'), config: { exclusiveValues: [] } }))
      .toEqual(['options.1.value:duplicate_option'])
    expect(only({ ...base, type: 'multiple_choice', options: options('none', 'b'), config: { exclusiveValues: ['ghost'] } }))
      .toEqual(['config.exclusiveValues:unknown_option'])
    expect(only({ ...base, type: 'multiple_choice', options: options('none', 'b'), config: { exclusiveValues: ['none'] } }))
      .toEqual([])
  })

  it('T-HU005-05 true_false without labels.false has an error on config.labels', () => {
    expect(only({ ...base, type: 'true_false', config: { labels: { true: { es: 'Sí' } } } })).toEqual(['config.labels:required'])
    expect(only({ ...base, type: 'true_false', config: { labels: { true: { es: 'Sí' }, false: { es: 'No' } } } })).toEqual([])
  })

  it('T-HU005-06 numeric_scale with min 10 and max 1 has a min_gte_max error', () => {
    expect(only({ ...base, type: 'numeric_scale', config: { min: 10, max: 1 } })).toEqual(['config.max:min_gte_max'])
    expect(only({ ...base, type: 'numeric_scale', config: { min: 5, max: 5 } })).toEqual(['config.max:min_gte_max'])
    expect(only({ ...base, type: 'numeric_scale', config: { min: 1, max: 10, minLabel: { es: 'Nada' } } })).toEqual([])
  })

  it('T-HU005-07 agreement with 4 labels has a labels_count error', () => {
    const labels = ['Uno', 'Dos', 'Tres', 'Cuatro'].map(es => ({ es }))

    expect(only({ ...base, type: 'agreement', config: { labels } })).toEqual(['config.labels:labels_count'])
    expect(only({ ...base, type: 'agreement', config: { labels: [...labels, { es: ' ' }] } })).toEqual(['config.labels.4:required'])
    expect(only({ ...base, type: 'agreement', config: { labels: [...labels, { es: 'Cinco' }] } })).toEqual([])
  })

  it('T-HU005-09 open_text with maxLength 0 and numeric_free with min > max', () => {
    expect(only({ ...base, type: 'open_text', config: { maxLength: 0 } })).toEqual(['config.maxLength:out_of_range'])
    expect(only({ ...base, type: 'open_text', config: { maxLength: 5001 } })).toEqual(['config.maxLength:out_of_range'])
    expect(only({ ...base, type: 'numeric_free', config: { unit: { es: 'horas' }, min: 10, max: 1 } })).toEqual(['config.max:min_gt_max'])
    expect(only({ ...base, type: 'numeric_free', config: { min: 3, max: 3, step: 0.5 } })).toEqual([])
    expect(only({ ...base, type: 'numeric_free', config: {} })).toEqual([])
  })

  it('T-HU005-10 a question with 3 invalid fields returns 3 errors in one call', () => {
    const result = validateQuestionInput({ code: 'x', prompt: { es: '' }, type: 'numeric_scale', required: true, config: { min: 10, max: 1 } })

    expect(result.ok).toBe(false)
    expect(result.errors.map(error => `${error.field}:${error.code}`)).toEqual([
      'code:invalid_format', 'prompt:required', 'config.max:min_gte_max',
    ])
  })

  it('HU005 optional fields are checked when they are present', () => {
    expect(only({ ...base, options: options('a', 'b'), direction: 'sideways' as never, weight: -1 }))
      .toEqual(['direction:invalid_direction', 'weight:invalid_number'])
    expect(only({ ...base, options: options('a', 'b'), direction: 'higher_is_risk', weight: 1.5, variable: 'memory' })).toEqual([])
  })
})
