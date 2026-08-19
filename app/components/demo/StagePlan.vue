<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

defineProps<{ demoCase: DemoCase }>()
</script>

<template>
  <div class="space-y-5">
    <p
      class="demo-enter rounded-2xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-900 ring-1 ring-brand-100 sm:text-base dark:bg-brand-900/20 dark:text-brand-100 dark:ring-brand-900"
    >
      {{ demoCase.plan.goal }}
    </p>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DemoStageCard
        v-for="(block, index) in demoCase.plan.blocks"
        :key="block.key"
        :delay="80 + index * 70"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
          >
            <UIcon
              :name="block.icon"
              class="size-4.5"
            />
          </span>
          <h3 class="font-bold text-neutral-900 dark:text-white">
            {{ block.title }}
          </h3>
        </div>

        <ul class="mt-4 space-y-2.5">
          <li
            v-for="item in block.items"
            :key="item"
            class="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300"
          >
            <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
            {{ item }}
          </li>
        </ul>
      </DemoStageCard>
    </div>
  </div>
</template>
