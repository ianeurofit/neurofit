import type { QuestionDetail, TestTree, TreeQuestion } from '../types/assessment'
import { conditionErrors } from './conditions'
import { normalizeQuestionInput, questionToBody, toConditionTarget, validateQuestionInput } from './questions'

// HU007: what must hold before a test is published, and how a new version is copied.

export type PublishErrorCode = 'no_sections' | 'empty_section' | 'inactive_dependency' | string

export interface PublishError {
  sectionCode?: string
  questionCode?: string
  /** The field of the question, as `validateQuestionInput` and `conditionErrors` name it. */
  field?: string
  code: PublishErrorCode
}

function asDetail(question: TreeQuestion): QuestionDetail {
  return { ...question, id: question.id ?? '', test_id: question.test_id ?? '', section_id: question.section_id ?? '' }
}

const byPosition = <T extends { position: number }>(items: T[]) => [...items].sort((a, b) => a.position - b.position)

/**
 * RF-01: every reason the test cannot be published, in section and question order. Only active
 * questions are checked: an inactive one is not shown to anybody.
 */
export function validateForPublish(test: TestTree): PublishError[] {
  if (!test.sections.length) return [{ code: 'no_sections' }]

  const all = test.sections.flatMap(section => section.questions)
  const targets = all.map(question => toConditionTarget(asDetail(question)))
  const errors: PublishError[] = []

  for (const section of byPosition(test.sections)) {
    const active = byPosition(section.questions).filter(question => question.active)

    if (!active.length) {
      errors.push({ sectionCode: section.code, code: 'empty_section' })
      continue
    }

    for (const question of active) {
      const where = { sectionCode: section.code, questionCode: question.code }
      const input = normalizeQuestionInput(questionToBody(asDetail(question)))
      const found: Array<{ field: string, code: string }> = [
        ...validateQuestionInput(input).errors,
        ...conditionErrors(question.code, question.depends_on, targets),
      ]

      const dependency = question.depends_on && all.find(item => item.code === question.depends_on!.questionCode)
      if (!found.length && dependency && !dependency.active) {
        found.push({ field: 'dependsOn.questionCode', code: 'inactive_dependency' })
      }

      errors.push(...found.map(error => ({ ...where, field: error.field, code: error.code })))
    }
  }

  return errors
}

/**
 * RF-03: a draft copy whose parent is the original; no ids, nothing shared. Its version is
 * `version + 1`, or `nextVersion` when the code already has higher versions (e.g. an archived draft).
 */
export function cloneTestVersion(test: TestTree, nextVersion = test.version + 1): TestTree {
  const copy = structuredClone(test)

  return {
    ...copy,
    id: undefined,
    version: nextVersion,
    status: 'draft',
    parent_test_id: test.id ?? null,
    sections: copy.sections.map(({ id: _section, ...section }) => ({
      ...section,
      questions: section.questions.map(({ id: _id, test_id: _test, section_id: _sectionId, ...question }) => question),
    })),
  }
}

/** The JSON `public.create_test_version` inserts: the rows of the tree, options included. */
export function toVersionPayload(test: TestTree) {
  return {
    code: test.code,
    title: test.title,
    description: test.description,
    version: test.version,
    parent_test_id: test.parent_test_id,
    sections: byPosition(test.sections).map(section => ({
      code: section.code,
      title: section.title,
      domain: section.domain,
      position: section.position,
      is_draft_content: section.is_draft_content,
      questions: byPosition(section.questions).map(({ options, ...question }) => ({
        ...question,
        options: options.map(option => ({ value: option.value, label: option.label, score: option.score, is_exclusive: option.isExclusive })),
      })),
    })),
  }
}

interface TreeRows {
  test: Omit<TestTree, 'sections'>
  sections: Array<Omit<TestTree['sections'][number], 'questions'> & { id: string }>
  questions: Array<TreeQuestion & { section_id: string }>
}

/** Builds the tree from the rows of `tests`, `test_sections` and `questions`. */
export function assembleTestTree({ test, sections, questions }: TreeRows): TestTree {
  return {
    ...test,
    sections: byPosition(sections).map(section => ({
      ...section,
      questions: byPosition(questions.filter(question => question.section_id === section.id)),
    })),
  }
}
