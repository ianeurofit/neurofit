import { describe, expect, it } from 'vitest'
import { validateForPublish } from '../../../shared/utils/publish'
import { question, tree } from './fixtures'

describe('validateForPublish', () => {
  it('T-HU007-01 a section without active questions has an empty_section error with its code', () => {
    const test = tree()
    test.sections[1]!.questions = test.sections[1]!.questions.map(item => ({ ...item, active: false }))

    expect(validateForPublish(test)).toEqual([{ sectionCode: 'SLP', code: 'empty_section' }])
  })

  it('T-HU007-01 a test without sections cannot be published', () => {
    expect(validateForPublish(tree({ sections: [] }))).toEqual([{ code: 'no_sections' }])
  })

  it('T-HU007-02 a test with 2 different problems returns 2 errors', () => {
    const test = tree()
    test.sections[0]!.questions[1] = question('PACKS', 2, { type: 'numeric_free', config: { min: 10, max: 1 } })
    test.sections[1]!.questions = []

    expect(validateForPublish(test)).toEqual([
      { sectionCode: 'MEM', questionCode: 'PACKS', field: 'config.max', code: 'min_gt_max' },
      { sectionCode: 'SLP', code: 'empty_section' },
    ])
  })

  it('T-HU007-02 invalid conditions are reported, also when they point to an inactive question', () => {
    const test = tree()
    test.sections[0]!.questions[1] = { ...test.sections[0]!.questions[1]!, depends_on: { questionCode: 'SMOKE', op: 'eq', value: 'Quizás' } }
    test.sections[1]!.questions.push(question('SLP_002', 2, { section_id: 's2', depends_on: { questionCode: 'OFF', op: 'eq', value: true } }))
    test.sections[1]!.questions.push(question('OFF', 3, { section_id: 's2', active: false }))

    expect(validateForPublish(test)).toEqual([
      { sectionCode: 'MEM', questionCode: 'PACKS', field: 'dependsOn.value', code: 'invalid_value' },
      { sectionCode: 'SLP', questionCode: 'SLP_002', field: 'dependsOn.questionCode', code: 'inactive_dependency' },
    ])
  })

  it('T-HU007-03 a valid test has no errors; inactive questions are not checked', () => {
    const test = tree()
    test.sections[1]!.questions.push(question('BROKEN', 2, { section_id: 's2', active: false, type: 'numeric_scale', config: { min: 9, max: 1 } }))

    expect(validateForPublish(test)).toEqual([])
  })
})
