import type { QuestionDetail, TestDetail } from '#shared/types/assessment'
import type { PublishError } from '#shared/utils/publish'

export type LifecycleGeneralError = 'not_draft' | 'not_published' | 'draft_exists' | 'already_archived' | 'forbidden' | 'unknown'

export type LifecycleResult = { ok: true } | { ok: false, general?: LifecycleGeneralError }

interface ServerError {
  statusCode?: number
  data?: { data?: { code?: LifecycleGeneralError, errors?: PublishError[] } }
}

/** Codes that belong to publishing itself; the rest come from questions and conditions. */
const PUBLISH_CODES = new Set(['no_sections', 'empty_section', 'inactive_dependency'])

/** Publish, new version and archive of one test (HU007), with the errors grouped by section. */
export function useTestLifecycle(testId: string) {
  // `$i18n.t` works outside a component setup and still reacts to the active locale.
  const { $i18n } = useNuxtApp()
  const t = $i18n.t
  const base = `/api/admin/tests/${testId}`

  const detail = useFetch<TestDetail>(base)
  const questions = useFetch<QuestionDetail[]>(`${base}/questions`, { default: () => [] })

  const test = computed(() => detail.data.value ?? null)
  const pending = computed(() => [detail.status.value, questions.status.value].some(status => status === 'pending' || status === 'idle'))
  const serverErrors = ref<PublishError[] | null>(null)
  const busy = ref(false)

  async function refresh() {
    serverErrors.value = null
    await Promise.all([detail.refresh(), questions.refresh()])
  }

  /** RF-01: the same checks the server runs, on what the screen already has. */
  const localErrors = computed<PublishError[]>(() => {
    if (!test.value) return []
    return validateForPublish(assembleTestTree({
      test: { ...test.value, parent_test_id: null },
      sections: test.value.sections.map(section => ({ ...section, is_draft_content: false })),
      questions: (questions.data.value ?? []).map(question => ({ ...question, alert_rule: null, is_draft_content: false })),
    }))
  })

  const errors = computed(() => serverErrors.value ?? localErrors.value)

  const status = computed(() => test.value?.status ?? null)
  const canPublish = computed(() => status.value === 'draft')
  const canCreateVersion = computed(() => status.value === 'published')
  const canArchive = computed(() => status.value === 'draft' || status.value === 'published')

  function message(error: PublishError) {
    const key = PUBLISH_CODES.has(error.code)
      ? `tests.publish.errors.${error.code}`
      : questionErrorKey(error.field ?? '', error.code)
    return t(key, { code: error.questionCode ?? '', ...questionErrorParams(error.code) })
  }

  /** The errors in section order; errors of the whole test (no section) come first. */
  const groups = computed(() => {
    const order = new Map((test.value?.sections ?? []).map(section => [section.code, section]))
    const result: Array<{ sectionCode: string | null, title: string | null, errors: Array<PublishError & { message: string }> }> = []

    for (const error of errors.value) {
      const code = error.sectionCode ?? null
      let group = result.find(item => item.sectionCode === code)
      if (!group) {
        const section = code ? order.get(code) : undefined
        group = { sectionCode: code, title: section ? localizedText(section.title, $i18n.locale.value as 'es' | 'en') : null, errors: [] }
        result.push(group)
      }
      group.errors.push({ ...error, message: message(error) })
    }
    return result
  })

  function failure(error: unknown): LifecycleResult {
    const { statusCode, data } = error as ServerError
    const body = data?.data

    if (statusCode === 422 && body?.errors) {
      serverErrors.value = body.errors
      return { ok: false }
    }
    return { ok: false, general: body?.code ?? (statusCode === 403 ? 'forbidden' : 'unknown') }
  }

  async function run<T>(request: () => Promise<T>): Promise<{ ok: true, value: T } | { ok: false, general?: LifecycleGeneralError }> {
    busy.value = true
    try {
      return { ok: true, value: await request() }
    }
    catch (error) {
      return failure(error) as { ok: false, general?: LifecycleGeneralError }
    }
    finally {
      busy.value = false
    }
  }

  /** CA-01 / CA-02: nothing is sent while the screen already knows of errors. */
  async function publish(): Promise<LifecycleResult> {
    serverErrors.value = null
    if (localErrors.value.length) return { ok: false }

    const result = await run(() => $fetch(`${base}/publish`, { method: 'POST' }))
    if (result.ok) await refresh()
    return result.ok ? { ok: true } : result
  }

  /** CA-03: the copy is a new draft; the caller opens it. */
  async function newVersion(): Promise<{ ok: true, id: string, version: number } | { ok: false, general?: LifecycleGeneralError }> {
    const result = await run(() => $fetch<{ id: string, version: number }>(`${base}/new-version`, { method: 'POST' }))
    return result.ok ? { ok: true, id: result.value.id, version: result.value.version } : result
  }

  async function archive(): Promise<LifecycleResult> {
    const result = await run(() => $fetch(`${base}/archive`, { method: 'POST' }))
    if (result.ok) await refresh()
    return result.ok ? { ok: true } : result
  }

  return { test, pending, busy, errors, groups, canPublish, canCreateVersion, canArchive, refresh, publish, newVersion, archive }
}
