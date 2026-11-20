import { beforeEach, describe, expect, it } from 'vitest'
import { getQuery, readBody } from 'h3'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

const TEST_ID = '10000000-0000-0000-0000-000000000001'
const preview = (errors: unknown[] = []) => ({
  total: 2, sections: [{ code: 'MEM', title: 'Memoria', count: 2 }], byType: { single_choice: 2 }, errors,
})
const plan = { sections: { create: 1, update: 0, unchanged: 0 }, questions: { create: 2, update: 0, unchanged: 0, untouched: 0 } }

let calls: Array<{ dryRun: boolean, markdown: string }>
let reply: (dryRun: boolean) => unknown

const md = '## Módulo 1 · Memoria (`MEM`)\n| ID | Ref | Pregunta | Tipo |\n|---|---|---|---|\n| MEM_001 | P4 | ¿Olvidas? | F5 |'
const file = (content = md, name = 'test-1.md') => new File([content], name, { type: 'text/markdown' })

describe('useTestImport', () => {
  beforeEach(() => {
    calls = []
    reply = dryRun => ({ dryRun, imported: !dryRun, preview: preview(), plan })
    registerEndpoint(`/api/admin/tests/${TEST_ID}/import`, {
      method: 'POST',
      handler: async (event) => {
        const dryRun = getQuery(event).dryRun === 'true'
        calls.push({ dryRun, markdown: (await readBody(event)).markdown })
        return reply(dryRun)
      },
    })
  })

  it('T-HU008-02 loading a file shows its preview without importing anything', async () => {
    const importer = useTestImport(TEST_ID)
    expect(importer.state.value).toBe('empty')

    await importer.load(file())

    expect(importer.state.value).toBe('ready')
    expect(calls).toEqual([{ dryRun: true, markdown: md }])
    expect(importer.preview.value!.total).toBe(2)
    expect(importer.canConfirm.value).toBe(true)
  })

  it('T-HU008-04 CA-03 a preview with errors cannot be confirmed and shows translated messages with their line', async () => {
    reply = dryRun => ({ dryRun, imported: false, preview: preview([{ line: 12, questionCode: 'SLP_001', code: 'unsupported_type' }]), plan: null })
    const importer = useTestImport(TEST_ID)

    await importer.load(file())

    expect(importer.canConfirm.value).toBe(false)
    expect(importer.errors.value).toEqual([{ line: 12, questionCode: 'SLP_001', code: 'unsupported_type', message: expect.not.stringMatching(/tests\.import\./) }])
    expect((await importer.confirm()).ok).toBe(false)
    expect(calls).toHaveLength(1)
  })

  it('HU008 confirming imports the same content once', async () => {
    const importer = useTestImport(TEST_ID)
    await importer.load(file())

    const result = await importer.confirm()

    expect(result.ok).toBe(true)
    expect(calls.map(call => call.dryRun)).toEqual([true, false])
    expect(calls[1]!.markdown).toBe(md)
    expect(importer.state.value).toBe('done')
  })

  it('HU008 an empty file or one that is not Markdown is refused before calling the server', async () => {
    const importer = useTestImport(TEST_ID)

    await importer.load(file('   '))
    expect(importer.general.value).toBe('empty_file')

    await importer.load(file(md, 'datos.xlsx'))
    expect(importer.general.value).toBe('not_markdown')
    expect(calls).toHaveLength(0)
  })

  it('HU008 a server failure leaves the error state', async () => {
    reply = () => {
      throw createError({ statusCode: 409, data: { code: 'new_version_required' } })
    }
    const importer = useTestImport(TEST_ID)

    await importer.load(file())

    expect(importer.state.value).toBe('error')
    expect(importer.general.value).toBe('new_version_required')
  })
})
