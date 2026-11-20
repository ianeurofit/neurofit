import { requireRole } from '../../../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'
import { isUuid } from '#shared/utils/validation'

/** Removes a patient from an evaluator. Removing a missing pair is not an error. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  // The caller's own session (not the service role): RLS applies and the audit trail names the actor.
  const client = await serverSupabaseClient<Database>(event)
  const evaluatorId = getRouterParam(event, 'evaluatorId')
  const patientId = getRouterParam(event, 'patientId')

  if (!isUuid(evaluatorId) || !isUuid(patientId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identificadores inválidos' })
  }

  const { error } = await client
    .from('evaluator_patients')
    .delete()
    .eq('evaluator_id', evaluatorId)
    .eq('patient_id', patientId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo retirar el paciente' })
  }

  return { ok: true }
})
