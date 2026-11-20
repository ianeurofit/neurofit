import { requireRole } from '../../../../../utils/requireRole'
import { questionDbError, requireEditableTest, uuidParam } from '../../../../../utils/testStructure'
import { parentTestId } from '../../../../../utils/questionSave'
import { isUuid } from '#shared/utils/validation'

/** HU006 RF-07: saves the order of every question of the section (positions 1..n), like HU004. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const sectionId = uuidParam(event, 'id')

  const body = await readBody<{ ids?: unknown }>(event).catch(() => null)
  const ids = body?.ids
  const invalid = () => createError({ statusCode: 422, statusMessage: 'Orden inválido', data: { code: 'invalid_order' } })

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isUuid) || new Set(ids).size !== ids.length) throw invalid()

  const testId = await parentTestId(event, 'test_sections', sectionId)
  const { client } = await requireEditableTest(event, testId)
  const { error } = await client.rpc('reorder_section_questions', { section: sectionId, question_ids: ids })

  if (error?.code === '22023') throw invalid()
  if (error) questionDbError(error)

  setResponseStatus(event, 204)
  return null
})
