<script setup lang="ts">
import type { DemoPatient, StageId } from '~/data/demo'

const props = defineProps<{
  patient: DemoPatient
  current: StageId
}>()

const emit = defineEmits<{ select: [StageId] }>()

const { ui, stages, riskLabel, formatDate } = useDemo()

const currentIndex = computed(() => stages.value.findIndex(s => s.id === props.current))
const progress = computed(() => ((currentIndex.value + 1) / stages.value.length) * 100)
const localePath = useLocalePath()
</script>

<template>
  <div>
    <!-- Escritorio: barra lateral -->
    <div class="hidden h-full flex-col lg:flex">
      <NuxtLink
        :to="localePath('/demo')"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        {{ ui.backToPatients }}
      </NuxtLink>

      <!-- Ficha del paciente -->
      <div class="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
        <div class="flex items-center gap-3">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
          >{{ patient.initials }}</span>
          <div class="min-w-0">
            <p class="truncate font-bold text-neutral-900 dark:text-white">
              {{ patient.name }}
            </p>
            <p class="text-xs text-neutral-500">
              {{ ui.years.replace('{age}', String(patient.age)) }}
            </p>
          </div>
        </div>

        <span
          class="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
          :class="[RISK_STYLES[patient.risk].bg, RISK_STYLES[patient.risk].text, RISK_STYLES[patient.risk].ring]"
        >{{ riskLabel(patient.risk) }}</span>

        <p class="mt-3 text-xs text-neutral-500">
          {{ ui.evaluatedOn.replace('{date}', formatDate(patient.evaluatedAt)) }}
        </p>
      </div>

      <p class="mt-6 mb-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
        {{ ui.stagesLabel }}
      </p>

      <nav class="flex-1 space-y-1">
        <button
          v-for="stage in stages"
          :key="stage.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-200"
          :class="stage.id === current
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5'"
          :aria-current="stage.id === current ? 'step' : undefined"
          @click="emit('select', stage.id)"
        >
          <span
            class="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200"
            :class="stage.index < currentIndex
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300'
              : stage.id === current
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400'"
          >
            <UIcon
              v-if="stage.index < currentIndex"
              name="i-lucide-check"
              class="size-3.5"
            />
            <template v-else>{{ stage.number }}</template>
          </span>
          <span class="truncate">{{ stage.label }}</span>
        </button>
      </nav>

      <!-- Progreso -->
      <div class="mt-6 border-t border-neutral-200 pt-4 dark:border-white/10">
        <div class="mb-2 flex items-center justify-between text-xs">
          <span class="text-neutral-500">{{ ui.progressLabel }}</span>
          <span class="font-bold tabular-nums text-neutral-700 dark:text-neutral-300">
            {{ currentIndex + 1 }}/{{ stages.length }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
          <div
            class="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Móvil: cabecera compacta + stepper horizontal -->
    <div class="lg:hidden">
      <div class="flex items-center gap-3 px-4 pt-4">
        <NuxtLink
          :to="localePath('/demo')"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-500 ring-1 ring-neutral-200 dark:bg-ink-900 dark:text-neutral-400 dark:ring-white/10"
          :aria-label="ui.backToPatients"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-4"
          />
        </NuxtLink>

        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
        >{{ patient.initials }}</span>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-neutral-900 dark:text-white">
            {{ patient.name }}
          </p>
          <p class="truncate text-xs text-neutral-500">
            {{ ui.years.replace('{age}', String(patient.age)) }} · {{ riskLabel(patient.risk) }}
          </p>
        </div>
      </div>

      <div class="mt-3 flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          v-for="stage in stages"
          :key="stage.id"
          type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="stage.id === current
            ? 'bg-brand-600 text-white'
            : 'bg-white text-neutral-600 ring-1 ring-neutral-200 dark:bg-ink-900 dark:text-neutral-300 dark:ring-white/10'"
          @click="emit('select', stage.id)"
        >
          <UIcon
            v-if="stage.index < currentIndex"
            name="i-lucide-check"
            class="size-3.5 text-brand-500"
          />
          <span v-else>{{ stage.number }}.</span>
          {{ stage.label }}
        </button>
      </div>
    </div>
  </div>
</template>
