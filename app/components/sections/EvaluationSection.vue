<script setup lang="ts">
const columns = [
  {
    number: 1,
    title: 'Cognición',
    icon: 'i-lucide-brain',
    color: 'brand' as const,
    description: 'Evaluamos tus capacidades cognitivas clave para entender cómo funciona tu mente.',
    items: ['Memoria', 'Atención', 'Funciones ejecutivas', 'Velocidad de procesamiento', 'Razonamiento', 'Aprendizaje']
  },
  {
    number: 2,
    title: 'Salud emocional',
    icon: 'i-lucide-heart-pulse',
    color: 'blue' as const,
    description: 'Analizamos tu bienestar emocional y factores que pueden afectar tu equilibrio mental.',
    items: ['Estrés', 'Ansiedad', 'Estado de ánimo', 'Bienestar emocional', 'Resiliencia', 'Motivación']
  },
  {
    number: 3,
    title: 'Estilo de vida',
    icon: 'i-lucide-person-standing',
    color: 'violet' as const,
    description: 'Estudiamos tus hábitos diarios que impactan directamente tu salud cerebral.',
    items: ['Calidad del sueño', 'Actividad física', 'Alimentación', 'Relaciones sociales', 'Manejo del tiempo', 'Hábitos y rutinas']
  },
  {
    number: 4,
    title: 'Factores de riesgo',
    icon: 'i-lucide-shield-alert',
    color: 'orange' as const,
    description: 'Identificamos factores que pueden incrementar el riesgo de deterioro cognitivo o problemas futuros.',
    items: ['Factores cognitivos', 'Factores conductuales', 'Factores emocionales', 'Antecedentes familiares', 'Envejecimiento cerebral', 'Otros factores relevantes']
  }
]

const colorMap: Record<string, { text: string, dot: string, ring: string }> = {
  brand: { text: 'text-brand-600 dark:text-brand-400', dot: 'bg-brand-500', ring: 'bg-brand-50 dark:bg-brand-950/40' },
  blue: { text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', ring: 'bg-blue-50 dark:bg-blue-950/40' },
  violet: { text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', ring: 'bg-violet-50 dark:bg-violet-950/40' },
  orange: { text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', ring: 'bg-orange-50 dark:bg-orange-950/40' }
}
</script>

<template>
  <section id="solucion" class="py-20 lg:py-28">
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow label="¿Qué evalúa Neurofit IA?" />
          <h2 class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Un análisis integral de tu <span class="text-brand-600 dark:text-brand-400">salud cerebral</span>
          </h2>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          Neurofit IA evalúa múltiples dimensiones que influyen en tu salud cerebral para generar una visión
          completa y precisa.
        </p>
      </div>

      <div class="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="col in columns"
          :key="col.title"
          class="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800"
          :class="colorMap[col.color].ring"
        >
          <div class="flex size-12 items-center justify-center rounded-full bg-white dark:bg-neutral-900">
            <UIcon :name="col.icon" class="size-6" :class="colorMap[col.color].text" />
          </div>
          <h3 class="mt-4 text-lg font-bold" :class="colorMap[col.color].text">
            {{ col.number }}. {{ col.title }}
          </h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{{ col.description }}</p>
          <div class="mt-4 h-px bg-neutral-200 dark:bg-neutral-700" />
          <ul class="mt-4 space-y-2.5">
            <li v-for="item in col.items" :key="item" class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <span class="size-1.5 shrink-0 rounded-full" :class="colorMap[col.color].dot" />
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 grid gap-4 rounded-2xl bg-neutral-50 p-6 sm:grid-cols-2 dark:bg-neutral-900/40">
        <p class="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
          <UIcon name="i-lucide-brain-circuit" class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
          Al integrar todas estas dimensiones, Neurofit IA genera un
          <span class="font-semibold text-brand-700 dark:text-brand-400">diagnóstico preventivo personalizado</span>
          y recomendaciones accionables para ti.
        </p>
        <p class="flex items-start gap-3 text-sm font-semibold text-neutral-900 sm:justify-self-end dark:text-white">
          <UIcon name="i-lucide-sparkles" class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
          Más que datos, inteligencia para tu bienestar.
        </p>
      </div>
    </UContainer>
  </section>
</template>
