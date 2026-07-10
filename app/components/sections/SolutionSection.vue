<script setup lang="ts">
const capabilities = [
  { icon: 'i-lucide-search-check', title: 'Evaluar', description: 'Analizamos tu salud cognitiva, emocional y conductual.' },
  { icon: 'i-lucide-shield-check', title: 'Monitorear', description: 'Seguimiento continuo para ver tu evolución en el tiempo.' },
  { icon: 'i-lucide-bell-ring', title: 'Detectar riesgos', description: 'Identificamos factores de riesgo antes de que sea demasiado tarde.' },
  { icon: 'i-lucide-triangle-alert', title: 'Alertas tempranas', description: 'Notificaciones inteligentes cuando detectamos señales de atención.' },
  { icon: 'i-lucide-lightbulb', title: 'Recomendaciones', description: 'Estrategias personalizadas basadas en ciencia y en tu perfil único.' },
  { icon: 'i-lucide-target', title: 'Optimizar tu cerebro', description: 'Planes y acciones para fortalecer tu salud cerebral y tu bienestar.' }
]

const stats = [
  { icon: 'i-lucide-users', value: 10, prefix: '+', label: 'Dimensiones analizadas' },
  { icon: 'i-lucide-brain', value: 50, prefix: '+', label: 'Variables evaluadas' },
  { icon: 'i-lucide-database', value: 1, prefix: '+', suffix: 'M', label: 'Datos procesados con IA' },
  { icon: 'i-lucide-trending-up', value: 100, suffix: '%', label: 'Enfocado en tu salud cerebral' }
]

const dimensions = [
  { label: 'Cognición', value: 85, color: 'brand' as const },
  { label: 'Salud emocional', value: 78, color: 'blue' as const },
  { label: 'Estilo de vida', value: 80, color: 'violet' as const },
  { label: 'Factores de riesgo', value: 70, color: 'orange' as const }
]
</script>

<template>
  <section id="tecnologia" class="py-20 lg:py-28">
    <UContainer>
      <div class="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <UiSectionEyebrow label="Nuestra solución" />
          <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Neurofit IA<br>
            <span class="text-brand-600 dark:text-brand-400">Brain Intelligence™</span>
          </h2>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">
            Una plataforma de inteligencia artificial diseñada para evaluar, monitorear y optimizar la salud
            cerebral mediante un análisis integral de tu información.
          </p>

          <div class="mt-5 h-px w-16 bg-neutral-300 dark:bg-neutral-700" />

          <UAlert color="primary" variant="soft" class="mt-5 rounded-xl">
            <template #description>
              <span class="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                <UIcon name="i-lucide-brain-circuit" class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
                Neurofit IA transforma datos en información accionable para que puedas tomar
                <span class="font-semibold text-brand-700 dark:text-brand-400">decisiones preventivas</span>
                hoy, y construir un mejor futuro.
              </span>
            </template>
          </UAlert>

          <p class="mt-8 text-sm font-bold tracking-wide text-neutral-900 dark:text-white">
            Neurofit IA TE PERMITE:
          </p>
          <div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div v-for="item in capabilities" :key="item.title" class="flex items-start gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                <UIcon :name="item.icon" class="size-4" />
              </div>
              <div>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ item.title }}</p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <UCard :ui="{ body: 'p-6' }" class="shadow-xl shadow-brand-950/5">
            <div class="flex items-center justify-between">
              <p class="font-bold text-neutral-900 dark:text-white">Tu Brain Score™</p>
              <UBadge color="primary" variant="subtle" class="rounded-full">Bueno</UBadge>
            </div>
            <div class="mt-5 flex items-center gap-6">
              <UiStatRing :value="82" />
              <div class="flex-1 space-y-4">
                <UiDimensionBar
                  v-for="dim in dimensions"
                  :key="dim.label"
                  :label="dim.label"
                  :value="dim.value"
                  :color="dim.color"
                />
              </div>
            </div>
          </UCard>

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <UiStatCounter
              v-for="stat in stats"
              :key="stat.label"
              :icon="stat.icon"
              :value="stat.value"
              :prefix="stat.prefix"
              :suffix="stat.suffix"
              :label="stat.label"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
