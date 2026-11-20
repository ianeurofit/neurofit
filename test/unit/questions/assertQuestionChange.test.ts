import { describe, expect, it } from 'vitest'
import { assertQuestionChange, diffQuestion } from '../../../shared/utils/questions'
import type { QuestionInput } from '../../../shared/utils/questions'

const question: QuestionInput = {
  code: 'MEM_001', prompt: { es: '¿Olvidas conversaciones?' }, type: 'single_choice', required: true, config: {},
  options: [
    { value: 'never', label: { es: 'Nunca' }, score: 0, isExclusive: false },
    { value: 'always', label: { es: 'Siempre' }, score: 4, isExclusive: false },
  ],
}

describe('assertQuestionChange', () => {
  it('T-HU006-01 changing the prompt of a question without answers is allowed', () => {
    expect(assertQuestionChange({ prompt: { es: 'Otro texto' } }, false)).toEqual({ ok: true })
  })

  it('T-HU006-02 changing the type of a question with answers needs a new version', () => {
    expect(assertQuestionChange({ type: 'multiple_choice' }, true)).toEqual({ ok: false, code: 'new_version_required' })
  })

  it('T-HU006-02 changing the options with answers also needs a new version; other fields do not', () => {
    expect(assertQuestionChange({ options: [] }, true)).toEqual({ ok: false, code: 'new_version_required' })
    expect(assertQuestionChange({ prompt: { es: 'Otro' }, active: false }, true)).toEqual({ ok: true })
    expect(assertQuestionChange({ type: 'open_text', options: [] }, false)).toEqual({ ok: true })
  })

  it('HU006 diffQuestion keeps only the fields that really change', () => {
    expect(diffQuestion(question, { ...question, prompt: { es: '¿Olvidas conversaciones?' } })).toEqual({})
    expect(diffQuestion(question, { ...question, active: false })).toEqual({ active: false })

    const options = question.options!.map(option => ({ ...option }))
    options[1]!.score = 3
    expect(Object.keys(diffQuestion(question, { ...question, options }))).toEqual(['options'])
  })
})
