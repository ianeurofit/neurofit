import type { Profile, UserRole } from '../types/user'
import { ROLE_HOME } from './roles'

const DASHBOARD = '/dashboard'

export interface MenuItem {
  /** Translation key under `dashboard.nav.<key>`. */
  key: string
  icon: string
  /** Route without a locale prefix. */
  to: string
}

/** Dashboard areas and the roles that may open them; a name also covers its child routes. */
const AREAS: Array<{ name: string, roles: UserRole[] }> = [
  { name: 'dashboard-usuarios', roles: ['superuser'] },
  { name: 'dashboard-superusuario', roles: ['superuser'] },
  { name: 'dashboard-evaluador', roles: ['evaluator'] },
  { name: 'dashboard-usuario', roles: ['user'] },
  { name: 'dashboard-roadmap', roles: ['superuser', 'evaluator'] },
  { name: 'dashboard-educacion', roles: ['superuser'] },
  { name: 'dashboard-tests', roles: ['superuser'] },
  { name: 'dashboard-pacientes', roles: ['evaluator', 'superuser'] },
  { name: 'dashboard-auditoria', roles: ['superuser'] },
]

/** 'dashboard-tests___en' -> 'dashboard-tests' */
function baseRouteName(routeName: string): string {
  return routeName.split('___')[0] ?? ''
}

export function resolveHomeRoute(role: UserRole): string {
  return ROLE_HOME[role]
}

export function canAccessArea(routeName: string, role: UserRole): boolean {
  const name = baseRouteName(routeName)
  const area = AREAS.find(a => name === a.name || name.startsWith(`${a.name}-`))

  return area ? area.roles.includes(role) : true
}

export function buildDashboardMenu(role: UserRole): MenuItem[] {
  const home = ROLE_HOME[role]

  switch (role) {
    case 'superuser':
      return [
        { key: 'overview', icon: 'i-lucide-layout-dashboard', to: home },
        { key: 'users', icon: 'i-lucide-users', to: '/dashboard/usuarios' },
        { key: 'newUser', icon: 'i-lucide-user-plus', to: '/dashboard/usuarios/nuevo' },
        { key: 'tests', icon: 'i-lucide-clipboard-list', to: '/dashboard/tests' },
        { key: 'audit', icon: 'i-lucide-history', to: '/dashboard/auditoria' },
        { key: 'roadmap', icon: 'i-lucide-map', to: '/dashboard/roadmap' },
        { key: 'education', icon: 'i-lucide-graduation-cap', to: '/dashboard/educacion' },
        { key: 'demo', icon: 'i-lucide-monitor-play', to: '/demo' },
      ]
    case 'evaluator':
      return [
        { key: 'overview', icon: 'i-lucide-layout-dashboard', to: home },
        { key: 'patients', icon: 'i-lucide-users-round', to: '/dashboard/pacientes' },
        { key: 'roadmap', icon: 'i-lucide-map', to: '/dashboard/roadmap' },
      ]
    default:
      return [{ key: 'myPanel', icon: 'i-lucide-brain', to: home }]
  }
}

/** Same message for a wrong password and an unknown email, so the form never reveals which exist. */
export function mapAuthError(error: { message?: string, code?: string }): string {
  const invalidCodes = ['invalid_credentials', 'user_not_found']
  const invalidMessage = /invalid login credentials|user not found/i

  if ((error.code && invalidCodes.includes(error.code)) || (error.message && invalidMessage.test(error.message))) {
    return 'auth.errors.invalidCredentials'
  }

  return 'auth.errors.generic'
}

function hasUnsafeCharacters(value: string): boolean {
  return [...value].some((char) => {
    const code = char.charCodeAt(0)
    return code < 32 || code === 127 || char === '\\'
  })
}

/** Only internal paths are accepted as a post-login destination (no open redirects). */
export function safeRedirect(param: unknown): string {
  if (typeof param !== 'string') return DASHBOARD
  if (!param.startsWith('/') || param.startsWith('//')) return DASHBOARD
  if (hasUnsafeCharacters(param)) return DASHBOARD

  return param
}

export function checkRoleAccess(
  profile: Pick<Profile, 'role' | 'is_active'> | null,
  allowed: UserRole[],
): 'ok' | 401 | 403 {
  if (!profile) return 401
  if (!profile.is_active || !allowed.includes(profile.role)) return 403

  return 'ok'
}

export type AssignmentResult =
  | { ok: true }
  | { ok: false, code: 'invalid_evaluator' | 'invalid_patient' }

export function validateAssignment(
  evaluator: { role: UserRole, is_active?: boolean },
  patient: { role: UserRole },
): AssignmentResult {
  if (evaluator.role !== 'evaluator' || evaluator.is_active === false) {
    return { ok: false, code: 'invalid_evaluator' }
  }

  if (patient.role !== 'user') return { ok: false, code: 'invalid_patient' }

  return { ok: true }
}
