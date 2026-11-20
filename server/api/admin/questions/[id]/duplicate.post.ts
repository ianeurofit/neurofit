import { requireRole } from '../../../../utils/requireRole'
import { uuidParam } from '../../../../utils/testStructure'
import { duplicateQuestion, parentTestId } from '../../../../utils/questionSave'

/** HU006 RF-03: copies a question with a `_COPY` code at the end of its section. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const questionId = uuidParam(event, 'id')
  const testId = await parentTestId(event, 'questions', questionId)

  const copy = await duplicateQuestion(event, testId, questionId)

  setResponseStatus(event, 201)
  return copy
})
