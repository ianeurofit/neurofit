import { describe, expect, it } from 'vitest'
import { forbiddenImports, listFiles, read } from './rules'

describe('architecture: shared/ is pure logic', () => {
  it('TK-S1-11 no file in shared/ imports from app/, server/ or the framework', () => {
    const offenders = listFiles('shared')
      .map(file => ({ file, imports: forbiddenImports(read(file)) }))
      .filter(entry => entry.imports.length > 0)

    expect(offenders).toEqual([])
  })

  it('TK-S1-11 detects imports from app/ and server/', () => {
    expect(forbiddenImports('import { x } from \'~/composables/useProfile\'')).toEqual(['~/composables/useProfile'])
    expect(forbiddenImports('import { y } from \'~~/server/utils/adminGuard\'')).toEqual(['~~/server/utils/adminGuard'])
    expect(forbiddenImports('import { z } from \'../../app/types/user\'')).toEqual(['../../app/types/user'])
  })

  it('TK-S1-11 detects framework and Supabase imports', () => {
    expect(forbiddenImports('import { ref } from \'vue\'')).toEqual(['vue'])
    expect(forbiddenImports('import type { H3Event } from \'h3\'')).toEqual(['h3'])
    expect(forbiddenImports('const c = await import(\'@supabase/supabase-js\')')).toEqual(['@supabase/supabase-js'])
  })

  it('TK-S1-11 allows pure relative imports inside shared/', () => {
    expect(forbiddenImports('import { validate } from \'./validate\'')).toEqual([])
    expect(forbiddenImports('export * from \'../types/assessment\'')).toEqual([])
  })
})
