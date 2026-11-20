import type { Condition, ConditionOperator, QuestionOption, QuestionType } from '../types/assessment'

// HU006: "show this question only if <CODE> <op> <value>". One condition per question; the
// referenced question must exist in the same test and the value must fit its type.

export const CONDITION_OPERATORS: readonly ConditionOperator[] = ['eq', 'neq', 'in', 'any_eq']

/** The operators each type accepts. Free text cannot be the source of a condition. */
export const OPERATORS_BY_TYPE: Record<QuestionType, readonly ConditionOperator[]> = {
  single_choice: ['eq', 'neq', 'in'],
  multiple_choice: ['any_eq'],
  true_false: ['eq', 'neq'],
  numeric_scale: ['eq', 'neq', 'in'],
  agreement: ['eq', 'neq', 'in'],
  numeric_free: ['eq', 'neq'],
  open_text: [],
}

export type ConditionErrorCode = 'unknown_question' | 'invalid_operator' | 'invalid_value' | 'self_reference' | 'cycle'

export type ConditionResult = { ok: true } | { ok: false, code: ConditionErrorCode }

/** What a condition needs to know about the question it points to. */
export interface ConditionTarget {
  code: string
  type: QuestionType
  config: Record<string, unknown>
  options: QuestionOption[]
  dependsOn: Condition | null
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function inRange(value: number, min: unknown, max: unknown) {
  return (!isNumber(min) || value >= min) && (!isNumber(max) || value <= max)
}

/** Whether one answer value is possible for the question. */
function validValue(target: ConditionTarget, value: unknown): boolean {
  switch (target.type) {
    case 'single_choice':
    case 'multiple_choice':
      return typeof value === 'string' && target.options.some(option => option.value === value)
    case 'true_false':
      return typeof value === 'boolean'
    case 'numeric_scale':
      return isNumber(value) && Number.isInteger(value) && inRange(value, target.config.min, target.config.max)
    case 'agreement':
      return isNumber(value) && Number.isInteger(value) && value >= 1 && value <= 5
    case 'numeric_free':
      return isNumber(value) && inRange(value, target.config.min, target.config.max)
    default:
      return false
  }
}

/** RF-05: the code exists in the test, the operator fits its type and so does the value. */
export function validateCondition(condition: Condition, questions: ConditionTarget[]): ConditionResult {
  const target = questions.find(question => question.code === condition.questionCode)

  if (!target) return { ok: false, code: 'unknown_question' }
  if (!OPERATORS_BY_TYPE[target.type].includes(condition.op)) return { ok: false, code: 'invalid_operator' }

  const values = condition.op === 'in' ? condition.value : [condition.value]
  if (!Array.isArray(values) || !values.length || !values.every(value => validValue(target, value))) {
    return { ok: false, code: 'invalid_value' }
  }
  return { ok: true }
}

/**
 * RF-06: the first circular dependency, as the codes of the cycle in the order they depend
 * on each other, or null. Each question has at most one condition, so following it is enough.
 */
export function detectCycle(questions: Array<{ code: string, dependsOn: Condition | null }>): string[] | null {
  const next = new Map(questions.map(question => [question.code, question.dependsOn?.questionCode ?? null]))
  const done = new Set<string>()

  for (const { code } of questions) {
    const path: string[] = []
    let current: string | null = code

    while (current && next.has(current) && !done.has(current)) {
      const start = path.indexOf(current)
      if (start !== -1) return path.slice(start)
      path.push(current)
      current = next.get(current) ?? null
    }
    path.forEach(item => done.add(item))
  }
  return null
}

const FIELD: Record<ConditionErrorCode, string> = {
  unknown_question: 'dependsOn.questionCode',
  self_reference: 'dependsOn.questionCode',
  cycle: 'dependsOn.questionCode',
  invalid_operator: 'dependsOn.op',
  invalid_value: 'dependsOn.value',
}

/**
 * The errors of the condition of question `code`, each on its form field. `questions` are the
 * other questions of the test as stored; the question being saved replaces its stored copy
 * when looking for cycles.
 */
export function conditionErrors(code: string, condition: Condition | null, questions: ConditionTarget[]) {
  if (!condition) return []
  const error = (reason: ConditionErrorCode) => [{ field: FIELD[reason], code: reason }]

  if (condition.questionCode === code) return error('self_reference')

  const result = validateCondition(condition, questions.filter(question => question.code !== code))
  if (!result.ok) return error(result.code)

  const graph = [
    ...questions.filter(question => question.code !== code),
    { code, dependsOn: condition },
  ]
  return detectCycle(graph)?.includes(code) ? error('cycle') : []
}
