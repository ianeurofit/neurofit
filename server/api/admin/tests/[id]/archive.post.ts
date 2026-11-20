import { requireRole } from '../../../../utils/requireRole'
import { uuidParam } from '../../../../utils/testStructure'
import { conflict, findTest, lifecycleDbError } from '../../../../utils/testLifecycle'

/**
 * HU007 CA-05: an archived test can no longer be started; its assessments and results stay.
 * A draft or a published test can be archived; archiving cannot be undone.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const { client, test } = await findTest(event, testId)
  if (test.status === 'archived') conflict('already_archived')

  const { error } = await client.from('tests').update({ status: 'archived' }).eq('id', testId)
  if (error) lifecycleDbError(error)

  return { id: testId, status: 'archived' as const }
})
