import type { QuestionDirection, QuestionOption, QuestionType, Scale } from '../types/assessment'
import { CHOICE_TYPES, MIN_CHOICE_OPTIONS, QUESTION_CODE_PATTERN, defaultConfig, validateQuestionInput } from './questions'
import { applyScale } from './scales'

// HU008: imports the sections, questions and options of a Markdown file with the format of
// docs/test-1.md — "## Módulo n · Título (`CÓDIGO`)" headings followed by a table with the
// columns ID, Ref, Pregunta, Tipo and, optionally, Opciones and Dirección.

export const IMPORT_MAX_BYTES = 1_000_000

export type ScaleCode = 'F5' | 'IND' | 'SNN' | 'FC' | 'CMP5'

const SCALE_TOKENS: readonly ScaleCode[] = ['F5', 'IND', 'SNN', 'FC', 'CMP5']

const PLAIN_TOKENS: Record<string, QuestionType> = {
  OU: 'single_choice',
  OM: 'multiple_choice',
  SN: 'true_false',
  NUM: 'numeric_free',
  OPEN: 'open_text',
}

/** RF-05: the type (and scale) of a token of the document, or null when it is not supported. */
export function mapDocType(token: string): { type: QuestionType, scaleCode?: ScaleCode } | null {
  const key = token.trim().toUpperCase()
  if ((SCALE_TOKENS as readonly string[]).includes(key)) return { type: 'single_choice', scaleCode: key as ScaleCode }
  return PLAIN_TOKENS[key] ? { type: PLAIN_TOKENS[key] } : null
}

export interface ImportQuestion {
  /** 1-based line of the row in the file. */
  line: number
  code: string
  docRef: string | null
  prompt: string
  token: string
  type: QuestionType | null
  scaleCode?: ScaleCode
  /** The scale named by the token is not in the catalogue. */
  scaleMissing?: boolean
  config: Record<string, unknown>
  options: QuestionOption[]
  required: boolean
  direction: QuestionDirection
  isDraftContent: boolean
}

export interface ImportSection {
  line: number
  code: string
  title: string
  position: number
  isDraftContent: boolean
  questions: ImportQuestion[]
}

export interface TestImport { sections: ImportSection[] }

export type ImportErrorCode = 'no_modules' | 'unsupported_type' | 'invalid_code' | 'duplicate_code'
  | 'missing_prompt' | 'unknown_scale' | 'empty_options' | string

export interface ImportError {
  line: number
  code: ImportErrorCode
  questionCode?: string
  /** Set when the error comes from the question validation of HU005 (e.g. `config.max`). */
  field?: string
}

export interface ParsedImport { test: TestImport, errors: ImportError[] }

export interface ParseOptions {
  /** The scale catalogue (HU031); scale tokens copy their options from it. */
  scales?: Scale[]
  /** Section code by module number, for modules that list several codes (e.g. `{ 2: 'ANT' }`). */
  sectionCodes?: Record<number, string>
}

// --- Text helpers ---------------------------------------------------------------------------

const MODULE_HEADING = /^##\s+Módulo\s+(\d+)\s*·\s*(.+?)\s*\(([^)]*)\)\s*(.*)$/i

/** Removes the marks of the document: bold, †, ⚑ and italic notes such as *(opc.)*. */
function clean(text: string) {
  return text
    .replace(/\*\([^)]*\)\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/[†⚑]/g, '')
    .replace(/\((excluyente|alerta)\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** `1–2 días/semana` → `1_2_dias_semana`, within the option value format. */
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
    .replace(/_+$/g, '')
}

function cells(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim())
}

/** Options separated by ` · `; a trailing number is the score; `(excluyente)` marks exclusive. */
function parseOptions(text: string): QuestionOption[] {
  const taken = new Set<string>()

  return text.split('·').map(raw => raw.trim()).filter(Boolean).map((raw, index) => {
    const isExclusive = /\(excluyente\)/i.test(raw)
    let label = clean(raw)
    let score: number | null = null

    const scored = label.match(/^(.*\S)\s+(-?\d+(?:[.,]\d+)?)$/)
    if (scored) {
      label = scored[1]!
      score = Number(scored[2]!.replace(',', '.'))
    }

    let value = slugify(label) || `option_${index + 1}`
    for (let n = 2; taken.has(value); n++) value = `${slugify(label).slice(0, 36) || 'option'}_${n}`
    taken.add(value)

    return { value, label: { es: label }, score, isExclusive }
  })
}

const DIRECTIONS: Record<string, QuestionDirection> = {
  protector: 'higher_is_protective',
  riesgo: 'higher_is_risk',
  neutral: 'neutral',
}

interface Columns { id: number, ref: number, prompt: number, type: number, options: number, direction: number }

function columnsOf(header: string[]): Columns | null {
  const names = header.map(name => clean(name).toLowerCase())
  const find = (test: (name: string) => boolean) => names.findIndex(test)
  const id = find(name => name === 'id')
  const ref = find(name => name === 'ref')
  const type = find(name => name === 'tipo')
  if (id === -1 || type === -1) return null

  const options = find(name => name.startsWith('opciones'))
  const direction = find(name => name.startsWith('dirección') || name.startsWith('direccion'))
  const prompt = names.findIndex((_, index) => ![id, ref, type, options, direction].includes(index))

  return { id, ref, prompt, type, options, direction }
}

function parseRow(row: string[], columns: Columns, line: number, scales: Scale[], isDraftContent: boolean): ImportQuestion {
  const rawType = row[columns.type] ?? ''
  const rawPrompt = row[columns.prompt] ?? ''
  const rawOptions = columns.options === -1 ? '' : row[columns.options] ?? ''
  const rawDirection = columns.direction === -1 ? '' : clean(row[columns.direction] ?? '').toLowerCase()

  const [, token = '', rest = ''] = rawType.match(/^\s*([A-Za-z0-9]+)\s*(.*)$/) ?? []
  const mapped = mapDocType(token)
  const type = mapped?.type ?? null
  const inline = rest.trim().startsWith(':') ? rest.trim().slice(1) : ''
  const annotation = inline ? '' : rest.replace(/\*\([^)]*\)\*/g, '').trim()
  const optional = /\(opc\.\)/i.test(rawPrompt) || /\(opc\.\)/i.test(rawType)

  let direction: QuestionDirection = type === 'numeric_free' || type === 'open_text' ? 'neutral' : 'higher_is_risk'
  if (/mayor\s*=\s*protector/i.test(annotation)) direction = 'higher_is_protective'
  if (DIRECTIONS[rawDirection]) direction = DIRECTIONS[rawDirection]!

  const config: Record<string, unknown> = type ? defaultConfig(type) : {}
  let options: QuestionOption[] = []
  let scaleMissing = false

  if (mapped?.scaleCode) {
    const scale = scales.find(item => item.code === mapped.scaleCode)
    if (scale) options = applyScale(scale)
    else scaleMissing = true
  }
  else if (type && CHOICE_TYPES.includes(type)) {
    options = parseOptions(inline || rawOptions)
    if (type === 'multiple_choice') config.exclusiveValues = options.filter(option => option.isExclusive).map(option => option.value)
  }
  else if (type === 'numeric_free') {
    const note = annotation.replace(/^\(|\)$/g, '').trim()
    const range = note.match(/^(-?\d+(?:[.,]\d+)?)\s*[–-]\s*(-?\d+(?:[.,]\d+)?)$/)
    if (range) Object.assign(config, { min: Number(range[1]!.replace(',', '.')), max: Number(range[2]!.replace(',', '.')) })
    const unit = range ? '' : clean(note || rawOptions)
    if (unit) config.unit = { es: unit }
  }

  const ref = clean(row[columns.ref] ?? '')

  return {
    line,
    code: clean(row[columns.id] ?? ''),
    docRef: /^P\d+$/i.test(ref) ? ref.toUpperCase() : null,
    prompt: clean(rawPrompt),
    token: token.toUpperCase(),
    type,
    ...(mapped?.scaleCode ? { scaleCode: mapped.scaleCode } : {}),
    ...(scaleMissing ? { scaleMissing } : {}),
    config,
    options,
    required: !optional,
    direction,
    isDraftContent,
  }
}

/** RF-01: the modules and their rows. Text outside the modules (conventions, notes) is ignored. */
export function parseTestMarkdown(md: string, options: ParseOptions = {}): ParsedImport {
  const scales = options.scales ?? []
  const sections: ImportSection[] = []
  let current: ImportSection | null = null
  let columns: Columns | null = null

  md.split(/\r?\n/).forEach((text, index) => {
    const line = index + 1
    const trimmed = text.trim()

    if (/^#{1,2}\s/.test(trimmed)) {
      const heading = trimmed.match(MODULE_HEADING)
      columns = null
      if (!heading) {
        current = null
        return
      }
      const number = Number(heading[1])
      const codes = [...heading[3]!.matchAll(/[A-Z0-9_]+/g)].map(match => match[0])
      current = {
        line,
        code: options.sectionCodes?.[number] ?? codes.join('_'),
        title: clean(heading[2]!),
        position: sections.length + 1,
        isDraftContent: /borrador/i.test(heading[4] ?? ''),
        questions: [],
      }
      sections.push(current)
      return
    }

    if (!current || !trimmed.startsWith('|')) return
    if (/^\|[\s:|-]+\|?$/.test(trimmed)) return

    const row = cells(trimmed)
    const header = columnsOf(row)
    if (header) {
      columns = header
      return
    }
    if (!columns || !row[columns.id]) return

    current.questions.push(parseRow(row, columns, line, scales, current.isDraftContent))
  })

  return { test: { sections }, errors: sections.length ? [] : [{ line: 1, code: 'no_modules' }] }
}

// --- Preview --------------------------------------------------------------------------------

export interface ImportPreview {
  total: number
  sections: Array<{ code: string, title: string, count: number }>
  byType: Partial<Record<QuestionType, number>>
  errors: ImportError[]
}

/** The problems of one row: the first problem of the file format, or the HU005 validation. */
function rowErrors(question: ImportQuestion, seen: Set<string>): ImportError[] {
  const at = (code: ImportErrorCode, field?: string): ImportError =>
    ({ line: question.line, questionCode: question.code, code, ...(field ? { field } : {}) })

  if (!question.type) return [at('unsupported_type')]
  if (!QUESTION_CODE_PATTERN.test(question.code)) return [at('invalid_code')]
  if (seen.has(question.code)) return [at('duplicate_code')]
  if (!question.prompt) return [at('missing_prompt')]
  if (question.scaleMissing) return [at('unknown_scale')]
  if (CHOICE_TYPES.includes(question.type) && question.options.length < MIN_CHOICE_OPTIONS) return [at('empty_options')]

  return validateQuestionInput({
    code: question.code,
    prompt: { es: question.prompt },
    type: question.type,
    required: question.required,
    config: question.config,
    options: question.options,
    direction: question.direction,
  }).errors.map(error => at(error.code, error.field))
}

/** RF-02: counts by section and by type, and every error with its line. */
export function previewImport(parsed: ParsedImport): ImportPreview {
  const errors = [...parsed.errors]
  const byType: Partial<Record<QuestionType, number>> = {}
  const seen = new Set<string>()

  for (const section of parsed.test.sections) {
    for (const question of section.questions) {
      errors.push(...rowErrors(question, seen))
      seen.add(question.code)
      if (question.type) byType[question.type] = (byType[question.type] ?? 0) + 1
    }
  }

  return {
    total: parsed.test.sections.reduce((sum, section) => sum + section.questions.length, 0),
    sections: parsed.test.sections.map(section => ({ code: section.code, title: section.title, count: section.questions.length })),
    byType,
    errors,
  }
}

// --- Upsert plan ----------------------------------------------------------------------------

/** A stored question, reduced to what the file defines. */
export interface ExistingQuestion {
  id: string
  code: string
  sectionCode: string
  position: number
  docRef: string | null
  prompt: string
  type: QuestionType
  config: Record<string, unknown>
  options: QuestionOption[]
  required: boolean
  direction: QuestionDirection
  isDraftContent: boolean
}

export function toExistingQuestion(row: Omit<ExistingQuestion, 'type'> & { type: QuestionType | null }): ExistingQuestion {
  return {
    id: row.id,
    code: row.code,
    sectionCode: row.sectionCode,
    position: row.position,
    docRef: row.docRef ?? null,
    prompt: row.prompt,
    type: row.type as QuestionType,
    config: row.config,
    options: row.options,
    required: row.required,
    direction: row.direction,
    isDraftContent: row.isDraftContent,
  }
}

export type PlannedQuestion = ImportQuestion & { sectionCode: string, id?: string }

export interface UpsertPlan {
  sections: { create: string[], update: string[], unchanged: string[] }
  questions: { create: PlannedQuestion[], update: PlannedQuestion[], unchanged: string[], untouched: string[] }
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${key}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value ?? null)
}

/** Only what the file defines is compared; translations added later in the app are kept. */
function comparable(question: Omit<ExistingQuestion, 'id' | 'position'>) {
  return stable({
    sectionCode: question.sectionCode,
    docRef: question.docRef,
    prompt: question.prompt,
    type: question.type,
    config: question.config,
    options: question.options.map(option => ({ value: option.value, label: option.label.es, score: option.score, isExclusive: option.isExclusive })),
    required: question.required,
    direction: question.direction,
    isDraftContent: question.isDraftContent,
  })
}

/** RF-04: by code, what to create, what to update and what is already as the file says. */
export function planUpsert(existing: ExistingQuestion[], existingSections: Array<{ code: string, title: string }>, parsed: TestImport): UpsertPlan {
  const byCode = new Map(existing.map(question => [question.code, question]))
  const sectionTitles = new Map(existingSections.map(section => [section.code, section.title]))
  const plan: UpsertPlan = {
    sections: { create: [], update: [], unchanged: [] },
    questions: { create: [], update: [], unchanged: [], untouched: [] },
  }
  const inFile = new Set<string>()

  for (const section of parsed.sections) {
    const title = sectionTitles.get(section.code)
    if (title === undefined) plan.sections.create.push(section.code)
    else if (title !== section.title) plan.sections.update.push(section.code)
    else plan.sections.unchanged.push(section.code)

    for (const question of section.questions) {
      inFile.add(question.code)
      const planned: PlannedQuestion = { ...question, sectionCode: section.code }
      const stored = byCode.get(question.code)

      if (!stored) plan.questions.create.push(planned)
      else if (comparable({ ...planned, type: planned.type as QuestionType }) !== comparable(stored)) {
        // Keeps the English labels written in the app for options that still exist.
        const english = new Map(stored.options.map(option => [option.value, option.label.en]))
        plan.questions.update.push({
          ...planned,
          id: stored.id,
          options: planned.options.map(option => (english.get(option.value) ? { ...option, label: { ...option.label, en: english.get(option.value) } } : option)),
        })
      }
      else plan.questions.unchanged.push(question.code)
    }
  }

  plan.questions.untouched = existing.filter(question => !inFile.has(question.code)).map(question => question.code)
  return plan
}

/** The arguments of `public.import_test`: only what changes. */
export function toImportPayload(plan: UpsertPlan, parsed: TestImport) {
  const changed = new Set([...plan.sections.create, ...plan.sections.update])

  return {
    sections: parsed.sections.filter(section => changed.has(section.code)).map(section => ({ code: section.code, title: section.title })),
    questions: [...plan.questions.create, ...plan.questions.update].map(question => ({
      section_code: question.sectionCode,
      code: question.code,
      doc_ref: question.docRef,
      prompt: question.prompt,
      type: question.type,
      config: question.config,
      required: question.required,
      direction: question.direction,
      is_draft_content: question.isDraftContent,
      options: question.options.map(option => ({ value: option.value, label: option.label, score: option.score, is_exclusive: option.isExclusive })),
    })),
  }
}

export type ImportResult =
  | { ok: true, preview: ImportPreview, plan: UpsertPlan }
  | { ok: false, preview: ImportPreview, plan: null }

/**
 * RF-03: with any error nothing is written; otherwise the whole plan goes to `write` in one
 * call (one transaction). With nothing to change, nothing is written either.
 */
export async function runImport(
  parsed: ParsedImport,
  existing: { questions: ExistingQuestion[], sections: Array<{ code: string, title: string }> },
  write: (plan: UpsertPlan) => Promise<unknown>,
): Promise<ImportResult> {
  const preview = previewImport(parsed)
  if (preview.errors.length) return { ok: false, preview, plan: null }

  const plan = planUpsert(existing.questions, existing.sections, parsed.test)
  const changes = plan.sections.create.length + plan.sections.update.length + plan.questions.create.length + plan.questions.update.length
  if (changes) await write(plan)

  return { ok: true, preview, plan }
}
