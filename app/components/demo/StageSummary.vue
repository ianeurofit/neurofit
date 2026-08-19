<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

defineProps<{ demoCase: DemoCase }>()
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-5">
    <div class="demo-enter rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-ink-900">
      <p class="section-eyebrow">
        {{ demoCase.summary.label }}
      </p>
      <p class="mt-4 text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
        {{ demoCase.summary.text }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <DemoStageCard :delay="120">
        <p class="section-eyebrow">
          {{ demoCase.summary.durationLabel }}
        </p>
        <p class="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {{ demoCase.meta.duration }}
        </p>
      </DemoStageCard>

      <DemoStageCard :delay="200">
        <p class="section-eyebrow">
          {{ demoCase.summary.scoreLabel }}
        </p>
        <div class="mt-2 flex items-center gap-4">
          <p class="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {{ demoCase.index.global }} <span class="text-neutral-400">/ 100</span>
          </p>
          <DemoScoreRing
            :value="demoCase.index.global"
            :risk="demoCase.patient.risk"
            :size="56"
            :stroke="6"
            class="ml-auto"
          />
        </div>
      </DemoStageCard>
    </div>
  </div>
</template>
