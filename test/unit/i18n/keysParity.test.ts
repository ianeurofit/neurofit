import { describe, expect, it } from 'vitest'
import { read } from '../architecture/rules'

type Messages = { [key: string]: string | Messages }

function flatten(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : flatten(value, `${prefix}${key}.`),
  )
}

const es = flatten(JSON.parse(read('i18n/locales/es.json')))
const en = flatten(JSON.parse(read('i18n/locales/en.json')))

describe('i18n: Spanish and English share the same keys', () => {
  it('T-HU001-13 has no key that exists only in Spanish', () => {
    expect(es.filter(key => !en.includes(key))).toEqual([])
  })

  it('T-HU001-13 has no key that exists only in English', () => {
    expect(en.filter(key => !es.includes(key))).toEqual([])
  })

  it('T-HU001-13 defines the keys added by HU001', () => {
    for (const key of [
      'auth.errors.invalidCredentials',
      'auth.errors.generic',
      'dashboard.nav.tests',
      'dashboard.nav.patients',
      'dashboard.titles.patients',
      'seo.patients.title',
      'patients.title',
      'patients.empty',
      'patients.error',
    ]) {
      expect(es).toContain(key)
      expect(en).toContain(key)
    }
  })

  it('T-HU024-04 defines the keys added by HU024', () => {
    for (const key of [
      'dashboard.nav.audit',
      'dashboard.titles.audit',
      'seo.audit.title',
      'audit.eyebrow',
      'audit.title',
      'audit.intro',
      'audit.listTitle',
      'audit.filters.entity',
      'audit.filters.entityAll',
      'audit.filters.actor',
      'audit.filters.actorAll',
      'audit.filters.from',
      'audit.filters.to',
      'audit.filters.clear',
      'audit.columns.date',
      'audit.columns.actor',
      'audit.columns.action',
      'audit.columns.entity',
      'audit.columns.changes',
      'audit.actions.insert',
      'audit.actions.update',
      'audit.actions.delete',
      'audit.entities.evaluator_patients',
      'audit.system',
      'audit.empty',
      'audit.emptyFiltered',
      'audit.error',
      'audit.retry',
      'audit.total',
      'audit.pageOf',
    ]) {
      expect(es).toContain(key)
      expect(en).toContain(key)
    }
  })

  it('T-HU024-04 has a label for every audited entity', async () => {
    const { AUDIT_ENTITIES } = await import('../../../shared/utils/audit')

    for (const entity of AUDIT_ENTITIES) {
      expect(es).toContain(`audit.entities.${entity}`)
      expect(en).toContain(`audit.entities.${entity}`)
    }
  })
})
