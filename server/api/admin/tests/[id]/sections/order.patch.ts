import { requireRole } from '../../../../../utils/requireRole'
import { requireEditableTest, sectionDbError, uuidParam } from '../../../../../utils/testStructure'
import { isUuid } from '#shared/utils/validation'

/** HU004 RF-03: saves the order of every section of the test (positions 1..n) in one transaction. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const body = await readBody<{ ids?: unknown }>(event).catch(() => null)
  const ids = body?.ids

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isUuid) || new Set(ids).size !== ids.length) {
    throw createError({ statusCode: 422, statusMessage: 'Orden inválido', data: { code: 'invalid_order' } })
  }

  const { client } = await requireEditableTest(event, testId)
  const { error } = await client.rpc('reorder_test_sections', { test: testId, section_ids: ids })

  if (error?.code === '22023') {
    throw createError({ statusCode: 422, statusMessage: 'Orden inválido', data: { code: 'invalid_order' } })
  }
  if (error) sectionDbError(error)

  setResponseStatus(event, 204)
  return null
})
