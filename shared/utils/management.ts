export type ListState = 'loading' | 'error' | 'empty' | 'emptyFiltered' | 'ready'

export interface ListStateInput {
  pending: boolean
  error: boolean
  count: number
  hasFilters: boolean
}

export interface RequiredError {
  name: string
  code: 'required'
}

/** Single place that decides which view a management list shows. */
export function resolveListState({ pending, error, count, hasFilters }: ListStateInput): ListState {
  if (pending) return 'loading'
  if (error) return 'error'
  if (count === 0) return hasFilters ? 'emptyFiltered' : 'empty'
  return 'ready'
}

function isBlank(value: unknown) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

/** Returns one error per required field that is empty. `0` and `false` count as filled. */
export function validateRequired(state: Record<string, unknown>, fields: string[]): RequiredError[] {
  return fields.filter(name => isBlank(state[name])).map(name => ({ name, code: 'required' as const }))
}
