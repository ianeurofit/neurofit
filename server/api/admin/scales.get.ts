import { requireRole } from '../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import { scaleFromRows } from '#shared/utils/scales'
import type { ScaleOption } from '#shared/types/assessment'
import type { Database } from '~~/app/types/database.types'

/** HU031: the scale catalogue with its options in order, for the question form. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])

  // The caller's own session: the RLS policies of the catalogue are the last line of defence.
  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('scales')
    .select('code, name, options:scale_options(value, label, score, position)')
    .order('code')

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las escalas' })

  return (data ?? []).map(scale => scaleFromRows(scale, scale.options as unknown as ScaleOption[]))
})
