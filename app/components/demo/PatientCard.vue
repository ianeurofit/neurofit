<script setup lang="ts">
import { NuxtLink } from '#components'
import type { DemoPatient } from '~/data/demo'

const props = withDefaults(
  defineProps<{
    patient: DemoPatient
    /** Retraso de entrada en milisegundos */
    delay?: number
  }>(),
  { delay: 0 },
)

const { ui, riskLabel, formatDate } = useDemo()
const localePath = useLocalePath()

const to = computed(() =>
  props.patient.hasFullCase ? localePath(`/demo/${props.patient.id}`) : undefined,
)
</script>

<template>
  <div
    class="demo-enter h-full"
    :style="{ '--delay': `${delay}ms` }"
  >
    <component
      :is="to ? NuxtLink : 'div'"
      :to="to"
      class="group flex h-full flex-col rounded-2xl border bg-white p-5 transition-all duration-300 dark:bg-ink-900"
      :class="patient.hasFullCase
        ? 'cursor-pointer border-neutral-200 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-950/5 dark:border-white/10 dark:hover:border-brand-800'
        : 'border-dashed border-neutral-200 dark:border-white/10'"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
        >{{ patient.initials }}</span>

        <div class="min-w-0 flex-1">
          <p class="truncate font-bold text-neutral-900 dark:text-white">
            {{ patient.name }}
          </p>
          <p class="truncate text-xs text-neutral-500">
            {{ ui.years.replace('{age}', String(patient.age)) }} · {{ formatDate(patient.evaluatedAt) }}
          </p>
        </div>

        <UIcon
          v-if="patient.hasFullCase"
          name="i-lucide-arrow-right"
          class="mt-1 size-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500"
        />
      </div>

      <div class="mt-5 flex items-center gap-4">
        <DemoScoreRing
          :value="patient.score"
          :risk="patient.risk"
          :size="64"
          :stroke="6"
        />

        <div class="min-w-0 flex-1">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
            :class="[RISK_STYLES[patient.risk].bg, RISK_STYLES[patient.risk].text, RISK_STYLES[patient.risk].ring]"
          >{{ riskLabel(patient.risk) }}</span>

          <p class="mt-2 text-sm leading-snug text-neutral-500 dark:text-neutral-400">
            {{ patient.reason }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-white/5">
        <template v-if="patient.hasFullCase">
          <span class="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {{ ui.viewCase }}
          </span>
        </template>
        <template v-else>
          <UIcon
            name="i-lucide-lock"
            class="size-3.5 shrink-0 text-neutral-400"
          />
          <span class="text-xs text-neutral-400">{{ ui.demoOnly }}</span>
        </template>
      </div>
    </component>
  </div>
</template>
