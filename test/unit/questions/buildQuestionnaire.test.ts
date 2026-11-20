import { describe, expect, it } from 'vitest'
import { buildQuestionnaire } from '../../../shared/utils/questions'

const question = (code: string, position: number, active = true, sectionPosition = 1) => ({ code, position, active, sectionPosition })

describe('buildQuestionnaire', () => {
  it('T-HU006-04 an inactive question among three leaves two, in order', () => {
    const result = buildQuestionnaire([question('C', 3), question('B', 2, false), question('A', 1)])

    expect(result.map(item => item.code)).toEqual(['A', 'C'])
  })

  it('T-HU006-04 orders by section first, then by position, without changing the input', () => {
    const input = [question('S2_Q1', 1, true, 2), question('S1_Q2', 2), question('S1_Q1', 1)]

    expect(buildQuestionnaire(input).map(item => item.code)).toEqual(['S1_Q1', 'S1_Q2', 'S2_Q1'])
    expect(input[0]!.code).toBe('S2_Q1')
  })
})
