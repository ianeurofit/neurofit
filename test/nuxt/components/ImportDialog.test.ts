import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import ImportDialog from '~/components/admin/tests/ImportDialog.vue'

const TEST_ID = '10000000-0000-0000-0000-000000000001'
const md = '## Módulo 1 · Memoria (`MEM`)'
const file = new File([md], 'test-1.md', { type: 'text/markdown' })

let reply: (dryRun: boolean) => unknown
const preview = (errors: unknown[] = []) => ({
  total: 3, sections: [{ code: 'MEM', title: 'Memoria', count: 3 }], byType: { single_choice: 2, open_text: 1 }, errors,
})
const plan = { sections: { create: 1, update: 0, unchanged: 0 }, questions: { create: 3, update: 0, unchanged: 0, untouched: 0 } }

const body = () => document.body.querySelector('[data-test="import-dialog"]')
type Vm = { loadFile: (file: File) => Promise<void> }

describe('ImportDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    reply = dryRun => ({ dryRun, imported: !dryRun, preview: preview(), plan })
    registerEndpoint(`/api/admin/tests/${TEST_ID}/import`, { method: 'POST', handler: event => reply(event.path.includes('dryRun=true')) })
  })

  it('HU008 starts with the empty state and translated texts', async () => {
    await mountSuspended(ImportDialog, { props: { testId: TEST_ID, open: true } })

    await vi.waitFor(() => expect(body()?.querySelector('[data-test="import-empty"]')).not.toBeNull())
    expect(body()!.textContent).not.toMatch(/tests\.import\./)
  })

  it('T-HU008-03 the preview shows the counts by section and by type and allows confirming', async () => {
    const wrapper = await mountSuspended(ImportDialog, { props: { testId: TEST_ID, open: true } })
    await (wrapper.vm as unknown as Vm).loadFile(file)

    await vi.waitFor(() => expect(body()?.querySelector('[data-test="import-preview"]')).not.toBeNull())
    expect(body()!.querySelector('[data-test="import-preview"]')!.textContent).toContain('MEM')
    expect(body()!.querySelectorAll('[data-test="import-type"]')).toHaveLength(2)
    expect((document.body.querySelector('[data-test="import-confirm"]')! as HTMLButtonElement).disabled).toBe(false)
  })

  it('T-HU008-02 CA-03 errors are listed with their line and the import cannot be confirmed', async () => {
    reply = dryRun => ({ dryRun, imported: false, preview: preview([{ line: 12, questionCode: 'SLP_001', code: 'unsupported_type' }]), plan: null })
    const wrapper = await mountSuspended(ImportDialog, { props: { testId: TEST_ID, open: true } })
    await (wrapper.vm as unknown as Vm).loadFile(file)

    await vi.waitFor(() => expect(body()?.querySelector('[data-test="import-errors"]')).not.toBeNull())
    expect(body()!.querySelector('[data-test="import-errors"]')!.textContent).toMatch(/12/)
    expect(body()!.querySelector('[data-test="import-errors"]')!.textContent).toContain('SLP_001')
    expect((document.body.querySelector('[data-test="import-confirm"]')! as HTMLButtonElement).disabled).toBe(true)
  })

  it('HU008 a failed request shows the error state', async () => {
    reply = () => {
      throw createError({ statusCode: 500 })
    }
    const wrapper = await mountSuspended(ImportDialog, { props: { testId: TEST_ID, open: true } })
    await (wrapper.vm as unknown as Vm).loadFile(file)

    await vi.waitFor(() => expect(body()?.querySelector('[role="alert"]')).not.toBeNull())
  })

  it('HU008 confirming imports and tells the page', async () => {
    const wrapper = await mountSuspended(ImportDialog, { props: { testId: TEST_ID, open: true } })
    await (wrapper.vm as unknown as Vm).loadFile(file)
    await vi.waitFor(() => expect(document.body.querySelector('[data-test="import-confirm"]')).not.toBeNull())

    ;(document.body.querySelector('[data-test="import-confirm"]')! as HTMLButtonElement).click()

    await vi.waitFor(() => expect(wrapper.emitted('imported')).toHaveLength(1))
  })
})
