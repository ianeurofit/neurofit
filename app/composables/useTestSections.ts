import type { SectionSummary, TestDetail } from '#shared/types/assessment'
import type { SectionFieldError, SectionFormState } from '#shared/utils/tests'

export type SectionGeneralError = 'new_version_required' | 'forbidden' | 'unknown'

export type SectionError = SectionFieldError | { field: 'code', code: 'section_code_taken' }

export type SectionResult =
  | { ok: true }
  | { ok: false, errors: SectionError[], general?: SectionGeneralError }

interface ServerError {
  statusCode?: number
  data?: { data?: { code?: string, errors?: SectionError[] } }
}

function toResult(error: unknown): SectionResult {
  const { statusCode, data } = error as ServerError
  const body = data?.data

  if ((statusCode === 409 || statusCode === 422) && body?.errors?.length) return { ok: false, errors: body.errors }
  if (body?.code === 'new_version_required') return { ok: false, errors: [], general: 'new_version_required' }
  return { ok: false, errors: [], general: statusCode === 403 ? 'forbidden' : 'unknown' }
}

/** Sections of one test: list, add/edit, reorder and delete (HU004). */
export function useTestSections(testId: string) {
  // `$i18n.t` works outside a component setup and still reacts to the active locale.
  const t = useNuxtApp().$i18n.t
  const base = `/api/admin/tests/${testId}`

  const { data, status, refresh } = useFetch<TestDetail>(base)

  const test = computed(() => data.value ?? null)
  const sections = computed<SectionSummary[]>(() => data.value?.sections ?? [])
  const pending = computed(() => status.value === 'pending' || status.value === 'idle')
  const hasError = computed(() => status.value === 'error')
  const editable = computed(() => !!test.value && assertStructureEditable(test.value, false).ok)

  function setSections(next: SectionSummary[]) {
    if (data.value) data.value = { ...data.value, sections: next }
  }

  async function save(section: SectionSummary | null, state: SectionFormState): Promise<SectionResult> {
    const input = formToSectionInput(state)
    const validation = validateSectionInput(input)

    if (!validation.ok) return { ok: false, errors: validation.errors }

    try {
      if (section) await $fetch(`${base}/sections/${section.id}`, { method: 'PATCH', body: input })
      else await $fetch(`${base}/sections`, { method: 'POST', body: input })
      await refresh()
      return { ok: true }
    }
    catch (error) {
      return toResult(error)
    }
  }

  /** Moves a section (drag or up/down) and saves the whole order; reverts on failure. */
  async function move(from: number, to: number): Promise<SectionResult> {
    const previous = sections.value
    const next = reorder(previous, from, to)

    if (next === previous) return { ok: true }

    setSections(next)
    try {
      await $fetch(`${base}/sections/order`, { method: 'PATCH', body: { ids: next.map(item => item.id) } })
      return { ok: true }
    }
    catch (error) {
      setSections(previous)
      return toResult(error)
    }
  }

  function deletePlan(section: SectionSummary) {
    return planDeleteSection(section.question_count, false)
  }

  /** Deletes a section; the caller has already asked the user to confirm. */
  async function remove(section: SectionSummary): Promise<SectionResult> {
    try {
      await $fetch(`${base}/sections/${section.id}`, { method: 'DELETE', query: { confirm: 'true' } })
      await refresh()
      return { ok: true }
    }
    catch (error) {
      return toResult(error)
    }
  }

  function errorMessage(error: SectionError) {
    const max = error.field === 'domain' ? SECTION_DOMAIN_MAX : TEST_TITLE_MAX
    const min = error.field === 'domain' ? SECTION_DOMAIN_MIN : TEST_TITLE_MIN

    return t(`tests.sections.errors.${error.code}`, { min, max })
  }

  function validateForm(state: Partial<SectionFormState>) {
    const input = formToSectionInput({ code: '', titleEs: '', titleEn: '', domain: '', ...state })

    return validateSectionInput(input).errors.map(error => ({
      name: sectionErrorToFormField(error.field),
      message: errorMessage(error),
    }))
  }

  return { test, sections, pending, hasError, editable, refresh, save, move, deletePlan, remove, errorMessage, validateForm }
}
