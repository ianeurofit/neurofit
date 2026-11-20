import type { H3Event } from 'h3'
import { requireRole } from './requireRole'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { UserRole } from '#shared/types/user'

/**
 * Verifica que quien llama sea un superusuario activo y devuelve
 * el cliente con service_role para operar sobre auth.users.
 */
export async function requireSuperuser(event: H3Event) {
  const { userId } = await requireRole(event, ['superuser'])

  return { admin: serverSupabaseServiceRole(event), userId }
}

export function assertRole(role: unknown): UserRole {
  if (role === 'superuser' || role === 'evaluator' || role === 'user') return role
  throw createError({ statusCode: 400, statusMessage: 'Rol invalido' })
}
