import type { Condition, LocalizedText, QuestionDetail, QuestionDirection, QuestionOption, QuestionType } from '../types/assessment'

// HU005: questions of every supported type. The configuration of each type follows
// specs.md §5; HU031 options copied from a scale are validated with `validateOptions`.

export const QUESTION_TYPES: readonly QuestionType[] = [
  'single_choice', 'multiple_choice', 'true_false', 'numeric_scale', 'agreement', 'numeric_free', 'open_text',
]
export const QUESTION_DIRECTIONS: readonly QuestionDirection[] = ['neutral', 'higher_is_risk', 'higher_is_protective']
export const CHOICE_TYPES: readonly QuestionType[] = ['single_choice', 'multiple_choice']
export const MIN_CHOICE_OPTIONS = 2
export const AGREEMENT_POINTS = 5
export const OPEN_TEXT_MAX_LENGTH = { min: 1, max: 5000, default: 1000 }
export const QUESTION_CODE_PATTERN = /^[A-Z0-9_]{2,40}$/
export const OPTION_VALUE_PATTERN = /^[a-z0-9_]{1,40}$/
export const QUESTION_PROMPT_MAX = 1000

export interface QuestionInput {
  code: string
  prompt: LocalizedText
  type: QuestionType
  required: boolean
  allowsDecline?: boolean
  config?: Record<string, unknown>
  options?: QuestionOption[]
  variable?: string | null
  direction?: QuestionDirection
  weight?: number | null
  alertRule?: Record<string, unknown> | null
  source?: string | null
  conversationalHint?: LocalizedText | null
  docRef?: string | null
  clinicalNote?: string | null
  dependsOn?: Condition | null
  active?: boolean
}

export type QuestionErrorCode = 'required' | 'invalid_format' | 'too_long' | 'invalid_type'
  | 'min_options' | 'duplicate_option' | 'invalid_score' | 'unknown_option'
  | 'min_gte_max' | 'min_gt_max' | 'labels_count' | 'out_of_range' | 'invalid_number'
  | 'invalid_direction'

export interface QuestionFieldError {
  /**
   * `code`, `prompt`, `type`, `required`, `direction`, `weight`, `options`, one option field
   * (`options.<index>.<value|label|score>`) or one config field (`config.<name>[.<index>]`).
   */
  field: string
  code: QuestionErrorCode
}

export interface QuestionValidation {
  ok: boolean
  errors: QuestionFieldError[]
}

function blank(value: unknown) {
  return typeof value !== 'string' || value.trim() === ''
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function present(value: unknown) {
  return value !== undefined && value !== null && value !== ''
}

const localized = (es: string, en: string) => ({ es, en })

const AGREEMENT_LABELS = [
  localized('Totalmente en desacuerdo', 'Strongly disagree'),
  localized('En desacuerdo', 'Disagree'),
  localized('Ni de acuerdo ni en desacuerdo', 'Neither agree nor disagree'),
  localized('De acuerdo', 'Agree'),
  localized('Totalmente de acuerdo', 'Strongly agree'),
]

/** The starting configuration of each type (specs.md §5). Always a fresh copy. */
export function defaultConfig(type: QuestionType): Record<string, unknown> {
  switch (type) {
    case 'multiple_choice':
      return { exclusiveValues: [] }
    case 'true_false':
      return { labels: { true: localized('Sí', 'Yes'), false: localized('No', 'No') } }
    case 'numeric_scale':
      return { min: 1, max: 10 }
    case 'agreement':
      return { labels: AGREEMENT_LABELS.map(label => ({ ...label })) }
    case 'open_text':
      return { maxLength: OPEN_TEXT_MAX_LENGTH.default }
    default:
      return {}
  }
}

/** Errors of the options of a choice question, each on its own option. */
export function validateOptions(options: QuestionOption[]): QuestionFieldError[] {
  const errors: QuestionFieldError[] = []

  if (options.length < MIN_CHOICE_OPTIONS) return [{ field: 'options', code: 'min_options' }]

  const values = new Set<string>()
  const labels = new Set<string>()

  options.forEach((option, index) => {
    const value = option.value?.trim() ?? ''
    const label = option.label?.es?.trim().toLowerCase() ?? ''

    if (!value) errors.push({ field: `options.${index}.value`, code: 'required' })
    else if (!OPTION_VALUE_PATTERN.test(value)) errors.push({ field: `options.${index}.value`, code: 'invalid_format' })
    else if (values.has(value)) errors.push({ field: `options.${index}.value`, code: 'duplicate_option' })
    values.add(value)

    if (!label) errors.push({ field: `options.${index}.label`, code: 'required' })
    else if (labels.has(label)) errors.push({ field: `options.${index}.label`, code: 'duplicate_option' })
    labels.add(label)

    if (option.score !== null && !Number.isFinite(option.score)) {
      errors.push({ field: `options.${index}.score`, code: 'invalid_score' })
    }
  })

  return errors
}

function hasSpanish(value: unknown): value is LocalizedText {
  return typeof value === 'object' && value !== null && !blank((value as LocalizedText).es)
}

/** Errors of the configuration of one question type, on `config.<field>`. */
export function validateConfig(type: QuestionType, config: Record<string, unknown> = {}, options: QuestionOption[] = []): QuestionFieldError[] {
  const errors: QuestionFieldError[] = []
  const push = (field: string, code: QuestionErrorCode) => errors.push({ field: `config.${field}`, code })

  switch (type) {
    case 'multiple_choice': {
      const exclusive = config.exclusiveValues ?? []
      const known = new Set(options.map(option => option.value))
      if (!Array.isArray(exclusive) || exclusive.some(value => !known.has(String(value)))) push('exclusiveValues', 'unknown_option')
      break
    }
    case 'true_false': {
      const labels = (config.labels ?? {}) as Record<string, unknown>
      if (!hasSpanish(labels.true) || !hasSpanish(labels.false)) push('labels', 'required')
      break
    }
    case 'numeric_scale': {
      const { min, max } = config
      if (!isNumber(min)) push('min', 'invalid_number')
      if (!isNumber(max)) push('max', 'invalid_number')
      else if (isNumber(min) && min >= max) push('max', 'min_gte_max')
      for (const field of ['minLabel', 'maxLabel']) {
        if (present(config[field]) && typeof config[field] !== 'object') push(field, 'invalid_format')
      }
      break
    }
    case 'agreement': {
      const labels = config.labels
      if (!Array.isArray(labels) || labels.length !== AGREEMENT_POINTS) push('labels', 'labels_count')
      else labels.forEach((label, index) => !hasSpanish(label) && push(`labels.${index}`, 'required'))
      break
    }
    case 'numeric_free': {
      const { min, max, step } = config
      for (const [field, value] of Object.entries({ min, max, step })) {
        if (present(value) && !isNumber(value)) push(field, 'invalid_number')
      }
      if (isNumber(step) && step <= 0) push('step', 'invalid_number')
      if (isNumber(min) && isNumber(max) && min > max) push('max', 'min_gt_max')
      if (present(config.unit) && typeof config.unit !== 'object') push('unit', 'invalid_format')
      break
    }
    case 'open_text': {
      const { maxLength } = config
      if (!Number.isInteger(maxLength) || (maxLength as number) < OPEN_TEXT_MAX_LENGTH.min || (maxLength as number) > OPEN_TEXT_MAX_LENGTH.max) {
        push('maxLength', 'out_of_range')
      }
      break
    }
  }

  return errors
}

/** RF-01…RF-08: every error of the question at once, each on its field. */
export function validateQuestionInput(input: QuestionInput): QuestionValidation {
  const errors: QuestionFieldError[] = []
  const knownType = QUESTION_TYPES.includes(input.type)

  if (blank(input.code)) errors.push({ field: 'code', code: 'required' })
  else if (!QUESTION_CODE_PATTERN.test(input.code)) errors.push({ field: 'code', code: 'invalid_format' })

  if (blank(input.prompt?.es)) errors.push({ field: 'prompt', code: 'required' })
  else if (input.prompt.es.trim().length > QUESTION_PROMPT_MAX) errors.push({ field: 'prompt', code: 'too_long' })

  if (blank(input.type)) errors.push({ field: 'type', code: 'required' })
  else if (!knownType) errors.push({ field: 'type', code: 'invalid_type' })

  if (typeof input.required !== 'boolean') errors.push({ field: 'required', code: 'required' })

  if (knownType) {
    if (CHOICE_TYPES.includes(input.type)) errors.push(...validateOptions(input.options ?? []))
    errors.push(...validateConfig(input.type, input.config, input.options))
  }

  if (input.direction !== undefined && !QUESTION_DIRECTIONS.includes(input.direction)) {
    errors.push({ field: 'direction', code: 'invalid_direction' })
  }
  if (present(input.weight) && (!isNumber(input.weight) || input.weight < 0)) {
    errors.push({ field: 'weight', code: 'invalid_number' })
  }

  return { ok: errors.length === 0, errors }
}

// --- Request bodies, rows and the form -------------------------------------------------

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function optionalText(value: unknown) {
  const trimmed = text(value)
  return trimmed || null
}

function optionalLocalized(value: unknown): LocalizedText | null {
  if (typeof value !== 'object' || value === null) return null
  const { es, en } = value as Record<string, unknown>
  if (!text(es)) return null
  return text(en) ? { es: text(es), en: text(en) } : { es: text(es) }
}

function toNumberOrNull(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : Number.NaN
}

/** Keeps only the fields a body may send, trimmed. Options are kept for choice types only. */
export function normalizeQuestionInput(body: unknown): QuestionInput & { sectionId: string } {
  const raw = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>
  const prompt = (typeof raw.prompt === 'object' && raw.prompt !== null ? raw.prompt : {}) as Record<string, unknown>
  const type = text(raw.type) as QuestionType
  const config = typeof raw.config === 'object' && raw.config !== null && !Array.isArray(raw.config)
    ? raw.config as Record<string, unknown>
    : {}
  const exclusive = new Set(type === 'multiple_choice' && Array.isArray(config.exclusiveValues) ? config.exclusiveValues.map(String) : [])
  const options = CHOICE_TYPES.includes(type) && Array.isArray(raw.options)
    ? (raw.options as Array<Record<string, unknown>>).map((option) => {
        const value = text(option?.value)
        const label = optionalLocalized(option?.label) ?? { es: '' }
        return { value, label, score: toNumberOrNull(option?.score), isExclusive: exclusive.has(value) }
      })
    : []
  const weight = toNumberOrNull(raw.weight)

  return {
    sectionId: text(raw.sectionId),
    code: text(raw.code),
    prompt: text(prompt.en) ? { es: text(prompt.es), en: text(prompt.en) } : { es: text(prompt.es) },
    type,
    required: raw.required as boolean,
    allowsDecline: raw.allowsDecline === true,
    config,
    options,
    variable: optionalText(raw.variable),
    direction: (text(raw.direction) || 'neutral') as QuestionDirection,
    weight,
    alertRule: typeof raw.alertRule === 'object' && raw.alertRule !== null ? raw.alertRule as Record<string, unknown> : null,
    source: optionalText(raw.source),
    conversationalHint: optionalLocalized(raw.conversationalHint),
    docRef: optionalText(raw.docRef),
    clinicalNote: optionalText(raw.clinicalNote),
    dependsOn: normalizeCondition(raw.dependsOn),
    active: raw.active !== false,
  }
}

/** A condition with its code upper-cased, or null when none is set. */
export function normalizeCondition(value: unknown): Condition | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>
  const questionCode = text(raw.questionCode).toUpperCase()
  if (!questionCode) return null
  return { questionCode, op: text(raw.op) as Condition['op'], value: raw.value ?? null }
}

/** The arguments of `public.save_question`: the question row and its options. */
export function toQuestionRow(input: QuestionInput & { sectionId: string }) {
  return {
    question: {
      section_id: input.sectionId,
      code: input.code,
      doc_ref: input.docRef ?? null,
      prompt: input.prompt,
      type: input.type,
      config: input.config ?? {},
      required: input.required,
      allows_decline: input.allowsDecline ?? false,
      variable: input.variable ?? null,
      direction: input.direction ?? 'neutral',
      weight: input.weight ?? null,
      alert_rule: input.alertRule ?? null,
      conversational_hint: input.conversationalHint ?? null,
      source: input.source ?? null,
      clinical_note: input.clinicalNote ?? null,
      depends_on: input.dependsOn ?? null,
      active: input.active ?? true,
    },
    options: (input.options ?? []).map(option => ({
      value: option.value,
      label: option.label,
      score: option.score,
      is_exclusive: option.isExclusive,
    })),
  }
}

interface OptionRow { value: string, label: unknown, score: number | string | null, position: number, is_exclusive: boolean }

/** A row of `questions` with its `question_options`, as the admin API returns it. */
export function questionFromRow(row: Record<string, unknown> & { options?: OptionRow[] | null }): QuestionDetail {
  const options = [...(row.options ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(option => ({
      value: option.value,
      label: option.label as LocalizedText,
      score: option.score === null ? null : Number(option.score),
      isExclusive: option.is_exclusive,
    }))

  return {
    id: row.id as string,
    test_id: row.test_id as string,
    section_id: row.section_id as string,
    code: row.code as string,
    prompt: row.prompt as LocalizedText,
    type: row.type as QuestionType,
    config: (row.config ?? {}) as Record<string, unknown>,
    required: row.required as boolean,
    allows_decline: row.allows_decline as boolean,
    position: row.position as number,
    variable: (row.variable ?? null) as string | null,
    direction: row.direction as QuestionDirection,
    weight: row.weight === null || row.weight === undefined ? null : Number(row.weight),
    source: (row.source ?? null) as string | null,
    conversational_hint: (row.conversational_hint ?? null) as LocalizedText | null,
    doc_ref: (row.doc_ref ?? null) as string | null,
    clinical_note: (row.clinical_note ?? null) as string | null,
    depends_on: (row.depends_on ?? null) as Condition | null,
    active: row.active !== false,
    options,
  }
}

/** The body that would recreate a stored question; PATCH merges the request over it. */
export function questionToBody(question: QuestionDetail) {
  return {
    sectionId: question.section_id,
    code: question.code,
    prompt: question.prompt,
    type: question.type,
    required: question.required,
    allowsDecline: question.allows_decline,
    config: question.config,
    options: question.options,
    variable: question.variable,
    direction: question.direction,
    weight: question.weight,
    source: question.source,
    conversationalHint: question.conversational_hint,
    docRef: question.doc_ref,
    clinicalNote: question.clinical_note,
    dependsOn: question.depends_on,
    active: question.active,
  }
}

export type QuestionDbErrorResult =
  | { field: 'code', code: 'question_code_taken' }
  | { field: 'sectionId', code: 'section_not_found' }
  | { field: null, code: 'new_version_required' | 'question_not_found' | 'forbidden' | 'unknown' }

/** Turns a Postgres error of `save_question` into a field error or a general one. */
export function mapQuestionDbError(error: { code?: string, message?: string }): QuestionDbErrorResult {
  if (error.code === '23505' && error.message?.includes('questions_test_code_key')) {
    return { field: 'code', code: 'question_code_taken' }
  }
  if (error.code === '23503' && error.message?.includes('questions_section_fkey')) {
    return { field: 'sectionId', code: 'section_not_found' }
  }
  if (error.code === 'P0001' && error.message?.includes('new_version_required')) {
    return { field: null, code: 'new_version_required' }
  }
  if (error.code === 'P0002') return { field: null, code: 'question_not_found' }
  if (error.code === '42501') return { field: null, code: 'forbidden' }
  return { field: null, code: 'unknown' }
}

/** Flat state of the question form: one input per language. */
export interface QuestionFormState {
  sectionId: string
  code: string
  promptEs: string
  promptEn: string
  type: QuestionType
  required: boolean
  allowsDecline: boolean
  config: Record<string, unknown>
  options: QuestionOption[]
  variable: string
  direction: QuestionDirection
  weight: string | number
  source: string
  hintEs: string
  hintEn: string
  dependsOn: Condition | null
  active: boolean
}

export function emptyQuestionForm(sectionId: string, type: QuestionType = 'single_choice'): QuestionFormState {
  return {
    sectionId, code: '', promptEs: '', promptEn: '', type, required: true, allowsDecline: false,
    config: defaultConfig(type), options: [], variable: '', direction: 'neutral', weight: '', source: '', hintEs: '', hintEn: '',
    dependsOn: null, active: true,
  }
}

export function questionToForm(question: QuestionDetail): QuestionFormState {
  return {
    sectionId: question.section_id,
    code: question.code,
    promptEs: question.prompt.es,
    promptEn: question.prompt.en ?? '',
    type: question.type,
    required: question.required,
    allowsDecline: question.allows_decline,
    config: structuredClone(question.config),
    options: question.options.map(option => ({ ...option, label: { ...option.label } })),
    variable: question.variable ?? '',
    direction: question.direction,
    weight: question.weight ?? '',
    source: question.source ?? '',
    hintEs: question.conversational_hint?.es ?? '',
    hintEn: question.conversational_hint?.en ?? '',
    dependsOn: question.depends_on ? { ...question.depends_on } : null,
    active: question.active,
  }
}

/** A new type starts from its default configuration; only choice types keep their options. */
export function changeQuestionType(state: QuestionFormState, type: QuestionType) {
  state.type = type
  state.config = defaultConfig(type)
  if (!CHOICE_TYPES.includes(type)) state.options = []
}

/** The request body of the form; the code is upper-cased as the user types it. */
export function formToQuestionBody(state: QuestionFormState) {
  return normalizeQuestionInput({
    ...state,
    code: state.code.trim().toUpperCase(),
    prompt: { es: state.promptEs, en: state.promptEn },
    conversationalHint: { es: state.hintEs, en: state.hintEn },
  })
}

/** Values the translated message of an error code interpolates (`errors.question.<code>`). */
export function questionErrorParams(code: string) {
  return {
    min: code === 'min_options' ? MIN_CHOICE_OPTIONS : OPEN_TEXT_MAX_LENGTH.min,
    max: code === 'too_long' ? QUESTION_PROMPT_MAX : OPEN_TEXT_MAX_LENGTH.max,
    count: AGREEMENT_POINTS,
  }
}

/** The i18n key of an error: conditions have their own block (HU006). */
export function questionErrorKey(field: string, code: string) {
  return field.startsWith('dependsOn') ? `errors.condition.${code}` : `errors.question.${code}`
}

/** A stored question as the condition checks see it. */
export function toConditionTarget(question: QuestionDetail) {
  return { code: question.code, type: question.type, config: question.config, options: question.options, dependsOn: question.depends_on }
}

/** The form field that shows an error of `validateQuestionInput`. */
export function questionErrorToFormField(field: string) {
  if (field === 'prompt') return 'promptEs'
  return field
}

// --- HU006: lifecycle --------------------------------------------------------------------

/** Fields whose change would break the answers already given (CA-02). */
const ANSWER_BOUND_FIELDS: Array<keyof QuestionInput> = ['type', 'options']

/** RF-01 / RF-02: with answers, the type and the options can only change in a new version. */
export function assertQuestionChange(change: Partial<QuestionInput>, hasAnswers: boolean):
  { ok: true } | { ok: false, code: 'new_version_required' } {
  if (hasAnswers && ANSWER_BOUND_FIELDS.some(field => field in change)) return { ok: false, code: 'new_version_required' }
  return { ok: true }
}

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].every(key => same((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

/** The fields of `after` that differ from `before` (absent and undefined are the same). */
export function diffQuestion<T extends QuestionInput>(before: T, after: T): Partial<T> {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<keyof T>
  return Object.fromEntries([...keys]
    .filter(key => !same(before[key] ?? null, after[key] ?? null))
    .map(key => [key, after[key]])) as Partial<T>
}

const COPY_SUFFIX = '_COPY'
const CODE_MAX = 40

/** RF-03: `<code>_COPY`, `<code>_COPY2`… — the first one not taken, within 40 characters. */
export function duplicateCode(code: string, existing: string[]): string {
  const taken = new Set(existing)
  for (let n = 1; ; n++) {
    const suffix = n === 1 ? COPY_SUFFIX : `${COPY_SUFFIX}${n}`
    const candidate = `${code.slice(0, CODE_MAX - suffix.length)}${suffix}`
    if (!taken.has(candidate)) return candidate
  }
}

/** RF-04: the questions a new assessment shows — only active ones, by section and position. */
export function buildQuestionnaire<T extends { active: boolean, position: number, sectionPosition?: number }>(questions: T[]): T[] {
  return questions
    .filter(question => question.active)
    .sort((a, b) => (a.sectionPosition ?? 0) - (b.sectionPosition ?? 0) || a.position - b.position)
}
