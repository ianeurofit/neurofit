export function useCountUp(target: Ref<number> | number, options?: { duration?: number }) {
  const duration = options?.duration ?? 1200
  const current = ref(0)
  const el = ref<HTMLElement | null>(null)
  const hasPlayed = ref(false)

  const targetValue = computed(() => (typeof target === 'number' ? target : target.value))

  function play() {
    if (hasPlayed.value) return
    hasPlayed.value = true

    const start = performance.now()
    const from = 0
    const to = targetValue.value

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out-quad
      const eased = 1 - (1 - progress) * (1 - progress)
      current.value = Math.round(from + (to - from) * eased)

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        current.value = to
      }
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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(el.value)

    onUnmounted(() => observer.disconnect())
  })

  return { current, el, play }
}
