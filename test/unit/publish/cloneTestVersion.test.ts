import { describe, expect, it } from 'vitest'
import { cloneTestVersion } from '../../../shared/utils/publish'
import { tree } from './fixtures'

describe('cloneTestVersion', () => {
  it('T-HU007-04 cloning v1 with conditions gives a v2 draft with the same codes and intact conditions', () => {
    const v1 = { ...tree(), status: 'published' as const }
    const v2 = cloneTestVersion(v1)

    expect(v2).toMatchObject({ code: 'TEST_1', version: 2, status: 'draft', parent_test_id: 't1' })
    expect(v2.id).toBeUndefined()
    expect(v2.sections.map(section => section.code)).toEqual(['MEM', 'SLP'])
    expect(v2.sections.flatMap(section => section.questions.map(item => item.code))).toEqual(['SMOKE', 'PACKS', 'SLP_001'])
    expect(v2.sections[0]!.questions[1]!.depends_on).toEqual({ questionCode: 'SMOKE', op: 'eq', value: true })
    expect(v2.sections[1]!.questions[0]!.options.map(option => option.score)).toEqual([0, 4])
  })

  it('T-HU007-04 the copy has no ids and does not share objects with the original', () => {
    const v1 = tree()
    const v2 = cloneTestVersion(v1)

    expect(v2.sections.every(section => section.id === undefined && section.questions.every(item => item.id === undefined))).toBe(true)
    v2.sections[0]!.questions[1]!.depends_on!.value = false
    v2.sections[1]!.questions[0]!.options[0]!.label.es = 'Cambiado'

    expect(v1.sections[0]!.questions[1]!.depends_on!.value).toBe(true)
    expect(v1.sections[1]!.questions[0]!.options[0]!.label.es).toBe('Nunca')
  })

  it('T-HU007-04 the new version follows the highest version of the code, even an archived draft', () => {
    expect(cloneTestVersion(tree(), 4).version).toBe(4)
    expect(cloneTestVersion(tree()).version).toBe(2)
  })

  it('HU007 toVersionPayload gives the rows create_test_version inserts', async () => {
    const { toVersionPayload } = await import('../../../shared/utils/publish')
    const payload = toVersionPayload(cloneTestVersion(tree()))

    expect(payload).toMatchObject({ code: 'TEST_1', version: 2, parent_test_id: 't1' })
    expect(payload.sections[1]!.questions[0]!.options).toEqual([
      { value: 'never', label: { es: 'Nunca' }, score: 0, is_exclusive: false },
      { value: 'always', label: { es: 'Siempre' }, score: 4, is_exclusive: false },
    ])
  })
})
