/**
 * Cuenta ascendente apta para SSR: el valor final se renderiza en el servidor
 * y solo en el cliente se reinicia a 0 para animarlo. Así el número sigue
 * siendo legible si el JavaScript no llega a ejecutarse.
 */
export function useDemoCountUp(target: number, options?: { duration?: number }) {
  const duration = options?.duration ?? 1200
  const current = ref(target)
  const el = ref<HTMLElement | null>(null)

  let played = false

  function play() {
    if (played) return
    played = true

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      current.value = target
      return
    }

    const start = performance.now()
    current.value = 0

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      // ease-out-quad
      const eased = 1 - (1 - progress) * (1 - progress)
      current.value = Math.round(target * eased)

      if (progress < 1) requestAnimationFrame(tick)
      else current.value = target
    }

    requestAnimationFrame(tick)
  }

  onMounted(() => {
    if (!el.value || typeof IntersectionObserver === 'undefined') {
      play()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            play()
            observer.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(el.value)
    onUnmounted(() => observer.disconnect())
  })

  return { current, el }
}
