import { describe, expect, it } from 'vitest'
import { QUESTION_CODE_PATTERN, duplicateCode } from '../../../shared/utils/questions'

describe('duplicateCode', () => {
  it('T-HU006-03 skips the suffixes already taken', () => {
    expect(duplicateCode('MEM_001', ['MEM_001', 'MEM_001_COPY'])).toBe('MEM_001_COPY2')
  })

  it('T-HU006-03 starts with _COPY and keeps counting', () => {
    expect(duplicateCode('MEM_001', ['MEM_001'])).toBe('MEM_001_COPY')
    expect(duplicateCode('MEM_001', ['MEM_001', 'MEM_001_COPY', 'MEM_001_COPY2', 'MEM_001_COPY3'])).toBe('MEM_001_COPY4')
  })

  it('T-HU006-03 a long code is shortened so the copy still fits in 40 characters', () => {
    const long = 'A'.repeat(40)
    const copy = duplicateCode(long, [long])

    expect(copy).toMatch(QUESTION_CODE_PATTERN)
    expect(copy.endsWith('_COPY')).toBe(true)
  })
})
