import { describe, expect, it } from 'vitest'
import { parseTestMarkdown } from '../../../shared/utils/importer'
import { scales, twoModules } from './fixtures'

describe('parseTestMarkdown', () => {
  it('T-HU008-01 a fragment with 2 modules and 5 rows gives 2 sections and 5 questions', () => {
    const { test, errors } = parseTestMarkdown(twoModules, { scales })

    expect(errors).toEqual([])
    expect(test.sections.map(section => [section.code, section.title, section.position])).toEqual([['MEM', 'Memoria', 1], ['SLP', 'Sueño', 2]])
    expect(test.sections.flatMap(section => section.questions.map(question => question.code)))
      .toEqual(['MEM_001', 'MEM_002', 'MEM_003', 'SLP_001', 'SLP_002'])
  })

  it('T-HU008-01 each row keeps its line, reference, prompt, type and configuration', () => {
    const [mem, slp] = parseTestMarkdown(twoModules, { scales }).test.sections

    expect(mem!.questions[0]).toMatchObject({ line: 7, docRef: 'P4', prompt: '¿Olvidas conversaciones recientes?', type: 'single_choice', scaleCode: 'F5', required: true })
    expect(mem!.questions[0]!.options.map(option => [option.value, option.score])).toEqual([['never', 0], ['rarely', 1], ['sometimes', 2], ['often', 3], ['always', 4]])
    expect(mem!.questions[1]).toMatchObject({ type: 'numeric_free', config: { unit: { es: 'veces' } }, docRef: 'P5' })
    expect(mem!.questions[2]).toMatchObject({ docRef: null, prompt: '¿Usas notas?', type: 'multiple_choice', config: { exclusiveValues: ['ninguna'] } })
    expect(mem!.questions[2]!.options.map(option => [option.value, option.label.es, option.isExclusive])).toEqual([
      ['agenda', 'Agenda', false], ['alarmas', 'Alarmas', false], ['ninguna', 'Ninguna', true],
    ])
    expect(slp!.questions[0]).toMatchObject({ type: 'true_false', config: { labels: { true: { es: 'Sí', en: 'Yes' }, false: { es: 'No', en: 'No' } } } })
    expect(slp!.questions[1]).toMatchObject({ prompt: '¿Algo más sobre tu sueño?', type: 'open_text', required: false, config: { maxLength: 1000 } })
  })

  it('HU008 understands the variants of docs/test-1.md', () => {
    const md = [
      '## Módulo 2 · Antecedentes (`HIS`, `GEN`)',
      '| ID | Ref | Ítem | Tipo | Opciones | Dirección |',
      '|---|---|---|---|---|---|',
      '| HIS_001 | P14 | Comparado con hace 5 años | OU: Mucho mejor 0 · Igual 2 · Mucho peor 4 | | riesgo |',
      '| HIS_002 | — | Frutas | FC | | protector |',
      '| HIS_003 | P61 | Días de actividad | NUM (0–7) | | |',
      '| HIS_004 | P57 | ¿Descansas? | F5 (dirección: mayor = protector) | | |',
      '| HIS_005 | — | Peso | NUM (kg) | | neutral |',
      '| HIS_006 | P3 | ¿Cómo han sido? | OU | Estables · **Han empeorado rápidamente (alerta)** · 1–2 días/semana | |',
      '## Módulo 9 · Estado emocional (`EMO`) — BORRADOR',
      '| ID | Ref | Pregunta (borrador) | Tipo |',
      '|---|---|---|---|',
      '| EMO_001 | — | ¿Te has sentido triste? | F5 |',
      '## Redacción corregida',
      '| Ítem | Original | Propuesta |',
      '|---|---|---|',
      '| DAT_014 | a | b |',
    ].join('\n')
    const { test, errors } = parseTestMarkdown(md, { scales, sectionCodes: { 2: 'ANT' } })
    const [ant, emo] = test.sections
    const byCode = Object.fromEntries(ant!.questions.map(question => [question.code, question]))

    expect(errors).toEqual([])
    expect(test.sections.map(section => section.code)).toEqual(['ANT', 'EMO'])
    expect(byCode.HIS_001!.options.map(option => [option.value, option.label.es, option.score])).toEqual([
      ['mucho_mejor', 'Mucho mejor', 0], ['igual', 'Igual', 2], ['mucho_peor', 'Mucho peor', 4],
    ])
    expect(byCode.HIS_001!.direction).toBe('higher_is_risk')
    expect(byCode.HIS_002).toMatchObject({ scaleCode: 'FC', direction: 'higher_is_protective' })
    expect(byCode.HIS_003).toMatchObject({ type: 'numeric_free', config: { min: 0, max: 7 }, direction: 'neutral' })
    expect(byCode.HIS_004).toMatchObject({ scaleCode: 'F5', direction: 'higher_is_protective' })
    expect(byCode.HIS_005).toMatchObject({ config: { unit: { es: 'kg' } }, direction: 'neutral' })
    expect(byCode.HIS_006!.options.map(option => [option.value, option.label.es])).toEqual([
      ['estables', 'Estables'], ['han_empeorado_rapidamente', 'Han empeorado rápidamente'], ['1_2_dias_semana', '1–2 días/semana'],
    ])
    expect(emo).toMatchObject({ isDraftContent: true })
    expect(emo!.questions[0]!.isDraftContent).toBe(true)
  })

  it('HU008 a module with several codes and no override joins them', () => {
    const md = ['## Módulo 13 · Social (`COG`, `SOC`)', '| ID | Ref | Pregunta | Tipo |', '|---|---|---|---|', '| COG_001 | P65 | ¿Lees? | F5 |'].join('\n')

    expect(parseTestMarkdown(md, { scales }).test.sections[0]!.code).toBe('COG_SOC')
  })

  it('HU008 a file without modules reports it', () => {
    expect(parseTestMarkdown('# Nada aquí\n\nTexto', { scales }).errors).toEqual([{ line: 1, code: 'no_modules' }])
  })
})
