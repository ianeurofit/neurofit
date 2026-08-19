<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

defineProps<{ demoCase: DemoCase }>()
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-4 lg:grid-cols-3">
      <div
        v-for="(block, index) in demoCase.recommendations.blocks"
        :key="block.key"
        class="demo-enter rounded-2xl border border-neutral-200 border-l-4 border-l-brand-500 bg-white p-5 transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:border-l-brand-500 dark:bg-ink-900"
        :style="{ '--delay': `${index * 90}ms` }"
      >
        <p class="section-eyebrow">
          {{ block.timeframe }}
        </p>
        <ul class="mt-4 space-y-2.5">
          <li
            v-for="item in block.items"
            :key="item"
            class="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="mt-0.5 size-4 shrink-0 text-brand-500"
            />
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <div
      class="demo-enter rounded-2xl bg-red-50 p-6 ring-1 ring-red-100 dark:bg-red-950/25 dark:ring-red-900/60"
      :style="{ '--delay': '300ms' }"
    >
      <h3 class="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
        <UIcon
          name="i-lucide-triangle-alert"
          class="size-5 shrink-0"
        />
        {{ demoCase.recommendations.alertsTitle }}
      </h3>
      <ul class="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="alert in demoCase.recommendations.alerts"
          :key="alert"
          class="flex items-start gap-2 text-sm text-red-800/90 dark:text-red-200/90"
        >
          <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" />
          {{ alert }}
        </li>
      </ul>
    </div>
  </div>
</template>
