import { describe, expect, it } from 'vitest'
import { buildAssessment, startAssessment } from '../../../shared/utils/assessment'

const test = (status: 'draft' | 'published' | 'archived', version = 1) => ({ id: 't1', status, version })
const input = { patientId: 'p1', evaluatorId: null, mode: 'form' as const }

describe('startAssessment', () => {
  it('T-HU007-06 an archived test cannot be started', () => {
    expect(startAssessment(test('archived'), input)).toEqual({ ok: false, code: 'test_unavailable' })
    expect(startAssessment(test('draft'), input)).toEqual({ ok: false, code: 'test_unavailable' })
  })

  it('T-HU007-07 buildAssessment copies the version of the test', () => {
    expect(buildAssessment(test('published', 3), input)).toEqual({
      test_id: 't1', test_version: 3, patient_id: 'p1', evaluator_id: null, mode: 'form', status: 'not_started',
    })
    expect(startAssessment(test('published', 3), input)).toEqual({ ok: true, assessment: buildAssessment(test('published', 3), input) })
  })
})
