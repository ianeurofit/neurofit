import { requireRole } from '../../../../utils/requireRole'
import { SECTION_COLUMNS, countSectionQuestions, uuidParam } from '../../../../utils/testStructure'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

/** One test with its sections in order and how many questions each one has. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const client = await serverSupabaseClient<Database>(event)
  const { data: test, error } = await client
    .from('tests')
    .select(`id, code, title, description, version, status, created_at, sections:test_sections(${SECTION_COLUMNS})`)
    .eq('id', testId)
    .order('position', { referencedTable: 'test_sections' })
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar el test' })
  if (!test) throw createError({ statusCode: 404, statusMessage: 'Test no encontrado' })

  const counts = await countSectionQuestions(client, test.sections.map(section => section.id))

  return { ...test, sections: test.sections.map(section => ({ ...section, question_count: counts[section.id] ?? 0 })) }
})
