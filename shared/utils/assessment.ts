import type { AssessmentMode, TestStatus } from '../types/assessment'

// HU007 RF-05 / RF-06: only a published test can be started, and every assessment remembers the
// version it started with. The `assessments` table and `POST /api/assessments` arrive with HU011.

interface StartableTest { id: string, status: TestStatus, version: number }

export interface AssessmentStart {
  patientId: string
  evaluatorId: string | null
  mode: AssessmentMode
}

/** The row of a new assessment: `test_version` is copied from the test. */
export function buildAssessment(test: StartableTest, input: AssessmentStart) {
  return {
    test_id: test.id,
    test_version: test.version,
    patient_id: input.patientId,
    evaluator_id: input.evaluatorId,
    mode: input.mode,
    status: 'not_started' as const,
  }
}

export function startAssessment(test: StartableTest, input: AssessmentStart):
  { ok: true, assessment: ReturnType<typeof buildAssessment> } | { ok: false, code: 'test_unavailable' } {
  if (test.status !== 'published') return { ok: false, code: 'test_unavailable' }
  return { ok: true, assessment: buildAssessment(test, input) }
}
