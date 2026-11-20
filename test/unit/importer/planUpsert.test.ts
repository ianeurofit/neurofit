import { describe, expect, it } from 'vitest'
import { parseTestMarkdown, planUpsert, toExistingQuestion } from '../../../shared/utils/importer'
import type { ExistingQuestion, TestImport } from '../../../shared/utils/importer'
import { scales, twoModules } from './fixtures'

/** What the database would hold after importing `test`. */
function stored(test: TestImport): ExistingQuestion[] {
  return test.sections.flatMap(section => section.questions.map((question, index) => toExistingQuestion({
    id: `id-${question.code}`, sectionCode: section.code, position: index + 1, ...question,
  })))
}

describe('planUpsert', () => {
  it('T-HU008-05 reimporting the same file leaves everything unchanged', () => {
    const { test } = parseTestMarkdown(twoModules, { scales })
    const plan = planUpsert(stored(test), [{ code: 'MEM', title: 'Memoria' }, { code: 'SLP', title: 'Sueño' }], test)

    expect(plan.questions.create).toEqual([])
    expect(plan.questions.update).toEqual([])
    expect(plan.questions.unchanged).toHaveLength(5)
    expect(plan.sections).toEqual({ create: [], update: [], unchanged: ['MEM', 'SLP'] })
  })

  it('T-HU008-06 a changed text and a new question give 1 update and 1 create', () => {
    const before = parseTestMarkdown(twoModules, { scales }).test
    const changed = twoModules
      .replace('¿Roncas?', '¿Roncas por la noche?')
      .concat('\n| SLP_003 | P56 | ¿Te despiertas de noche? | F5 |')
    const after = parseTestMarkdown(changed, { scales }).test

    const plan = planUpsert(stored(before), [{ code: 'MEM', title: 'Memoria' }, { code: 'SLP', title: 'Sueño' }], after)

    expect(plan.questions.update.map(item => item.code)).toEqual(['SLP_001'])
    expect(plan.questions.update[0]!.id).toBe('id-SLP_001')
    expect(plan.questions.create.map(item => item.code)).toEqual(['SLP_003'])
    expect(plan.questions.unchanged).toHaveLength(4)
  })

  it('HU008 new sections are created and questions not in the file are left alone', () => {
    const { test } = parseTestMarkdown(twoModules, { scales })
    const extra = { ...stored(test)[0]!, id: 'id-OLD', code: 'OLD_001' }

    const plan = planUpsert([extra], [{ code: 'MEM', title: 'Memoria antigua' }], test)

    expect(plan.sections).toEqual({ create: ['SLP'], update: ['MEM'], unchanged: [] })
    expect(plan.questions.create).toHaveLength(5)
    expect(plan.questions.untouched).toEqual(['OLD_001'])
  })
})
