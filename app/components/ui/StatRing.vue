<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    size?: number
  }>(),
  {
    max: 100,
    size: 132,
  },
)

const { current, el } = useCountUp(props.value)

const radius = computed(() => props.size / 2 - 10)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - current.value / props.max))
</script>

<template>
  <div
    ref="el"
    class="relative shrink-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      class="-rotate-90"
    >
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke-width="10"
        class="stroke-neutral-100 dark:stroke-neutral-800"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke-width="10"
        stroke-linecap="round"
        class="stroke-brand-500 transition-[stroke-dashoffset] duration-300 ease-out"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-3xl font-extrabold tabular-nums text-neutral-900 dark:text-white">{{ current }}</span>
      <span class="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">/{{ max }}</span>
    </div>
  </div>
</template>
