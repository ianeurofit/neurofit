import { requireRole } from '../../../../utils/requireRole'
import { uuidParam } from '../../../../utils/testStructure'
import { parentTestId, updateQuestion } from '../../../../utils/questionSave'

/**
 * HU006 RF-01, RF-02, RF-04, RF-05, RF-06: edits, activates or deactivates a question or sets
 * its condition. The body sends only what changes.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const questionId = uuidParam(event, 'id')
  const testId = await parentTestId(event, 'questions', questionId)

  return await updateQuestion(event, testId, questionId, await readBody(event).catch(() => null))
})
