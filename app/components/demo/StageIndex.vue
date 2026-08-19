<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

defineProps<{ demoCase: DemoCase }>()
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-5">
    <div
      class="demo-enter flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:flex-row sm:p-8 dark:border-white/10 dark:bg-ink-900"
    >
      <DemoScoreRing
        :value="demoCase.index.global"
        :risk="demoCase.patient.risk"
        :size="132"
        :stroke="11"
        show-max
      />
      <div class="text-center sm:text-left">
        <p class="section-eyebrow">
          {{ demoCase.index.label }}
        </p>
        <h3 class="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {{ demoCase.index.title }}
        </h3>
      </div>
    </div>

    <div
      class="demo-enter rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-ink-900"
      :style="{ '--delay': '120ms' }"
    >
      <div class="space-y-4">
        <DemoMetricBar
          v-for="(metric, index) in demoCase.index.metrics"
          :key="metric.key"
          :label="metric.label"
          :value="metric.value"
          :delay="150 + index * 80"
        />
      </div>
    </div>
  </div>
</template>
