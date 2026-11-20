import { canAccessArea, resolveHomeRoute } from '#shared/utils/auth'

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
    return navigateTo(localePath(profile ? resolveHomeRoute(profile.role) : '/dashboard'))
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

  const home = localePath(resolveHomeRoute(profile.role))

  if (name === 'dashboard') {
    return navigateTo(home)
  }

  if (!canAccessArea(name, profile.role)) {
    return navigateTo(home)
  }
})
