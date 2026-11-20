import { requireRole } from '../../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'
import { isUuid } from '#shared/utils/validation'
import { validateAssignment } from '#shared/utils/auth'
import type { UserRole } from '#shared/types/user'

interface Body {
  evaluator_id?: unknown
  patient_id?: unknown
}

/** Assigns a patient to an evaluator. Repeating an existing pair is not an error. */
export default defineEventHandler(async (event) => {
  const { userId } = await requireRole(event, ['superuser'])
  // The caller's own session (not the service role): RLS applies and the audit trail names the actor.
  const client = await serverSupabaseClient<Database>(event)
  const body = await readBody<Body>(event)

  if (!isUuid(body?.evaluator_id) || !isUuid(body?.patient_id)) {
    throw createError({ statusCode: 400, statusMessage: 'Identificadores inválidos' })
  }

  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, role, is_active')
    .in('id', [body.evaluator_id, body.patient_id])

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar los perfiles' })
  }

  const evaluator = profiles?.find(profile => profile.id === body.evaluator_id)
  const patient = profiles?.find(profile => profile.id === body.patient_id)

  if (!evaluator || !patient) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  const result = validateAssignment(
    { role: evaluator.role as UserRole, is_active: evaluator.is_active },
    { role: patient.role as UserRole },
  )

  if (!result.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Asignación inválida', data: { code: result.code } })
  }

  const { error: insertError } = await client
    .from('evaluator_patients')
    .upsert(
      { evaluator_id: body.evaluator_id, patient_id: body.patient_id, assigned_by: userId },
      { onConflict: 'evaluator_id,patient_id', ignoreDuplicates: true },
    )

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo asignar el paciente' })
  }

  return { ok: true }
})
