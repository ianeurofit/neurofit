import { describe, expect, it } from 'vitest'
import { buildDashboardMenu, canAccessArea } from '../../../shared/utils/auth'

describe('audit access', () => {
  it('HU024 only the superuser can open the audit page', () => {
    expect(canAccessArea('dashboard-auditoria', 'superuser')).toBe(true)
    expect(canAccessArea('dashboard-auditoria', 'evaluator')).toBe(false)
    expect(canAccessArea('dashboard-auditoria', 'user')).toBe(false)
  })

  it('HU024 the area also covers the locale suffix and child routes', () => {
    expect(canAccessArea('dashboard-auditoria___en', 'evaluator')).toBe(false)
    expect(canAccessArea('dashboard-auditoria-detalle', 'user')).toBe(false)
  })

  it('HU024 only the superuser menu lists the audit page', () => {
    expect(buildDashboardMenu('superuser').map(item => item.key)).toContain('audit')
    expect(buildDashboardMenu('evaluator').map(item => item.key)).not.toContain('audit')
    expect(buildDashboardMenu('user').map(item => item.key)).not.toContain('audit')
  })

  it('HU024 the menu entry points to the audit page', () => {
    const item = buildDashboardMenu('superuser').find(entry => entry.key === 'audit')

    expect(item?.to).toBe('/dashboard/auditoria')
  })
})
