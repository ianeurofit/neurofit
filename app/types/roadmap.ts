export type RoadmapStatus = 'done' | 'in_progress' | 'planned'

/** Hito de un nodo, con el valor que se le asigna. */
export interface RoadmapItem {
  text: string
  /** Valor del hito en pesos colombianos (COP). */
  amount: number
}

export interface RoadmapNode {
  id: string
  /** Etiqueta visible del nodo, ej. 'Agosto 12' */
  title: string
  /** Fecha real (ISO `YYYY-MM-DD`): ordena la línea de tiempo */
  event_date: string
  /** Orden manual dentro de una misma fecha */
  position: number
  items: RoadmapItem[]
  status: RoadmapStatus
  created_at: string
  updated_at: string
}

/**
 * Normaliza lo que llega de la base. Tolera el formato antiguo (`string[]`)
 * para que la vista no se rompa si todavía falta correr la migración.
 */
export function normalizeRoadmapItems(raw: unknown): RoadmapItem[] {
  if (!Array.isArray(raw)) return []

  return raw.flatMap((entry) => {
    if (typeof entry === 'string') return [{ text: entry, amount: 0 }]
    if (!entry || typeof entry !== 'object') return []

    const { text, amount } = entry as { text?: unknown, amount?: unknown }
    if (typeof text !== 'string') return []

    return [{ text, amount: Number(amount) || 0 }]
  })
}

/** Suma de los valores de los hitos de un nodo. */
export function roadmapNodeTotal(node: Pick<RoadmapNode, 'items'>): number {
  return node.items.reduce((sum, item) => sum + item.amount, 0)
}

export function formatCop(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Campos que el superusuario edita desde el panel. */
export type RoadmapNodeInput = Pick<
  RoadmapNode,
  'title' | 'event_date' | 'position' | 'items' | 'status'
>

export const ROADMAP_STATUSES: RoadmapStatus[] = ['done', 'in_progress', 'planned']

export const ROADMAP_STATUS_ICONS: Record<RoadmapStatus, string> = {
  done: 'i-lucide-check',
  in_progress: 'i-lucide-loader',
  planned: 'i-lucide-circle-dashed',
}

/** Paleta por estado, alineada con la línea gráfica del sitio. */
export const ROADMAP_STATUS_STYLES: Record<RoadmapStatus, {
  text: string
  bg: string
  ring: string
  dot: string
  line: string
}> = {
  done: {
    text: 'text-brand-700 dark:text-brand-300',
    bg: 'bg-brand-50 dark:bg-brand-900/30',
    ring: 'ring-brand-200 dark:ring-brand-800',
    dot: 'bg-brand-500',
    line: 'bg-brand-500',
  },
  in_progress: {
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-900/25',
    ring: 'ring-amber-200 dark:ring-amber-800',
    dot: 'bg-amber-500',
    line: 'bg-amber-500',
  },
  planned: {
    text: 'text-neutral-600 dark:text-neutral-300',
    bg: 'bg-neutral-50 dark:bg-white/5',
    ring: 'ring-neutral-200 dark:ring-white/10',
    dot: 'bg-neutral-300 dark:bg-white/25',
    line: 'bg-neutral-200 dark:bg-white/10',
  },
}
