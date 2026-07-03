<script setup lang="ts">
const dimensions = [
  { icon: 'i-lucide-brain', value: 85, label: 'Cognición', color: 'brand' as const },
  { icon: 'i-lucide-heart-pulse', value: 78, label: 'Salud emocional', color: 'blue' as const },
  { icon: 'i-lucide-person-standing', value: 80, label: 'Estilo de vida', color: 'violet' as const },
  { icon: 'i-lucide-shield-alert', value: 70, label: 'Factores de riesgo', color: 'orange' as const }
]

const projection = [
  { year: 'Hoy', score: 82 },
  { year: '5 años', score: 78 },
  { year: '10 años', score: 72 },
  { year: '20 años', score: 65 },
]

const recommendations = [
  'Mejorar calidad del sueño',
  'Aumentar actividad física',
  'Manejo del estrés',
  'Entrenamiento cognitivo',
  'Alimentación saludable',
  'Fortalecer relaciones sociales',
]

const deliverables = [
  { icon: 'i-lucide-clipboard-list', title: 'Brain Score™', description: 'Tu puntaje personalizado' },
  { icon: 'i-lucide-scan-search', title: 'Perfil de riesgo', description: 'Factores que necesitan atención' },
  { icon: 'i-lucide-bell', title: 'Alertas tempranas', description: 'Notificaciones inteligentes' },
  { icon: 'i-lucide-lightbulb', title: 'Recomendaciones', description: 'Acciones basadas en ciencia' },
  { icon: 'i-lucide-calendar-check', title: 'Plan de optimización', description: 'Estrategias para mejorar tu cerebro' },
  { icon: 'i-lucide-line-chart', title: 'Seguimiento continuo', description: 'Monitorea tu evolución en el tiempo' },
]

const maxScore = 100
</script>

<template>
  <section id="brain-score" class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28">
    <UContainer>
      <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <UiSectionEyebrow label="Brain Score™" />
          <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Tu indicador integral de <span class="text-brand-600 dark:text-brand-400">salud cerebral</span>
          </h2>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">
            Neurofit AI genera tu Brain Score™, un puntaje personalizado que refleja tu
            <span class="font-semibold text-neutral-900 dark:text-white">estado cerebral actual</span>
            y tu <span class="font-semibold text-neutral-900 dark:text-white">proyección futura</span>.
          </p>
          <NuxtPicture
            format="avif,webp"
            src="/hand-brain.webp"
          />
          <div class="mt-6 h-px w-16 bg-neutral-300 dark:bg-neutral-700" />

          <p class="mt-8 font-serif text-lg italic text-neutral-500 dark:text-neutral-400">
            Conoce hoy tu cerebro, cuídalo siempre.
          </p>
        </div>

        <UCard :ui="{ body: 'p-6 sm:p-8' }" class="shadow-xl shadow-brand-950/5">
          <div class="grid gap-8 sm:grid-cols-2">
            <div class="flex flex-col items-center justify-center gap-3 rounded-2xl bg-neutral-50 p-6 text-center dark:bg-neutral-900/60">
              <p class="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Tu Brain Score™</p>
              <UiStatRing :value="82" :size="150" />
              <UBadge color="primary" variant="subtle" class="rounded-full">Bueno · en buen estado</UBadge>
            </div>

            <div>
              <p class="mb-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Dimensiones analizadas</p>
              <div class="space-y-4">
                <UiDimensionBar
                  v-for="dim in dimensions"
                  :key="dim.label"
                  :label="dim.label"
                  :value="dim.value"
                  :color="dim.color"
                />
              </div>
            </div>
          </div>

          <div class="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Proyección futura</p>
              <div class="flex items-end justify-between gap-2">
                <div v-for="point in projection" :key="point.year" class="flex flex-col items-center gap-2">
                  <div class="flex h-24 w-8 items-end rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      class="w-full rounded-full bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                      :style="{ height: `${(point.score / maxScore) * 100}%` }"
                    />
                  </div>
                  <span class="text-xs font-bold text-neutral-700 dark:text-neutral-300">{{ point.score }}</span>
                  <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{ point.year }}</span>
                </div>
              </div>
            </div>

            <div>
              <p class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Recomendaciones clave</p>
              <ul class="space-y-1.5">
                <li
                  v-for="rec in recommendations"
                  :key="rec"
                  class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0 text-brand-500" />
                  {{ rec }}
                </li>
              </ul>
              <UButton label="Ver plan personalizado" color="primary" size="sm" class="mt-4 rounded-full" block />
            </div>
          </div>
        </UCard>
      </div>

      <div class="mt-14">
        <p class="mb-6 text-center text-sm font-bold tracking-wide text-neutral-500 dark:text-neutral-400">
          ¿QUÉ RECIBES?
        </p>
        <div v-auto-animate class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          <div v-for="item in deliverables" :key="item.title" class="flex flex-col items-center text-center">
            <div class="flex size-14 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-brand-400 dark:ring-neutral-800">
              <UIcon :name="item.icon" class="size-6" />
            </div>
            <p class="mt-3 text-sm font-bold text-neutral-900 dark:text-white">{{ item.title }}</p>
            <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
