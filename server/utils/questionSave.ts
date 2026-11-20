import type { H3Event } from 'h3'
import { findQuestion, questionDbError, requireEditableTest, testHasAnswers } from './testStructure'
import type { DbClient } from './testStructure'
import { serverSupabaseClient } from '#supabase/server'
import { conditionErrors } from '#shared/utils/conditions'
import type { ConditionTarget } from '#shared/utils/conditions'
import {
  assertQuestionChange, diffQuestion, duplicateCode, normalizeQuestionInput, questionToBody, toQuestionRow,
  validateQuestionInput,
} from '#shared/utils/questions'
import { isUuid } from '#shared/utils/validation'
import type { QuestionDetail, QuestionOption } from '#shared/types/assessment'
import type { Database, Json } from '~~/app/types/database.types'

type QuestionBody = ReturnType<typeof normalizeQuestionInput>

/** The other questions of the test, as a condition sees them (HU006). */
async function conditionTargets(client: DbClient, testId: string, exceptId: string | null): Promise<ConditionTarget[]> {
  const { data, error } = await client
    .from('questions')
    .select('id, code, type, config, depends_on, options:question_options(value, label, score, is_exclusive)')
    .eq('test_id', testId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las preguntas' })

  return (data ?? []).filter(row => row.id !== exceptId).map(row => ({
    code: row.code,
    type: row.type,
    config: (row.config ?? {}) as Record<string, unknown>,
    options: (row.options ?? []).map(option => ({ value: option.value, label: option.label, score: option.score, isExclusive: option.is_exclusive }) as QuestionOption),
    dependsOn: row.depends_on as ConditionTarget['dependsOn'],
  }))
}

/** Every error of a body: its section, the shared validation (RF-08) and its condition (HU006). */
async function bodyErrors(client: DbClient, testId: string, input: QuestionBody, questionId: string | null) {
  const section = isUuid(input.sectionId) ? [] : [{ field: 'sectionId', code: 'required' }]
  const own = validateQuestionInput(input).errors
  const condition = input.dependsOn ? conditionErrors(input.code, input.dependsOn, await conditionTargets(client, testId, questionId)) : []

  return [...section, ...own, ...condition]
}

function unprocessable(errors: Array<{ field: string, code: string }>): never {
  throw createError({ statusCode: 422, statusMessage: 'Datos inválidos', data: { errors } })
}

async function save(client: DbClient, testId: string, questionId: string | null, input: QuestionBody) {
  const { question, options } = toQuestionRow(input)
  const { data, error } = await client.rpc('save_question', {
    test: testId, question_id: questionId, question: question as unknown as Json, options: options as unknown as Json,
  })

  if (error) questionDbError(error)
  return (await findQuestion(client, testId, data as string))!
}

/** HU005: creates a question at the end of its section. */
export async function createQuestion(event: H3Event, testId: string, body: unknown): Promise<QuestionDetail> {
  const { client } = await requireEditableTest(event, testId)
  const input = normalizeQuestionInput(body)
  const errors = await bodyErrors(client, testId, input, null)

  if (errors.length) unprocessable(errors)
  return await save(client, testId, null, input)
}

/**
 * HU005 / HU006 RF-01, RF-02: merges the fields the body sends over the stored question and
 * validates the result as a whole. With answers, changing the type or the options is refused.
 */
export async function updateQuestion(event: H3Event, testId: string, questionId: string, body: unknown): Promise<QuestionDetail> {
  const { client } = await requireEditableTest(event, testId)
  const existing = await findQuestion(client, testId, questionId)

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pregunta no encontrada' })

  const before = normalizeQuestionInput(questionToBody(existing))
  const changes = typeof body === 'object' && body !== null ? body : {}
  const input = normalizeQuestionInput({ ...questionToBody(existing), ...changes })

  const allowed = assertQuestionChange(diffQuestion(before, input), await testHasAnswers(client, testId))
  if (!allowed.ok) {
    throw createError({ statusCode: 409, statusMessage: 'Se necesita una versión nueva', data: { code: allowed.code } })
  }

  const errors = await bodyErrors(client, testId, input, questionId)
  if (errors.length) unprocessable(errors)

  return await save(client, testId, questionId, input)
}

/** HU006 RF-03: a copy with the code `<code>_COPY[n]`, at the end of the same section. */
export async function duplicateQuestion(event: H3Event, testId: string, questionId: string): Promise<QuestionDetail> {
  const { client } = await requireEditableTest(event, testId)
  const existing = await findQuestion(client, testId, questionId)

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pregunta no encontrada' })

  const { data: codes, error } = await client.from('questions').select('code').eq('test_id', testId)
  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las preguntas' })

  const input = normalizeQuestionInput({
    ...questionToBody(existing),
    code: duplicateCode(existing.code, (codes ?? []).map(row => row.code)),
  })
  return await save(client, testId, null, input)
}

/** The test of a question or section, for the routes that only carry its id (HU006). */
export async function parentTestId(event: H3Event, table: 'questions' | 'test_sections', id: string): Promise<string> {
  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client.from(table).select('test_id').eq('id', id).maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar la estructura' })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
  return data.test_id
}
