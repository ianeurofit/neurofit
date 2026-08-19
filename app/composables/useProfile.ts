import type { Profile } from '~/types/user'

/**
 * Perfil (y por tanto rol) del usuario autenticado.
 * Se cachea en useState para no repetir la consulta en cada navegacion.
 */
export function useProfile() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  const localePath = useLocalePath()
  const profile = useState<Profile | null>('neurofit-profile', () => null)

  async function fetchProfile(force = false) {
    // Justo despues de signInWithPassword el ref del modulo todavia puede estar
    // vacio, asi que la sesion es la fuente de verdad para el id.
    let id = user.value?.id

    if (!id) {
      const { data } = await client.auth.getSession()
      id = data.session?.user?.id
    }

    if (!id) {
      profile.value = null
      return null
    }

    if (profile.value && profile.value.id === id && !force) {
      return profile.value
    }

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      profile.value = null
      return null
    }

    profile.value = data as Profile | null
    return profile.value
  }

  const role = computed(() => profile.value?.role ?? null)
  const isSuperuser = computed(() => role.value === 'superuser')
  const isEvaluator = computed(() => role.value === 'evaluator')

  async function signOut() {
    await client.auth.signOut()
    profile.value = null
    await navigateTo(localePath('/login'))
  }

  return { profile, role, isSuperuser, isEvaluator, fetchProfile, signOut }
}
