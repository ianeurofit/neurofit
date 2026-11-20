import type { TestTree, TreeQuestion } from '../../../shared/types/assessment'

export function question(code: string, position: number, extra: Partial<TreeQuestion> = {}): TreeQuestion {
  return {
    id: `id-${code}`, test_id: 't1', section_id: 's1', code, prompt: { es: `Texto ${code}` }, type: 'true_false',
    config: { labels: { true: { es: 'Sí' }, false: { es: 'No' } } }, required: true, allows_decline: false, position,
    variable: null, direction: 'neutral', weight: null, source: null, conversational_hint: null, doc_ref: 'P1',
    clinical_note: null, depends_on: null, active: true, options: [], alert_rule: null, is_draft_content: false, ...extra,
  }
}

export function tree(extra: Partial<TestTree> = {}): TestTree {
  return {
    id: 't1', code: 'TEST_1', title: { es: 'Test 1' }, description: null, version: 1, status: 'draft', parent_test_id: null,
    sections: [
      {
        id: 's1', code: 'MEM', title: { es: 'Memoria' }, domain: 'memory', position: 1, is_draft_content: false,
        questions: [
          question('SMOKE', 1),
          question('PACKS', 2, { type: 'numeric_free', config: { min: 0 }, depends_on: { questionCode: 'SMOKE', op: 'eq', value: true } }),
        ],
      },
      {
        id: 's2', code: 'SLP', title: { es: 'Sueño' }, domain: 'sleep', position: 2, is_draft_content: false,
        questions: [question('SLP_001', 1, {
          section_id: 's2', type: 'single_choice', config: {},
          options: [{ value: 'never', label: { es: 'Nunca' }, score: 0, isExclusive: false }, { value: 'always', label: { es: 'Siempre' }, score: 4, isExclusive: false }],
        })],
      },
    ],
    ...extra,
  }
}
