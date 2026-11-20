import { describe, expect, it } from 'vitest'
import { parseTestMarkdown, previewImport } from '../../../shared/utils/importer'
import { scales, twoModules } from './fixtures'

const lines = (...rows: string[]) => rows.join('\n')

describe('previewImport', () => {
  it('T-HU008-02 a row with the type XYZ on line 12 is unsupported_type on line 12', () => {
    const md = lines(
      '# Test', '', '## Módulo 1 · Memoria (`MEM`)', '| ID | Ref | Pregunta | Tipo |', '|---|---|---|---|',
      '| MEM_001 | P4 | ¿Olvidas? | F5 |', '', '## Módulo 2 · Sueño (`SLP`)', '', '| ID | Ref | Pregunta | Tipo |', '|---|---|---|---|',
      '| SLP_001 | P54 | ¿Roncas? | XYZ |',
    )
    expect(md.split('\n')[11]).toContain('XYZ')

    const preview = previewImport(parseTestMarkdown(md, { scales }))

    expect(preview.errors).toEqual([{ line: 12, questionCode: 'SLP_001', code: 'unsupported_type' }])
  })

  it('T-HU008-03 counts by section and by question_type are right', () => {
    const preview = previewImport(parseTestMarkdown(twoModules, { scales }))

    expect(preview.total).toBe(5)
    expect(preview.sections).toEqual([{ code: 'MEM', title: 'Memoria', count: 3 }, { code: 'SLP', title: 'Sueño', count: 2 }])
    expect(preview.byType).toEqual({ single_choice: 1, numeric_free: 1, multiple_choice: 1, true_false: 1, open_text: 1 })
    expect(preview.errors).toEqual([])
  })

  it('T-HU008-02 a repeated code and empty options are reported with their line', () => {
    const md = lines(
      '## Módulo 1 · Datos (`DAT`)', '| ID | Ref | Pregunta | Tipo | Opciones |', '|---|---|---|---|---|',
      '| DAT_001 | — | País | OU | selección |',
      '| DAT_002 | — | Edad | NUM | años |',
      '| DAT_002 | — | Edad otra vez | NUM | años |',
      '| dat 3 | — | Mal código | SN | |',
      '| DAT_004 | — | | SN | |',
    )

    expect(previewImport(parseTestMarkdown(md, { scales })).errors).toEqual([
      { line: 4, questionCode: 'DAT_001', code: 'empty_options' },
      { line: 6, questionCode: 'DAT_002', code: 'duplicate_code' },
      { line: 7, questionCode: 'dat 3', code: 'invalid_code' },
      { line: 8, questionCode: 'DAT_004', code: 'missing_prompt' },
    ])
  })

  it('HU008 a scale that is not in the catalogue is reported', () => {
    const md = lines('## Módulo 1 · Memoria (`MEM`)', '| ID | Ref | Pregunta | Tipo |', '|---|---|---|---|', '| MEM_001 | P4 | ¿Olvidas? | F5 |')

    expect(previewImport(parseTestMarkdown(md, { scales: [] })).errors).toEqual([{ line: 4, questionCode: 'MEM_001', code: 'unknown_scale' }])
  })
})
