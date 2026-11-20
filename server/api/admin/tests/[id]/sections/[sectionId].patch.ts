import { requireRole } from '../../../../../utils/requireRole'
import { SECTION_COLUMNS, countSectionQuestions, requireEditableTest, sectionDbError, uuidParam } from '../../../../../utils/testStructure'
import { normalizeSectionInput, validateSectionInput } from '#shared/utils/tests'

/** Edits the code, title or domain of a section. The position changes only through `order`. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')
  const sectionId = uuidParam(event, 'sectionId')

  const input = normalizeSectionInput(await readBody(event).catch(() => null), { partial: true })
  const validation = validateSectionInput(input, { partial: true })

  if (!validation.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos', data: { errors: validation.errors } })
  }
  if (Object.keys(input).length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Nada que actualizar', data: { errors: [] } })
  }

  const { client } = await requireEditableTest(event, testId)
  const { data, error } = await client
    .from('test_sections')
    .update(input)
    .eq('id', sectionId)
    .eq('test_id', testId)
    .select(SECTION_COLUMNS)
    .maybeSingle()

  if (error) sectionDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Sección no encontrada' })

  const counts = await countSectionQuestions(client, [data.id])
  return { ...data, question_count: counts[data.id] ?? 0 }
})
