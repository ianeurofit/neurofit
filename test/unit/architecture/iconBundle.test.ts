import { describe, expect, it } from 'vitest'
import { read } from './rules'

/**
 * With Nuxt Icon in "local" server mode every installed collection is bundled into the
 * server function. simple-icons alone is 4.6 MB of JSON and made the Netlify build run out
 * of memory, while the app uses six of its icons. The icons in use go to the client bundle
 * (scan) and only lucide — also used by Nuxt UI — stays in the server bundle.
 */
function iconConfig(config: string) {
  const start = config.search(/^ {2}icon:\s*\{/m)
  if (start === -1) return ''
  const rest = config.slice(start)
  const end = rest.search(/^ {2}\},?$/m)
  return end === -1 ? rest : rest.slice(0, end)
}

describe('architecture: the server bundle stays small enough to build on Netlify', () => {
  const icon = iconConfig(read('nuxt.config.ts'))

  it('Nuxt Icon is configured', () => {
    expect(icon).not.toBe('')
  })

  it('the server bundle only carries lucide, never simple-icons', () => {
    expect(icon).toMatch(/serverBundle:\s*\{[^}]*collections:\s*\[\s*'lucide'\s*\]/)
    expect(icon).not.toMatch(/serverBundle:[^}]*simple-icons/)
  })

  it('the icons the app uses are scanned into the client bundle', () => {
    expect(icon).toMatch(/clientBundle:\s*\{[^}]*scan:\s*true/)
  })
})
