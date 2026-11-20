import { requireRole } from '../../../../utils/requireRole'
import { uuidParam } from '../../../../utils/testStructure'
import { conflict, findTest, lifecycleDbError, loadTestTree } from '../../../../utils/testLifecycle'
import { validateForPublish } from '#shared/utils/publish'

/**
 * HU007 RF-01, RF-02, RF-04: publishes a draft after checking its whole content. With errors it
 * answers 422 with every one of them and changes nothing; otherwise the version it replaces is
 * archived in the same transaction.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const { client, test } = await findTest(event, testId)
  if (test.status !== 'draft') conflict('not_draft')

  const errors = validateForPublish(await loadTestTree(client, test))
  if (errors.length) {
    throw createError({ statusCode: 422, statusMessage: 'El test no se puede publicar', data: { errors } })
  }

  const { error } = await client.rpc('publish_test', { test: testId })
  if (error) lifecycleDbError(error)

  return { id: testId, status: 'published' as const }
})
