import type { H3Event } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export type UserRole = 'superuser' | 'evaluator' | 'user'

/**
 * Verifica que quien llama sea un superusuario activo y devuelve
 * el cliente con service_role para operar sobre auth.users.
 */
export async function requireSuperuser(event: H3Event) {
  // serverSupabaseUser devuelve los claims del JWT: el id del usuario
  // viene en `sub`, no en `id` (esa es la forma del objeto User clasico).
  const claims = await serverSupabaseUser(event)

  if (!claims) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const userId = claims.sub
  const admin = serverSupabaseServiceRole(event)

  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo verificar el perfil' })
  }

  if (!profile || profile.role !== 'superuser' || !profile.is_active) {
    throw createError({ statusCode: 403, statusMessage: 'Se requieren permisos de superusuario' })
  }

  return { admin, userId }
}

export function assertRole(role: unknown): UserRole {
  if (role === 'superuser' || role === 'evaluator' || role === 'user') return role
  throw createError({ statusCode: 400, statusMessage: 'Rol invalido' })
}
