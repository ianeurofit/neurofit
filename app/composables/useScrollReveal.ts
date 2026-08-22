import { animate } from 'animejs'
import type { Ref } from 'vue'

function setOpacity(el: HTMLElement, value: string) {
  el.style.opacity = value
}

/**
 * Revela con anime.js los elementos marcados con `data-reveal` la primera
 * vez que entran en el viewport. Se degrada a "todo visible" si
 * prefers-reduced-motion está activo o si el navegador no soporta
 * IntersectionObserver, así el contenido nunca depende del JS para leerse.
 */
export function useScrollReveal(root: Ref<HTMLElement | null>) {
  onMounted(() => {
    const container = root.value
    if (!container) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (reduced || typeof IntersectionObserver === 'undefined') {
      els.forEach(el => setOpacity(el, '1'))
      return
    }

    els.forEach(el => setOpacity(el, '0'))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const delay = Number(el.dataset.revealDelay ?? 0)

          animate(el, {
            opacity: [0, 1],
            translateY: [22, 0],
            duration: 700,
            delay,
            ease: 'outQuart',
          })

          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    els.forEach(el => observer.observe(el))
    onBeforeUnmount(() => observer.disconnect())
  })
}
