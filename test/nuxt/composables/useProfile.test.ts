import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Profile } from '#shared/types/user'

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigateTo: vi.fn(),
  localePath: vi.fn((path: string) => path),
}))

mockNuxtImport('useSupabaseClient', () => () => ({ auth: { signOut: mocks.signOut } }))
mockNuxtImport('useLocalePath', () => () => mocks.localePath)
mockNuxtImport('navigateTo', () => mocks.navigateTo)

const profile: Profile = {
  id: 'c0000000-0000-0000-0000-0000000000c1',
  email: 'patient@test.local',
  full_name: 'Paciente de prueba',
  role: 'user',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('useProfile().signOut', () => {
  beforeEach(() => {
    mocks.signOut.mockReset().mockResolvedValue({ error: null })
    mocks.navigateTo.mockReset()
    mocks.localePath.mockReset().mockImplementation((path: string) => path)
    useState<Profile | null>('neurofit-profile').value = profile
  })

  it('T-HU001-13 clears the profile and navigates to /login', async () => {
    const { profile: state, signOut } = useProfile()
    expect(state.value?.id).toBe(profile.id)

    await signOut()

    expect(mocks.signOut).toHaveBeenCalledTimes(1)
    expect(state.value).toBeNull()
    expect(mocks.navigateTo).toHaveBeenCalledWith('/login')
  })

  it('T-HU001-13 ends the Supabase session before leaving the page', async () => {
    const order: string[] = []
    mocks.signOut.mockImplementation(async () => {
      order.push('signOut')
    })
    mocks.navigateTo.mockImplementation(() => {
      order.push('navigate')
    })

    await useProfile().signOut()

    expect(order).toEqual(['signOut', 'navigate'])
  })

  it('T-HU001-13 sends English users to the English login', async () => {
    mocks.localePath.mockImplementation((path: string) => `/en${path}`)

    await useProfile().signOut()

    expect(mocks.navigateTo).toHaveBeenCalledWith('/en/login')
  })
})
