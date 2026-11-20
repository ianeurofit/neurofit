import { requireRole } from '../../../../../utils/requireRole'
import { countSectionQuestions, requireEditableTest, sectionDbError, uuidParam } from '../../../../../utils/testStructure'
import { planDeleteSection } from '#shared/utils/tests'

/**
 * HU004 RF-05: deletes a section. One with questions needs `?confirm=true`; without it the
 * answer is 409 with the number of questions that would be deleted.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')
  const sectionId = uuidParam(event, 'sectionId')
  const confirmed = getQuery(event).confirm === 'true'

  const { client } = await requireEditableTest(event, testId)
  const { data: section, error: readError } = await client
    .from('test_sections')
    .select('id')
    .eq('id', sectionId)
    .eq('test_id', testId)
    .maybeSingle()

  if (readError) throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar la sección' })
  if (!section) throw createError({ statusCode: 404, statusMessage: 'Sección no encontrada' })

  const counts = await countSectionQuestions(client, [sectionId])
  const plan = planDeleteSection(counts[sectionId] ?? 0, confirmed)

  if (plan.needsConfirm) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Confirma la eliminación',
      data: { code: 'confirm_required', questionCount: plan.questionCount },
    })
  }

  const { error } = await client.from('test_sections').delete().eq('id', sectionId).eq('test_id', testId)
  if (error) sectionDbError(error)

  // Close the gap so positions stay 1..n.
  const { data: rest } = await client.from('test_sections').select('id').eq('test_id', testId).order('position')
  if (rest?.length) {
    const { error: orderError } = await client.rpc('reorder_test_sections', { test: testId, section_ids: rest.map(row => row.id) })
    if (orderError) sectionDbError(orderError)
  }

  setResponseStatus(event, 204)
  return null
})
