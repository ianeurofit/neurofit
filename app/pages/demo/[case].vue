<script setup lang="ts">
import type { Component } from 'vue'
import type { StageId } from '~/data/demo'
import StageScreening from '~/components/demo/StageScreening.vue'
import StageSummary from '~/components/demo/StageSummary.vue'
import StageFindings from '~/components/demo/StageFindings.vue'
import StageRisk from '~/components/demo/StageRisk.vue'
import StageIndex from '~/components/demo/StageIndex.vue'
import StagePlan from '~/components/demo/StagePlan.vue'
import StageRecommendations from '~/components/demo/StageRecommendations.vue'

definePageMeta({ layout: 'demo' })

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { content, ui, demoCase, stages } = useDemo()

const caseId = computed(() => String(route.params.case ?? ''))

// Solo el caso completo del guión tiene panel navegable.
const patient = computed(() =>
  content.value.patients.find(p => p.id === caseId.value && p.hasFullCase),
)

if (!patient.value) {
  throw createError({ statusCode: 404, statusMessage: 'Demo case not found', fatal: true })
}

/** La etapa vive en la URL (`?etapa=`) para poder compartir y usar atrás/adelante. */
const STAGE_QUERY = 'etapa'

function parseStage(value: unknown): StageId {
  const id = String(value ?? '')
  return DEMO_STAGES.includes(id as StageId) ? (id as StageId) : 'screening'
}

const current = ref<StageId>(parseStage(route.query[STAGE_QUERY]))
const currentIndex = computed(() => stages.value.findIndex(s => s.id === current.value))
const currentStage = computed(() => stages.value[currentIndex.value])

/** Cada paso del demo vive en su propio componente. */
const STAGE_COMPONENTS: Record<StageId, Component> = {
  screening: StageScreening,
  summary: StageSummary,
  findings: StageFindings,
  risk: StageRisk,
  index: StageIndex,
  plan: StagePlan,
  recommendations: StageRecommendations,
}

const stageComponent = computed(() => STAGE_COMPONENTS[current.value])

const contentTop = ref<HTMLElement | null>(null)

function goTo(stage: StageId) {
  if (stage === current.value) return
  current.value = stage
  router.replace({ query: { ...route.query, [STAGE_QUERY]: stage } })
  // En móvil el contenido queda por debajo del stepper: se reencuadra al cambiar.
  nextTick(() => {
    if (window.innerWidth < 1024) {
      contentTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function step(delta: number) {
  const next = stages.value[currentIndex.value + delta]
  if (next) goTo(next.id)
}

const canPrev = computed(() => currentIndex.value > 0)
const canNext = computed(() => currentIndex.value < stages.value.length - 1)

function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

  if (event.key === 'ArrowRight') step(1)
  if (event.key === 'ArrowLeft') step(-1)
}

watch(() => route.query[STAGE_QUERY], (value) => {
  current.value = parseStage(value)
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

useSeoMeta({
  title: () => `${patient.value?.name} · ${ui.value.panelName} | Neurofit IA`,
  description: () => demoCase.value.summary.text,
  ogTitle: () => `${patient.value?.name} · ${ui.value.panelName}`,
  ogDescription: () => demoCase.value.summary.text,
  ogImage: '/neurofit-logo-tealgray-.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div
    v-if="patient"
    class="mx-auto flex w-full max-w-[1600px] flex-col lg:flex-row lg:gap-8 lg:px-6"
  >
    <!-- Navegación de etapas -->
    <aside
      class="w-full shrink-0 lg:sticky lg:top-18 lg:h-[calc(100vh-4.5rem)] lg:w-72 lg:py-8 xl:w-80"
    >
      <DemoStageNav
        :patient="patient"
        :current="current"
        @select="goTo"
      />
    </aside>

    <!-- Contenido de la etapa -->
    <div
      ref="contentTop"
      class="min-w-0 flex-1 border-t border-neutral-200 px-4 py-6 sm:px-6 lg:border-t-0 lg:border-l lg:px-8 lg:py-8 dark:border-white/10"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-neutral-400">
            {{ ui.stageOf.replace('{current}', String(currentIndex + 1)).replace('{total}', String(stages.length)) }}
          </p>
          <Transition
            name="demo-stage"
            mode="out-in"
          >
            <h1
              :key="current"
              class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              {{ currentStage?.label }}
            </h1>
          </Transition>
        </div>

        <div class="flex shrink-0 gap-2">
          <UButton
            :label="ui.scheduleAppointment"
            color="neutral"
            variant="outline"
            class="rounded-full"
            icon="i-lucide-calendar-plus"
            :to="`${localePath('/')}login`"
          />
          <UButton
            :label="ui.generateReport"
            color="primary"
            class="rounded-full"
            icon="i-lucide-file-down"
            :to="`${localePath('/')}login`"
          />
        </div>
      </div>

      <!-- Etapa activa -->
      <div class="mt-6">
        <Transition
          name="demo-stage"
          mode="out-in"
        >
          <component
            :is="stageComponent"
            :key="current"
            :demo-case="demoCase"
          />
        </Transition>
      </div>

      <!-- Navegación entre etapas -->
      <div class="mt-8 flex items-center justify-between gap-3 border-t border-neutral-200 pt-5 dark:border-white/10">
        <UButton
          :label="ui.prev"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="rounded-full"
          :disabled="!canPrev"
          @click="step(-1)"
        />

        <div class="flex items-center gap-1.5">
          <button
            v-for="stage in stages"
            :key="stage.id"
            type="button"
            class="h-1.5 rounded-full transition-all"
            :class="stage.id === current
              ? 'w-6 bg-brand-500'
              : 'w-1.5 bg-neutral-300 hover:bg-neutral-400 dark:bg-white/20'"
            :aria-label="stage.label"
            @click="goTo(stage.id)"
          />
        </div>

        <UButton
          :label="ui.next"
          color="primary"
          variant="ghost"
          trailing-icon="i-lucide-arrow-right"
          class="rounded-full"
          :disabled="!canNext"
          @click="step(1)"
        />
      </div>

      <p class="mt-6 flex items-start gap-2 text-xs text-neutral-400">
        <UIcon
          name="i-lucide-info"
          class="mt-0.5 size-3.5 shrink-0"
        />
        {{ ui.disclaimer }}
      </p>
    </div>
  </div>
</template>
