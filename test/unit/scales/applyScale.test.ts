import { describe, expect, it } from 'vitest'
import { applyScale, findScale, scaleFromRows } from '../../../shared/utils/scales'
import type { Scale } from '../../../shared/types/assessment'

const f5 = (): Scale => ({
  code: 'F5',
  name: { es: 'Frecuencia 0–4', en: 'Frequency 0–4' },
  options: [
    { value: 'never', label: { es: 'Nunca', en: 'Never' }, score: 0, position: 1 },
    { value: 'rarely', label: { es: 'Rara vez', en: 'Rarely' }, score: 1, position: 2 },
    { value: 'always', label: { es: 'Siempre', en: 'Always' }, score: 4, position: 3 },
  ],
})

describe('applyScale', () => {
  it('T-HU031-02 copies values, labels and scores in position order', () => {
    const scale = f5()
    scale.options.reverse()

    expect(applyScale(scale)).toEqual([
      { value: 'never', label: { es: 'Nunca', en: 'Never' }, score: 0, isExclusive: false },
      { value: 'rarely', label: { es: 'Rara vez', en: 'Rarely' }, score: 1, isExclusive: false },
      { value: 'always', label: { es: 'Siempre', en: 'Always' }, score: 4, isExclusive: false },
    ])
  })

  it('T-HU031-02 changing the scale afterwards does not change the copy', () => {
    const scale = f5()
    const copy = applyScale(scale)

    scale.options[0]!.label.es = 'Jamás'
    scale.options[0]!.score = 9
    scale.options.push({ value: 'extra', label: { es: 'Extra', en: 'Extra' }, score: 5, position: 4 })

    expect(copy).toHaveLength(3)
    expect(copy[0]).toEqual({ value: 'never', label: { es: 'Nunca', en: 'Never' }, score: 0, isExclusive: false })
  })

  it('T-HU031-02 editing the copy does not change the scale', () => {
    const scale = f5()
    const copy = applyScale(scale)

    copy[1]!.label.es = 'Pocas veces'
    expect(scale.options[1]!.label.es).toBe('Rara vez')
  })
})

describe('scaleFromRows', () => {
  it('HU031 builds a scale from the database rows and drops malformed labels to es', () => {
    const scale = scaleFromRows(
      { code: 'SNN', name: { es: 'Sí / No / No lo sé', en: 'Yes / No / I don\'t know' } },
      [{ value: 'no', label: { es: 'No', en: 'No' }, score: null, position: 2 }, { value: 'yes', label: { es: 'Sí', en: 'Yes' }, score: null, position: 1 }],
    )

    expect(scale.options.map(option => option.value)).toEqual(['yes', 'no'])
    expect(scale.options[0]!.score).toBeNull()
  })
})

describe('findScale', () => {
  it('HU031 finds a scale by code', () => {
    expect(findScale([f5()], 'F5')?.code).toBe('F5')
    expect(findScale([f5()], 'XX')).toBeUndefined()
  })
})
