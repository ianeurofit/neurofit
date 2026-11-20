import type { H3Event } from 'h3'
import { QUESTION_COLUMNS } from './testStructure'
import type { DbClient } from './testStructure'
import { serverSupabaseClient } from '#supabase/server'
import { assembleTestTree } from '#shared/utils/publish'
import { questionFromRow } from '#shared/utils/questions'
import type { LocalizedText, TestStatus, TestTree, TreeQuestion } from '#shared/types/assessment'
import type { Database } from '~~/app/types/database.types'

/** The caller's session client and the test row, or 404. */
export async function findTest(event: H3Event, testId: string) {
  const client = await serverSupabaseClient<Database>(event)
  const { data: test, error } = await client
    .from('tests')
    .select('id, code, title, description, version, status, parent_test_id')
    .eq('id', testId)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar el test' })
  if (!test) throw createError({ statusCode: 404, statusMessage: 'Test no encontrado' })
  return { client, test }
}

/** HU007: the whole test — sections, questions, options and conditions — in order. */
export async function loadTestTree(client: DbClient, test: Awaited<ReturnType<typeof findTest>>['test']): Promise<TestTree> {
  const [sections, questions] = await Promise.all([
    client.from('test_sections').select('id, code, title, domain, position, is_draft_content').eq('test_id', test.id),
    client.from('questions').select(`${QUESTION_COLUMNS}, alert_rule, is_draft_content`).eq('test_id', test.id),
  ])

  if (sections.error || questions.error) throw createError({ statusCode: 500, statusMessage: 'No se pudo leer la estructura del test' })

  type Row = Parameters<typeof questionFromRow>[0] & { alert_rule: unknown, is_draft_content: boolean }
  return assembleTestTree({
    test: {
      ...test,
      title: test.title as LocalizedText,
      description: test.description as LocalizedText | null,
      status: test.status as TestStatus,
    },
    sections: sections.data.map(section => ({ ...section, title: section.title as LocalizedText })),
    questions: (questions.data as unknown as Row[]).map(row => ({
      ...questionFromRow(row),
      alert_rule: (row.alert_rule ?? null) as TreeQuestion['alert_rule'],
      is_draft_content: row.is_draft_content,
    })),
  })
}

/** A lifecycle conflict (409) with the code the screen translates. */
export function conflict(code: 'not_draft' | 'not_published' | 'draft_exists' | 'already_archived'): never {
  throw createError({ statusCode: 409, statusMessage: 'Estado del test incompatible', data: { code } })
}

/** Postgres errors of publish_test and create_test_version. */
export function lifecycleDbError(error: { code?: string, message?: string }): never {
  if (error.code === '42501') throw createError({ statusCode: 403, statusMessage: 'No tienes permisos para esta acción' })
  if (error.code === 'P0001' && error.message?.includes('not_draft')) conflict('not_draft')
  if (error.code === '23505' && error.message?.includes('tests_one_draft_per_code')) conflict('draft_exists')
  throw createError({ statusCode: 500, statusMessage: 'No se pudo cambiar el estado del test' })
}
