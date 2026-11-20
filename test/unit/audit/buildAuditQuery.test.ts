import { describe, expect, it } from 'vitest'
import { AUDIT_PAGE_SIZE, buildAuditQuery, summarizeDiff, validateAuditFilters } from '../../../shared/utils/audit'

describe('buildAuditQuery', () => {
  it('T-HU024-04 starts at the first page with no filters', () => {
    expect(buildAuditQuery({ page: 1 })).toEqual({
      page: 1,
      pageSize: AUDIT_PAGE_SIZE,
      offset: 0,
      rangeFrom: 0,
      rangeTo: AUDIT_PAGE_SIZE - 1,
    })
  })

  it('T-HU024-04 page 2 skips the first page', () => {
    const query = buildAuditQuery({ page: 2 })

    expect(query.offset).toBe(AUDIT_PAGE_SIZE)
    expect(query.rangeFrom).toBe(AUDIT_PAGE_SIZE)
    expect(query.rangeTo).toBe(AUDIT_PAGE_SIZE * 2 - 1)
  })

  it('T-HU024-04 turns an entity and a date range into bounds', () => {
    const query = buildAuditQuery({ entity: 'questions', from: '2026-01-01', to: '2026-01-31', page: 2 })

    expect(query.entity).toBe('questions')
    expect(query.from).toBe('2026-01-01T00:00:00.000Z')
    // The end date is inclusive: the bound is the start of the next day.
    expect(query.toExclusive).toBe('2026-02-01T00:00:00.000Z')
    expect(query.offset).toBe(AUDIT_PAGE_SIZE)
  })

  it('T-HU024-04 keeps the actor filter', () => {
    const actorId = 'a0000000-0000-0000-0000-00000000000a'

    expect(buildAuditQuery({ actorId, page: 1 }).actorId).toBe(actorId)
  })

  it('T-HU024-04 ignores blank filters', () => {
    const query = buildAuditQuery({ entity: '   ', actorId: '', from: '', to: '', page: 1 })

    expect(query).not.toHaveProperty('entity')
    expect(query).not.toHaveProperty('actorId')
    expect(query).not.toHaveProperty('from')
    expect(query).not.toHaveProperty('toExclusive')
  })

  it('T-HU024-04 falls back to page 1 for an invalid page', () => {
    for (const page of [0, -3, 1.5, Number.NaN]) expect(buildAuditQuery({ page }).page).toBe(1)
  })

  it('T-HU024-04 the end of a month rolls over the year', () => {
    expect(buildAuditQuery({ to: '2026-12-31', page: 1 }).toExclusive).toBe('2027-01-01T00:00:00.000Z')
  })
})

describe('validateAuditFilters', () => {
  it('HU024 accepts valid filters', () => {
    expect(validateAuditFilters({ entity: 'tests', actorId: 'a0000000-0000-0000-0000-00000000000a', from: '2026-01-01', to: '2026-01-31', page: 1 }))
      .toEqual({ ok: true })
  })

  it('HU024 rejects an actor that is not a UUID', () => {
    expect(validateAuditFilters({ actorId: 'abc', page: 1 })).toEqual({ ok: false, code: 'invalid_actor' })
  })

  it('HU024 rejects an entity that is not a table name', () => {
    expect(validateAuditFilters({ entity: 'tests; drop table x', page: 1 })).toEqual({ ok: false, code: 'invalid_entity' })
  })

  it('HU024 rejects dates that do not exist or are not YYYY-MM-DD', () => {
    expect(validateAuditFilters({ from: '2026-02-31', page: 1 })).toEqual({ ok: false, code: 'invalid_date' })
    expect(validateAuditFilters({ to: '01/02/2026', page: 1 })).toEqual({ ok: false, code: 'invalid_date' })
  })

  it('HU024 rejects a range that ends before it starts', () => {
    expect(validateAuditFilters({ from: '2026-02-01', to: '2026-01-01', page: 1 })).toEqual({ ok: false, code: 'invalid_range' })
  })
})

describe('summarizeDiff', () => {
  it('HU024 lists each changed column with its old and new value', () => {
    expect(summarizeDiff({ prompt: { old: 'first', new: 'second' } })).toBe('prompt: first → second')
  })

  it('HU024 shows only the new value for a created column and only the old for a removed one', () => {
    expect(summarizeDiff({ role: { old: null, new: 'evaluator' } })).toBe('role: evaluator')
    expect(summarizeDiff({ role: { old: 'evaluator', new: null } })).toBe('role: evaluator')
  })

  it('HU024 caps the number of columns and says how many were left out', () => {
    const diff = { a: { old: 1, new: 2 }, b: { old: 1, new: 2 }, c: { old: 1, new: 2 }, d: { old: 1, new: 2 } }

    expect(summarizeDiff(diff, 2)).toBe('a: 1 → 2, b: 1 → 2 (+2)')
  })

  it('HU024 shortens long values and tolerates an empty diff', () => {
    expect(summarizeDiff({ body: { old: 'x'.repeat(80), new: 'y' } })).toContain('…')
    expect(summarizeDiff({})).toBe('')
    expect(summarizeDiff(null)).toBe('')
  })
})
