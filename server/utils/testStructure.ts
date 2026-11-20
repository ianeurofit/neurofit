import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { assertStructureEditable, mapSectionDbError } from '#shared/utils/tests'
import { mapQuestionDbError, questionFromRow } from '#shared/utils/questions'
import { isUuid } from '#shared/utils/validation'
import type { QuestionDetail } from '#shared/types/assessment'
import type { Database } from '~~/app/types/database.types'

export type DbClient = Awaited<ReturnType<typeof serverSupabaseClient<Database>>>

export const SECTION_COLUMNS = 'id, test_id, code, title, domain, position'

export const QUESTION_COLUMNS = 'id, test_id, section_id, code, doc_ref, prompt, type, config, required, allows_decline, '
  + 'position, variable, direction, weight, source, conversational_hint, clinical_note, depends_on, active, '
  + 'options:question_options(value, label, score, position, is_exclusive)'

/** Reads and validates a uuid route parameter, or answers 404. */
export function uuidParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)

  if (!isUuid(value)) {
    throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
  }
  return value
}

/**
 * Whether the test already has answered assessments. The `assessments` table arrives
 * with HU011; until then no test can have answers.
 */
export async function testHasAnswers(_client: DbClient, _testId: string): Promise<boolean> {
  return false
}

/** How many questions each section has (HU005). */
export async function countSectionQuestions(client: DbClient, sectionIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = Object.fromEntries(sectionIds.map(id => [id, 0]))
  if (!sectionIds.length) return counts

  const { data, error } = await client.from('questions').select('section_id').in('section_id', sectionIds)
  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudieron contar las preguntas' })

  for (const row of data ?? []) counts[row.section_id] = (counts[row.section_id] ?? 0) + 1
  return counts
}

/** One question of the test with its options, or null when it does not exist. */
export async function findQuestion(client: DbClient, testId: string, questionId: string): Promise<QuestionDetail | null> {
  const { data, error } = await client
    .from('questions')
    .select(QUESTION_COLUMNS)
    .eq('test_id', testId)
    .eq('id', questionId)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar la pregunta' })
  return data ? questionFromRow(data as unknown as Parameters<typeof questionFromRow>[0]) : null
}

/**
 * The caller's session client and the test, after checking that its structure can change
 * (HU004 · CA-05). Answers 404 when the test does not exist and 409 when it is frozen.
 */
export async function requireEditableTest(event: H3Event, testId: string) {
  // The caller's own session (not the service role): RLS applies and the audit trail names the actor.
  const client = await serverSupabaseClient<Database>(event)
  const { data: test, error } = await client.from('tests').select('id, status').eq('id', testId).maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar el test' })
  if (!test) throw createError({ statusCode: 404, statusMessage: 'Test no encontrado' })

  const editable = assertStructureEditable(test, await testHasAnswers(client, testId))

  if (!editable.ok) {
    throw createError({ statusCode: 409, statusMessage: 'Se necesita una versión nueva', data: { code: editable.code } })
  }

  return { client, test }
}

/** Turns a Postgres error of `test_sections` into the HTTP error the form understands. */
export function sectionDbError(error: { code?: string, message?: string }): never {
  const mapped = mapSectionDbError(error)

  if (mapped.code === 'section_code_taken') {
    throw createError({ statusCode: 409, statusMessage: 'El código ya existe en este test', data: { errors: [mapped] } })
  }
  if (mapped.code === 'new_version_required') {
    throw createError({ statusCode: 409, statusMessage: 'Se necesita una versión nueva', data: { code: mapped.code } })
  }
  if (mapped.code === 'forbidden') {
    throw createError({ statusCode: 403, statusMessage: 'No tienes permisos para esta acción' })
  }
  throw createError({ statusCode: 500, statusMessage: 'No se pudo guardar la sección' })
}

/** Turns a Postgres error of `save_question` into the HTTP error the form understands. */
export function questionDbError(error: { code?: string, message?: string }): never {
  const mapped = mapQuestionDbError(error)

  if (mapped.code === 'question_code_taken') {
    throw createError({ statusCode: 409, statusMessage: 'El código ya existe en este test', data: { errors: [mapped] } })
  }
  if (mapped.code === 'section_not_found') {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos', data: { errors: [mapped] } })
  }
  if (mapped.code === 'new_version_required') {
    throw createError({ statusCode: 409, statusMessage: 'Se necesita una versión nueva', data: { code: mapped.code } })
  }
  if (mapped.code === 'question_not_found') {
    throw createError({ statusCode: 404, statusMessage: 'Pregunta no encontrada', data: { code: mapped.code } })
  }
  if (mapped.code === 'forbidden') {
    throw createError({ statusCode: 403, statusMessage: 'No tienes permisos para esta acción' })
  }
  throw createError({ statusCode: 500, statusMessage: 'No se pudo guardar la pregunta' })
}
