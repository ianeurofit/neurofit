import { requireRole } from '../../../../../utils/requireRole'
import { uuidParam } from '../../../../../utils/testStructure'
import { updateQuestion } from '../../../../../utils/questionSave'

/** HU005: changes a question of the test. Same rules as `PATCH /api/admin/questions/:id`. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')
  const questionId = uuidParam(event, 'questionId')

  return await updateQuestion(event, testId, questionId, await readBody(event).catch(() => null))
})
