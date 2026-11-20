import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

// The Nuxt test environment does not read .env: pass only the public variables
// (the Supabase URL and key), from .env locally or from the environment in CI.
const fileEnv = existsSync('.env') ? parseEnv(readFileSync('.env', 'utf8')) : {}

// The tests never reach Supabase (every request is mocked), but the Supabase module refuses to
// start without a URL and a key, and then no other plugin (i18n included) is installed. With no
// .env and no secrets — a fresh clone or CI — these placeholders let the app boot.
const TEST_DEFAULTS = {
  NUXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NUXT_PUBLIC_SUPABASE_KEY: 'test-anon-key',
}

// Real values win over the placeholders; empty ones (e.g. an unset CI secret) do not.
const publicEnv: Record<string, string> = {
  ...TEST_DEFAULTS,
  ...Object.fromEntries(
    Object.entries({ ...fileEnv, ...process.env })
      .filter((entry): entry is [string, string] => entry[0].startsWith('NUXT_PUBLIC_') && !!entry[1]),
  ),
}

// Nuxt reads these while loading its config, before the test environment exists.
Object.assign(process.env, publicEnv)

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          // Booting the whole Nuxt app can take longer than the 10 s default, especially in CI.
          hookTimeout: 60_000,
          testTimeout: 30_000,
          env: publicEnv,
          environmentOptions: {
            nuxt: { domEnvironment: 'happy-dom' },
          },
        },
      }),
    ],
  },
})
