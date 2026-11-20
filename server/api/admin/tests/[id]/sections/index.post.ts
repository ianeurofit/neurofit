import { requireRole } from '../../../../../utils/requireRole'
import { SECTION_COLUMNS, requireEditableTest, sectionDbError, uuidParam } from '../../../../../utils/testStructure'
import { normalizeSectionInput, validateSectionInput } from '#shared/utils/tests'
import { nextPosition } from '#shared/utils/ordering'
import type { SectionInput } from '#shared/utils/tests'

/** HU004 RF-01: appends a section at position max + 1. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const input = normalizeSectionInput(await readBody(event).catch(() => null)) as SectionInput
  const validation = validateSectionInput(input)

  if (!validation.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos', data: { errors: validation.errors } })
  }

  const { client } = await requireEditableTest(event, testId)
  const { data: positions, error: positionsError } = await client.from('test_sections').select('position').eq('test_id', testId)

  if (positionsError) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las secciones' })

  const { data, error } = await client
    .from('test_sections')
    .insert({ ...input, test_id: testId, position: nextPosition(positions ?? []) })
    .select(SECTION_COLUMNS)
    .single()

  if (error) sectionDbError(error)

  setResponseStatus(event, 201)
  return { ...data, question_count: 0 }
})
