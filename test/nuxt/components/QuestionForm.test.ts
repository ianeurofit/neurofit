import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import QuestionForm from '~/components/admin/tests/QuestionForm.vue'
import { QUESTION_TYPES, emptyQuestionForm } from '#shared/utils/questions'
import type { QuestionType, SectionSummary } from '#shared/types/assessment'

const SECTION_ID = '30000000-0000-0000-0000-000000000001'
const sections: SectionSummary[] = [
  { id: SECTION_ID, test_id: 't1', code: 'MEM', title: { es: 'Memoria' }, domain: 'memory', position: 1, question_count: 0 },
]

const targets = [
  { code: 'SMOKE', type: 'true_false' as const, config: {}, options: [], dependsOn: null },
  { code: 'FREQ', type: 'single_choice' as const, config: {}, options: [{ value: 'never', label: { es: 'Nunca' }, score: 0, isExclusive: false }, { value: 'always', label: { es: 'Siempre' }, score: 4, isExclusive: false }], dependsOn: null },
]

async function mountForm(type: QuestionType = 'open_text', props: Record<string, unknown> = {}) {
  const state = reactive({ ...emptyQuestionForm(SECTION_ID, type), code: 'Q_01', promptEs: '¿Pregunta?' })
  const wrapper = await mountSuspended(QuestionForm, { props: { state, sections, ...props } })
  return { wrapper, state }
}

async function submit(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
  await wrapper.find('form').trigger('submit')
  await new Promise(resolve => setTimeout(resolve, 50))
}

describe('QuestionForm', () => {
  beforeEach(() => {
    clearNuxtData()
    registerEndpoint('/api/admin/scales', () => [])
  })

  it('HU005 CA-01 shows code, prompt, type and required, with every text translated', async () => {
    const { wrapper } = await mountForm()

    for (const name of ['code', 'promptEs', 'promptEn']) expect(wrapper.find(`[name="${name}"]`).exists(), name).toBe(true)
    expect(wrapper.find('[data-test="type-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="required"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/(tests\.questions|errors\.question|scales)\.[a-z]/)
  })

  it('HU005 shows an empty state instead of the form when the test has no sections', async () => {
    const { wrapper } = await mountForm('open_text', { sections: [] })

    expect(wrapper.find('[data-test="no-sections"]').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('HU005 each type shows its own configuration subform', async () => {
    for (const type of QUESTION_TYPES) {
      const { wrapper } = await mountForm(type)
      const expected = type === 'single_choice' || type === 'multiple_choice' ? 'config-choice' : `config-${type}`
      expect(wrapper.find(`[data-test="${expected}"]`).exists(), type).toBe(true)
    }
  })

  it('T-HU005-07 the agreement subform shows its 5 editable labels', async () => {
    const { wrapper, state } = await mountForm('agreement')

    expect(wrapper.findAll('[data-test="agreement-label"]')).toHaveLength(5)
    await wrapper.find('[name="config.labels.0.es"]').setValue('Nada de acuerdo')
    expect((state.config.labels as Array<{ es: string }>)[0]!.es).toBe('Nada de acuerdo')
  })

  it('HU005 changing the type resets the configuration to its defaults', async () => {
    const { wrapper, state } = await mountForm('open_text')

    ;(wrapper.vm as unknown as { changeType: (type: QuestionType) => void }).changeType('numeric_scale')
    await nextTick()

    expect(state.config).toEqual({ min: 1, max: 10 })
    expect(wrapper.find('[data-test="config-numeric_scale"]').exists()).toBe(true)
  })

  it('T-HU005-06 CA-08 an invalid configuration shows its error next to the field and is not submitted', async () => {
    const { wrapper, state } = await mountForm('numeric_scale')
    state.config = { min: 10, max: 1 }
    await nextTick()

    await submit(wrapper)

    await vi.waitFor(() => expect(wrapper.find('[name="config.max"]').attributes('aria-invalid')).toBe('true'))
    expect(wrapper.text()).not.toMatch(/errors\.question\./)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('HU005 a valid question is submitted', async () => {
    const { wrapper } = await mountForm('true_false')

    await submit(wrapper)

    await vi.waitFor(() => expect(wrapper.emitted('submit')).toHaveLength(1))
  })
})

describe('QuestionForm · condition and active (HU006)', () => {
  beforeEach(() => {
    clearNuxtData()
    registerEndpoint('/api/admin/scales', () => [])
  })

  it('HU006 CA-04 the question can be deactivated from the form', async () => {
    const { wrapper } = await mountForm('open_text', { questions: targets })

    expect(wrapper.find('[data-test="active"]').exists()).toBe(true)
  })

  it('HU006 CA-05 without other questions the condition editor shows an empty state', async () => {
    const { wrapper } = await mountForm('open_text', { questions: [] })

    expect(wrapper.find('[data-test="condition-empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="condition-question"]').exists()).toBe(false)
  })

  it('HU006 CA-05 enabling the condition offers the other questions and the operators of its type', async () => {
    const { wrapper, state } = await mountForm('open_text', { questions: targets })
    const vm = wrapper.vm as unknown as { setConditionQuestion: (code: string) => void }

    await wrapper.find('[data-test="condition-toggle"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-test="condition-question"]').exists()).toBe(true)

    vm.setConditionQuestion('SMOKE')
    await nextTick()

    expect(state.dependsOn).toEqual({ questionCode: 'SMOKE', op: 'eq', value: true })
    expect(wrapper.find('[data-test="condition-op"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="condition-value"]').exists()).toBe(true)
  })

  it('T-HU006-06 an invalid condition value shows its error and is not submitted', async () => {
    const { wrapper, state } = await mountForm('open_text', { questions: targets })
    state.dependsOn = { questionCode: 'SMOKE', op: 'eq', value: 'Quizás' }
    await nextTick()

    await submit(wrapper)

    await vi.waitFor(() => expect(wrapper.find('[data-test="condition-error"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="condition-error"]').text()).not.toMatch(/errors\.condition\./)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('T-HU006-07 a condition that closes a cycle is refused', async () => {
    const chained = [{ ...targets[0]!, dependsOn: { questionCode: 'Q_01', op: 'eq' as const, value: 'x' } }]
    const { wrapper, state } = await mountForm('open_text', { questions: chained })
    state.dependsOn = { questionCode: 'SMOKE', op: 'eq', value: true }
    await nextTick()

    await submit(wrapper)

    await vi.waitFor(() => expect(wrapper.find('[data-test="condition-error"]').exists()).toBe(true))
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})
