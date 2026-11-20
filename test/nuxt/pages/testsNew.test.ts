import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import NewTestPage from '~/pages/dashboard/tests/nuevo.vue'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

let postReply: () => unknown

async function fill(wrapper: Awaited<ReturnType<typeof mountSuspended>>, values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    await wrapper.find(`[name="${name}"]`).setValue(value)
  }
}

async function submit(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
  await wrapper.find('form').trigger('submit')
  await new Promise(resolve => setTimeout(resolve, 50))
}

describe('dashboard/tests/nuevo', () => {
  beforeEach(() => {
    navigateToMock.mockReset()
    postReply = () => ({ id: '3', code: 'NEW_1' })
    registerEndpoint('/api/admin/tests', { method: 'POST', handler: () => postReply() })
  })

  it('T-HU003-02 shows translated errors next to the invalid fields', async () => {
    const wrapper = await mountSuspended(NewTestPage)

    await fill(wrapper, { code: 'ab', titleEs: 'x' })
    await submit(wrapper)

    expect(wrapper.text()).not.toMatch(/errors\.test\./)
    expect(wrapper.find('[name="code"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('[name="titleEs"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.findAll('[id$="-error"]').length).toBeGreaterThanOrEqual(2)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('T-HU003-01 saves a valid test and returns to the list', async () => {
    const wrapper = await mountSuspended(NewTestPage)

    await fill(wrapper, { code: 'NEW_1', titleEs: 'Nuevo test' })
    await submit(wrapper)

    await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledWith(expect.stringMatching(/\/dashboard\/tests$/)))
  })

  it('T-HU003-04 CA-03 a repeated code shows the error next to the code field', async () => {
    postReply = () => {
      throw createError({ statusCode: 409, data: { errors: [{ field: 'code', code: 'code_taken' }] } })
    }
    const wrapper = await mountSuspended(NewTestPage)

    await fill(wrapper, { code: 'DRAFT_A', titleEs: 'Nuevo test' })
    await submit(wrapper)

    const codeInput = wrapper.find('[name="code"]')
    await vi.waitFor(() => expect(codeInput.attributes('aria-invalid')).toBe('true'))
    const errorId = codeInput.attributes('aria-describedby')!.split(' ').find(id => id.endsWith('-error'))!
    expect(wrapper.find(`#${errorId}`).text()).toMatch(/código|code/i)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('HU003 a server failure shows a general alert', async () => {
    postReply = () => {
      throw createError({ statusCode: 500 })
    }
    const wrapper = await mountSuspended(NewTestPage)

    await fill(wrapper, { code: 'NEW_2', titleEs: 'Nuevo test' })
    await submit(wrapper)

    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
  })
})
