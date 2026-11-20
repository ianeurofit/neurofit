import { beforeEach, describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { readBody } from 'h3'

const tests = [
  { id: '1', code: 'DRAFT_A', title: { es: 'Borrador' }, description: null, version: 1, status: 'draft', created_at: '2026-11-20T10:00:00Z' },
  { id: '2', code: 'PUB_B', title: { es: 'Publicado' }, description: null, version: 2, status: 'published', created_at: '2026-11-19T10:00:00Z' },
]

let created: unknown[] = []
let postReply: () => unknown = () => ({ ...tests[0], id: '3' })

describe('useAdminTests', () => {
  beforeEach(() => {
    created = []
    clearNuxtData()
    postReply = () => ({ ...tests[0], id: '3' })
    registerEndpoint('/api/admin/tests', { method: 'GET', handler: () => tests })
    registerEndpoint('/api/admin/tests', {
      method: 'POST',
      handler: async (event) => {
        created.push(await readBody(event))
        return postReply()
      },
    })
  })

  it('T-HU003-07 loads the tests and filters them by status', async () => {
    const admin = useAdminTests()
    await admin.refresh()

    expect(admin.tests.value).toHaveLength(2)
    admin.filter.status = 'draft'
    expect(admin.tests.value.map(test => test.code)).toEqual(['DRAFT_A'])
    expect(admin.hasFilters.value).toBe(true)
    admin.clearFilters()
    expect(admin.tests.value).toHaveLength(2)
  })

  it('T-HU003-01 create sends the localized input and reports success', async () => {
    const admin = useAdminTests()
    const result = await admin.create({ code: 'NEW_1', titleEs: 'Nuevo', titleEn: '', descriptionEs: '', descriptionEn: '' })

    expect(result.ok).toBe(true)
    expect(created[0]).toEqual({ code: 'NEW_1', title: { es: 'Nuevo' }, description: null })
  })

  it('T-HU003-02 create does not call the server when the input is invalid', async () => {
    const admin = useAdminTests()
    const result = await admin.create({ code: 'ab', titleEs: '', titleEn: '', descriptionEs: '', descriptionEn: '' })

    expect(result).toMatchObject({ ok: false })
    expect(result.ok === false && result.errors.map(error => error.field)).toEqual(['code', 'title'])
    expect(created).toHaveLength(0)
  })

  it('T-HU003-04 a repeated code comes back as a code_taken error on the code field', async () => {
    postReply = () => {
      throw createError({ statusCode: 409, data: { errors: [{ field: 'code', code: 'code_taken' }] } })
    }
    const admin = useAdminTests()
    const result = await admin.create({ code: 'DRAFT_A', titleEs: 'Otro', titleEn: '', descriptionEs: '', descriptionEn: '' })

    expect(result).toEqual({ ok: false, errors: [{ field: 'code', code: 'code_taken' }] })
  })

  it('HU003 any other server failure is a general error', async () => {
    postReply = () => {
      throw createError({ statusCode: 500 })
    }
    const admin = useAdminTests()
    const result = await admin.create({ code: 'NEW_2', titleEs: 'Nuevo', titleEn: '', descriptionEs: '', descriptionEn: '' })

    expect(result).toEqual({ ok: false, errors: [], general: 'unknown' })
  })

  it('HU003 offers one translated option per status plus "all"', () => {
    const admin = useAdminTests()

    expect(admin.statusOptions.value.map(option => option.value)).toEqual(['all', 'draft', 'published', 'archived'])
    expect(admin.statusOptions.value.every(option => !option.label.includes('.'))).toBe(true)
  })
})
