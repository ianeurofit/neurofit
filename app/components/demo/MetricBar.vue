<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    value: number
    max?: number
    /** Retraso de entrada en milisegundos, para escalonar la lista */
    delay?: number
  }>(),
  {
    max: 100,
    delay: 0,
  },
)

const { current, el } = useDemoCountUp(props.value, { duration: 1200 })

const pct = computed(() => Math.min(100, (props.value / props.max) * 100))
/** Verde cuando el indicador es sólido, ámbar cuando conviene vigilarlo. */
const tone = computed(() => (props.value >= 70 ? 'bg-brand-500' : 'bg-amber-500'))
</script>

<template>
  <div ref="el">
    <div class="mb-1.5 flex items-baseline justify-between gap-3">
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ label }}</span>
      <span class="text-sm font-bold tabular-nums text-neutral-900 dark:text-white">{{ current }}</span>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
      <div
        class="demo-bar-grow h-full rounded-full"
        :class="tone"
        :style="{ 'width': `${pct}%`, '--delay': `${delay}ms` }"
      />
    </div>
  </div>
</template>
