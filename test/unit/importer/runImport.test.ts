import { describe, expect, it, vi } from 'vitest'
import { parseTestMarkdown, runImport } from '../../../shared/utils/importer'
import { scales, twoModules } from './fixtures'

describe('runImport', () => {
  it('T-HU008-04 an import with one error calls no write at all', async () => {
    const write = vi.fn()
    const broken = twoModules.replace('| SN |', '| XYZ |')

    const result = await runImport(parseTestMarkdown(broken, { scales }), { questions: [], sections: [] }, write)

    expect(result.ok).toBe(false)
    expect(result.preview.errors.map(error => error.code)).toEqual(['unsupported_type'])
    expect(write).not.toHaveBeenCalled()
  })

  it('T-HU008-04 a valid import writes the whole plan in one call', async () => {
    const write = vi.fn().mockResolvedValue(undefined)

    const result = await runImport(parseTestMarkdown(twoModules, { scales }), { questions: [], sections: [] }, write)

    expect(result.ok).toBe(true)
    expect(write).toHaveBeenCalledTimes(1)
    expect(write.mock.calls[0]![0].questions.create).toHaveLength(5)
  })

  it('T-HU008-05 with nothing to change no write is made', async () => {
    const write = vi.fn()
    const { test } = parseTestMarkdown(twoModules, { scales })
    const { toExistingQuestion } = await import('../../../shared/utils/importer')
    const questions = test.sections.flatMap(section => section.questions.map((question, index) =>
      toExistingQuestion({ id: question.code, sectionCode: section.code, position: index + 1, ...question })))

    const result = await runImport({ test, errors: [] }, { questions, sections: [{ code: 'MEM', title: 'Memoria' }, { code: 'SLP', title: 'Sueño' }] }, write)

    expect(result.ok).toBe(true)
    expect(write).not.toHaveBeenCalled()
  })
})
