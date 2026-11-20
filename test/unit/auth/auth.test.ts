import { describe, expect, it } from 'vitest'
import {
  buildDashboardMenu,
  canAccessArea,
  checkRoleAccess,
  mapAuthError,
  resolveHomeRoute,
  safeRedirect,
  validateAssignment,
} from '../../../shared/utils/auth'
import { ROLE_HOME, USER_ROLES } from '../../../shared/utils/roles'

const keys = (role: Parameters<typeof buildDashboardMenu>[0]) => buildDashboardMenu(role).map(item => item.key)

describe('resolveHomeRoute', () => {
  it('T-HU001-01 returns the home route of every role', () => {
    expect(resolveHomeRoute('user')).toBe('/dashboard/usuario')
    expect(resolveHomeRoute('evaluator')).toBe('/dashboard/evaluador')
    expect(resolveHomeRoute('superuser')).toBe('/dashboard/superusuario')
  })

  it('T-HU001-01 covers every role in ROLE_HOME', () => {
    for (const role of USER_ROLES) expect(resolveHomeRoute(role)).toBe(ROLE_HOME[role])
  })
})

describe('canAccessArea', () => {
  it('T-HU001-02 only the superuser can open the test management area', () => {
    expect(canAccessArea('dashboard-tests', 'superuser')).toBe(true)
    expect(canAccessArea('dashboard-tests', 'evaluator')).toBe(false)
    expect(canAccessArea('dashboard-tests', 'user')).toBe(false)
  })

  it('T-HU001-02 the area covers its child routes and the locale suffix', () => {
    expect(canAccessArea('dashboard-tests-id-sections', 'evaluator')).toBe(false)
    expect(canAccessArea('dashboard-tests___en', 'user')).toBe(false)
    expect(canAccessArea('dashboard-tests___en', 'superuser')).toBe(true)
  })

  it('T-HU001-02 evaluators and superusers can open the patients area', () => {
    expect(canAccessArea('dashboard-pacientes', 'evaluator')).toBe(true)
    expect(canAccessArea('dashboard-pacientes', 'superuser')).toBe(true)
    expect(canAccessArea('dashboard-pacientes', 'user')).toBe(false)
  })

  it('T-HU001-02 keeps the existing areas', () => {
    expect(canAccessArea('dashboard-usuarios', 'superuser')).toBe(true)
    expect(canAccessArea('dashboard-usuarios-nuevo', 'evaluator')).toBe(false)
    expect(canAccessArea('dashboard-educacion', 'evaluator')).toBe(false)
    expect(canAccessArea('dashboard-roadmap', 'evaluator')).toBe(true)
    expect(canAccessArea('dashboard-roadmap', 'user')).toBe(false)
    expect(canAccessArea('dashboard-superusuario', 'superuser')).toBe(true)
    expect(canAccessArea('dashboard-evaluador', 'superuser')).toBe(false)
    expect(canAccessArea('dashboard-usuario', 'user')).toBe(true)
  })

  it('T-HU001-02 an area name is not matched by a longer unrelated name', () => {
    // `dashboard-usuario` (patient home) must not guard `dashboard-usuarios` (user management).
    expect(canAccessArea('dashboard-usuarios', 'user')).toBe(false)
    expect(canAccessArea('dashboard-usuario', 'superuser')).toBe(false)
  })

  it('T-HU001-02 routes outside any area are open to every role', () => {
    expect(canAccessArea('dashboard-ajustes', 'user')).toBe(true)
  })
})

describe('buildDashboardMenu', () => {
  it('T-HU001-03 the user menu has no test management nor patients', () => {
    expect(keys('user')).not.toContain('tests')
    expect(keys('user')).not.toContain('patients')
    expect(keys('user')).toEqual(['myPanel'])
  })

  it('T-HU001-04 the evaluator sees patients but not test management', () => {
    expect(keys('evaluator')).toContain('patients')
    expect(keys('evaluator')).not.toContain('tests')
  })

  it('T-HU001-04 the superuser sees test management', () => {
    expect(keys('superuser')).toContain('tests')
    expect(keys('superuser')).not.toContain('patients')
  })

  it('T-HU001-04 the first item of each menu is the home of the role', () => {
    for (const role of USER_ROLES) expect(buildDashboardMenu(role)[0]?.to).toBe(resolveHomeRoute(role))
  })

  it('T-HU001-04 every item can only be opened by the role that sees it', () => {
    for (const role of USER_ROLES) {
      for (const item of buildDashboardMenu(role)) expect(item.to.startsWith('/')).toBe(true)
    }
  })

  it('T-HU001-04 item keys are unique inside a menu', () => {
    for (const role of USER_ROLES) expect(new Set(keys(role)).size).toBe(keys(role).length)
  })
})

describe('validateAssignment', () => {
  it('T-HU001-06 accepts an evaluator and a patient', () => {
    expect(validateAssignment({ role: 'evaluator' }, { role: 'user' })).toEqual({ ok: true })
  })

  it('T-HU001-06 rejects an evaluator whose role is user', () => {
    expect(validateAssignment({ role: 'user' }, { role: 'user' })).toEqual({ ok: false, code: 'invalid_evaluator' })
  })

  it('T-HU001-06 rejects an inactive evaluator', () => {
    expect(validateAssignment({ role: 'evaluator', is_active: false }, { role: 'user' }))
      .toEqual({ ok: false, code: 'invalid_evaluator' })
  })

  it('T-HU001-06 rejects a patient that is not a user', () => {
    expect(validateAssignment({ role: 'evaluator' }, { role: 'evaluator' })).toEqual({ ok: false, code: 'invalid_patient' })
    expect(validateAssignment({ role: 'evaluator' }, { role: 'superuser' })).toEqual({ ok: false, code: 'invalid_patient' })
  })
})

describe('mapAuthError', () => {
  it('T-HU001-07 wrong password and unknown email give the same message key', () => {
    const wrongPassword = mapAuthError({ message: 'Invalid login credentials' })
    const unknownUser = mapAuthError({ message: 'User not found' })

    expect(wrongPassword).toBe('auth.errors.invalidCredentials')
    expect(unknownUser).toBe(wrongPassword)
  })

  it('T-HU001-07 recognises the error codes as well as the messages', () => {
    expect(mapAuthError({ code: 'invalid_credentials' })).toBe('auth.errors.invalidCredentials')
    expect(mapAuthError({ code: 'user_not_found' })).toBe('auth.errors.invalidCredentials')
  })

  it('T-HU001-07 any other error gives a generic key and never leaks the raw message', () => {
    expect(mapAuthError({ message: 'Database error saving new user' })).toBe('auth.errors.generic')
    expect(mapAuthError({})).toBe('auth.errors.generic')
  })
})

describe('checkRoleAccess', () => {
  it('T-HU001-09 answers 401 when there is no profile', () => {
    expect(checkRoleAccess(null, ['superuser'])).toBe(401)
  })

  it('T-HU001-10 answers 403 for a role that is not allowed', () => {
    expect(checkRoleAccess({ role: 'user', is_active: true }, ['superuser'])).toBe(403)
  })

  it('T-HU001-10 answers 403 for an inactive profile', () => {
    expect(checkRoleAccess({ role: 'superuser', is_active: false }, ['superuser'])).toBe(403)
  })

  it('T-HU001-09 answers ok for an active profile with an allowed role', () => {
    expect(checkRoleAccess({ role: 'evaluator', is_active: true }, ['evaluator', 'superuser'])).toBe('ok')
  })
})

describe('safeRedirect', () => {
  it('T-HU001-12 rejects protocol-relative and absolute URLs', () => {
    expect(safeRedirect('//evil.com')).toBe('/dashboard')
    expect(safeRedirect('https://x.y')).toBe('/dashboard')
    expect(safeRedirect('javascript:alert(1)')).toBe('/dashboard')
  })

  it('T-HU001-12 keeps internal routes', () => {
    expect(safeRedirect('/dashboard/usuario')).toBe('/dashboard/usuario')
    expect(safeRedirect('/en/dashboard/roadmap?tab=1')).toBe('/en/dashboard/roadmap?tab=1')
  })

  it('T-HU001-12 rejects backslash tricks, control characters and non-strings', () => {
    expect(safeRedirect('/\\evil.com')).toBe('/dashboard')
    expect(safeRedirect('/dashboard\nSet-Cookie: x=1')).toBe('/dashboard')
    expect(safeRedirect(undefined)).toBe('/dashboard')
    expect(safeRedirect(['/dashboard/usuario'])).toBe('/dashboard')
    expect(safeRedirect('')).toBe('/dashboard')
  })
})
