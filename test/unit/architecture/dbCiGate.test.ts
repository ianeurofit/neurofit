import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROOT, read } from './rules'

const WORKFLOW = '.github/workflows/ci.yml'

/** Body of one job in a GitHub Actions workflow (from its key to the next job). */
export function jobBody(workflow: string, job: string): string {
  const start = workflow.search(new RegExp(`^  ${job}:`, 'm'))
  if (start === -1) return ''
  const rest = workflow.slice(start + 1)
  const next = rest.search(/^ {2}\S[\w-]*:/m)

  return next === -1 ? rest : rest.slice(0, next)
}

describe('architecture: the database tests gate the integration', () => {
  it('TK-S1-14 the CI workflow exists', () => {
    expect(existsSync(`${ROOT}${WORKFLOW}`)).toBe(true)
  })

  it('TK-S1-14 runs on pushes to main and on every pull request', () => {
    const workflow = read(WORKFLOW)

    expect(workflow).toMatch(/^on:/m)
    expect(workflow).toMatch(/push:\s*\n\s*branches:\s*\[main\]/)
    expect(workflow).toMatch(/pull_request:/)
  })

  it('TK-S1-14 the checks job runs lint, typecheck and test', () => {
    const checks = jobBody(read(WORKFLOW), 'checks')

    expect(checks).toContain('pnpm lint')
    expect(checks).toContain('pnpm typecheck')
    expect(checks).toContain('pnpm test')
  })

  it('TK-S1-14 the database job starts Postgres and runs supabase test db', () => {
    const database = jobBody(read(WORKFLOW), 'database')

    expect(database).toContain('supabase/setup-cli')
    expect(database).toContain('supabase db start')
    expect(database).toContain('supabase test db')
  })

  it('TK-S1-14 no step may fail silently', () => {
    expect(read(WORKFLOW)).not.toMatch(/continue-on-error:\s*true/)
  })

  it('TK-S1-14 jobBody isolates one job', () => {
    const sample = 'jobs:\n  a:\n    steps:\n      - run: one\n  b:\n    steps:\n      - run: two\n'

    expect(jobBody(sample, 'a')).toContain('one')
    expect(jobBody(sample, 'a')).not.toContain('two')
    expect(jobBody(sample, 'missing')).toBe('')
  })
})
