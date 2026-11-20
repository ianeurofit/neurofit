import { requireRole } from '../../../../../utils/requireRole'
import { QUESTION_COLUMNS, uuidParam } from '../../../../../utils/testStructure'
import { serverSupabaseClient } from '#supabase/server'
import { questionFromRow } from '#shared/utils/questions'
import type { Database } from '~~/app/types/database.types'

/** HU005: every question of the test with its options, in section order (the preview). */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')

  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('questions')
    .select(`${QUESTION_COLUMNS}, section:test_sections(position)`)
    .eq('test_id', testId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las preguntas' })

  type Row = Parameters<typeof questionFromRow>[0] & { section: { position: number } | null }
  return (data as unknown as Row[])
    .sort((a, b) => (a.section?.position ?? 0) - (b.section?.position ?? 0) || (a.position as number) - (b.position as number))
    .map(({ section: _section, ...row }) => questionFromRow(row))
})
