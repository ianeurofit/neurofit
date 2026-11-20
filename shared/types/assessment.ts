// Shared contracts of the evaluation module (specs.md §8).
export type Locale = 'es' | 'en'
export type LocalizedText = { es: string, en?: string }

export type TestStatus = 'draft' | 'published' | 'archived'

export interface TestSummary {
  id: string
  code: string
  title: LocalizedText
  description: LocalizedText | null
  version: number
  status: TestStatus
  created_at: string
}

export interface SectionSummary {
  id: string
  test_id: string
  code: string
  title: LocalizedText
  domain: string
  position: number
  question_count: number
}

export interface TestDetail extends TestSummary {
  sections: SectionSummary[]
}

/** An option as a question stores it (specs.md §8). */
export interface QuestionOption {
  value: string
  label: LocalizedText
  score: number | null
  isExclusive: boolean
}

export interface ScaleOption {
  value: string
  label: { es: string, en: string }
  score: number | null
  position: number
}

export interface Scale {
  code: string
  name: { es: string, en: string }
  options: ScaleOption[]
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false'
  | 'numeric_scale' | 'agreement' | 'numeric_free' | 'open_text'

export type QuestionDirection = 'higher_is_risk' | 'higher_is_protective' | 'neutral'

/** A question as the admin API returns it (HU005), with its options in order. */
export interface QuestionDetail {
  id: string
  test_id: string
  section_id: string
  code: string
  prompt: LocalizedText
  type: QuestionType
  config: Record<string, unknown>
  required: boolean
  allows_decline: boolean
  position: number
  variable: string | null
  direction: QuestionDirection
  weight: number | null
  source: string | null
  conversational_hint: LocalizedText | null
  doc_ref: string | null
  clinical_note: string | null
  depends_on: Condition | null
  active: boolean
  options: QuestionOption[]
}

export type ConditionOperator = 'eq' | 'neq' | 'in' | 'any_eq'

/** "Show this question only if …" (specs.md §8). One condition per question (HU006). */
export interface Condition { questionCode: string, op: ConditionOperator, value: unknown }

/** A question inside a whole test tree (HU007): what a new version copies. */
export type TreeQuestion = Omit<QuestionDetail, 'id' | 'test_id' | 'section_id'> & {
  id?: string
  test_id?: string
  section_id?: string
  alert_rule: Record<string, unknown> | null
  is_draft_content: boolean
}

export interface TreeSection {
  id?: string
  code: string
  title: LocalizedText
  domain: string
  position: number
  is_draft_content: boolean
  questions: TreeQuestion[]
}

/** A test with its sections, questions and options, in order (HU007). */
export interface TestTree {
  id?: string
  code: string
  title: LocalizedText
  description: LocalizedText | null
  version: number
  status: TestStatus
  parent_test_id: string | null
  sections: TreeSection[]
}

export type AssessmentMode = 'form' | 'conversation' | 'mixed'
