import type { UserRole } from '../types/user'

export const USER_ROLES: UserRole[] = ['superuser', 'evaluator', 'user']

/** Routes without a locale prefix; use them with `localePath()`. */
export const ROLE_HOME: Record<UserRole, string> = {
  superuser: '/dashboard/superusuario',
  evaluator: '/dashboard/evaluador',
  user: '/dashboard/usuario',
}
