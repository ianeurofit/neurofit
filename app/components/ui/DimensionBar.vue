<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    value: number
    max?: number
    color?: 'brand' | 'blue' | 'violet' | 'orange'
  }>(),
  {
    max: 100,
    color: 'brand',
  },
)

const { current, el } = useCountUp(props.value)

const barColor: Record<string, string> = {
  brand: 'bg-brand-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  orange: 'bg-orange-500',
}

const widthPct = computed(() => `${Math.min(100, (current.value / props.max) * 100)}%`)
</script>

<template>
  <div
    ref="el"
    class="w-full"
  >
    <div class="mb-1.5 flex items-center justify-between text-sm">
      <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ label }}</span>
      <span class="font-bold tabular-nums text-neutral-900 dark:text-white">{{ current }}/{{ max }}</span>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
      <div
        class="h-full rounded-full transition-[width] duration-300 ease-out"
        :class="barColor[color]"
        :style="{ width: widthPct }"
      />
    </div>
  </div>
</template>
