import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import TestDetailPage from '~/pages/dashboard/tests/[id]/index.vue'

const TEST_ID = '10000000-0000-0000-0000-000000000001'

mockNuxtImport('useRoute', () => () => ({ params: { id: TEST_ID }, query: {}, path: `/dashboard/tests/${TEST_ID}`, name: 'dashboard-tests-id', meta: {} }))

let detail: Record<string, unknown>

describe('dashboard/tests/[id]', () => {
  beforeEach(() => {
    clearNuxtData()
    detail = {
      id: TEST_ID, code: 'T_ONE', title: { es: 'Test uno' }, description: null, status: 'draft', version: 1, created_at: '',
      sections: [{ id: 's1', test_id: TEST_ID, code: 'MOD_A', title: { es: 'Memoria' }, domain: 'cognition', position: 1, question_count: 3 }],
    }
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => detail)
  })

  it('HU004 shows the test header and its sections', async () => {
    const wrapper = await mountSuspended(TestDetailPage)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="section"]')).toHaveLength(1))

    expect(wrapper.text()).toContain('T_ONE')
    expect(wrapper.text()).toContain('Test uno')
    expect(wrapper.text()).not.toMatch(/tests\.(sections|admin)\./)
  })

  it('HU004 CA-05 a published test shows the locked notice and no edit controls', async () => {
    detail.status = 'published'
    const wrapper = await mountSuspended(TestDetailPage)
    await vi.waitFor(() => expect(wrapper.findAll('[data-test="section"]')).toHaveLength(1))

    expect(wrapper.find('[data-test="locked"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="edit"]').exists()).toBe(false)
  })

  it('HU004 a missing test shows an error', async () => {
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => {
      throw createError({ statusCode: 404 })
    })
    const wrapper = await mountSuspended(TestDetailPage)

    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
  })
})

describe('dashboard/tests/[id] · questions link', () => {
  it('HU005 the structure links to the questions of the test', async () => {
    clearNuxtData()
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => ({
      id: TEST_ID, code: 'T_ONE', title: { es: 'Test uno' }, description: null, status: 'draft', version: 1, created_at: '', sections: [],
    }))
    const wrapper = await mountSuspended(TestDetailPage)

    await vi.waitFor(() => expect(wrapper.find('[data-test="questions-link"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="questions-link"]').attributes('href')).toMatch(new RegExp(`/dashboard/tests/${TEST_ID}/preguntas$`))
  })
})

describe('dashboard/tests/[id] · publish (HU007)', () => {
  const question = (sectionId: string, code: string) => ({
    id: `id-${code}`, test_id: TEST_ID, section_id: sectionId, code, prompt: { es: code }, type: 'open_text', config: { maxLength: 100 },
    required: true, allows_decline: false, position: 1, variable: null, direction: 'neutral', weight: null, source: null,
    conversational_hint: null, doc_ref: null, clinical_note: null, depends_on: null, active: true, options: [],
  })
  let published: number

  function setup(status: string, questions: unknown[]) {
    clearNuxtData()
    published = 0
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => ({
      id: TEST_ID, code: 'T_ONE', title: { es: 'Test uno' }, description: null, status, version: 1, created_at: '',
      sections: [{ id: 's1', test_id: TEST_ID, code: 'MOD_A', title: { es: 'Memoria' }, domain: 'cognition', position: 1, question_count: questions.length }],
    }))
    registerEndpoint(`/api/admin/tests/${TEST_ID}/questions`, () => questions)
    registerEndpoint(`/api/admin/tests/${TEST_ID}/publish`, { method: 'POST', handler: () => (published++, { id: TEST_ID, status: 'published' }) })
  }

  it('T-HU007-01 CA-01 publishing a test with an empty section shows the errors by section and does not publish', async () => {
    setup('draft', [])
    const wrapper = await mountSuspended(TestDetailPage)
    await vi.waitFor(() => expect(wrapper.find('[data-test="publish"]').exists()).toBe(true))

    await wrapper.find('[data-test="publish"]').trigger('click')

    await vi.waitFor(() => expect(wrapper.find('[data-test="publish-errors"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="publish-errors"]').text()).toContain('MOD_A')
    expect(wrapper.find('[data-test="publish-errors"]').text()).not.toMatch(/tests\.publish\./)
    expect(published).toBe(0)
  })

  it('T-HU007-03 CA-02 a valid draft asks for confirmation and publishes', async () => {
    setup('draft', [question('s1', 'MEM_001')])
    const wrapper = await mountSuspended(TestDetailPage)
    await vi.waitFor(() => expect(wrapper.find('[data-test="publish"]').exists()).toBe(true))

    await wrapper.find('[data-test="publish"]').trigger('click')
    await vi.waitFor(() => expect(document.querySelector('[data-test="confirm-publish"]')).not.toBeNull())
    ;(document.querySelector('[data-test="confirm-publish"]') as HTMLButtonElement).click()

    await vi.waitFor(() => expect(published).toBe(1))
  })

  it('HU007 CA-03 a published test offers a new version instead of publishing', async () => {
    setup('published', [question('s1', 'MEM_001')])
    const wrapper = await mountSuspended(TestDetailPage)

    await vi.waitFor(() => expect(wrapper.find('[data-test="new-version"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="publish"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="archive"]').exists()).toBe(true)
  })
})

describe('dashboard/tests/[id] · import (HU008)', () => {
  function setup(status: string) {
    clearNuxtData()
    registerEndpoint(`/api/admin/tests/${TEST_ID}`, () => ({
      id: TEST_ID, code: 'T_ONE', title: { es: 'Test uno' }, description: null, status, version: 1, created_at: '', sections: [],
    }))
    registerEndpoint(`/api/admin/tests/${TEST_ID}/questions`, () => [])
  }

  it('T-HU008-08 CA-06 a draft offers the import; a published test does not', async () => {
    setup('draft')
    const draft = await mountSuspended(TestDetailPage)
    await vi.waitFor(() => expect(draft.find('[data-test="import-open"]').exists()).toBe(true))

    setup('published')
    const published = await mountSuspended(TestDetailPage)
    await vi.waitFor(() => expect(published.find('[data-test="new-version"]').exists()).toBe(true))
    expect(published.find('[data-test="import-open"]').exists()).toBe(false)
  })
})
