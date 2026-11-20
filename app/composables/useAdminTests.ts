import type { TestStatus, TestSummary } from '#shared/types/assessment'
import type { FieldError, TestErrorField, TestFormState } from '#shared/utils/tests'

const ALL = 'all'

export type CreateTestError = FieldError | { field: TestErrorField, code: 'code_taken' }

export type CreateTestResult =
  | { ok: true, test: TestSummary }
  | { ok: false, errors: CreateTestError[], general?: 'unknown' | 'forbidden' }

interface ServerErrorBody {
  data?: { errors?: CreateTestError[] }
}

/** State of the test management screens: the list, its status filter and creation. */
export function useAdminTests() {
  // `$i18n.t` works outside a component setup and still reacts to the active locale.
  const t = useNuxtApp().$i18n.t

  const filter = reactive<{ status: TestStatus | typeof ALL }>({ status: ALL })

  const { data, status, refresh } = useFetch<TestSummary[]>('/api/admin/tests', {
    default: () => [],
  })

  const tests = computed(() => filterTests(data.value ?? [], filter.status === ALL ? undefined : filter.status))
  const pending = computed(() => status.value === 'pending' || status.value === 'idle')
  const hasError = computed(() => status.value === 'error')
  const hasFilters = computed(() => filter.status !== ALL)

  const statusOptions = computed(() => [
    { value: ALL, label: t('tests.admin.filters.statusAll') },
    ...TEST_STATUSES.map(value => ({ value, label: t(`tests.admin.status.${value}`) })),
  ])

  function clearFilters() {
    filter.status = ALL
  }

  async function create(state: TestFormState): Promise<CreateTestResult> {
    const input = formToTestInput(state)
    const validation = validateTestInput(input)

    if (!validation.ok) return { ok: false, errors: validation.errors }

    try {
      const test = await $fetch<TestSummary>('/api/admin/tests', { method: 'POST', body: input })
      await refresh()
      return { ok: true, test }
    }
    catch (error) {
      const { statusCode, data: body } = error as { statusCode?: number, data?: ServerErrorBody }
      const errors = body?.data?.errors

      if ((statusCode === 409 || statusCode === 422) && errors?.length) return { ok: false, errors }
      return { ok: false, errors: [], general: statusCode === 403 ? 'forbidden' : 'unknown' }
    }
  }

  /** Translated message of one validation or server error, with its length limits. */
  function errorMessage(error: CreateTestError) {
    const max = error.field.startsWith('description') ? TEST_DESCRIPTION_MAX : TEST_TITLE_MAX

    return t(`errors.test.${error.code}`, { min: TEST_TITLE_MIN, max })
  }

  /** Validation of the form state, as `UForm` errors on the form field names. */
  function validateForm(state: Partial<TestFormState>) {
    const input = formToTestInput({ code: '', titleEs: '', titleEn: '', descriptionEs: '', descriptionEn: '', ...state })

    return validateTestInput(input).errors.map(error => ({
      name: testErrorToFormField(error.field),
      message: errorMessage(error),
    }))
  }

  return {
    tests, filter, statusOptions, pending, hasError, hasFilters,
    clearFilters, refresh, create, errorMessage, validateForm,
  }
}
