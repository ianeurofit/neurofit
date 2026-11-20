import { isUuid } from './validation'

export const AUDIT_PAGE_SIZE = 50

/** Tables whose changes are audited; used by the entity filter of the audit page. */
export const AUDIT_ENTITIES = [
  'evaluator_patients',
  'tests',
  'test_sections',
  'questions',
  'question_options',
  'scales',
  'scale_options',
  'scoring_models',
  'alert_rules',
  'recommendation_templates',
] as const

export interface AuditFilters {
  entity?: string
  actorId?: string
  /** First day, YYYY-MM-DD. */
  from?: string
  /** Last day (inclusive), YYYY-MM-DD. */
  to?: string
  page: number
}

export interface AuditQuery {
  entity?: string
  actorId?: string
  /** ISO instant, inclusive. */
  from?: string
  /** ISO instant, exclusive (the day after `to`). */
  toExclusive?: string
  page: number
  pageSize: number
  offset: number
  /** Inclusive row range for `.range()`. */
  rangeFrom: number
  rangeTo: number
}

export type AuditFiltersResult =
  | { ok: true }
  | { ok: false, code: 'invalid_entity' | 'invalid_actor' | 'invalid_date' | 'invalid_range' }

export type AuditDiff = Record<string, { old: unknown, new: unknown }>

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const ENTITY = /^[a-z][a-z0-9_]{0,62}$/
const DAY_MS = 86_400_000

function isRealDate(value: string): boolean {
  if (!DATE_ONLY.test(value)) return false

  const date = new Date(`${value}T00:00:00.000Z`)

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

function startOfDay(value: string): string {
  return `${value}T00:00:00.000Z`
}

function startOfNextDay(value: string): string {
  return new Date(new Date(startOfDay(value)).getTime() + DAY_MS).toISOString()
}

export function validateAuditFilters(filters: AuditFilters): AuditFiltersResult {
  const entity = filters.entity?.trim()
  const from = filters.from?.trim()
  const to = filters.to?.trim()

  if (entity && !ENTITY.test(entity)) return { ok: false, code: 'invalid_entity' }
  if (filters.actorId && !isUuid(filters.actorId)) return { ok: false, code: 'invalid_actor' }
  if ((from && !isRealDate(from)) || (to && !isRealDate(to))) return { ok: false, code: 'invalid_date' }
  if (from && to && from > to) return { ok: false, code: 'invalid_range' }

  return { ok: true }
}

/** Normalises the filters of the audit page into the bounds and the row range of one query. */
export function buildAuditQuery(filters: AuditFilters): AuditQuery {
  const page = Number.isInteger(filters.page) && filters.page >= 1 ? filters.page : 1
  const offset = (page - 1) * AUDIT_PAGE_SIZE
  const entity = filters.entity?.trim()
  const from = filters.from?.trim()
  const to = filters.to?.trim()

  return {
    ...(entity ? { entity } : {}),
    ...(filters.actorId ? { actorId: filters.actorId } : {}),
    ...(from ? { from: startOfDay(from) } : {}),
    ...(to ? { toExclusive: startOfNextDay(to) } : {}),
    page,
    pageSize: AUDIT_PAGE_SIZE,
    offset,
    rangeFrom: offset,
    rangeTo: offset + AUDIT_PAGE_SIZE - 1,
  }
}

function shorten(value: unknown, max = 40): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value)

  return text.length > max ? `${text.slice(0, max)}…` : text
}

/** One-line description of what changed, e.g. `prompt: first → second (+2)`. */
export function summarizeDiff(diff: AuditDiff | null | undefined, maxColumns = 3): string {
  const columns = Object.entries(diff ?? {})
  const shown = columns.slice(0, maxColumns).map(([column, change]) => {
    if (change.old === null || change.old === undefined) return `${column}: ${shorten(change.new)}`
    if (change.new === null || change.new === undefined) return `${column}: ${shorten(change.old)}`

    return `${column}: ${shorten(change.old)} → ${shorten(change.new)}`
  })
  const rest = columns.length - shown.length

  return rest > 0 ? `${shown.join(', ')} (+${rest})` : shown.join(', ')
}
