import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { UserRole } from '#shared/types/user'
import { checkRoleAccess } from '#shared/utils/auth'

/**
 * Authenticates the caller and checks that their profile is active and has one of
 * the allowed roles. Throws 401 (no session or profile) or 403 (role not allowed).
 */
export async function requireRole(event: H3Event, roles: UserRole[]) {
  // serverSupabaseUser devuelve los claims del JWT: el id del usuario viene en `sub`.
  const claims = await serverSupabaseUser(event)

  if (!claims) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const { data: profile, error } = await serverSupabaseServiceRole(event)
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', claims.sub)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo verificar el perfil' })
  }

  const access = checkRoleAccess(profile, roles)

  if (access === 401) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  if (access === 403) {
    throw createError({ statusCode: 403, statusMessage: 'No tienes permisos para esta acción' })
  }

  return { userId: claims.sub, role: profile!.role as UserRole }
}
