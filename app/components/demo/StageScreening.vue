<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

const props = defineProps<{ demoCase: DemoCase }>()

const { ui } = useDemo()

const messages = computed(() => props.demoCase.screening.messages)

/** Ritmo de escritura. */
const CHARS_PER_TICK = 2
const TICK_MS = 64
/** Pausa entre un mensaje y el siguiente: simula el turno de la otra parte. */
const GAP_MS = 520

const scroller = ref<HTMLElement | null>(null)

/**
 * Hasta que el componente se hidrata se muestra la transcripción completa:
 * el tecleo es un adorno y nunca debe esconder el contenido (SSR y sin JS).
 */
const hydrated = ref(false)

/** Mensajes ya escritos por completo. */
const typedCount = ref(0)
/** Caracteres escritos del mensaje en curso. */
const charIndex = ref(0)
const isPlaying = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined
/** Se deja de auto-desplazar si la persona sube a releer. */
let followBottom = true

const total = computed(() => messages.value.length)

/** Mensajes completos que se pintan en la lista. */
const written = computed(() =>
  hydrated.value ? messages.value.slice(0, typedCount.value) : messages.value,
)

const activeMessage = computed(() =>
  hydrated.value && typedCount.value < total.value ? messages.value[typedCount.value] : undefined,
)

/** Texto parcial del mensaje que se está escribiendo. */
const typingText = computed(() => activeMessage.value?.text.slice(0, charIndex.value) ?? '')

/** Antes del primer carácter se muestran los puntos de "escribiendo…". */
const isThinking = computed(() => Boolean(activeMessage.value) && charIndex.value === 0)

const isComplete = computed(() => !hydrated.value || typedCount.value >= total.value)

const progress = computed(() => (total.value ? typedCount.value / total.value : 0))

function speakerName(from: 'ai' | 'patient') {
  return from === 'ai' ? 'Neurofit IA' : props.demoCase.patient.name.split(' ')[0]
}

function autoScroll() {
  const root = scroller.value
  if (!root || !followBottom) return
  root.scrollTop = root.scrollHeight
}

function onScroll() {
  const root = scroller.value
  if (!root) return
  // Se reanuda el seguimiento cuando vuelve al final.
  followBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 40
}

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function tick() {
  if (!isPlaying.value) return

  const message = messages.value[typedCount.value]

  if (!message) {
    isPlaying.value = false
    return
  }

  if (charIndex.value < message.text.length) {
    charIndex.value = Math.min(message.text.length, charIndex.value + CHARS_PER_TICK)
    nextTick(autoScroll)
    timer = setTimeout(tick, TICK_MS)
    return
  }

  // Mensaje terminado: pasa al siguiente tras una pausa.
  typedCount.value++
  charIndex.value = 0
  nextTick(autoScroll)

  if (typedCount.value >= total.value) {
    isPlaying.value = false
    return
  }

  timer = setTimeout(tick, GAP_MS)
}

function play() {
  if (isPlaying.value) return
  if (isComplete.value) restart()

  isPlaying.value = true
  followBottom = true
  timer = setTimeout(tick, GAP_MS / 2)
}

function pause() {
  isPlaying.value = false
  clearTimer()
}

function toggle() {
  if (isPlaying.value) pause()
  else play()
}

function restart() {
  pause()
  typedCount.value = 0
  charIndex.value = 0
  followBottom = true
  scroller.value?.scrollTo({ top: 0 })
}

/** Salta el tecleo y deja la transcripción completa. */
function showAll() {
  pause()
  typedCount.value = total.value
  charIndex.value = 0
  nextTick(() => {
    followBottom = true
    autoScroll()
  })
}

onMounted(() => {
  hydrated.value = true
  typedCount.value = 0
  charIndex.value = 0

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (reduced || typeof IntersectionObserver === 'undefined') {
    showAll()
    return
  }

  // La conversación arranca sola al entrar en pantalla.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          play()
          observer.disconnect()
        }
      }
    },
    { threshold: 0.35 },
  )

  if (scroller.value) observer.observe(scroller.value)
  onUnmounted(() => observer.disconnect())
})

onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
    <!-- Transcripción -->
    <div class="demo-enter overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
      <!-- Barra de control -->
      <div class="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-white/10">
        <span class="relative flex size-2.5 shrink-0">
          <span
            v-if="isPlaying"
            class="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60"
          />
          <span class="relative inline-flex size-2.5 rounded-full bg-brand-500" />
        </span>

        <p class="min-w-0 flex-1 truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {{ isComplete ? demoCase.screening.summaryTitle : ui.scrollHint }}
        </p>

        <div class="flex shrink-0 items-center gap-1">
          <UButton
            :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
            :aria-label="isPlaying ? ui.pauseChat : ui.playChat"
            color="neutral"
            variant="ghost"
            size="xs"
            class="rounded-full"
            @click="toggle"
          />
          <UButton
            icon="i-lucide-chevrons-down"
            :aria-label="ui.showAll"
            color="neutral"
            variant="ghost"
            size="xs"
            class="rounded-full"
            :disabled="isComplete"
            @click="showAll"
          />
          <UButton
            icon="i-lucide-rotate-ccw"
            :aria-label="ui.replayChat"
            color="neutral"
            variant="ghost"
            size="xs"
            class="rounded-full"
            @click="restart"
          />
        </div>
      </div>

      <!-- Progreso de la transcripción -->
      <div class="h-0.5 w-full bg-neutral-100 dark:bg-white/5">
        <div
          class="h-full bg-brand-500 transition-[width] duration-200 ease-out"
          :style="{ width: `${progress * 100}%` }"
        />
      </div>

      <!-- Mensajes -->
      <div
        ref="scroller"
        class="h-[26rem] space-y-3 overflow-y-auto p-4 sm:h-[32rem] sm:p-5"
        @scroll.passive="onScroll"
      >
        <!-- Ya escritos -->
        <div
          v-for="(message, index) in written"
          :key="index"
          class="flex"
          :class="message.from === 'ai' ? 'justify-start' : 'justify-end'"
        >
          <div
            class="max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[78%]"
            :class="message.from === 'ai'
              ? 'bg-neutral-100 text-neutral-800 dark:bg-white/5 dark:text-neutral-200'
              : 'bg-brand-600 text-white'"
          >
            <p
              class="mb-0.5 text-[11px] font-bold uppercase tracking-wide"
              :class="message.from === 'ai' ? 'text-brand-600 dark:text-brand-400' : 'text-white/70'"
            >
              {{ speakerName(message.from) }}
            </p>
            <p class="text-sm leading-relaxed">
              {{ message.text }}
            </p>
            <p
              v-if="message.note"
              class="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <UIcon
                name="i-lucide-flag"
                class="size-3 shrink-0"
              />
              {{ message.note }}
            </p>
          </div>
        </div>

        <!-- Escribiéndose -->
        <div
          v-if="activeMessage"
          class="flex"
          :class="activeMessage.from === 'ai' ? 'justify-start' : 'justify-end'"
        >
          <div
            class="max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[78%]"
            :class="activeMessage.from === 'ai'
              ? 'bg-neutral-100 text-neutral-800 dark:bg-white/5 dark:text-neutral-200'
              : 'bg-brand-600 text-white'"
          >
            <p
              class="mb-0.5 text-[11px] font-bold uppercase tracking-wide"
              :class="activeMessage.from === 'ai' ? 'text-brand-600 dark:text-brand-400' : 'text-white/70'"
            >
              {{ speakerName(activeMessage.from) }}
            </p>

            <!-- Puntos suspensivos antes del primer carácter -->
            <div
              v-if="isThinking"
              class="flex items-center gap-1 py-1"
            >
              <span
                v-for="dot in 3"
                :key="dot"
                class="size-1.5 animate-bounce rounded-full"
                :class="activeMessage.from === 'ai' ? 'bg-neutral-400' : 'bg-white/70'"
                :style="{ animationDelay: `${(dot - 1) * 0.15}s` }"
              />
            </div>

            <p
              v-else
              class="text-sm leading-relaxed"
            >
              {{ typingText }}<span
                class="demo-caret"
                aria-hidden="true"
              >|</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ficha de la llamada -->
    <div class="space-y-4">
      <DemoStageCard
        :delay="100"
        :interactive="false"
      >
        <p class="section-eyebrow">
          {{ demoCase.screening.summaryTitle }}
        </p>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex flex-wrap items-baseline gap-x-2">
            <dt class="text-neutral-500 dark:text-neutral-400">
              {{ demoCase.screening.reasonLabel }}:
            </dt>
            <dd class="font-semibold text-neutral-900 dark:text-white">
              {{ demoCase.meta.reason }}
            </dd>
          </div>
          <div class="flex flex-wrap items-baseline gap-x-2">
            <dt class="text-neutral-500 dark:text-neutral-400">
              {{ demoCase.screening.durationLabel }}:
            </dt>
            <dd class="font-semibold text-neutral-900 dark:text-white">
              {{ demoCase.meta.duration }}
            </dd>
          </div>
          <div class="flex flex-wrap items-baseline gap-x-2">
            <dt class="text-neutral-500 dark:text-neutral-400">
              {{ demoCase.screening.typeLabel }}:
            </dt>
            <dd class="font-semibold text-neutral-900 dark:text-white">
              {{ demoCase.meta.type }}
            </dd>
          </div>
        </dl>
      </DemoStageCard>

      <p
        class="demo-enter rounded-2xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-900 ring-1 ring-brand-100 dark:bg-brand-900/20 dark:text-brand-100 dark:ring-brand-900"
        :style="{ '--delay': '200ms' }"
      >
        {{ demoCase.screening.intro }}
      </p>
    </div>
  </div>
</template>
