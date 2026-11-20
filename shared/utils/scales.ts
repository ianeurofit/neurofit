import type { QuestionOption, Scale, ScaleOption } from '../types/assessment'

/**
 * HU031 RF-02: the options a question gets when it picks a scale. It is a deep copy, so
 * later changes to the catalogue never reach the question, and vice versa.
 */
export function applyScale(scale: Scale): QuestionOption[] {
  return [...scale.options]
    .sort((a, b) => a.position - b.position)
    .map(option => ({
      value: option.value,
      label: { es: option.label.es, en: option.label.en },
      score: option.score,
      isExclusive: false,
    }))
}

export function findScale(scales: Scale[], code: string): Scale | undefined {
  return scales.find(scale => scale.code === code)
}

/** A scale from its `scales` row and its `scale_options` rows, options in position order. */
export function scaleFromRows(scale: { code: string, name: unknown }, options: ScaleOption[]): Scale {
  return {
    code: scale.code,
    name: scale.name as Scale['name'],
    options: [...options].sort((a, b) => a.position - b.position).map(option => ({
      value: option.value,
      label: { es: option.label.es, en: option.label.en },
      score: option.score === null ? null : Number(option.score),
      position: option.position,
    })),
  }
}
