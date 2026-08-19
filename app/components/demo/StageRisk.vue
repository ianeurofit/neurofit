<script setup lang="ts">
import type { DemoCase } from '~/data/demo'

const props = defineProps<{ demoCase: DemoCase }>()

const risk = computed(() => props.demoCase.patient.risk)

/** Acentos por grupo: alto en rojo, moderado en ámbar, protectores en verde marca. */
const groupTone: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  protective: 'text-brand-600 dark:text-brand-400',
}
</script>

<template>
  <div class="space-y-5">
    <div
      class="demo-enter rounded-2xl p-6 ring-1 sm:p-8"
      :class="[RISK_STYLES[risk].bg, RISK_STYLES[risk].ring]"
    >
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="min-w-0 flex-1">
          <p
            class="text-xs font-bold uppercase tracking-[0.14em]"
            :class="RISK_STYLES[risk].text"
          >
            {{ demoCase.risk.levelLabel }}
          </p>
          <h3
            class="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
            :class="RISK_STYLES[risk].text"
          >
            {{ demoCase.risk.levelTitle }}
          </h3>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {{ demoCase.risk.levelText }}
          </p>
        </div>

        <DemoScoreRing
          :value="demoCase.index.global"
          :risk="risk"
          :size="104"
          :stroke="9"
          show-max
          class="shrink-0 self-start sm:self-center"
        />
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <DemoStageCard
        v-for="(group, index) in demoCase.risk.groups"
        :key="group.key"
        :delay="100 + index * 80"
      >
        <h3
          class="font-bold"
          :class="groupTone[group.key]"
        >
          {{ group.title }}
        </h3>
        <ul class="mt-3 divide-y divide-neutral-100 dark:divide-white/5">
          <li
            v-for="item in group.items"
            :key="item"
            class="flex items-start gap-2 py-2.5 text-sm text-neutral-600 dark:text-neutral-300"
          >
            <UIcon
              :name="group.level === 'protective' ? 'i-lucide-check' : 'i-lucide-dot'"
              class="mt-0.5 size-4 shrink-0"
              :class="groupTone[group.key]"
            />
            {{ item }}
          </li>
        </ul>
      </DemoStageCard>
    </div>
  </div>
</template>
