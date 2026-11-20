import { requireRole } from '../../utils/requireRole'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

/**
 * Patients assigned to the authenticated evaluator. The query runs with the caller's
 * own session, so RLS (`evaluator_patients_select`) is the last line of defence.
 */
export default defineEventHandler(async (event) => {
  const { userId } = await requireRole(event, ['evaluator', 'superuser'])
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('evaluator_patients')
    .select('created_at, patient:profiles!evaluator_patients_patient_id_fkey(id, full_name, email, is_active)')
    .eq('evaluator_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron cargar los pacientes' })
  }

  const patients = (data ?? []).flatMap((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient
    return patient ? [{ ...patient, assigned_at: row.created_at }] : []
  })

  return { patients }
})
