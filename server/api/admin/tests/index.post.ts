import { requireRole } from '../../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import { buildNewTest, mapDbError, normalizeTestInput, validateTestInput } from '#shared/utils/tests'
import type { Database } from '~~/app/types/database.types'

/** Creates a test as a draft at version 1 (HU003 · RF-01…03). */
export default defineEventHandler(async (event) => {
  const { userId } = await requireRole(event, ['superuser'])

  const input = normalizeTestInput(await readBody(event).catch(() => null))
  const validation = validateTestInput(input)

  if (!validation.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos', data: { errors: validation.errors } })
  }

  // The caller's own session (not the service role): RLS applies and the audit trail names the actor.
  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('tests')
    .insert(buildNewTest(input, userId))
    .select('id, code, title, description, version, status, created_at')
    .single()

  if (error) {
    const mapped = mapDbError(error)

    if (mapped.code === 'code_taken') {
      throw createError({ statusCode: 409, statusMessage: 'El código ya existe', data: { errors: [mapped] } })
    }
    if (mapped.code === 'forbidden') {
      throw createError({ statusCode: 403, statusMessage: 'No tienes permisos para esta acción' })
    }
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear el test' })
  }

  setResponseStatus(event, 201)
  return data
})
