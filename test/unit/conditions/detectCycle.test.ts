import { describe, expect, it } from 'vitest'
import { detectCycle } from '../../../shared/utils/conditions'

const on = (questionCode: string) => ({ questionCode, op: 'eq' as const, value: true })

describe('detectCycle', () => {
  it('T-HU006-07 A depends on B and B on A', () => {
    expect(detectCycle([{ code: 'A', dependsOn: on('B') }, { code: 'B', dependsOn: on('A') }])).toEqual(['A', 'B'])
  })

  it('T-HU006-08 a chain A → B → C has no cycle', () => {
    expect(detectCycle([{ code: 'A', dependsOn: on('B') }, { code: 'B', dependsOn: on('C') }, { code: 'C', dependsOn: null }])).toBeNull()
  })

  it('T-HU006-07 finds a longer cycle behind a chain and ignores unknown codes', () => {
    expect(detectCycle([
      { code: 'X', dependsOn: on('A') },
      { code: 'A', dependsOn: on('B') },
      { code: 'B', dependsOn: on('C') },
      { code: 'C', dependsOn: on('A') },
    ])).toEqual(['A', 'B', 'C'])
    expect(detectCycle([{ code: 'A', dependsOn: on('GHOST') }])).toBeNull()
    expect(detectCycle([{ code: 'A', dependsOn: on('A') }])).toEqual(['A'])
  })
})
