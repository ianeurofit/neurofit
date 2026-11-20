import { describe, expect, it } from 'vitest'
import { listFiles, read } from './rules'

/**
 * A TypeScript cast inside v-model compiles to `(x as T) = $event`, which the production build
 * (esbuild) rejects with "Invalid assignment target". Dev and the tests do not catch it, so the
 * Netlify build failed. Cast in `:model-value` and update with a handler instead.
 */
export function castsInVModel(source: string): string[] {
  return [...source.matchAll(/v-model(?::[\w-]+)?="([^"]*\sas\s[^"]*)"/g)].map(match => match[1]!)
}

describe('architecture: templates compile for production', () => {
  it('no v-model holds a TypeScript cast', () => {
    const offenders = listFiles('app', ['.vue']).flatMap(file => castsInVModel(read(file)).map(expression => `${file}: ${expression}`))

    expect(offenders).toEqual([])
  })

  it('castsInVModel finds casts in v-model and v-model:arg, and ignores casts in bindings', () => {
    expect(castsInVModel('<UInput v-model="value as string" />')).toEqual(['value as string'])
    expect(castsInVModel('<X v-model:open="flag as boolean" />')).toEqual(['flag as boolean'])
    expect(castsInVModel('<UInput :model-value="value as string" v-model="other" />')).toEqual([])
  })
})
