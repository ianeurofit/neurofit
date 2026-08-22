<script setup lang="ts">
import { motion, useScroll, useSpring } from 'motion-v'
import { formatCop, ROADMAP_STATUS_ICONS, ROADMAP_STATUS_STYLES, type RoadmapNode, roadmapNodeTotal } from '~/types/roadmap'

const props = defineProps<{
  nodes: RoadmapNode[]
  /** Muestra los controles de edición sobre cada nodo. */
  editable?: boolean
}>()

const emit = defineEmits<{
  edit: [RoadmapNode]
  remove: [RoadmapNode]
}>()

const { t, locale } = useI18n()

const track = ref<HTMLElement | null>(null)

// La línea vertical se dibuja siguiendo el scroll de la propia lista.
const { scrollYProgress } = useScroll({
  target: track,
  offset: ['start 0.85', 'end 0.6'],
})

const lineProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

/** Nodo abierto: el primero llega expandido y el resto se despliega al pulsar. */
const openId = ref<string | null>(null)

watch(
  () => props.nodes,
  (list) => {
    if (!openId.value || !list.some(node => node.id === openId.value)) {
      openId.value = list[0]?.id ?? null
    }
  },
  { immediate: true },
)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}

const totalItems = computed(() =>
  props.nodes.reduce((sum, node) => sum + node.items.length, 0),
)

const doneItems = computed(() =>
  props.nodes
    .filter(node => node.status === 'done')
    .reduce((sum, node) => sum + node.items.length, 0),
)

const progressPct = computed(() =>
  totalItems.value ? Math.round((doneItems.value / totalItems.value) * 100) : 0,
)

/** Valor total comprometido en toda la hoja de ruta. */
const totalAmount = computed(() =>
  props.nodes.reduce((sum, node) => sum + roadmapNodeTotal(node), 0),
)

function amountLabel(value: number) {
  return formatCop(value, locale.value)
}

function formatDate(iso: string) {
  // Se parsea por partes para no desplazar el día por zona horaria.
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)

  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Progreso general -->
    <div class="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
      <div class="mb-2 flex items-baseline justify-between gap-3">
        <span class="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
          {{ t('dashboard.roadmap.progress') }}
        </span>
        <span class="text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
          {{ doneItems }} / {{ totalItems }}
        </span>
      </div>
      <p class="mb-3 text-xs text-neutral-500">
        {{ t('dashboard.roadmap.totalValue') }}
        <strong class="tabular-nums text-neutral-900 dark:text-white">{{ amountLabel(totalAmount) }}</strong>
      </p>
      <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
        <motion.div
          class="h-full rounded-full bg-brand-500"
          :initial="{ width: '0%' }"
          :animate="{ width: `${progressPct}%` }"
          :transition="{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }"
        />
      </div>
    </div>

    <!-- Línea de tiempo -->
    <div
      ref="track"
      class="relative pl-10 sm:pl-14"
    >
      <!-- Riel de fondo -->
      <div
        class="absolute left-[15px] top-2 bottom-2 w-0.5 rounded-full bg-neutral-200 sm:left-[23px] dark:bg-white/10"
        aria-hidden="true"
      />
      <!-- Riel que avanza con el scroll -->
      <motion.div
        class="absolute left-[15px] top-2 w-0.5 origin-top rounded-full bg-gradient-to-b from-brand-400 to-brand-600 sm:left-[23px]"
        :style="{ scaleY: lineProgress, height: 'calc(100% - 1rem)' }"
        aria-hidden="true"
      />

      <ul class="space-y-4">
        <motion.li
          v-for="(node, index) in nodes"
          :key="node.id"
          class="relative"
          :initial="{ opacity: 0, x: -16 }"
          :while-in-view="{ opacity: 1, x: 0 }"
          :viewport="{ once: true, amount: 0.4 }"
          :transition="{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }"
        >
          <!-- Punto del nodo -->
          <motion.span
            class="absolute -left-10 top-5 flex size-8 items-center justify-center rounded-full ring-4 ring-neutral-50 sm:-left-14 dark:ring-ink-950"
            :class="ROADMAP_STATUS_STYLES[node.status].dot"
            :initial="{ scale: 0 }"
            :while-in-view="{ scale: 1 }"
            :viewport="{ once: true, amount: 0.6 }"
            :transition="{ type: 'spring', stiffness: 320, damping: 18, delay: index * 0.06 + 0.15 }"
          >
            <UIcon
              :name="ROADMAP_STATUS_ICONS[node.status]"
              class="size-4 text-white"
              :class="{ 'animate-spin [animation-duration:3s]': node.status === 'in_progress' }"
            />
          </motion.span>

          <!-- Tarjeta del nodo -->
          <motion.div
            class="overflow-hidden rounded-2xl border bg-white dark:bg-ink-900"
            :class="openId === node.id
              ? 'border-brand-300 shadow-lg shadow-brand-950/5 dark:border-brand-800'
              : 'border-neutral-200 dark:border-white/10'"
            :while-hover="{ y: -3 }"
            :transition="{ duration: 0.25 }"
          >
            <button
              type="button"
              class="flex w-full items-start gap-3 p-5 text-left"
              :aria-expanded="openId === node.id"
              @click="toggle(node.id)"
            >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-lg font-extrabold tracking-tight">
                    {{ node.title }}
                  </h3>
                  <span
                    class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
                    :class="[
                      ROADMAP_STATUS_STYLES[node.status].bg,
                      ROADMAP_STATUS_STYLES[node.status].text,
                      ROADMAP_STATUS_STYLES[node.status].ring,
                    ]"
                  >{{ t(`dashboard.roadmap.statuses.${node.status}`) }}</span>
                </div>
                <p class="mt-1 text-xs text-neutral-500">
                  {{ formatDate(node.event_date) }} ·
                  {{ node.items.length }} {{ t('dashboard.roadmap.milestones', node.items.length) }}
                  <template v-if="roadmapNodeTotal(node) > 0">
                    · <span class="font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">{{ amountLabel(roadmapNodeTotal(node)) }}</span>
                  </template>
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <template v-if="editable">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    class="rounded-full"
                    :aria-label="t('dashboard.roadmap.actions.edit')"
                    @click.stop="emit('edit', node)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    class="rounded-full"
                    :aria-label="t('dashboard.roadmap.actions.delete')"
                    @click.stop="emit('remove', node)"
                  />
                </template>

                <motion.span
                  class="flex size-7 items-center justify-center text-neutral-400"
                  :animate="{ rotate: openId === node.id ? 180 : 0 }"
                  :transition="{ duration: 0.25 }"
                >
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4"
                  />
                </motion.span>
              </div>
            </button>

            <!-- Hitos -->
            <Transition name="roadmap-panel">
              <div v-if="openId === node.id">
                <ul class="space-y-2.5 border-t border-neutral-100 px-5 py-4 dark:border-white/5">
                  <motion.li
                    v-for="(item, itemIndex) in node.items"
                    :key="`${item.text}-${itemIndex}`"
                    class="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-300"
                    :initial="{ opacity: 0, x: -8 }"
                    :animate="{ opacity: 1, x: 0 }"
                    :transition="{ duration: 0.3, delay: itemIndex * 0.05 }"
                  >
                    <span
                      class="mt-1.5 size-1.5 shrink-0 rounded-full"
                      :class="ROADMAP_STATUS_STYLES[node.status].dot"
                    />
                    <span class="min-w-0 flex-1">{{ item.text }}</span>
                    <span
                      v-if="item.amount > 0"
                      class="shrink-0 tabular-nums font-semibold text-neutral-700 dark:text-neutral-200"
                    >{{ amountLabel(item.amount) }}</span>
                  </motion.li>
                </ul>
              </div>
            </Transition>
          </motion.div>
        </motion.li>
      </ul>
    </div>
  </div>
</template>
