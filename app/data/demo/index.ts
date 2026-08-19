import type { DemoContent } from './types'
import { demoEs } from './es'
import { demoEn } from './en'

export * from './types'

const CONTENT: Record<string, DemoContent> = {
  es: demoEs,
  en: demoEn,
}

/** Contenido del demo en el idioma activo (con español como fallback). */
export function getDemoContent(locale: string): DemoContent {
  return CONTENT[locale] ?? demoEs
}
