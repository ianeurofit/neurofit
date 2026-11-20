import { requireRole } from '../../../../utils/requireRole'
import { uuidParam } from '../../../../utils/testStructure'
import { conflict, findTest, lifecycleDbError, loadTestTree } from '../../../../utils/testLifecycle'
import { cloneTestVersion, toVersionPayload } from '#shared/utils/publish'
import type { Json } from '~~/app/types/database.types'

/** HU007 RF-03: copies a published test into version + 1 as a draft; the published one stays in use. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const { client, test } = await findTest(event, testId)
  if (test.status !== 'published') conflict('not_published')

  const { data: versions, error: versionsError } = await client.from('tests').select('version, status').eq('code', test.code)
  if (versionsError) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las versiones' })
  if (versions.some(version => version.status === 'draft')) conflict('draft_exists')

  const next = Math.max(...versions.map(version => version.version)) + 1
  const copy = cloneTestVersion(await loadTestTree(client, test), next)
  const { data: id, error } = await client.rpc('create_test_version', { tree: toVersionPayload(copy) as unknown as Json })
  if (error) lifecycleDbError(error)

  setResponseStatus(event, 201)
  return { id: id as string, version: copy.version, status: 'draft' as const }
})
