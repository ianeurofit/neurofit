import { requireRole } from '../../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import { isTestStatus } from '#shared/utils/tests'
import type { Database } from '~~/app/types/database.types'

const COLUMNS = 'id, code, title, description, version, status, created_at'

/** Every test, drafts included, newest first. Optional `?status=` filter. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])

  const raw = getQuery(event).status
  const status = Array.isArray(raw) ? raw[0] : raw

  if (status !== undefined && status !== '' && !isTestStatus(status)) {
    throw createError({ statusCode: 422, statusMessage: 'Estado inválido', data: { code: 'invalid_status' } })
  }

  // The caller's own session: the RLS policy of `tests` is the last line of defence.
  const client = await serverSupabaseClient<Database>(event)
  let query = client.from('tests').select(COLUMNS).order('created_at', { ascending: false })

  if (isTestStatus(status)) query = query.eq('status', status)

  const { data, error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar los tests' })
  }

  return data ?? []
})
