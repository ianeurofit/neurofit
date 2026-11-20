import { requireRole } from '../../../../../utils/requireRole'
import { uuidParam } from '../../../../../utils/testStructure'
import { createQuestion } from '../../../../../utils/questionSave'

/** HU005 RF-01…RF-08: creates a question at the end of its section, with its options. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const question = await createQuestion(event, testId, await readBody(event).catch(() => null))

  setResponseStatus(event, 201)
  return question
})
