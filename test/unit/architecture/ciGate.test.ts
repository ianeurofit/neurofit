import { describe, expect, it } from 'vitest'
import { buildCommand, buildSteps, read } from './rules'

describe('architecture: the deploy is gated by the checks', () => {
  it('TK-S1-13 netlify.toml runs lint, typecheck and test before the build', () => {
    const steps = buildSteps(read('netlify.toml'))

    expect(steps).toEqual([
      'pnpm lint',
      'pnpm typecheck',
      'pnpm test',
      'pnpm run build',
    ])
  })

  it('TK-S1-13 chains the steps with && so a failing check stops the deploy', () => {
    const command = buildCommand(read('netlify.toml'))

    expect(command).not.toMatch(/;|\|\|/)
    expect(command.split('&&').length).toBeGreaterThan(1)
  })

  it('TK-S1-13 buildSteps splits a chained command', () => {
    expect(buildSteps('[build]\n  command = "a && b"\n  publish = "dist"')).toEqual(['a', 'b'])
    expect(buildSteps('')).toEqual([])
  })

  it('the Netlify build gives Node at least 4 GB of heap (the Nitro step peaks near 2 GB)', () => {
    const toml = read('netlify.toml')
    const options = toml.match(/^\s*NODE_OPTIONS\s*=\s*"([^"]*)"/m)?.[1] ?? ''
    const heap = Number(options.match(/--max-old-space-size=(\d+)/)?.[1] ?? 0)

    expect(heap).toBeGreaterThanOrEqual(4096)
  })
})
