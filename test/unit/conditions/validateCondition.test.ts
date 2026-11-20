import { describe, expect, it } from 'vitest'
import { conditionErrors, validateCondition } from '../../../shared/utils/conditions'
import type { ConditionTarget } from '../../../shared/utils/conditions'

const option = (value: string) => ({ value, label: { es: value }, score: null, isExclusive: false })

const questions: ConditionTarget[] = [
  { code: 'SMOKE', type: 'true_false', config: {}, options: [], dependsOn: null },
  { code: 'FREQ', type: 'single_choice', config: {}, options: [option('never'), option('always')], dependsOn: null },
  { code: 'HIST', type: 'multiple_choice', config: {}, options: [option('none'), option('stroke')], dependsOn: null },
  { code: 'PAIN', type: 'numeric_scale', config: { min: 1, max: 10 }, options: [], dependsOn: null },
  { code: 'HOURS', type: 'numeric_free', config: { min: 0, max: 24 }, options: [], dependsOn: null },
  { code: 'NOTES', type: 'open_text', config: { maxLength: 100 }, options: [], dependsOn: null },
]

describe('validateCondition', () => {
  it('T-HU006-05 a condition on a code that does not exist in the test is unknown_question', () => {
    expect(validateCondition({ questionCode: 'GHOST', op: 'eq', value: true }, questions)).toEqual({ ok: false, code: 'unknown_question' })
  })

  it('T-HU006-06 eq "Quizás" on a true_false question is invalid_value', () => {
    expect(validateCondition({ questionCode: 'SMOKE', op: 'eq', value: 'Quizás' }, questions)).toEqual({ ok: false, code: 'invalid_value' })
    expect(validateCondition({ questionCode: 'SMOKE', op: 'eq', value: true }, questions)).toEqual({ ok: true })
  })

  it('T-HU006-06 choice values must be options of the question', () => {
    expect(validateCondition({ questionCode: 'FREQ', op: 'eq', value: 'always' }, questions)).toEqual({ ok: true })
    expect(validateCondition({ questionCode: 'FREQ', op: 'in', value: ['never', 'always'] }, questions)).toEqual({ ok: true })
    expect(validateCondition({ questionCode: 'FREQ', op: 'in', value: ['never', 'sometimes'] }, questions)).toEqual({ ok: false, code: 'invalid_value' })
    expect(validateCondition({ questionCode: 'FREQ', op: 'in', value: [] }, questions)).toEqual({ ok: false, code: 'invalid_value' })
    expect(validateCondition({ questionCode: 'HIST', op: 'any_eq', value: 'stroke' }, questions)).toEqual({ ok: true })
    expect(validateCondition({ questionCode: 'HIST', op: 'any_eq', value: 'cancer' }, questions)).toEqual({ ok: false, code: 'invalid_value' })
  })

  it('T-HU006-06 numbers must be inside the limits of the question', () => {
    expect(validateCondition({ questionCode: 'PAIN', op: 'eq', value: 7 }, questions)).toEqual({ ok: true })
    expect(validateCondition({ questionCode: 'PAIN', op: 'eq', value: 11 }, questions)).toEqual({ ok: false, code: 'invalid_value' })
    expect(validateCondition({ questionCode: 'HOURS', op: 'neq', value: '8' }, questions)).toEqual({ ok: false, code: 'invalid_value' })
  })

  it('HU006 each type accepts only its operators; free text cannot be a condition', () => {
    expect(validateCondition({ questionCode: 'SMOKE', op: 'any_eq', value: true }, questions)).toEqual({ ok: false, code: 'invalid_operator' })
    expect(validateCondition({ questionCode: 'FREQ', op: 'any_eq', value: 'never' }, questions)).toEqual({ ok: false, code: 'invalid_operator' })
    expect(validateCondition({ questionCode: 'NOTES', op: 'eq', value: 'x' }, questions)).toEqual({ ok: false, code: 'invalid_operator' })
  })

  it('HU006 CA-05/CA-06 conditionErrors puts each problem on its field, including self-reference and cycles', () => {
    expect(conditionErrors('FREQ', null, questions)).toEqual([])
    expect(conditionErrors('FREQ', { questionCode: 'FREQ', op: 'eq', value: 'never' }, questions))
      .toEqual([{ field: 'dependsOn.questionCode', code: 'self_reference' }])
    expect(conditionErrors('FREQ', { questionCode: 'SMOKE', op: 'eq', value: 'Quizás' }, questions))
      .toEqual([{ field: 'dependsOn.value', code: 'invalid_value' }])

    const chained = questions.map(item => (item.code === 'SMOKE' ? { ...item, dependsOn: { questionCode: 'FREQ', op: 'eq' as const, value: 'never' } } : item))
    expect(conditionErrors('FREQ', { questionCode: 'SMOKE', op: 'eq', value: true }, chained))
      .toEqual([{ field: 'dependsOn.questionCode', code: 'cycle' }])
  })
})
