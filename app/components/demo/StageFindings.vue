<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

defineProps<{ demoCase: DemoCase }>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <DemoStageCard
      v-for="(group, index) in demoCase.findings"
      :key="group.key"
      :delay="index * 70"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
        >
          <UIcon
            :name="group.icon"
            class="size-4.5"
          />
        </span>
        <h3 class="font-bold text-neutral-900 dark:text-white">
          {{ group.title }}
        </h3>
      </div>

      <ul class="mt-4 space-y-2.5">
        <li
          v-for="item in group.items"
          :key="item"
          class="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-0.5 size-4 shrink-0 text-brand-500"
          />
          {{ item }}
        </li>
      </ul>
    </DemoStageCard>
  </div>
</template>
