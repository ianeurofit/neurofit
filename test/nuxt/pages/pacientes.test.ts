import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import PatientsPage from '~/pages/dashboard/pacientes/index.vue'

const patients = [
  { id: '1', full_name: 'Carlos Gómez', email: 'carlos@test.local', is_active: true, assigned_at: '2026-01-02T00:00:00Z' },
  { id: '2', full_name: null, email: 'ana@test.local', is_active: false, assigned_at: '2026-01-03T00:00:00Z' },
]

describe('dashboard/pacientes', () => {
  beforeEach(() => {
    clearNuxtData('assigned-patients')
  })

  it('HU001 shows a loading state while the patients are requested', async () => {
    registerEndpoint('/api/evaluator/patients', () => new Promise(() => {}))

    const wrapper = await mountSuspended(PatientsPage)

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('HU001 lists the assigned patients with name, email and state', async () => {
    registerEndpoint('/api/evaluator/patients', () => ({ patients }))

    const wrapper = await mountSuspended(PatientsPage)
    await vi.waitFor(() => expect(wrapper.findAll('li')).toHaveLength(2))
    const text = wrapper.text()

    expect(text).toContain('Mis pacientes')
    expect(text).toContain('Carlos Gómez')
    expect(text).toContain('ana@test.local')
    expect(text).toContain('Activo')
    expect(text).toContain('Inactivo')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('HU001 shows an empty state when the evaluator has no patients', async () => {
    registerEndpoint('/api/evaluator/patients', () => ({ patients: [] }))

    const wrapper = await mountSuspended(PatientsPage)

    await vi.waitFor(() => expect(wrapper.text()).toContain('Aún no tienes pacientes asignados.'))
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('HU001 shows an error with a retry button when the request fails', async () => {
    registerEndpoint('/api/evaluator/patients', () => {
      throw createError({ statusCode: 500 })
    })

    const wrapper = await mountSuspended(PatientsPage)

    await vi.waitFor(() => expect(wrapper.text()).toContain('No pudimos cargar tus pacientes.'))
    expect(wrapper.text()).toContain('Reintentar')
  })

  it('HU001 renders no raw translation key', async () => {
    registerEndpoint('/api/evaluator/patients', () => ({ patients: [] }))

    const wrapper = await mountSuspended(PatientsPage)

    await vi.waitFor(() => expect(wrapper.text()).toContain('Aún no tienes'))
    expect(wrapper.text()).not.toMatch(/patients\.[a-z]+/i)
  })
})
