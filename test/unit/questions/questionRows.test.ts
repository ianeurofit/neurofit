import { describe, expect, it } from 'vitest'
import {
  formToQuestionBody, mapQuestionDbError, normalizeQuestionInput, questionFromRow, questionToBody, questionToForm, toQuestionRow,
} from '../../../shared/utils/questions'

const SECTION = '30000000-0000-0000-0000-000000000001'

describe('question bodies and rows (HU005 endpoints)', () => {
  it('HU005 RF-01 normalizes a body: trims, keeps options only for choice types and marks exclusive ones', () => {
    const input = normalizeQuestionInput({
      sectionId: ` ${SECTION} `, code: ' HIS_001 ', prompt: { es: ' ¿Antecedentes? ', en: ' ' }, type: 'multiple_choice',
      required: true, config: { exclusiveValues: ['none'] }, weight: '', status: 'published',
      options: [{ value: 'none', label: { es: 'Ninguno', en: 'None' }, score: '0' }, { value: 'stroke', label: { es: 'ACV' }, score: null }],
    })

    expect(input).toMatchObject({ sectionId: SECTION, code: 'HIS_001', prompt: { es: '¿Antecedentes?' }, weight: null, direction: 'neutral' })
    expect(input.options).toEqual([
      { value: 'none', label: { es: 'Ninguno', en: 'None' }, score: 0, isExclusive: true },
      { value: 'stroke', label: { es: 'ACV' }, score: null, isExclusive: false },
    ])
    expect(input).not.toHaveProperty('status')
    expect(normalizeQuestionInput({ type: 'open_text', options: [{ value: 'a' }] }).options).toEqual([])
  })

  it('HU005 builds the save_question arguments and reads a stored row back', () => {
    const input = normalizeQuestionInput({
      sectionId: SECTION, code: 'SN_001', prompt: { es: '¿Fumas?' }, type: 'single_choice', required: false,
      options: [{ value: 'yes', label: { es: 'Sí' }, score: 1 }, { value: 'no', label: { es: 'No' }, score: 0 }],
    })
    const { question, options } = toQuestionRow(input)

    expect(question).toMatchObject({ section_id: SECTION, code: 'SN_001', type: 'single_choice', required: false, allows_decline: false })
    expect(options).toEqual([
      { value: 'yes', label: { es: 'Sí' }, score: 1, is_exclusive: false },
      { value: 'no', label: { es: 'No' }, score: 0, is_exclusive: false },
    ])

    const stored = questionFromRow({
      id: 'q1', test_id: 't1', ...question, position: 3, weight: '1.5',
      options: [{ value: 'no', label: { es: 'No' }, score: '0', position: 2, is_exclusive: false }, { value: 'yes', label: { es: 'Sí' }, score: 1, position: 1, is_exclusive: false }],
    })
    expect(stored.weight).toBe(1.5)
    expect(stored.options.map(option => [option.value, option.score])).toEqual([['yes', 1], ['no', 0]])
    expect(normalizeQuestionInput(questionToBody(stored))).toMatchObject({ code: 'SN_001', options: input.options })
  })

  it('HU005 the form round-trips a question and upper-cases the code', () => {
    const form = questionToForm(questionFromRow({
      id: 'q1', test_id: 't1', section_id: SECTION, code: 'OPEN_001', prompt: { es: '¿Algo más?', en: 'Anything else?' },
      type: 'open_text', config: { maxLength: 500 }, required: true, allows_decline: true, position: 1, direction: 'neutral',
      weight: null, options: [],
    }))
    form.code = 'open_002'

    expect(formToQuestionBody(form)).toMatchObject({
      code: 'OPEN_002', prompt: { es: '¿Algo más?', en: 'Anything else?' }, config: { maxLength: 500 }, allowsDecline: true, conversationalHint: null,
    })
  })

  it('T-HU005-02 a repeated code in the test is reported on the code field', () => {
    expect(mapQuestionDbError({ code: '23505', message: 'duplicate key value violates unique constraint "questions_test_code_key"' }))
      .toEqual({ field: 'code', code: 'question_code_taken' })
    expect(mapQuestionDbError({ code: '23503', message: 'violates foreign key constraint "questions_section_fkey"' }))
      .toEqual({ field: 'sectionId', code: 'section_not_found' })
    expect(mapQuestionDbError({ code: 'P0001', message: 'new_version_required' })).toEqual({ field: null, code: 'new_version_required' })
    expect(mapQuestionDbError({ code: 'P0002', message: 'question_not_found' })).toEqual({ field: null, code: 'question_not_found' })
    expect(mapQuestionDbError({ code: '42501' })).toEqual({ field: null, code: 'forbidden' })
  })
})
