import { describe, expect, it } from 'vitest'
import { listFiles, read, usesServiceRole } from './rules'

describe('architecture: service role stays on the server', () => {
  it('TK-S1-10 no file in app/ references the service role', () => {
    const offenders = listFiles('app').filter(file => usesServiceRole(read(file)))

    expect(offenders).toEqual([])
  })

  it('TK-S1-10 detects the service role in client code', () => {
    expect(usesServiceRole('const c = serverSupabaseServiceRole(event)')).toBe(true)
    expect(usesServiceRole('const key = env.SUPABASE_SERVICE_ROLE_KEY')).toBe(true)
    expect(usesServiceRole('const client = useSupabaseClient()')).toBe(false)
  })
})
