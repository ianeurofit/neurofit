import { describe, expect, it } from 'vitest'
import { planDeleteSection } from '../../../shared/utils/tests'

describe('planDeleteSection', () => {
  it('T-HU004-05 a section with 5 questions needs confirmation', () => {
    expect(planDeleteSection(5, false)).toEqual({ needsConfirm: true, questionCount: 5 })
  })

  it('T-HU004-05 with confirmation it can be deleted', () => {
    expect(planDeleteSection(5, true)).toEqual({ needsConfirm: false, questionCount: 5 })
  })

  it('T-HU004-05 an empty section is deleted without confirmation', () => {
    expect(planDeleteSection(0, false)).toEqual({ needsConfirm: false, questionCount: 0 })
  })
})
