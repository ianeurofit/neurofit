<script setup lang="ts">
definePageMeta({ layout: 'demo' })

const { t } = useI18n()
const { content, ui } = useDemo()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `${ui.value.listTitle} | Neurofit IA`,
  description: () => ui.value.listSubtitle,
  ogTitle: () => `${ui.value.listTitle} | Neurofit IA`,
  ogDescription: () => ui.value.listSubtitle,
  ogImage: '/neurofit-logo-tealgray-.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const patients = computed(() => content.value.patients)

const counts = computed(() => ({
  total: patients.value.length,
  high: patients.value.filter(p => p.risk === 'high').length,
  moderate: patients.value.filter(p => p.risk === 'moderate').length,
  low: patients.value.filter(p => p.risk === 'low').length,
}))

const stats = computed(() => [
  { key: 'total', label: ui.value.activePatients, value: counts.value.total, tone: 'text-neutral-900 dark:text-white' },
  { key: 'high', label: ui.value.highRisk, value: counts.value.high, tone: 'text-red-600 dark:text-red-400' },
  { key: 'moderate', label: ui.value.moderateRisk, value: counts.value.moderate, tone: 'text-amber-600 dark:text-amber-400' },
  { key: 'low', label: ui.value.lowRisk, value: counts.value.low, tone: 'text-brand-600 dark:text-brand-400' },
])

const fullCase = computed(() => patients.value.find(p => p.hasFullCase))
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
    <!-- Encabezado -->
    <div class="demo-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {{ ui.listTitle }}
        </h1>
        <p class="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {{ ui.listSubtitle }}
        </p>
      </div>

      <UButton
        v-if="fullCase"
        :to="localePath(`/demo/${fullCase.id}`)"
        :label="ui.newScreening"
        icon="i-lucide-plus"
        color="primary"
        size="lg"
        class="w-fit rounded-full"
      />
    </div>

    <!-- Métricas -->
    <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <div
        v-for="(stat, index) in stats"
        :key="stat.key"
        class="demo-enter rounded-2xl border border-neutral-200 bg-white p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5 dark:border-white/10 dark:bg-ink-900"
        :style="{ '--delay': `${index * 70}ms` }"
      >
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
          {{ stat.label }}
        </p>
        <p
          class="mt-2 text-3xl font-extrabold tabular-nums sm:text-4xl"
          :class="stat.tone"
        >
          {{ stat.value }}
        </p>
      </div>
    </div>

    <!-- Pacientes -->
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DemoPatientCard
        v-for="(patient, index) in patients"
        :key="patient.id"
        :patient="patient"
        :delay="200 + index * 90"
      />
    </div>

    <p class="mt-6 flex items-start gap-2 text-xs text-neutral-400">
      <UIcon
        name="i-lucide-info"
        class="mt-0.5 size-3.5 shrink-0"
      />
      {{ ui.demoOnlyHint }} {{ ui.disclaimer }}
    </p>

    <!-- Cierre comercial -->
    <div
      class="demo-enter mt-10 flex flex-col gap-5 overflow-hidden rounded-2xl bg-ink-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"
      :style="{ '--delay': '300ms' }"
    >
      <div class="relative">
        <p class="section-eyebrow text-brand-400">
          Neurofit IA
        </p>
        <h2 class="mt-2 text-xl font-extrabold sm:text-2xl">
          {{ ui.ctaTitle }}
        </h2>
        <p class="mt-2 max-w-xl text-sm text-neutral-300">
          {{ ui.ctaText }}
        </p>
      </div>

      <UButton
        :to="`${localePath('/')}#formulario`"
        :label="ui.ctaButton"
        color="primary"
        size="lg"
        class="w-fit shrink-0 rounded-full"
        icon="i-lucide-brain-circuit"
      />
    </div>

    <p class="mt-6 text-center text-xs text-neutral-400">
      <NuxtLink
        :to="localePath('/')"
        class="font-semibold hover:text-brand-600 dark:hover:text-brand-400"
      >
        {{ t('auth.backHome') }}
      </NuxtLink>
    </p>
  </div>
</template>
