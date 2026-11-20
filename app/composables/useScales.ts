import type { QuestionOption, Scale } from '#shared/types/assessment'

export const NO_SCALE = 'none'

/** The scale catalogue (HU031) for the question form. */
export function useScales() {
  // `$i18n` works outside a component setup and still reacts to the active locale.
  const { t, te, locale } = useNuxtApp().$i18n

  const { data, status, refresh } = useFetch<Scale[]>('/api/admin/scales', { default: () => [] })

  const scales = computed(() => data.value ?? [])
  const pending = computed(() => status.value === 'pending' || status.value === 'idle')
  const hasError = computed(() => status.value === 'error')

  /** Scale names come from `scales.names.*`; a scale added later falls back to its name in the database. */
  function scaleName(scale: Scale) {
    const key = `scales.names.${scale.code}`
    return te(key) ? t(key) : (locale.value === 'en' ? scale.name.en : scale.name.es)
  }

  const scaleOptions = computed(() => [
    { value: NO_SCALE, label: t('scales.none') },
    ...scales.value.map(scale => ({ value: scale.code, label: scaleName(scale) })),
  ])

  /** Copy of the options of a scale; `none` gives an empty list. */
  function apply(code: string): QuestionOption[] {
    const scale = findScale(scales.value, code)
    return scale ? applyScale(scale) : []
  }

  return { scales, scaleOptions, pending, hasError, refresh, apply }
}
