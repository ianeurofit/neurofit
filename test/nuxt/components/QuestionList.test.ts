import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import QuestionList from '~/components/admin/tests/QuestionList.vue'
import type { QuestionDetail } from '#shared/types/assessment'

const question = (id: string, code: string, position: number, extra: Partial<QuestionDetail> = {}): QuestionDetail => ({
  id, test_id: 't1', section_id: 's1', code, prompt: { es: `Texto ${code}` }, type: 'open_text', config: { maxLength: 100 },
  required: true, allows_decline: false, position, variable: null, direction: 'neutral', weight: null, source: null,
  conversational_hint: null, doc_ref: null, clinical_note: null, depends_on: null, active: true, options: [], ...extra,
})

const questions = [
  question('q1', 'MEM_001', 1),
  question('q2', 'MEM_002', 2, { active: false, depends_on: { questionCode: 'MEM_001', op: 'eq', value: 'x' } }),
  question('q3', 'MEM_003', 3),
]

function mount(props: Record<string, unknown> = {}) {
  return mountSuspended(QuestionList, { props: { questions, editable: true, pending: false, error: false, ...props } })
}

describe('QuestionList', () => {
  it('HU006 shows loading, error and empty states', async () => {
    expect((await mount({ pending: true })).find('[data-test="questions-loading"]').exists()).toBe(true)

    const failed = await mount({ error: true })
    expect(failed.find('[role="alert"]').exists()).toBe(true)

    const empty = await mount({ questions: [] })
    expect(empty.find('[data-test="questions-empty"]').exists()).toBe(true)
  })

  it('HU006 every row offers edit, duplicate, activate/deactivate and move, all translated', async () => {
    const wrapper = await mount()

    expect(wrapper.findAll('[data-test="question"]')).toHaveLength(3)
    for (const action of ['edit-question', 'duplicate-question', 'toggle-question', 'move-up', 'move-down']) {
      expect(wrapper.findAll(`[data-test="${action}"]`), action).toHaveLength(3)
    }
    expect(wrapper.text()).not.toMatch(/(tests\.questions|errors\.condition)\.[a-z]/)
  })

  it('T-HU006-04 an inactive question is marked and its condition is shown', async () => {
    const wrapper = await mount()
    const row = wrapper.findAll('[data-test="question"]')[1]!

    expect(row.find('[data-test="inactive"]').exists()).toBe(true)
    expect(row.find('[data-test="condition"]').text()).toContain('MEM_001')
    expect(wrapper.findAll('[data-test="inactive"]')).toHaveLength(1)
  })

  it('HU006 the actions emit their events; the ends cannot move further', async () => {
    const wrapper = await mount()
    const rows = wrapper.findAll('[data-test="question"]')

    await rows[1]!.find('[data-test="duplicate-question"]').trigger('click')
    await rows[1]!.find('[data-test="toggle-question"]').trigger('click')
    await rows[1]!.find('[data-test="move-up"]').trigger('click')
    await rows[0]!.find('[data-test="edit-question"]').trigger('click')

    expect(wrapper.emitted('duplicate')![0]).toEqual([questions[1]])
    expect(wrapper.emitted('toggle')![0]).toEqual([questions[1]])
    expect(wrapper.emitted('move')![0]).toEqual([1, 0])
    expect(wrapper.emitted('edit')![0]).toEqual([questions[0]])
    expect(rows[0]!.find('[data-test="move-up"]').attributes('disabled')).toBeDefined()
    expect(rows[2]!.find('[data-test="move-down"]').attributes('disabled')).toBeDefined()
  })

  it('HU004 CA-05 a locked test shows no actions and cannot be dragged', async () => {
    const wrapper = await mount({ editable: false })

    expect(wrapper.find('[data-test="edit-question"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="move-up"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="question"]').attributes('draggable')).toBe('false')
  })
})
