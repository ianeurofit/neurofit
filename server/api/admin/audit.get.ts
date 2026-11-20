import { requireRole } from '../../utils/requireRole'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { buildAuditQuery, validateAuditFilters, type AuditFilters } from '#shared/utils/audit'
import type { Database } from '~~/app/types/database.types'

/** The filter methods shared by every PostgREST query builder. */
interface Filterable<T> {
  eq: (column: string, value: string) => T
  gte: (column: string, value: string) => T
  lt: (column: string, value: string) => T
}

function first(value: unknown): string | undefined {
  const single = Array.isArray(value) ? value[0] : value

  return typeof single === 'string' ? single : undefined
}

/**
 * Audit trail, newest first. Only a superuser may read it; the query also runs with the
 * caller's own session, so the RLS policy of `audit_log` is the last line of defence.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])

  const params = getQuery(event)
  const filters: AuditFilters = {
    entity: first(params.entity),
    actorId: first(params.actor),
    from: first(params.from),
    to: first(params.to),
    page: Number(first(params.page) ?? 1),
  }

  const validation = validateAuditFilters(filters)

  if (!validation.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Filtros inválidos', data: { code: validation.code } })
  }

  const query = buildAuditQuery(filters)
  const client = await serverSupabaseClient<Database>(event)

  // The same filters apply to the page and to the total, so they live in one place.
  const withFilters = <T extends Filterable<T>>(builder: T): T => {
    let filtered = builder

    if (query.entity) filtered = filtered.eq('entity', query.entity)
    if (query.actorId) filtered = filtered.eq('actor_id', query.actorId)
    if (query.from) filtered = filtered.gte('created_at', query.from)
    if (query.toExclusive) filtered = filtered.lt('created_at', query.toExclusive)

    return filtered
  }

  let { data, count, error } = await withFilters(
    client
      .from('audit_log')
      .select('id, actor_id, action, entity, entity_id, diff, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(query.rangeFrom, query.rangeTo),
  )

  // A page past the last row is not an error: answer an empty page with the real total.
  if (error?.code === 'PGRST103') {
    const totals = await withFilters(client.from('audit_log').select('id', { count: 'exact', head: true }))

    data = []
    count = totals.count
    error = null
  }

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo cargar la auditoría' })
  }

  const rows = data ?? []
  const actorIds = [...new Set(rows.flatMap(row => (row.actor_id ? [row.actor_id] : [])))]
  const actors = new Map<string, { id: string, full_name: string | null, email: string }>()

  if (actorIds.length) {
    const { data: profiles } = await serverSupabaseServiceRole<Database>(event)
      .from('profiles')
      .select('id, full_name, email')
      .in('id', actorIds)

    for (const profile of profiles ?? []) actors.set(profile.id, profile)
  }

  return {
    items: rows.map(row => ({ ...row, actor: row.actor_id ? (actors.get(row.actor_id) ?? null) : null })),
    total: count ?? 0,
    page: query.page,
    pageSize: query.pageSize,
  }
})
