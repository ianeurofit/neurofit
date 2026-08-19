import { getDemoContent, type RiskLevel, type StageId } from '~/data/demo'

/** Orden de las etapas del tamizaje tal como se recorren en el panel. */
export const DEMO_STAGES: StageId[] = [
  'screening',
  'summary',
  'findings',
  'risk',
  'index',
  'plan',
  'recommendations',
]

const STAGE_ICONS: Record<StageId, string> = {
  screening: 'i-lucide-messages-square',
  summary: 'i-lucide-file-text',
  findings: 'i-lucide-clipboard-list',
  risk: 'i-lucide-shield-alert',
  index: 'i-lucide-gauge',
  plan: 'i-lucide-calendar-check',
  recommendations: 'i-lucide-sparkles',
}

/** Paleta por nivel de riesgo, alineada con la línea gráfica del sitio. */
export const RISK_STYLES: Record<RiskLevel, {
  text: string
  bg: string
  ring: string
  dot: string
  stroke: string
}> = {
  low: {
    text: 'text-brand-700 dark:text-brand-300',
    bg: 'bg-brand-50 dark:bg-brand-900/30',
    ring: 'ring-brand-200 dark:ring-brand-800',
    dot: 'bg-brand-500',
    stroke: 'stroke-brand-500',
  },
  moderate: {
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-900/25',
    ring: 'ring-amber-200 dark:ring-amber-800',
    dot: 'bg-amber-500',
    stroke: 'stroke-amber-500',
  },
  high: {
    text: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/25',
    ring: 'ring-red-200 dark:ring-red-800',
    dot: 'bg-red-500',
    stroke: 'stroke-red-500',
  },
}

/**
 * Contenido y utilidades del panel demo público.
 * El contenido cambia con el idioma activo.
 */
export function useDemo() {
  const { locale } = useI18n()

  const content = computed(() => getDemoContent(locale.value))
  const ui = computed(() => content.value.ui)
  const demoCase = computed(() => content.value.case)

  const stages = computed(() =>
    DEMO_STAGES.map((id, index) => ({
      id,
      index,
      number: index + 1,
      label: content.value.stages[id],
      icon: STAGE_ICONS[id],
    })),
  )

  function riskLabel(level: RiskLevel) {
    return content.value.riskLabels[level]
  }

  function formatDate(iso: string) {
    // Se parsea por partes: `new Date('2026-07-08')` se interpreta como UTC
    // y en zonas horarias negativas mostraría el día anterior.
    const [year, month, day] = iso.split('-').map(Number)
    const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)

    return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return { content, ui, demoCase, stages, riskLabel, formatDate }
}
