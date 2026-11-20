import type { QuestionDetail, QuestionType } from '#shared/types/assessment'
import type { QuestionFieldError, QuestionFormState } from '#shared/utils/questions'
import type { ConditionErrorCode } from '#shared/utils/conditions'

export type QuestionGeneralError = 'new_version_required' | 'question_not_found' | 'forbidden' | 'unknown'

/** A field error of the shared validation, of the condition, or one only the server knows about. */
export interface QuestionError {
  field: string
  code: QuestionFieldError['code'] | ConditionErrorCode | 'question_code_taken' | 'section_not_found'
}

export type QuestionActionResult = { ok: true } | { ok: false, general: QuestionGeneralError }

export type QuestionResult =
  | { ok: true, question: QuestionDetail }
  | { ok: false, errors: QuestionError[], general?: QuestionGeneralError }

interface ServerError {
  statusCode?: number
  data?: { data?: { code?: QuestionGeneralError, errors?: QuestionError[] } }
}

function toFailure(error: unknown): QuestionResult {
  const { statusCode, data } = error as ServerError
  const body = data?.data

  if ((statusCode === 409 || statusCode === 422) && body?.errors?.length) return { ok: false, errors: body.errors }
  if (body?.code) return { ok: false, errors: [], general: body.code }
  return { ok: false, errors: [], general: statusCode === 403 ? 'forbidden' : 'unknown' }
}

function toActionFailure(error: unknown): QuestionActionResult {
  const failure = toFailure(error)
  return failure.ok ? { ok: true } : { ok: false, general: failure.general ?? 'unknown' }
}

/**
 * Questions of one test: the draft being edited, its errors and the live preview (HU005), and
 * the actions of each row — duplicate, activate/deactivate and move (HU006).
 */
export function useQuestionEditor(testId: string) {
  // `$i18n.t` works outside a component setup and still reacts to the active locale.
  const t = useNuxtApp().$i18n.t
  const base = `/api/admin/tests/${testId}/questions`

  const { data, status, refresh } = useFetch<QuestionDetail[]>(base, { default: () => [] })

  const pending = computed(() => status.value === 'pending' || status.value === 'idle')
  const hasError = computed(() => status.value === 'error')

  /** CA-09: every saved question, in the order the preview (HU009) shows them. */
  const preview = computed(() => {
    const list = data.value ?? []
    // Sections keep the order the server sent them in (section position); inside, by position.
    const sectionOrder = new Map<string, number>()
    list.forEach(question => sectionOrder.has(question.section_id) || sectionOrder.set(question.section_id, sectionOrder.size))
    return [...list].sort((a, b) =>
      sectionOrder.get(a.section_id)! - sectionOrder.get(b.section_id)! || a.position - b.position)
  })

  const draft = reactive<QuestionFormState>(emptyQuestionForm(''))
  const editing = ref<QuestionDetail | null>(null)
  const errors = ref<QuestionError[]>([])
  const general = ref<QuestionGeneralError | null>(null)
  const saving = ref(false)

  function reset(state: QuestionFormState, question: QuestionDetail | null) {
    Object.assign(draft, state)
    editing.value = question
    errors.value = []
    general.value = null
  }

  function startNew(sectionId: string) {
    reset(emptyQuestionForm(sectionId), null)
  }

  function startEdit(question: QuestionDetail) {
    reset(questionToForm(question), question)
  }

  function setType(type: QuestionType) {
    changeQuestionType(draft, type)
  }

  function errorMessage(error: QuestionError) {
    return t(questionErrorKey(error.field, error.code), questionErrorParams(error.code))
  }

  /** The errors as UForm shows them, each next to its field. */
  const formErrors = computed(() => errors.value.map(error => ({
    name: questionErrorToFormField(error.field),
    message: errorMessage(error),
  })))

  function upsert(question: QuestionDetail) {
    const list = data.value ?? []
    data.value = list.some(item => item.id === question.id)
      ? list.map(item => (item.id === question.id ? question : item))
      : [...list, question]
  }

  async function save(): Promise<QuestionResult> {
    const body = formToQuestionBody(draft)
    const found: QuestionError[] = [...validation(body)]

    general.value = null
    errors.value = found
    if (found.length) return { ok: false, errors: found }

    saving.value = true
    try {
      const question = editing.value
        ? await $fetch<QuestionDetail>(`${base}/${editing.value.id}`, { method: 'PATCH', body })
        : await $fetch<QuestionDetail>(base, { method: 'POST', body })

      // RF-09: the preview updates from the response, without reloading the list.
      upsert(question)
      editing.value = question
      return { ok: true, question }
    }
    catch (error) {
      const failure = toFailure(error)
      if (!failure.ok) {
        errors.value = failure.errors
        general.value = failure.general ?? null
      }
      return failure
    }
    finally {
      saving.value = false
    }
  }

  /** The other questions of the test, as the condition of the draft sees them. */
  const conditionTargets = computed(() => (data.value ?? [])
    .filter(question => question.id !== editing.value?.id)
    .map(toConditionTarget))

  /** Every client-side error: the question itself and its condition (HU006 CA-05, CA-06). */
  function validation(body: ReturnType<typeof formToQuestionBody>): QuestionError[] {
    return [
      ...validateQuestionInput(body).errors,
      ...conditionErrors(body.code, body.dependsOn ?? null, conditionTargets.value),
    ]
  }

  /** Client-side checks of the form, already translated, for DashboardManagementForm. */
  function validateForm(state: Partial<QuestionFormState>) {
    return validation(formToQuestionBody({ ...emptyQuestionForm(''), ...state })).map(error => ({
      name: questionErrorToFormField(error.field),
      message: errorMessage(error),
    }))
  }

  /** RF-03: the copy comes back from the server and joins the preview. */
  async function duplicate(question: QuestionDetail): Promise<QuestionActionResult & { copy?: QuestionDetail }> {
    try {
      const copy = await $fetch<QuestionDetail>(`/api/admin/questions/${question.id}/duplicate`, { method: 'POST' })
      upsert(copy)
      return { ok: true, copy }
    }
    catch (error) {
      return toActionFailure(error)
    }
  }

  /** RF-04: an inactive question stays in the list but leaves new assessments. */
  async function toggleActive(question: QuestionDetail): Promise<QuestionActionResult> {
    try {
      upsert(await $fetch<QuestionDetail>(`/api/admin/questions/${question.id}`, { method: 'PATCH', body: { active: !question.active } }))
      return { ok: true }
    }
    catch (error) {
      return toActionFailure(error)
    }
  }

  /** RF-07: moves a question inside its section and saves the whole order; reverts on failure. */
  async function move(sectionId: string, from: number, to: number): Promise<QuestionActionResult> {
    const previous = data.value ?? []
    const section = previous.filter(question => question.section_id === sectionId)
    const moved = reorder(section, from, to)

    if (moved === section) return { ok: true }

    const byId = new Map(moved.map(question => [question.id, question]))
    data.value = previous.map(question => byId.get(question.id) ?? question)
    try {
      await $fetch(`/api/admin/sections/${sectionId}/questions/order`, { method: 'PATCH', body: { ids: moved.map(question => question.id) } })
      return { ok: true }
    }
    catch (error) {
      data.value = previous
      return toActionFailure(error)
    }
  }

  return {
    questions: data, preview, pending, hasError, refresh,
    draft, editing, errors, general, saving, formErrors,
    startNew, startEdit, setType, save, errorMessage, validateForm, conditionTargets,
    duplicate, toggleActive, move,
  }
}
