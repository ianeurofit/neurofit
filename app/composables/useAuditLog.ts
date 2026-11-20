import type { AuditDiff } from '#shared/utils/audit'

export interface AuditItem {
  id: number
  actor_id: string | null
  action: 'insert' | 'update' | 'delete'
  entity: string
  entity_id: string | null
  diff: AuditDiff
  created_at: string
  actor: { id: string, full_name: string | null, email: string } | null
}

interface AuditResponse {
  items: AuditItem[]
  total: number
  page: number
  pageSize: number
}

const ALL = 'all'

/** State of the audit page: filters, pagination and the list of possible actors. */
export function useAuditLog() {
  // `$i18n.t` works outside a component setup and still reacts to the active locale.
  const t = useNuxtApp().$i18n.t
  const client = useSupabaseClient()

  const filters = reactive({ entity: ALL, actor: ALL, from: '', to: '', page: 1 })

  const query = computed(() => ({
    ...(filters.entity !== ALL ? { entity: filters.entity } : {}),
    ...(filters.actor !== ALL ? { actor: filters.actor } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
    page: filters.page,
  }))

  const { data, status, refresh } = useFetch<AuditResponse>('/api/admin/audit', {
    query,
    default: () => ({ items: [], total: 0, page: 1, pageSize: 50 }),
  })

  // Changing a filter starts again from the first page.
  watch(() => [filters.entity, filters.actor, filters.from, filters.to], () => {
    filters.page = 1
  })

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const pageSize = computed(() => data.value?.pageSize ?? 50)
  const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const pending = computed(() => status.value === 'pending')
  const hasError = computed(() => status.value === 'error')
  const hasFilters = computed(() =>
    filters.entity !== ALL || filters.actor !== ALL || filters.from !== '' || filters.to !== '',
  )

  function clearFilters() {
    Object.assign(filters, { entity: ALL, actor: ALL, from: '', to: '', page: 1 })
  }

  // Only staff can write to the audited tables, so only they can appear as actors.
  const { data: profiles } = useAsyncData('audit-actors', async () => {
    const { data: rows } = await client
      .from('profiles')
      .select('id, full_name, email')
      .in('role', ['superuser', 'evaluator'])
      .order('email')

    return rows ?? []
  }, { default: () => [] })

  const actorOptions = computed(() => [
    { label: t('audit.filters.actorAll'), value: ALL },
    ...(profiles.value ?? []).map(profile => ({ label: profile.full_name || profile.email, value: profile.id })),
  ])

  const entityOptions = computed(() => [
    { label: t('audit.filters.entityAll'), value: ALL },
    ...AUDIT_ENTITIES.map(entity => ({ label: t(`audit.entities.${entity}`), value: entity })),
  ])

  return { filters, items, total, pages, pageSize, pending, hasError, hasFilters, clearFilters, refresh, actorOptions, entityOptions }
}
