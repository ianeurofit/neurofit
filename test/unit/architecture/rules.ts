import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

const SKIPPED_DIRS = new Set(['node_modules', '.nuxt', '.output', '.git', '.claude', '.netlify'])
const CODE_EXTENSIONS = ['.ts', '.vue', '.js', '.mjs', '.sql']

/** Source files under a project folder, as paths relative to the project root. */
export function listFiles(dir: string, extensions = CODE_EXTENSIONS): string[] {
  const start = join(ROOT, dir)
  const found: string[] = []

  function walk(current: string) {
    let entries: string[]
    try {
      entries = readdirSync(current)
    }
    catch {
      return
    }

    for (const entry of entries) {
      if (SKIPPED_DIRS.has(entry)) continue
      const full = join(current, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (extensions.some(ext => entry.endsWith(ext))) found.push(relative(ROOT, full))
    }
  }

  walk(start)
  return found
}

export function read(file: string): string {
  return readFileSync(join(ROOT, file), 'utf8')
}

/** Principle 5: the service role key never reaches the client bundle. */
export function usesServiceRole(source: string): boolean {
  return /serverSupabaseServiceRole|service_role|SERVICE_ROLE/i.test(source)
}

const FORBIDDEN_IMPORTS = [
  /^(~|~~|@)\//, // app aliases
  /^(\.\.\/)+(app|server)(\/|$)/, // relative paths into app/ or server/
  /^#(app|imports|supabase|components)/, // Nuxt virtual modules
  /^(vue|nuxt|h3|vue-router)(\/|$)/, // framework runtime
  /^@supabase\//,
  /^@nuxtjs\/supabase/,
]

/** Principle 3: `shared/` holds pure logic, so these imports are not allowed there. */
export function forbiddenImports(source: string): string[] {
  const specifiers = [
    ...source.matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/g),
    ...source.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g),
    ...source.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm),
  ].map(match => match[1] as string)

  return specifiers.filter(specifier => FORBIDDEN_IMPORTS.some(rule => rule.test(specifier)))
}

/** Principle 5: the schema only changes through versioned migrations. */
export function createsTable(source: string): boolean {
  return /\bcreate\s+table\b/i.test(source)
}

/** The Netlify build command, which runs before every deploy. */
export function buildCommand(toml: string): string {
  return /\[build\][^[]*?command\s*=\s*"([^"]+)"/s.exec(toml)?.[1] ?? ''
}

/** Steps of the build command; any failing step aborts the Netlify build. */
export function buildSteps(toml: string): string[] {
  return buildCommand(toml).split('&&').map(step => step.trim()).filter(Boolean)
}
