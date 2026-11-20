import type { LocalizedText, TestStatus } from '../types/assessment'

export const TEST_STATUSES: readonly TestStatus[] = ['draft', 'published', 'archived']
export const TEST_CODE_PATTERN = /^[A-Z0-9_]{3,40}$/
export const TEST_TITLE_MIN = 3
export const TEST_TITLE_MAX = 120
export const TEST_DESCRIPTION_MAX = 1000

export interface TestInput {
  code: string
  title: LocalizedText
  description?: LocalizedText | null
}

export type TestErrorCode = 'required' | 'invalid_format' | 'too_short' | 'too_long'
export type TestErrorField = 'code' | 'title' | 'title.en' | 'description' | 'description.en'

export interface FieldError {
  field: TestErrorField
  code: TestErrorCode
}

export interface FieldValidation {
  ok: boolean
  errors: FieldError[]
}

export interface NewTestRow {
  code: string
  title: LocalizedText
  description: LocalizedText | null
  status: 'draft'
  version: 1
  created_by: string
}

export type DbErrorResult =
  | { field: 'code', code: 'code_taken' }
  | { field: null, code: 'forbidden' | 'unknown' }

export function isTestStatus(value: unknown): value is TestStatus {
  return typeof value === 'string' && (TEST_STATUSES as readonly string[]).includes(value)
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function localized(value: unknown): LocalizedText | null {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const es = text(source.es)
  const en = text(source.en)

  if (!es && !en) return null
  return en ? { es, en } : { es }
}

/** Trims the texts of an untrusted body and keeps only the fields a test accepts. */
export function normalizeTestInput(body: unknown): Required<TestInput> {
  const source = body && typeof body === 'object' ? body as Record<string, unknown> : {}

  return {
    code: text(source.code),
    title: localized(source.title) ?? { es: '' },
    description: localized(source.description),
  }
}

function checkLength(value: string, min: number, max: number): TestErrorCode | null {
  if (value.length < min) return 'too_short'
  if (value.length > max) return 'too_long'
  return null
}

/** RF-02: code `^[A-Z0-9_]{3,40}$`, title.es of 3–120 characters, optional description. */
export function validateTestInput(input: TestInput): FieldValidation {
  const errors: FieldError[] = []
  const code = text(input.code)
  const title = { es: text(input.title?.es), en: text(input.title?.en) }

  if (!code) errors.push({ field: 'code', code: 'required' })
  else if (!TEST_CODE_PATTERN.test(code)) errors.push({ field: 'code', code: 'invalid_format' })

  if (!title.es) errors.push({ field: 'title', code: 'required' })
  else {
    const issue = checkLength(title.es, TEST_TITLE_MIN, TEST_TITLE_MAX)
    if (issue) errors.push({ field: 'title', code: issue })
  }

  if (title.en) {
    const issue = checkLength(title.en, TEST_TITLE_MIN, TEST_TITLE_MAX)
    if (issue) errors.push({ field: 'title.en', code: issue })
  }

  if (text(input.description?.es).length > TEST_DESCRIPTION_MAX) errors.push({ field: 'description', code: 'too_long' })
  if (text(input.description?.en).length > TEST_DESCRIPTION_MAX) errors.push({ field: 'description.en', code: 'too_long' })

  return { ok: errors.length === 0, errors }
}

/** RF-01: the row to insert. Status, version and author never come from the client. */
export function buildNewTest(input: TestInput, userId: string): NewTestRow {
  const clean = normalizeTestInput(input)

  return { ...clean, status: 'draft', version: 1, created_by: userId }
}

/** RF-03: translates a Postgres error into something the form can show. */
export function mapDbError(error: { code?: string, message?: string }): DbErrorResult {
  if (error.code === '23505') return { field: 'code', code: 'code_taken' }
  if (error.code === '42501') return { field: null, code: 'forbidden' }
  return { field: null, code: 'unknown' }
}

export type EditableResult = { ok: true } | { ok: false, code: 'new_version_required' }

/** HU004 RF-06: only a draft without answers can change its structure. */
export function assertStructureEditable(test: { status: TestStatus }, hasAnswers: boolean): EditableResult {
  return test.status === 'draft' && !hasAnswers ? { ok: true } : { ok: false, code: 'new_version_required' }
}

/** HU004 RF-05: deleting a section that has questions needs an explicit confirmation. */
export function planDeleteSection(questionCount: number, confirmed: boolean) {
  return { needsConfirm: questionCount > 0 && !confirmed, questionCount }
}

/** RF-06: tests with the given status; the whole list when no status is given. */
export function filterTests<T extends { status: TestStatus }>(list: T[], status?: TestStatus): T[] {
  return status ? list.filter(test => test.status === status) : [...list]
}

/** Flat state of the create/edit form: one input per language. */
export interface TestFormState {
  code: string
  titleEs: string
  titleEn: string
  descriptionEs: string
  descriptionEn: string
}

const FORM_FIELDS: Record<TestErrorField, keyof TestFormState> = {
  'code': 'code',
  'title': 'titleEs',
  'title.en': 'titleEn',
  'description': 'descriptionEs',
  'description.en': 'descriptionEn',
}

/** The form writes codes in upper case for the user; the rest is trimmed by normalizeTestInput. */
export function formToTestInput(state: TestFormState): Required<TestInput> {
  return normalizeTestInput({
    code: state.code.trim().toUpperCase(),
    title: { es: state.titleEs, en: state.titleEn },
    description: { es: state.descriptionEs, en: state.descriptionEn },
  })
}

export function testErrorToFormField(field: TestErrorField): keyof TestFormState {
  return FORM_FIELDS[field]
}

/** Text in the active locale, falling back to Spanish (decision D-2). */
export function localizedText(value: LocalizedText | null | undefined, locale: string): string {
  if (!value) return ''
  return (locale === 'en' && value.en) ? value.en : value.es
}

// ---------------------------------------------------------------- Sections (HU004)

export const SECTION_CODE_PATTERN = /^[A-Z0-9_]{2,40}$/
export const SECTION_DOMAIN_MIN = 2
export const SECTION_DOMAIN_MAX = 60

export interface SectionInput {
  code: string
  title: LocalizedText
  domain: string
}

export type SectionErrorField = 'code' | 'title' | 'title.en' | 'domain'

export interface SectionFieldError {
  field: SectionErrorField
  code: TestErrorCode
}

export type SectionDbErrorResult =
  | { field: 'code', code: 'section_code_taken' }
  | { field: null, code: 'new_version_required' | 'forbidden' | 'unknown' }

interface PartialOption { partial?: boolean }

/** Trims an untrusted body. With `partial`, only the fields present are returned (PATCH). */
export function normalizeSectionInput(body: unknown, { partial = false }: PartialOption = {}): Partial<SectionInput> {
  const source = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const result: Partial<SectionInput> = {}

  if (!partial || 'code' in source) result.code = text(source.code).toUpperCase()
  if (!partial || 'title' in source) result.title = localized(source.title) ?? { es: '' }
  if (!partial || 'domain' in source) result.domain = text(source.domain)

  return result
}

/** Code `^[A-Z0-9_]{2,40}$`, title like a test title, domain of 2–60 characters. */
export function validateSectionInput(input: Partial<SectionInput>, { partial = false }: PartialOption = {}) {
  const errors: SectionFieldError[] = []
  const check = (key: keyof SectionInput) => !partial || input[key] !== undefined

  if (check('code')) {
    const code = text(input.code)
    if (!code) errors.push({ field: 'code', code: 'required' })
    else if (!SECTION_CODE_PATTERN.test(code)) errors.push({ field: 'code', code: 'invalid_format' })
  }

  if (check('title')) {
    const es = text(input.title?.es)
    const en = text(input.title?.en)
    if (!es) errors.push({ field: 'title', code: 'required' })
    else {
      const issue = checkLength(es, TEST_TITLE_MIN, TEST_TITLE_MAX)
      if (issue) errors.push({ field: 'title', code: issue })
    }
    if (en) {
      const issue = checkLength(en, TEST_TITLE_MIN, TEST_TITLE_MAX)
      if (issue) errors.push({ field: 'title.en', code: issue })
    }
  }

  if (check('domain')) {
    const domain = text(input.domain)
    if (!domain) errors.push({ field: 'domain', code: 'required' })
    else {
      const issue = checkLength(domain, SECTION_DOMAIN_MIN, SECTION_DOMAIN_MAX)
      if (issue) errors.push({ field: 'domain', code: issue })
    }
  }

  return { ok: errors.length === 0, errors }
}

/** HU004 RF-02 and CA-05: Postgres errors of `test_sections` as form errors. */
export function mapSectionDbError(error: { code?: string, message?: string }): SectionDbErrorResult {
  if (error.code === '23505' && error.message?.includes('test_sections_test_code_key')) {
    return { field: 'code', code: 'section_code_taken' }
  }
  if (error.code === 'P0001' && error.message?.includes('new_version_required')) {
    return { field: null, code: 'new_version_required' }
  }
  if (error.code === '42501') return { field: null, code: 'forbidden' }
  return { field: null, code: 'unknown' }
}

/** Flat state of the section form: one input per language. */
export interface SectionFormState {
  code: string
  titleEs: string
  titleEn: string
  domain: string
}

const SECTION_FORM_FIELDS: Record<SectionErrorField, keyof SectionFormState> = {
  'code': 'code',
  'title': 'titleEs',
  'title.en': 'titleEn',
  'domain': 'domain',
}

export function formToSectionInput(state: SectionFormState): SectionInput {
  return normalizeSectionInput({
    code: state.code,
    title: { es: state.titleEs, en: state.titleEn },
    domain: state.domain,
  }) as SectionInput
}

export function sectionToForm(section: SectionInput): SectionFormState {
  return { code: section.code, titleEs: section.title.es, titleEn: section.title.en ?? '', domain: section.domain }
}

export function sectionErrorToFormField(field: SectionErrorField): keyof SectionFormState {
  return SECTION_FORM_FIELDS[field]
}
