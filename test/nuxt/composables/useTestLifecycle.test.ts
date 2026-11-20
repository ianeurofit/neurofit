import { beforeEach, describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

const TEST_ID = '10000000-0000-0000-0000-000000000001'
const base = `/api/admin/tests/${TEST_ID}`

const section = (id: string, code: string, position: number) =>
  ({ id, test_id: TEST_ID, code, title: { es: `Módulo ${code}` }, domain: 'memory', position, question_count: 0 })
const question = (id: string, sectionId: string, code: string, extra: Record<string, unknown> = {}) => ({
  id, test_id: TEST_ID, section_id: sectionId, code, prompt: { es: code }, type: 'true_false',
  config: { labels: { true: { es: 'Sí' }, false: { es: 'No' } } }, required: true, allows_decline: false, position: 1,
  variable: null, direction: 'neutral', weight: null, source: null, conversational_hint: null, doc_ref: null,
  clinical_note: null, depends_on: null, active: true, options: [], ...extra,
})

let detail: Record<string, unknown>
let questions: unknown[]
let calls: string[]
let publishReply: () => unknown

describe('useTestLifecycle', () => {
  beforeEach(() => {
    clearNuxtData()
    calls = []
    detail = { id: TEST_ID, code: 'T1', title: { es: 'Test' }, description: null, status: 'draft', version: 1, created_at: '', sections: [section('s1', 'MEM', 1), section('s2', 'SLP', 2)] }
    questions = [question('q1', 's1', 'MEM_001'), question('q2', 's2', 'SLP_001')]
    publishReply = () => ({ id: TEST_ID, status: 'published' })
    registerEndpoint(base, () => detail)
    registerEndpoint(`${base}/questions`, () => questions)
    registerEndpoint(`${base}/publish`, { method: 'POST', handler: () => (calls.push('publish'), publishReply()) })
    registerEndpoint(`${base}/new-version`, { method: 'POST', handler: () => (calls.push('new-version'), { id: 'v2', version: 2, status: 'draft' }) })
    registerEndpoint(`${base}/archive`, { method: 'POST', handler: () => (calls.push('archive'), { id: TEST_ID, status: 'archived' }) })
  })

  it('T-HU007-03 a valid draft has no errors and can be published', async () => {
    const lifecycle = useTestLifecycle(TEST_ID)
    await lifecycle.refresh()

    expect(lifecycle.errors.value).toEqual([])
    expect(lifecycle.canPublish.value).toBe(true)
    expect((await lifecycle.publish()).ok).toBe(true)
    expect(calls).toEqual(['publish'])
  })

  it('T-HU007-01 CA-01 an empty section is listed, grouped by section, and nothing is sent', async () => {
    questions = [question('q1', 's1', 'MEM_001', { config: { labels: { true: { es: 'Sí' } } } })]
    const lifecycle = useTestLifecycle(TEST_ID)
    await lifecycle.refresh()

    expect(lifecycle.groups.value.map(group => [group.sectionCode, group.errors.length])).toEqual([['MEM', 1], ['SLP', 1]])
    expect(lifecycle.groups.value.flatMap(group => group.errors.map(error => error.message)).every(text => !/(tests|errors)\./.test(text))).toBe(true)
    expect((await lifecycle.publish()).ok).toBe(false)
    expect(calls).toEqual([])
  })

  it('HU007 errors the server finds are shown too', async () => {
    publishReply = () => {
      throw createError({ statusCode: 422, data: { errors: [{ sectionCode: 'MEM', code: 'empty_section' }] } })
    }
    const lifecycle = useTestLifecycle(TEST_ID)
    await lifecycle.refresh()

    expect((await lifecycle.publish()).ok).toBe(false)
    expect(lifecycle.groups.value.map(group => group.sectionCode)).toEqual(['MEM'])
  })

  it('T-HU007-04 CA-03 a published test creates a new version and returns its id', async () => {
    detail.status = 'published'
    const lifecycle = useTestLifecycle(TEST_ID)
    await lifecycle.refresh()

    expect(lifecycle.canPublish.value).toBe(false)
    expect(lifecycle.canCreateVersion.value).toBe(true)
    expect(await lifecycle.newVersion()).toEqual({ ok: true, id: 'v2', version: 2 })
  })

  it('HU007 CA-05 a test can be archived once', async () => {
    const lifecycle = useTestLifecycle(TEST_ID)
    await lifecycle.refresh()

    expect(lifecycle.canArchive.value).toBe(true)
    expect((await lifecycle.archive()).ok).toBe(true)
    expect(calls).toEqual(['archive'])
  })
})
