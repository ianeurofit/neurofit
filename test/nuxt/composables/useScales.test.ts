import { beforeEach, describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

const scales = [
  { code: 'F5', name: { es: 'Frecuencia 0–4', en: 'Frequency 0–4' }, options: [{ value: 'never', label: { es: 'Nunca', en: 'Never' }, score: 0, position: 1 }] },
  { code: 'SNN', name: { es: 'Sí / No / No lo sé', en: 'Yes / No / I don\'t know' }, options: [] },
]

describe('useScales', () => {
  beforeEach(() => {
    clearNuxtData()
    registerEndpoint('/api/admin/scales', () => scales)
  })

  it('HU031 loads the catalogue and offers one translated option per scale plus "none"', async () => {
    const catalogue = useScales()
    await catalogue.refresh()

    expect(catalogue.scales.value).toHaveLength(2)
    expect(catalogue.scaleOptions.value.map(option => option.value)).toEqual(['none', 'F5', 'SNN'])
    expect(catalogue.scaleOptions.value.every(option => !option.label.startsWith('scales.'))).toBe(true)
  })

  it('T-HU031-02 apply returns a copy of the options of the chosen scale', async () => {
    const catalogue = useScales()
    await catalogue.refresh()

    const copy = catalogue.apply('F5')
    expect(copy).toEqual([{ value: 'never', label: { es: 'Nunca', en: 'Never' }, score: 0, isExclusive: false }])
    copy[0]!.label.es = 'Jamás'
    expect(catalogue.scales.value[0]!.options[0]!.label.es).toBe('Nunca')
    expect(catalogue.apply('none')).toEqual([])
  })
})
