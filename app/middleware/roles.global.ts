import { ROLE_HOME, type UserRole } from '~/types/user'

/** Zonas del panel y roles permitidos en cada una (nombres de ruta sin sufijo de idioma). */
const AREAS: Array<{ name: string, roles: UserRole[] }> = [
  { name: 'dashboard-usuarios', roles: ['superuser'] },
  { name: 'dashboard-usuarios-nuevo', roles: ['superuser'] },
  { name: 'dashboard-superusuario', roles: ['superuser'] },
  { name: 'dashboard-evaluador', roles: ['evaluator'] },
  { name: 'dashboard-usuario', roles: ['user'] },
]

/** 'dashboard-usuarios___en' -> 'dashboard-usuarios' */
function baseName(name: unknown) {
  return String(name ?? '').split('___')[0] ?? ''
}

export default defineNuxtRouteMiddleware(async (to) => {
  const name = baseName(to.name)
  const isDashboard = name === 'dashboard' || name.startsWith('dashboard-')
  const user = useSupabaseUser()
  const localePath = useLocalePath()

  // Un usuario ya autenticado no necesita ver login ni registro
  if (['login', 'registro'].includes(name) && user.value) {
    const { fetchProfile } = useProfile()
    const profile = await fetchProfile()
    return navigateTo(localePath(profile ? ROLE_HOME[profile.role] : '/dashboard'))
  }

  // El listado de pacientes de la demo (/demo) solo es visible para el
  // superusuario, dentro del panel; el resto de visitantes va directo al
  // caso publico de la demo.
  if (name === 'demo') {
    const fallback = localePath('/demo/carlos-gomez')

    if (!user.value) return navigateTo(fallback)

    const { fetchProfile } = useProfile()
    const profile = await fetchProfile()

    if (!profile || !profile.is_active || profile.role !== 'superuser') {
      return navigateTo(fallback)
    }

    return
  }

  if (!isDashboard) return

  if (!user.value) {
    return navigateTo(`${localePath('/login')}?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const { fetchProfile, signOut } = useProfile()
  const profile = await fetchProfile()

  if (!profile) {
    await signOut()
    return navigateTo(`${localePath('/login')}?error=sin-perfil`)
  }

  if (!profile.is_active) {
    await signOut()
    return navigateTo(`${localePath('/login')}?error=cuenta-inactiva`)
  }

  const home = localePath(ROLE_HOME[profile.role])

  if (name === 'dashboard') {
    return navigateTo(home)
  }

  const area = AREAS.find(a => a.name === name)

  if (area && !area.roles.includes(profile.role)) {
    return navigateTo(home)
  }
})
