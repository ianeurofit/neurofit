import { describe, expect, it } from 'vitest'
import { moveItem, nextPosition, reorder } from '../../../shared/utils/ordering'

const items = ['A', 'B', 'C', 'D'].map((code, index) => ({ code, position: index + 1 }))

describe('nextPosition', () => {
  it('T-HU004-01 is 1 for an empty list and max + 1 otherwise', () => {
    expect(nextPosition([])).toBe(1)
    expect(nextPosition([{ position: 1 }, { position: 2 }, { position: 3 }])).toBe(4)
  })

  it('T-HU004-01 uses the highest position even with gaps or unsorted input', () => {
    expect(nextPosition([{ position: 7 }, { position: 2 }])).toBe(8)
  })
})

describe('reorder', () => {
  it('T-HU004-03 moving item 0 to index 2 gives positions 1..4 in the new order', () => {
    const result = reorder(items, 0, 2)

    expect(result.map(item => item.code)).toEqual(['B', 'C', 'A', 'D'])
    expect(result.map(item => item.position)).toEqual([1, 2, 3, 4])
  })

  it('T-HU004-03 sorts by position first and closes gaps', () => {
    const shuffled = [{ code: 'X', position: 10 }, { code: 'Y', position: 3 }]

    expect(reorder(shuffled, 1, 0).map(item => `${item.code}${item.position}`)).toEqual(['X1', 'Y2'])
  })

  it('T-HU004-04 an index out of range leaves the list unchanged', () => {
    expect(reorder(items, 0, 4)).toEqual(items)
    expect(reorder(items, -1, 2)).toEqual(items)
    expect(reorder(items, 1.5, 2)).toEqual(items)
  })

  it('T-HU004-03 does not mutate the input', () => {
    const copy = structuredClone(items)
    reorder(items, 3, 0)
    expect(items).toEqual(copy)
  })
})

describe('moveItem', () => {
  it('T-HU004-03 up and down buttons move one step and stop at the edges', () => {
    expect(moveItem(items, 1, 'up').map(item => item.code)).toEqual(['B', 'A', 'C', 'D'])
    expect(moveItem(items, 1, 'down').map(item => item.code)).toEqual(['A', 'C', 'B', 'D'])
    expect(moveItem(items, 0, 'up')).toEqual(items)
    expect(moveItem(items, 3, 'down')).toEqual(items)
  })
})

describe('reorder · questions (HU006)', () => {
  it('T-HU006-09 reordering the questions of a section gives consecutive positions', () => {
    const questions = [
      { id: 'q1', code: 'MEM_001', section_id: 's1', position: 1 },
      { id: 'q2', code: 'MEM_002', section_id: 's1', position: 4 },
      { id: 'q3', code: 'MEM_003', section_id: 's1', position: 6 },
    ]
    const result = reorder(questions, 2, 0)

    expect(result.map(item => item.code)).toEqual(['MEM_003', 'MEM_001', 'MEM_002'])
    expect(result.map(item => item.position)).toEqual([1, 2, 3])
    expect(result.every(item => item.section_id === 's1')).toBe(true)
  })
})
