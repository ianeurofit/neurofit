export type UserRole = 'superuser' | 'evaluator' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export const USER_ROLES: UserRole[] = ['superuser', 'evaluator', 'user']

export const ROLE_COLORS: Record<UserRole, 'primary' | 'info' | 'neutral'> = {
  superuser: 'primary',
  evaluator: 'info',
  user: 'neutral',
}

/** Rutas sin prefijo de idioma; usar con localePath(). */
export const ROLE_HOME: Record<UserRole, string> = {
  superuser: '/dashboard/superusuario',
  evaluator: '/dashboard/evaluador',
  user: '/dashboard/usuario',
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
