import { describe, expect, it } from 'vitest'
import { createsTable, listFiles, read } from './rules'

const OUTSIDE_MIGRATIONS = ['app', 'server', 'shared', 'scripts', 'supabase']
  .flatMap(dir => listFiles(dir))
  .filter(file => !file.startsWith('supabase/migrations/'))

describe('architecture: the schema changes only through migrations', () => {
  it('TK-S1-12 no file outside supabase/migrations/ creates a table', () => {
    const offenders = OUTSIDE_MIGRATIONS.filter(file => createsTable(read(file)))

    expect(offenders).toEqual([])
  })

  it('TK-S1-12 every table in the project comes from a migration', () => {
    const migrations = listFiles('supabase/migrations', ['.sql'])

    expect(migrations.length).toBeGreaterThan(0)
    expect(migrations.some(file => createsTable(read(file)))).toBe(true)
  })

  it('TK-S1-12 detects a table created in code', () => {
    expect(createsTable('CREATE TABLE public.tests (id uuid)')).toBe(true)
    expect(createsTable('create   table if not exists x ()')).toBe(true)
    expect(createsTable('create temp table scratch (id int)')).toBe(false)
    expect(createsTable('select * from tests')).toBe(false)
  })
})
