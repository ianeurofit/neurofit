import { beforeEach, describe, expect, it } from 'vitest'
import { getQuery, readBody } from 'h3'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

const TEST_ID = '10000000-0000-0000-0000-000000000001'
const section = (id: string, code: string, position: number, questions = 0) =>
  ({ id, test_id: TEST_ID, code, title: { es: `Módulo ${code}` }, domain: 'cognition', position, question_count: questions })

let detail: Record<string, unknown>
let calls: Array<{ method: string, path: string, body?: unknown, query?: unknown }> = []
let failNext: null | (() => never) = null

function record(method: string) {
  return async (event: Parameters<typeof readBody>[0]) => {
    if (failNext) {
      const fail = failNext
      failNext = null
      fail()
    }
    calls.push({ method, path: event.path, body: method === 'DELETE' ? undefined : await readBody(event), query: getQuery(event) })
    return method === 'POST' ? section('s9', 'NEW', 3) : null
  }
}

describe('useTestSections', () => {
  beforeEach(() => {
    calls = []
    failNext = null
    clearNuxtData()
    detail = { id: TEST_ID, code: 'T1', title: { es: 'Test' }, status: 'draft', version: 1, sections: [section('s1', 'AA', 1), section('s2', 'BB', 2, 5)] }
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => detail)
    registerEndpoint(`/api/admin/tests/${TEST_ID}/sections`, { method: 'POST', handler: record('POST') })
    registerEndpoint(`/api/admin/tests/${TEST_ID}/sections/order`, { method: 'PATCH', handler: record('PATCH') })
    registerEndpoint(`/api/admin/tests/${TEST_ID}/sections/s1`, { method: 'PATCH', handler: record('PATCH') })
    registerEndpoint(`/api/admin/tests/${TEST_ID}/sections/s2`, { method: 'DELETE', handler: record('DELETE') })
  })

  it('HU004 loads the test with its sections in order and says it is editable', async () => {
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    expect(sections.sections.value.map(item => item.code)).toEqual(['AA', 'BB'])
    expect(sections.editable.value).toBe(true)
  })

  it('HU004 CA-05 a published test is not editable', async () => {
    detail.status = 'published'
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    expect(sections.editable.value).toBe(false)
  })

  it('T-HU004-01 add sends the localized input and does not call the server when invalid', async () => {
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    const invalid = await sections.save(null, { code: 'x', titleEs: '', titleEn: '', domain: '' })
    expect(invalid.ok).toBe(false)
    expect(calls).toHaveLength(0)

    const result = await sections.save(null, { code: 'new', titleEs: 'Nueva sección', titleEn: '', domain: 'sleep' })
    expect(result.ok).toBe(true)
    expect(calls[0]).toMatchObject({ method: 'POST', body: { code: 'NEW', title: { es: 'Nueva sección' }, domain: 'sleep' } })
  })

  it('HU004 edit sends a PATCH to the section', async () => {
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    await sections.save(sections.sections.value[0]!, { code: 'AA', titleEs: 'Otro título', titleEn: '', domain: 'cognition' })
    expect(calls[0]).toMatchObject({ method: 'PATCH', path: expect.stringContaining('/sections/s1') })
  })

  it('T-HU004-02 a repeated code comes back on the code field', async () => {
    failNext = () => {
      throw createError({ statusCode: 409, data: { errors: [{ field: 'code', code: 'section_code_taken' }] } })
    }
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    const result = await sections.save(null, { code: 'AA', titleEs: 'Repetida', titleEn: '', domain: 'cognition' })
    expect(result).toEqual({ ok: false, errors: [{ field: 'code', code: 'section_code_taken' }] })
  })

  it('T-HU004-03 move reorders locally with positions 1..n and saves the ids in the new order', async () => {
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    await sections.move(0, 1)

    expect(sections.sections.value.map(item => `${item.code}${item.position}`)).toEqual(['BB1', 'AA2'])
    expect(calls[0]).toMatchObject({ method: 'PATCH', body: { ids: ['s2', 's1'] } })
  })

  it('T-HU004-04 a move out of range does not call the server', async () => {
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    await sections.move(1, 2)
    expect(calls).toHaveLength(0)
  })

  it('T-HU004-05 remove asks for confirmation when the section has questions and sends confirm=true', async () => {
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    expect(sections.deletePlan(sections.sections.value[1]!)).toEqual({ needsConfirm: true, questionCount: 5 })
    const result = await sections.remove(sections.sections.value[1]!)
    expect(result.ok).toBe(true)
    expect(calls[0]).toMatchObject({ method: 'DELETE', query: { confirm: 'true' } })
  })

  it('HU004 CA-05 a frozen test returns new_version_required', async () => {
    failNext = () => {
      throw createError({ statusCode: 409, data: { code: 'new_version_required' } })
    }
    const sections = useTestSections(TEST_ID)
    await sections.refresh()

    const result = await sections.move(0, 1)
    expect(result).toEqual({ ok: false, errors: [], general: 'new_version_required' })
  })
})
