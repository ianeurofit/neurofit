import { describe, expect, it } from 'vitest'

describe('unit project', () => {
  it('TK-S1-08 runs in a node environment', () => {
    expect(typeof window).toBe('undefined')
    expect(1 + 1).toBe(2)
  })
})
