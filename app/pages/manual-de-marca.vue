<script setup lang="ts">
import { animate, createTimeline } from 'animejs'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Manual de Marca | Neurofit IA',
  description: 'Guía oficial de identidad visual de Neurofit IA: logotipo, iconografía, paleta de color, tipografía, voz de marca y archivos descargables.',
  ogTitle: 'Manual de Marca | Neurofit IA',
  ogDescription: 'Logotipo, iconografía, color, tipografía y voz de marca de Neurofit IA — con todos los archivos disponibles para descargar.',
  ogImage: '/neurofit-logo-tealgray-.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap',
    },
  ],
})

const localePath = useLocalePath()
const toast = useToast()

/* ---------- Assets ---------- */
const B = '/brand'

const iconAssets = [
  { src: `${B}/icono-neurofit-color.svg`, filename: 'icono-neurofit-color.svg', label: 'Color', tone: 'checker' as const },
  { src: `${B}/icono-neurofit-blak.svg`, filename: 'icono-neurofit-negro.svg', label: 'Negro', tone: 'light' as const },
  { src: `${B}/icono-neurofit-white.svg`, filename: 'icono-neurofit-blanco.svg', label: 'Blanco', tone: 'dark' as const },
]

const horizontalAssets = [
  { src: `${B}/logo-neurofit-color-dark.svg`, filename: 'logo-neurofit-color.svg', label: 'Color', tone: 'light' as const },
  { src: `${B}/logo-neurofit-black.svg`, filename: 'logo-neurofit-negro.svg', label: 'Negro', tone: 'light' as const },
  { src: `${B}/logo-neurofit-white.svg`, filename: 'logo-neurofit-blanco.svg', label: 'Blanco', tone: 'dark' as const },
  { src: `${B}/logo-neurofit-mono-black.svg`, filename: 'logo-neurofit-mono-negro.svg', label: 'Monocromo negro', tone: 'light' as const },
  { src: `${B}/logo-neurofit-mono-white.svg`, filename: 'logo-neurofit-mono-blanco.svg', label: 'Monocromo blanco', tone: 'dark' as const },
]

const verticalAssets = [
  { src: `${B}/logo-neurofit-vertical-color.svg`, filename: 'logo-neurofit-vertical-color.svg', label: 'Color', tone: 'light' as const },
  { src: `${B}/logo-neurofit-vertical-black.svg`, filename: 'logo-neurofit-vertical-negro.svg', label: 'Negro', tone: 'light' as const },
  { src: `${B}/logo-neurofit-vertical-white.svg`, filename: 'logo-neurofit-vertical-blanco.svg', label: 'Blanco', tone: 'dark' as const },
]

const allAssets = [
  { ...horizontalAssets[0]!, group: 'Logotipo horizontal' },
  { ...horizontalAssets[1]!, group: 'Logotipo horizontal' },
  { ...horizontalAssets[2]!, group: 'Logotipo horizontal' },
  { ...horizontalAssets[3]!, group: 'Logotipo horizontal' },
  { ...horizontalAssets[4]!, group: 'Logotipo horizontal' },
  { ...verticalAssets[0]!, group: 'Logotipo vertical' },
  { ...verticalAssets[1]!, group: 'Logotipo vertical' },
  { ...verticalAssets[2]!, group: 'Logotipo vertical' },
  { ...iconAssets[0]!, group: 'Ícono' },
  { ...iconAssets[1]!, group: 'Ícono' },
  { ...iconAssets[2]!, group: 'Ícono' },
]

const downloadFilter = ref<'Todos' | 'Logotipo horizontal' | 'Logotipo vertical' | 'Ícono'>('Todos')
const downloadFilters = ['Todos', 'Logotipo horizontal', 'Logotipo vertical', 'Ícono'] as const
const filteredAssets = computed(() =>
  downloadFilter.value === 'Todos'
    ? allAssets
    : allAssets.filter(a => a.group === downloadFilter.value),
)

/* ---------- Paleta ---------- */
const palette = [
  { name: 'Verde Primario', hex: '#00BF63', text: 'light' as const },
  { name: 'Verde Oscuro', hex: '#0E9A4C', text: 'light' as const },
  { name: 'Verde Brillante', hex: '#3ED079', text: 'dark' as const },
  { name: 'Navy Base', hex: '#0A0A0A', text: 'light' as const },
  { name: 'Slate Grafito', hex: '#212121', text: 'light' as const },
  { name: 'Gris Medio', hex: '#545454', text: 'light' as const },
  { name: 'Gris Claro', hex: '#989898', text: 'dark' as const },
  { name: 'Off-White', hex: '#F2F2F2', text: 'dark' as const },
]

async function copyHex(hex: string) {
  try {
    await navigator.clipboard.writeText(hex)
    toast.add({ title: `Copiado: ${hex}`, color: 'primary', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({ title: 'No se pudo copiar', color: 'error' })
  }
}

/* ---------- Progreso de scroll + glow del cursor ---------- */
const progress = ref(0)
const glow = ref({ x: 0, y: 0 })

function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? (h.scrollTop / max) * 100 : 0
}

function onPointerMove(event: PointerEvent) {
  glow.value = { x: event.clientX, y: event.clientY }
}

/* ---------- Fondo de red neuronal (canvas) ---------- */
const canvasEl = ref<HTMLCanvasElement | null>(null)
let rafId = 0

function startNeuralBackground(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  let width = 0
  let height = 0
  let nodes: { x: number, y: number, vx: number, vy: number, r: number }[] = []

  function resize() {
    width = canvas.width = window.innerWidth
    height = canvas.height = document.body.scrollHeight
    const count = Math.max(40, Math.floor((width * height) / 95000))
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }))
  }

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    const scrollY = window.scrollY

    for (const n of nodes) {
      n.x += n.vx
      n.y += n.vy
      if (n.x < 0 || n.x > width) n.vx *= -1
      if (n.y < 0 || n.y > height) n.vy *= -1
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!
        const b = nodes[j]!
        const visA = a.y - scrollY
        const visB = b.y - scrollY
        if (visA < -50 || visA > height || visB < -50 || visB > height) continue
        const dist = Math.hypot(a.x - b.x, visA - visB)
        if (dist < 130) {
          ctx.strokeStyle = `rgba(0,191,99,${0.12 * (1 - dist / 130)})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, visA)
          ctx.lineTo(b.x, visB)
          ctx.stroke()
        }
      }
    }

    for (const n of nodes) {
      const vy = n.y - scrollY
      if (vy < -20 || vy > height + 20) continue
      ctx.fillStyle = 'rgba(64,207,138,0.55)'
      ctx.beginPath()
      ctx.arc(n.x, vy, n.r, 0, Math.PI * 2)
      ctx.fill()
    }

    rafId = requestAnimationFrame(draw)
  }

  resize()
  draw()
  window.addEventListener('resize', resize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    cancelAnimationFrame(rafId)
  })
}

/* ---------- Animaciones ---------- */
const pageRoot = ref<HTMLElement | null>(null)
useScrollReveal(pageRoot)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

  if (canvasEl.value) startNeuralBackground(canvasEl.value)

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  createTimeline({ defaults: { ease: 'outCubic' } })
    .add('#hero-tag', { opacity: [0, 1], translateY: [10, 0], duration: 600 })
    .add('#hero-logo', { opacity: [0, 1], scale: [0.85, 1], translateY: [20, 0], duration: 900 }, '-=300')
    .add('#hero-title', { opacity: [0, 1], translateY: [24, 0], duration: 800 }, '-=550')
    .add('#hero-sub', { opacity: [0, 1], translateY: [16, 0], duration: 700 }, '-=500')
    .add('#hero-cta', { opacity: [0, 1], translateY: [12, 0], duration: 600 }, '-=450')

  animate('#hero-logo img', {
    translateY: [0, -8, 0],
    duration: 4200,
    loop: true,
    ease: 'inOutSine',
  })
})
</script>

<template>
  <div
    ref="pageRoot"
    class="manual-marca relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#f2f2f2] selection:bg-brand-500 selection:text-[#0a0a0a]"
    @pointermove="onPointerMove"
  >
    <!-- Fondo neuronal -->
    <canvas
      ref="canvasEl"
      class="pointer-events-none fixed inset-0 z-0 opacity-60"
      aria-hidden="true"
    />

    <!-- Glow del cursor (solo con puntero fino) -->
    <div
      class="pointer-events-none fixed z-[1] hidden size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 [@media(pointer:fine)]:block [@media(pointer:fine)]:opacity-100"
      :style="{
        left: `${glow.x}px`,
        top: `${glow.y}px`,
        background: 'radial-gradient(circle, rgba(0,191,99,0.10) 0%, transparent 70%)',
      }"
      aria-hidden="true"
    />

    <!-- Barra de progreso -->
    <div
      class="fixed left-0 top-0 z-50 h-0.5 bg-gradient-to-r from-brand-500 to-[#40cf8a] transition-[width] duration-150"
      :style="{ width: `${progress}%` }"
    />

    <!-- Nav -->
    <header class="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0a0a0a]/75 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <NuxtLink
          :to="localePath('/')"
          class="flex shrink-0 items-center gap-2 font-display text-sm font-bold tracking-wide"
        >
          <img
            src="/brand/icono-neurofit-color.svg"
            alt=""
            class="h-6 w-6"
          >
          <span class="hidden sm:inline">NEUROFIT IA</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wider text-neutral-400 md:flex">
          <a
            href="#esencia"
            class="transition-colors hover:text-brand-400"
          >Esencia</a>
          <a
            href="#logotipo"
            class="transition-colors hover:text-brand-400"
          >Logotipo</a>
          <a
            href="#color"
            class="transition-colors hover:text-brand-400"
          >Color</a>
          <a
            href="#tipografia"
            class="transition-colors hover:text-brand-400"
          >Tipografía</a>
          <a
            href="#descargas"
            class="transition-colors hover:text-brand-400"
          >Descargas</a>
        </nav>

        <UButton
          :to="localePath('/')"
          label="Volver al sitio"
          icon="i-lucide-arrow-left"
          size="sm"
          color="neutral"
          variant="outline"
          class="rounded-full border-white/15 text-neutral-200 hover:bg-white/5"
        />
      </div>
    </header>

    <main class="relative z-10">
      <!-- HERO -->
      <section class="flex min-h-[86vh] flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
        <p
          id="hero-tag"
          class="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-brand-400"
        >
          Manual de marca · 2026
        </p>
        <div
          id="hero-logo"
          class="mb-8 w-full max-w-[420px]"
        >
          <img
            src="/brand/logo-neurofit-color-dark.svg"
            alt="Neurofit IA"
            class="w-full drop-shadow-[0_0_50px_rgba(0,191,99,0.25)]"
          >
        </div>
        <h1
          id="hero-title"
          class="font-display text-4xl font-extrabold tracking-tight sm:text-6xl"
        >
          Brain <span class="text-brand-400">Intelligence™</span>
        </h1>
        <p
          id="hero-sub"
          class="mx-auto mt-5 max-w-xl text-base font-light text-neutral-400"
        >
          Neurofit IA utiliza inteligencia artificial para evaluar, monitorear y optimizar la salud cerebral.
          Este manual define cómo se ve, se siente y se comunica la marca — y pone cada archivo a un clic de distancia.
        </p>
        <div
          id="hero-cta"
          class="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <UButton
            label="Descargar assets"
            icon="i-lucide-download"
            color="primary"
            size="lg"
            to="#descargas"
            class="rounded-full"
          />
          <UButton
            label="Ver el logotipo"
            icon="i-lucide-shapes"
            color="neutral"
            variant="outline"
            size="lg"
            to="#logotipo"
            class="rounded-full border-white/15 text-neutral-200 hover:bg-white/5"
          />
        </div>
      </section>

      <!-- ESENCIA -->
      <section
        id="esencia"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          01 · Esencia de marca
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          Ciencia y tecnología al servicio del cerebro.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          Neurofit IA transforma datos cognitivos, emocionales y conductuales en el
          <strong class="font-semibold text-neutral-200">Neurofit IA Index</strong>: un indicador claro que permite
          prevenir, monitorear y optimizar la salud cerebral. La marca comunica precisión científica con calidez humana.
        </p>

        <div class="mt-12 grid gap-4 sm:grid-cols-3">
          <div
            v-for="(pillar, i) in [
              { n: '01', title: 'Misión', text: 'Empoderar a personas y organizaciones con información precisa y recomendaciones personalizadas para mejorar la salud cerebral y el bienestar.' },
              { n: '02', title: 'Visión', text: 'Ser la plataforma líder en inteligencia cerebral, estableciendo el estándar de salud cerebral digital en Latinoamérica.' },
              { n: '03', title: 'Valores', text: 'Prevención, personalización, impacto real y ciencia con propósito — cada decisión de marca nace de estos cuatro pilares.' },
            ]"
            :key="pillar.n"
            data-reveal
            :data-reveal-delay="i * 80"
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-400 hover:-translate-y-1.5 hover:border-brand-500/40 hover:bg-brand-500/[0.06]"
          >
            <span class="font-display text-xs font-bold tracking-[0.2em] text-brand-400">{{ pillar.n }}</span>
            <h3 class="mt-3 font-display text-xl font-bold">
              {{ pillar.title }}
            </h3>
            <p class="mt-2.5 text-sm leading-relaxed text-neutral-400">
              {{ pillar.text }}
            </p>
          </div>
        </div>
      </section>

      <!-- LOGOTIPO -->
      <section
        id="logotipo"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          02 · Logotipo
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          El símbolo de una mente en equilibrio.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          El logotipo combina un trazo neuronal con la paleta verde-gris, evocando precisión clínica e inteligencia
          artificial. Se presenta siempre completo, con espacio de protección equivalente a la altura del ícono.
        </p>

        <!-- Vitrina principal -->
        <div
          data-reveal
          class="relative mt-10 flex flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent bg-[#0f0f0f] p-14"
        >
          <div class="rounded-2xl border border-dashed border-brand-500/40 p-10">
            <img
              src="/brand/logo-neurofit-color-dark.svg"
              alt="Logotipo Neurofit IA"
              class="w-full max-w-[380px]"
            >
          </div>
          <p class="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Área de protección mínima = altura del ícono
          </p>
        </div>

        <!-- Variantes horizontales -->
        <h3
          data-reveal
          class="mb-4 mt-14 font-display text-lg font-bold"
        >
          Logotipo horizontal
        </h3>
        <div class="grid gap-4 sm:grid-cols-3">
          <BrandAssetCard
            v-for="asset in horizontalAssets"
            :key="asset.filename"
            v-bind="asset"
            size="2.5rem"
          />
        </div>

        <!-- Usos incorrectos -->
        <h3
          data-reveal
          class="mb-4 mt-14 font-display text-lg font-bold"
        >
          Usos incorrectos
        </h3>
        <p
          data-reveal
          class="mb-5 max-w-xl text-sm text-neutral-500"
        >
          El logotipo nunca debe deformarse, rotarse, recolorearse fuera de la paleta ni llevar sombras o efectos.
        </p>
        <div class="grid gap-4 sm:grid-cols-4">
          <div
            v-for="dont in [
              { label: 'No deformar', class: 'scale-x-150' },
              { label: 'No rotar', class: 'rotate-[18deg]' },
              { label: 'No recolorear', class: 'hue-rotate-180 saturate-200' },
              { label: 'No añadir sombras', class: 'drop-shadow-[6px_8px_0_#ef4444]' },
            ]"
            :key="dont.label"
            data-reveal
            class="flex flex-col items-center gap-4 rounded-2xl border border-red-500/25 bg-[#0f0f0f] p-6 text-center"
          >
            <img
              src="/brand/icono-neurofit-color.svg"
              alt=""
              class="size-10"
              :class="dont.class"
            >
            <p class="text-xs text-neutral-500">
              {{ dont.label }}
            </p>
          </div>
        </div>
      </section>

      <!-- APLICACIONES VERTICALES -->
      <section
        id="vertical"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          03 · Aplicación vertical
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          Cuando el espacio manda, la marca se adapta.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          Para perfiles de redes sociales, sellos, packaging o cualquier formato cuadrado o vertical, usa el lockup
          apilado — mismo ícono, misma jerarquía tipográfica.
        </p>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <BrandAssetCard
            v-for="asset in verticalAssets"
            :key="asset.filename"
            v-bind="asset"
            size="7rem"
          />
        </div>
      </section>

      <!-- ÍCONOS -->
      <section
        id="iconos"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          04 · Ícono de marca
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          El circuito neuronal, solo.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          Úsalo como favicon, avatar o marca de agua cuando el espacio no permite el logotipo completo. Nunca lo
          combines con otro ícono ni lo recortes.
        </p>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <BrandAssetCard
            v-for="asset in iconAssets"
            :key="asset.filename"
            v-bind="asset"
            size="6rem"
          />
        </div>
      </section>

      <!-- COLOR -->
      <section
        id="color"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          05 · Paleta de color
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          Verde + gris: precisión con calma.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          El verde representa claridad cognitiva y bienestar; el gris grafito aporta seriedad clínica. Haz clic en
          cualquier color para copiar su código hexadecimal.
        </p>

        <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            v-for="(swatch, i) in palette"
            :key="swatch.hex"
            data-reveal
            :data-reveal-delay="i * 40"
            type="button"
            class="flex h-40 flex-col justify-end rounded-2xl p-4 text-left transition-transform duration-300 hover:-translate-y-2"
            :style="{ background: swatch.hex }"
            @click="copyHex(swatch.hex)"
          >
            <span
              class="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-70"
              :class="swatch.text === 'light' ? 'text-white' : 'text-[#0a0a0a]'"
            >Copiar</span>
            <h4
              class="font-display text-sm font-bold"
              :class="swatch.text === 'light' ? 'text-white' : 'text-[#0a0a0a]'"
            >
              {{ swatch.name }}
            </h4>
            <small
              class="font-mono text-xs opacity-80"
              :class="swatch.text === 'light' ? 'text-white' : 'text-[#0a0a0a]'"
            >{{ swatch.hex }}</small>
          </button>
        </div>
      </section>

      <!-- TIPOGRAFÍA -->
      <section
        id="tipografia"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          06 · Tipografía
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          Sora + Manrope.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          Sora aporta carácter geométrico y tecnológico a los titulares; Manrope garantiza legibilidad cálida en
          textos largos y datos clínicos.
        </p>

        <div class="mt-10 divide-y divide-white/10 border-y border-white/10">
          <div
            data-reveal
            class="grid gap-2 py-8 sm:grid-cols-[160px_1fr] sm:items-baseline sm:gap-8"
          >
            <span class="text-xs uppercase tracking-widest text-neutral-500">Display / H1</span>
            <span class="font-display text-5xl font-extrabold">Neurofit IA Index</span>
          </div>
          <div
            data-reveal
            class="grid gap-2 py-8 sm:grid-cols-[160px_1fr] sm:items-baseline sm:gap-8"
          >
            <span class="text-xs uppercase tracking-widest text-neutral-500">Heading / H2</span>
            <span class="font-display text-3xl font-bold">Conoce tu cerebro hoy</span>
          </div>
          <div
            data-reveal
            class="grid gap-2 py-8 sm:grid-cols-[160px_1fr] sm:items-baseline sm:gap-8"
          >
            <span class="text-xs uppercase tracking-widest text-neutral-500">Heading / H3</span>
            <span class="font-display text-xl font-semibold">Evaluar · Monitorear · Optimizar</span>
          </div>
          <div
            data-reveal
            class="grid gap-2 py-8 sm:grid-cols-[160px_1fr] sm:items-baseline sm:gap-8"
          >
            <span class="text-xs uppercase tracking-widest text-neutral-500">Body / Texto</span>
            <span class="max-w-xl text-base font-light leading-relaxed text-neutral-300">
              Neurofit IA analiza variables cognitivas, emocionales, conductuales y de estilo de vida para generar
              indicadores de salud cerebral, alertas tempranas y recomendaciones personalizadas basadas en ciencia.
            </span>
          </div>
        </div>

        <div
          data-reveal
          class="mt-8 flex flex-wrap gap-3"
        >
          <span
            v-for="chip in ['Sora 400', 'Sora 600', 'Sora 700', 'Sora 800', 'Manrope 400', 'Manrope 600']"
            :key="chip"
            class="rounded-full border border-white/15 px-4 py-2 text-xs text-neutral-400"
          >{{ chip }}</span>
        </div>
      </section>

      <!-- VOZ Y TONO -->
      <section
        id="voz"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          07 · Voz y tono
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          Ciencia cercana, nunca fría.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          Hablamos con la autoridad de la neurociencia y la calidez de quien cuida. Claros, precisos y humanos —
          nunca alarmistas ni excesivamente técnicos.
        </p>

        <div class="mt-10 grid gap-4 sm:grid-cols-2">
          <div
            v-for="(v, i) in [
              { yes: true, text: 'Conoce hoy el estado de tu cerebro y descubre cómo podría estar en 5, 10 o 20 años.' },
              { yes: false, text: '¡Tu cerebro está en peligro! Descubre ya el diagnóstico definitivo antes de que sea tarde.' },
              { yes: true, text: 'Cada cerebro es único. Nuestras recomendaciones también.' },
              { yes: false, text: 'Nuestro algoritmo garantiza resultados 100% infalibles para todos los usuarios.' },
            ]"
            :key="v.text"
            data-reveal
            :data-reveal-delay="i * 60"
            class="rounded-2xl border p-7"
            :class="v.yes ? 'border-brand-500/30 bg-brand-500/[0.06]' : 'border-white/10 bg-white/[0.02]'"
          >
            <h4
              class="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
              :class="v.yes ? 'text-brand-400' : 'text-neutral-500'"
            >
              {{ v.yes ? '✓ Así hablamos' : '✕ Así no' }}
            </h4>
            <p class="text-sm italic leading-relaxed text-neutral-300">
              “{{ v.text }}”
            </p>
          </div>
        </div>
      </section>

      <!-- DESCARGAS -->
      <section
        id="descargas"
        class="mx-auto max-w-[1200px] px-6 py-24 sm:px-10"
      >
        <p
          data-reveal
          class="section-eyebrow-dark"
        >
          08 · Descargas
        </p>
        <h2
          data-reveal
          data-reveal-delay="60"
          class="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          Todos los archivos, listos para usar.
        </h2>
        <p
          data-reveal
          data-reveal-delay="120"
          class="mt-5 max-w-2xl text-base font-light text-neutral-400"
        >
          Formato SVG vectorial, sin marcas de agua ni restricciones. Filtra por tipo y descarga el que necesites.
        </p>

        <div
          data-reveal
          class="mt-8 flex flex-wrap gap-2"
        >
          <button
            v-for="f in downloadFilters"
            :key="f"
            type="button"
            class="rounded-full px-4 py-2 text-xs font-bold transition-colors"
            :class="downloadFilter === f
              ? 'bg-brand-500 text-[#0a0a0a]'
              : 'border border-white/15 text-neutral-400 hover:border-brand-500/40 hover:text-brand-400'"
            @click="downloadFilter = f"
          >
            {{ f }}
          </button>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <BrandAssetCard
            v-for="asset in filteredAssets"
            :key="asset.filename"
            :src="asset.src"
            :filename="asset.filename"
            :label="`${asset.group} · ${asset.label}`"
            :tone="asset.tone"
            size="4.5rem"
          />
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-white/[0.08] px-6 py-14 text-center">
      <img
        src="/brand/logo-neurofit-white.svg"
        alt="Neurofit IA"
        class="mx-auto mb-5 h-6 opacity-90"
      >
      <p class="text-xs text-neutral-500">
        Inteligencia que transforma vidas. Manual de marca — uso interno y de aliados.
      </p>
      <div class="mt-4 flex flex-wrap justify-center gap-6 text-xs text-neutral-500">
        <span>info@neurofitia.com</span>
        <span>neurofitia.com</span>
        <span>© {{ new Date().getFullYear() }} Neurofit IA</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.manual-marca {
  font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif;
}

.font-display {
  font-family: 'Sora', ui-sans-serif, system-ui, sans-serif;
}

.section-eyebrow-dark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #40cf8a;
}

.section-eyebrow-dark::before {
  content: '';
  width: 28px;
  height: 1px;
  background: #00bf63;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
