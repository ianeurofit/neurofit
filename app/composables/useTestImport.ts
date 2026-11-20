import type { ImportError, ImportPreview } from '#shared/utils/importer'

export type ImportState = 'empty' | 'reading' | 'analyzing' | 'ready' | 'importing' | 'done' | 'error'

export type ImportGeneralError = 'empty_file' | 'too_large' | 'not_markdown' | 'new_version_required' | 'forbidden' | 'unknown'

export interface ImportPlanSummary {
  sections: { create: number, update: number, unchanged: number }
  questions: { create: number, update: number, unchanged: number, untouched: number }
}

interface ImportReply { dryRun: boolean, imported: boolean, preview: ImportPreview, plan: ImportPlanSummary | null }

interface ServerError {
  statusCode?: number
  data?: { data?: { code?: ImportGeneralError, preview?: ImportPreview } }
}

/** Codes of the file format; the rest come from the question validation (HU005). */
const IMPORT_CODES = new Set(['no_modules', 'unsupported_type', 'invalid_code', 'duplicate_code', 'missing_prompt', 'unknown_scale', 'empty_options'])

/** HU008: choose a file → preview (dry run) → confirm. Nothing is written until confirming. */
export function useTestImport(testId: string) {
  // `$i18n.t` works outside a component setup and still reacts to the active locale.
  const t = useNuxtApp().$i18n.t
  const url = `/api/admin/tests/${testId}/import`

  const state = ref<ImportState>('empty')
  const fileName = ref<string | null>(null)
  const markdown = ref('')
  const preview = ref<ImportPreview | null>(null)
  const plan = ref<ImportPlanSummary | null>(null)
  const general = ref<ImportGeneralError | null>(null)

  const errors = computed(() => (preview.value?.errors ?? []).map((error: ImportError) => ({
    ...error,
    message: IMPORT_CODES.has(error.code)
      ? t(`tests.import.errors.${error.code}`)
      : t(questionErrorKey(error.field ?? '', error.code), questionErrorParams(error.code)),
  })))

  const changes = computed(() => (plan.value
    ? plan.value.sections.create + plan.value.sections.update + plan.value.questions.create + plan.value.questions.update
    : 0))
  const canConfirm = computed(() => state.value === 'ready' && !errors.value.length && changes.value > 0)

  function fail(error: unknown) {
    const { statusCode, data } = error as ServerError
    const body = data?.data

    if (statusCode === 422 && body?.preview) {
      preview.value = body.preview
      state.value = 'ready'
      return
    }
    general.value = body?.code ?? (statusCode === 403 ? 'forbidden' : 'unknown')
    state.value = 'error'
  }

  async function send(dryRun: boolean) {
    const reply = await $fetch<ImportReply>(url, { method: 'POST', query: dryRun ? { dryRun: 'true' } : {}, body: { markdown: markdown.value } })
    preview.value = reply.preview
    plan.value = reply.plan
    return reply
  }

  function reset() {
    state.value = 'empty'
    fileName.value = null
    markdown.value = ''
    preview.value = null
    plan.value = null
    general.value = null
  }

  /** Reads the file and asks the server for the preview (dry run). */
  async function load(file: File) {
    reset()
    fileName.value = file.name

    if (!/\.(md|markdown)$/i.test(file.name)) {
      general.value = 'not_markdown'
      state.value = 'error'
      return
    }
    if (file.size > IMPORT_MAX_BYTES) {
      general.value = 'too_large'
      state.value = 'error'
      return
    }

    state.value = 'reading'
    markdown.value = await file.text()
    if (!markdown.value.trim()) {
      general.value = 'empty_file'
      state.value = 'error'
      return
    }

    state.value = 'analyzing'
    try {
      await send(true)
      state.value = 'ready'
    }
    catch (error) {
      fail(error)
    }
  }

  async function retry() {
    if (!markdown.value) return reset()
    general.value = null
    state.value = 'analyzing'
    try {
      await send(true)
      state.value = 'ready'
    }
    catch (error) {
      fail(error)
    }
  }

  /** CA-03: only a preview without errors is imported, in one request (one transaction). */
  async function confirm(): Promise<{ ok: boolean }> {
    if (!canConfirm.value) return { ok: false }

    state.value = 'importing'
    try {
      await send(false)
      state.value = 'done'
      return { ok: true }
    }
    catch (error) {
      fail(error)
      return { ok: false }
    }
  }

  return { state, fileName, preview, plan, errors, general, canConfirm, changes, load, retry, confirm, reset }
}
