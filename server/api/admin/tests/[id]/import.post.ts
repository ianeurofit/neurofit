import { requireRole } from '../../../../utils/requireRole'
import { requireEditableTest, uuidParam } from '../../../../utils/testStructure'
import { findTest, loadTestTree } from '../../../../utils/testLifecycle'
import { IMPORT_MAX_BYTES, parseTestMarkdown, runImport, toExistingQuestion, toImportPayload } from '#shared/utils/importer'
import { scaleFromRows } from '#shared/utils/scales'
import type { ScaleOption } from '#shared/types/assessment'
import type { Json } from '~~/app/types/database.types'

/**
 * HU008: imports a Markdown file with the format of docs/test-1.md into a draft test.
 * Body `{ markdown }`. With `?dryRun=true` it only answers the preview and the plan. With any
 * error it answers 422 and writes nothing; otherwise everything is written in one transaction.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['superuser'])
  const testId = uuidParam(event, 'id')
  const dryRun = getQuery(event).dryRun === 'true'

  const body = await readBody<{ markdown?: unknown }>(event).catch(() => null)
  const markdown = typeof body?.markdown === 'string' ? body.markdown : ''

  if (!markdown.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Archivo vacío', data: { code: 'empty_file' } })
  }
  if (new TextEncoder().encode(markdown).length > IMPORT_MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Archivo demasiado grande', data: { code: 'too_large' } })
  }

  // CA-06: only a draft (404 if missing, 409 new_version_required otherwise).
  const { client } = await requireEditableTest(event, testId)
  const { test } = await findTest(event, testId)

  const { data: scaleRows, error: scalesError } = await client
    .from('scales')
    .select('code, name, options:scale_options(value, label, score, position)')
  if (scalesError) throw createError({ statusCode: 500, statusMessage: 'No se pudieron consultar las escalas' })

  const tree = await loadTestTree(client, test)
  const existing = {
    sections: tree.sections.map(section => ({ code: section.code, title: section.title.es })),
    questions: tree.sections.flatMap(section => section.questions.map(question => toExistingQuestion({
      id: question.id!, code: question.code, sectionCode: section.code, position: question.position,
      docRef: question.doc_ref, prompt: question.prompt.es, type: question.type, config: question.config,
      options: question.options, required: question.required, direction: question.direction, isDraftContent: question.is_draft_content,
    }))),
  }

  const parsed = parseTestMarkdown(markdown, {
    scales: (scaleRows ?? []).map(row => scaleFromRows(row, row.options as unknown as ScaleOption[])),
  })

  const result = await runImport(parsed, existing, async (plan) => {
    if (dryRun) return
    const payload = toImportPayload(plan, parsed.test)
    const { error } = await client.rpc('import_test', {
      test: testId, sections: payload.sections as unknown as Json, questions: payload.questions as unknown as Json,
    })
    if (error) throw createError({ statusCode: error.code === '42501' ? 403 : 500, statusMessage: 'No se pudo importar el test' })
  })

  const summary = result.plan && {
    sections: { create: result.plan.sections.create.length, update: result.plan.sections.update.length, unchanged: result.plan.sections.unchanged.length },
    questions: {
      create: result.plan.questions.create.length,
      update: result.plan.questions.update.length,
      unchanged: result.plan.questions.unchanged.length,
      untouched: result.plan.questions.untouched.length,
    },
  }

  if (!result.ok && !dryRun) {
    throw createError({ statusCode: 422, statusMessage: 'El archivo tiene errores', data: { preview: result.preview } })
  }

  return { dryRun, imported: result.ok && !dryRun, preview: result.preview, plan: summary }
})
