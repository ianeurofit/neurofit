import { requireRole } from '../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

/** Published tests only (HU003 · RF-04). Drafts never leave this endpoint, whatever the role. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser', 'evaluator', 'user'])

  // RLS already hides drafts from evaluators and patients; the filter also hides them from a superuser here.
  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('tests')
    .select('id, code, title, description, version, status')
    .eq('status', 'published')
    .order('code')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar los tests' })
  }

  return data ?? []
})
