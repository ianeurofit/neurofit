import type { UserRole } from '#shared/types/user'

export type { Profile, UserRole } from '#shared/types/user'
export { ROLE_HOME, USER_ROLES } from '#shared/utils/roles'

export const ROLE_COLORS: Record<UserRole, 'primary' | 'info' | 'neutral'> = {
  superuser: 'primary',
  evaluator: 'info',
  user: 'neutral',
}

export const ROLE_ICONS: Record<UserRole, string> = {
  superuser: 'i-lucide-shield-check',
  evaluator: 'i-lucide-clipboard-check',
  user: 'i-lucide-user',
}

/** Clave i18n del rol: roles.<rol>.label / roles.<rol>.description */
export function roleKey(role: UserRole) {
  return `roles.${role}`
}
