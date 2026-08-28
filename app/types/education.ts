/** Lineas de la oferta educativa de Neurofit. */
export type EducationLine = 'talk' | 'workshop' | 'program' | 'ia'

export type EducationModality = 'both' | 'onsite' | 'virtual'

export interface EducationProgram {
  id: string
  /** Identificador legible: enlaza una conferencia concreta desde la URL. */
  slug: string
  line: EducationLine
  /** Orden manual dentro de su linea */
  position: number

  title: string
  title_en: string | null
  objective: string
  objective_en: string | null
  topics: string[]
  topics_en: string[]

  duration: string
  duration_en: string | null
  modality: EducationModality
  /** Nombre de icono lucide, ej. `i-lucide-brain`. */
  icon: string

  is_published: boolean
  created_at: string
  updated_at: string
}

/** Campos que el superusuario edita desde el panel. */
export type EducationProgramInput = Pick<
  EducationProgram,
  | 'slug' | 'line' | 'position' | 'title' | 'title_en' | 'objective' | 'objective_en'
  | 'topics' | 'topics_en' | 'duration' | 'duration_en' | 'modality' | 'icon' | 'is_published'
>

export const EDUCATION_LINES: EducationLine[] = ['talk', 'workshop', 'program', 'ia']

export const EDUCATION_MODALITIES: EducationModality[] = ['both', 'onsite', 'virtual']

export const EDUCATION_LINE_ICONS: Record<EducationLine, string> = {
  talk: 'i-lucide-mic',
  workshop: 'i-lucide-wrench',
  program: 'i-lucide-route',
  ia: 'i-lucide-cpu',
}

/**
 * Devuelve el campo en el idioma activo y cae al español cuando falta la
 * traducción, para que la versión en inglés nunca muestre un hueco.
 */
export function localized(es: string, en: string | null | undefined, locale: string): string {
  return locale === 'en' && en?.trim() ? en : es
}

export function localizedList(es: string[], en: string[], locale: string): string[] {
  return locale === 'en' && en.length ? en : es
}

/** Convierte un título en un slug válido para la columna `slug`. */
export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
    // El corte puede dejar un guion suelto: el CHECK del slug lo rechaza.
    .replace(/^-+|-+$/g, '')
}
