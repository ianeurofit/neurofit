<script setup lang="ts">
import type { RiskLevel } from '~/data/demo'

const props = withDefaults(
  defineProps<{
    value: number
    risk: RiskLevel
    size?: number
    stroke?: number
    max?: number
    showMax?: boolean
  }>(),
  {
    size: 96,
    stroke: 8,
    max: 100,
    showMax: false,
  },
)

const { current, el } = useDemoCountUp(props.value, { duration: 1400 })

const radius = computed(() => props.size / 2 - props.stroke / 2 - 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
/** Longitud de trazo pendiente para el valor final: es el estado de reposo. */
const offset = computed(() => circumference.value * (1 - Math.min(1, props.value / props.max)))
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
      aria-hidden="true"
    >
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        class="stroke-neutral-200 dark:stroke-white/10"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        stroke-linecap="round"
        class="demo-ring-draw"
        :class="RISK_STYLES[risk].stroke"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :style="{ '--ring-length': `${circumference}px` }"
      />
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
      <span
        class="font-extrabold tabular-nums text-neutral-900 dark:text-white"
        :style="{ fontSize: `${Math.round(size / 3.6)}px` }"
      >{{ current }}</span>
      <span
        v-if="showMax"
        class="mt-0.5 text-[10px] font-medium text-neutral-400"
      >/ {{ max }}</span>
    </div>
  </div>
</template>
