import { beforeEach, describe, expect, it } from 'vitest'
import { readBody } from 'h3'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

const TEST_ID = '10000000-0000-0000-0000-000000000001'
const SECTION_ID = '30000000-0000-0000-0000-000000000001'
const base = `/api/admin/tests/${TEST_ID}/questions`

const stored = (id: string, code: string, position: number, extra: Record<string, unknown> = {}) => ({
  id, test_id: TEST_ID, section_id: SECTION_ID, code, prompt: { es: `Pregunta ${code}` }, type: 'open_text',
  config: { maxLength: 1000 }, required: true, allows_decline: false, position, variable: null, direction: 'neutral',
  weight: null, source: null, conversational_hint: null, doc_ref: null, clinical_note: null, depends_on: null, active: true, options: [], ...extra,
})

let list: unknown[]
let calls: Array<{ method: string, body: Record<string, unknown> }> = []
let fail: null | (() => never) = null

describe('useQuestionEditor', () => {
  beforeEach(() => {
    clearNuxtData()
    calls = []
    fail = null
    list = [stored('q1', 'OPEN_001', 1)]
    registerEndpoint(base, { method: 'GET', handler: () => list })
    registerEndpoint(base, {
      method: 'POST',
      handler: async (event) => {
        if (fail) fail()
        const body = await readBody(event)
        calls.push({ method: 'POST', body })
        return stored('q2', body.code, 2, { prompt: body.prompt, type: body.type, config: body.config, options: body.options })
      },
    })
    registerEndpoint(`${base}/q1`, {
      method: 'PATCH',
      handler: async (event) => {
        const body = await readBody(event)
        calls.push({ method: 'PATCH', body })
        return stored('q1', body.code, 1, { prompt: body.prompt })
      },
    })
  })

  it('T-HU005-11 a successful save() shows the new question in the preview without reloading', async () => {
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()
    expect(editor.preview.value.map(question => question.code)).toEqual(['OPEN_001'])

    editor.startNew(SECTION_ID)
    editor.setType('true_false')
    Object.assign(editor.draft, { code: 'sn_001', promptEs: '¿Fumas?' })
    list = []

    const result = await editor.save()

    expect(result.ok).toBe(true)
    expect(calls[0]).toMatchObject({
      method: 'POST',
      body: { sectionId: SECTION_ID, code: 'SN_001', prompt: { es: '¿Fumas?' }, type: 'true_false', required: true },
    })
    expect(editor.preview.value.map(question => question.code)).toEqual(['OPEN_001', 'SN_001'])
  })

  it('HU005 CA-08 an invalid draft shows every error and is not sent', async () => {
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    editor.startNew(SECTION_ID)
    editor.setType('numeric_scale')
    Object.assign(editor.draft, { code: '', promptEs: '', config: { min: 10, max: 1 } })

    const result = await editor.save()

    expect(result.ok).toBe(false)
    expect(calls).toHaveLength(0)
    expect(editor.errors.value.map(error => `${error.field}:${error.code}`)).toEqual(['code:required', 'prompt:required', 'config.max:min_gte_max'])
    expect(editor.formErrors.value.map(error => error.name)).toEqual(['code', 'promptEs', 'config.max'])
    expect(editor.formErrors.value.every(error => !/errors\.question\./.test(error.message))).toBe(true)
  })

  it('HU005 CA-02 a code taken in the test comes back on the code field', async () => {
    fail = () => {
      throw createError({ statusCode: 409, data: { errors: [{ field: 'code', code: 'question_code_taken' }] } })
    }
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    editor.startNew(SECTION_ID)
    editor.setType('open_text')
    Object.assign(editor.draft, { code: 'OPEN_001', promptEs: 'Repetida' })

    expect((await editor.save()).ok).toBe(false)
    expect(editor.errors.value).toEqual([{ field: 'code', code: 'question_code_taken' }])
    expect(editor.preview.value).toHaveLength(1)
  })

  it('HU005 editing sends a PATCH and replaces the question in the preview', async () => {
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    editor.startEdit(editor.preview.value[0]!)
    expect(editor.draft.code).toBe('OPEN_001')
    editor.draft.promptEs = 'Texto nuevo'

    expect((await editor.save()).ok).toBe(true)
    expect(calls[0]!.method).toBe('PATCH')
    expect(editor.preview.value.map(question => question.prompt.es)).toEqual(['Texto nuevo'])
  })

  it('HU005 changing the type resets its configuration to the defaults', () => {
    const editor = useQuestionEditor(TEST_ID)
    editor.startNew(SECTION_ID)

    editor.setType('agreement')
    expect((editor.draft.config.labels as unknown[]).length).toBe(5)

    editor.setType('open_text')
    expect(editor.draft.config).toEqual({ maxLength: 1000 })
    expect(editor.draft.options).toEqual([])
  })
})

describe('useQuestionEditor · HU006 actions', () => {
  let actions: Array<{ method: string, path: string, body?: unknown }>
  let failOrder: boolean

  beforeEach(() => {
    clearNuxtData()
    actions = []
    failOrder = false
    list = [stored('q1', 'MEM_001', 1), stored('q2', 'MEM_002', 2), stored('q3', 'MEM_003', 3)]
    registerEndpoint(base, { method: 'GET', handler: () => list })
    registerEndpoint('/api/admin/questions/q1/duplicate', {
      method: 'POST',
      handler: (event) => {
        actions.push({ method: 'POST', path: event.path })
        return stored('q9', 'MEM_001_COPY', 4)
      },
    })
    registerEndpoint('/api/admin/questions/q2', {
      method: 'PATCH',
      handler: async (event) => {
        const body = await readBody(event)
        actions.push({ method: 'PATCH', path: event.path, body })
        return stored('q2', 'MEM_002', 2, body)
      },
    })
    registerEndpoint(`/api/admin/sections/${SECTION_ID}/questions/order`, {
      method: 'PATCH',
      handler: async (event) => {
        if (failOrder) throw createError({ statusCode: 500 })
        actions.push({ method: 'PATCH', path: event.path, body: await readBody(event) })
        return null
      },
    })
  })

  it('T-HU006-03 duplicate adds the copy to the preview at the end of its section', async () => {
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    const result = await editor.duplicate(editor.preview.value[0]!)

    expect(result.ok).toBe(true)
    expect(actions[0]!.method).toBe('POST')
    expect(editor.preview.value.map(question => question.code)).toEqual(['MEM_001', 'MEM_002', 'MEM_003', 'MEM_001_COPY'])
  })

  it('T-HU006-04 deactivating sends active: false and keeps the question in the list', async () => {
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    await editor.toggleActive(editor.preview.value[1]!)

    expect(actions[0]).toMatchObject({ method: 'PATCH', body: { active: false } })
    expect(editor.preview.value.find(question => question.id === 'q2')!.active).toBe(false)
    expect(editor.preview.value).toHaveLength(3)
  })

  it('T-HU006-09 move reorders the section with consecutive positions and saves every id', async () => {
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    expect((await editor.move(SECTION_ID, 2, 0)).ok).toBe(true)

    expect(editor.preview.value.map(question => `${question.code}:${question.position}`)).toEqual(['MEM_003:1', 'MEM_001:2', 'MEM_002:3'])
    expect(actions[0]).toMatchObject({ method: 'PATCH', body: { ids: ['q3', 'q1', 'q2'] } })
  })

  it('HU006 CA-07 a failed move goes back to the previous order', async () => {
    failOrder = true
    const editor = useQuestionEditor(TEST_ID)
    await editor.refresh()

    expect((await editor.move(SECTION_ID, 0, 1)).ok).toBe(false)
    expect(editor.preview.value.map(question => question.code)).toEqual(['MEM_001', 'MEM_002', 'MEM_003'])
  })
})
