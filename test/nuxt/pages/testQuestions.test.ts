import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import TestQuestionsPage from '~/pages/dashboard/tests/[id]/preguntas.vue'

const TEST_ID = '10000000-0000-0000-0000-000000000001'

mockNuxtImport('useRoute', () => () => ({ params: { id: TEST_ID }, query: {}, path: `/dashboard/tests/${TEST_ID}/preguntas`, name: 'dashboard-tests-id-preguntas', meta: {} }))

const section = (id: string, code: string, position: number) =>
  ({ id, test_id: TEST_ID, code, title: { es: `Módulo ${code}` }, domain: 'cognition', position, question_count: 0 })

const question = (id: string, sectionId: string, code: string, type: string, extra: Record<string, unknown> = {}) => ({
  id, test_id: TEST_ID, section_id: sectionId, code, prompt: { es: `Texto ${code}` }, type, config: {}, required: true,
  allows_decline: false, position: 1, variable: null, direction: 'neutral', weight: null, source: null,
  conversational_hint: null, doc_ref: null, clinical_note: null, depends_on: null, active: true, options: [], ...extra,
})

let detail: Record<string, unknown>
let questions: () => unknown

describe('dashboard/tests/[id]/preguntas', () => {
  beforeEach(() => {
    clearNuxtData()
    detail = { id: TEST_ID, code: 'T_ONE', title: { es: 'Test uno' }, description: null, status: 'draft', version: 1, created_at: '', sections: [section('s1', 'MEM', 1), section('s2', 'SLP', 2)] }
    questions = () => [question('q1', 's1', 'MEM_001', 'single_choice', {
      options: [{ value: 'never', label: { es: 'Nunca' }, score: 0, isExclusive: false }, { value: 'always', label: { es: 'Siempre' }, score: 4, isExclusive: false }],
    })]
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => detail)
    registerEndpoint(`/api/admin/tests/${TEST_ID}/questions`, () => questions())
    registerEndpoint('/api/admin/scales', () => [])
  })

  it('T-HU005-11 CA-09 the preview shows the saved questions under their section', async () => {
    const wrapper = await mountSuspended(TestQuestionsPage)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="question"]')).toHaveLength(1))

    const sections = wrapper.findAll('[data-test="question-section"]')
    expect(sections).toHaveLength(2)
    expect(sections[0]!.text()).toContain('MEM_001')
    expect(sections[0]!.text()).toContain('Nunca')
    expect(sections[1]!.find('[data-test="questions-empty"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/(tests\.questions|errors\.question)\.[a-z]/)
  })

  it('HU005 shows a loading state while the questions are requested', async () => {
    questions = () => new Promise(() => {})
    const wrapper = await mountSuspended(TestQuestionsPage)

    expect(wrapper.find('[data-test="questions-loading"]').exists()).toBe(true)
  })

  it('HU005 shows an error with retry when the questions fail', async () => {
    questions = () => {
      throw createError({ statusCode: 500 })
    }
    const wrapper = await mountSuspended(TestQuestionsPage)

    await vi.waitFor(() => expect(wrapper.find('[data-test="questions-error"]').exists()).toBe(true))
  })

  it('HU005 a test without sections shows an empty state', async () => {
    detail.sections = []
    questions = () => []
    const wrapper = await mountSuspended(TestQuestionsPage)

    await vi.waitFor(() => expect(wrapper.find('[data-test="no-sections"]').exists()).toBe(true))
  })

  it('HU005 each section offers to add a question while the test is a draft', async () => {
    const wrapper = await mountSuspended(TestQuestionsPage)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="add-question"]')).toHaveLength(2))
    expect(wrapper.findAll('[data-test="edit-question"]')).toHaveLength(1)
  })

  it('HU004 CA-05 a published test shows the locked notice and no edit controls', async () => {
    detail.status = 'published'
    const wrapper = await mountSuspended(TestQuestionsPage)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="question"]')).toHaveLength(1))

    expect(wrapper.find('[data-test="locked"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="add-question"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="edit-question"]').exists()).toBe(false)
  })

  it('T-HU006-03 duplicating a row adds the copy under the same section', async () => {
    registerEndpoint('/api/admin/questions/q1/duplicate', { method: 'POST', handler: () => question('q9', 's1', 'MEM_001_COPY', 'single_choice', { position: 2 }) })
    const wrapper = await mountSuspended(TestQuestionsPage)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="question"]')).toHaveLength(1))

    await wrapper.find('[data-test="duplicate-question"]').trigger('click')

    await vi.waitFor(() => expect(wrapper.findAll('[data-test="question-section"]')[0]!.findAll('[data-test="question"]')).toHaveLength(2))
    expect(wrapper.findAll('[data-test="question-section"]')[0]!.text()).toContain('MEM_001_COPY')
  })
})
