<script setup lang="ts">
const problems = [
  {
    icon: 'i-lucide-brain',
    title: 'Deterioro cognitivo',
    description: 'Pérdida progresiva de memoria, atención y otras funciones.',
    color: 'brand' as const
  },
  {
    icon: 'i-lucide-frown',
    title: 'Estrés y ansiedad',
    description: 'Niveles elevados de estrés que afectan el bienestar mental.',
    color: 'brand' as const
  },
  {
    icon: 'i-lucide-flame',
    title: 'Burnout',
    description: 'Agotamiento físico y mental que reduce la productividad y la calidad de vida.',
    color: 'orange' as const
  },
  {
    icon: 'i-lucide-heart-pulse',
    title: 'Problemas de salud mental',
    description: 'Trastornos emocionales que impactan la vida personal y social.',
    color: 'blue' as const
  },
  {
    icon: 'i-lucide-trending-down',
    title: 'Disminución de calidad de vida',
    description: 'Afecta las relaciones, el desempeño y la felicidad general.',
    color: 'violet' as const
  }
]
</script>

<template>
  <section class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28">
    <UContainer>
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <UiSectionEyebrow label="El problema" />
          <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Estamos viviendo una crisis silenciosa de
            <span class="text-brand-600 dark:text-brand-400">salud cerebral</span>
          </h2>

          <div class="mt-6 space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>
              Millones de personas presentan factores de riesgo relacionados con estrés, ansiedad, deterioro
              cognitivo y salud mental sin saberlo.
            </p>
            <p>La mayoría de los problemas cerebrales comienzan años antes de la aparición de síntomas visibles.</p>
            <p>
              Cuando las personas buscan ayuda,
              <span class="font-semibold text-neutral-900 dark:text-white">
                muchas veces el problema ya está avanzado.
              </span>
            </p>
          </div>

          <div class="mt-6 h-px w-16 bg-neutral-300 dark:bg-neutral-700" />

          <UAlert
            icon="i-lucide-alert-triangle"
            color="primary"
            variant="soft"
            class="mt-6 rounded-xl"
          >
            <template #description>
              <span class="text-neutral-700 dark:text-neutral-300">
                Neurofit IA busca cambiar ese paradigma, pasando de un modelo
                <span class="font-bold">reactivo</span> a un modelo
                <span class="font-bold text-brand-600 dark:text-brand-400">preventivo</span>.
              </span>
            </template>
          </UAlert>
        </div>

        <div class="relative flex items-center justify-center">
                  <NuxtPicture
          format="avif,webp"
          src="/neurofit-person-pefil-1.webp"
        />
        </div>
      </div>

      <div class="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        <UiFeatureCard
          v-for="item in problems"
          :key="item.title"
          :icon="item.icon"
          :title="item.title"
          :description="item.description"
          :color="item.color"
        />
      </div>
    </UContainer>
  </section>
</template>
