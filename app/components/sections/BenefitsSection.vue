<script setup lang="ts">
const benefits = [
  { icon: 'i-lucide-shield-check', title: 'Prevención temprana', description: 'Detecta factores de riesgo a tiempo para prevenir el deterioro cognitivo y problemas de salud mental.' },
  { icon: 'i-lucide-trending-up', title: 'Salud cerebral optimizada', description: 'Brinda recomendaciones personalizadas para mejorar el rendimiento cognitivo, emocional y físico.' },
  { icon: 'i-lucide-heart', title: 'Bienestar integral', description: 'Promueve hábitos saludables que impactan positivamente la mente, el cuerpo y las emociones.' },
  { icon: 'i-lucide-shield', title: 'Decisiones informadas', description: 'Proporciona información clara y basada en evidencia para tomar decisiones conscientes sobre la salud cerebral.' },
  { icon: 'i-lucide-users', title: 'Impacto en organizaciones', description: 'Mejora la productividad, reduce el estrés y el ausentismo, y potencia el bienestar de los equipos.' },
  { icon: 'i-lucide-plus', title: 'Apoyo a profesionales', description: 'Herramientas avanzadas para profesionales de la salud que facilitan evaluaciones precisas y planes de intervención efectivos.' },
  { icon: 'i-lucide-globe', title: 'Accesibilidad global', description: 'Plataforma digital accesible desde cualquier lugar, promoviendo la salud cerebral en todo el mundo.' },
  { icon: 'i-lucide-leaf', title: 'Ciencia con propósito', description: 'Integra ciencia, tecnología y humanidad para generar un cambio real y sostenible en la sociedad.' }
]

const closing = [
  { icon: 'i-lucide-brain', label: 'Mejores mentes' },
  { icon: 'i-lucide-heart', label: 'Mejores vidas' },
  { icon: 'i-lucide-users', label: 'Mejores comunidades' },
  { icon: 'i-lucide-globe', label: 'Mejor mundo' }
]
</script>

<template>
  <section class="py-20 lg:py-28">
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow number="08" label="Beneficios" />
          <h2 class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Beneficios que transforman <span class="text-brand-600 dark:text-brand-400">vidas y organizaciones</span>
          </h2>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          Neurofit AI combina ciencia, tecnología e inteligencia artificial para generar impacto positivo y
          medible en la salud cerebral de las personas y en los resultados de las organizaciones.
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <UiFeatureCard
          v-for="item in benefits"
          :key="item.title"
          :icon="item.icon"
          :title="item.title"
          :description="item.description"
        />
      </div>

      <div class="mt-8 flex flex-col gap-6 rounded-2xl bg-neutral-50 p-8 lg:flex-row lg:items-center lg:justify-between dark:bg-neutral-900/40">
        <div class="flex items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <UIcon name="i-lucide-target" class="size-6" />
          </div>
          <p class="text-neutral-700 dark:text-neutral-300">
            En Neurofit AI creemos que un cerebro sano es la base de una vida plena y de un
            <span class="font-bold text-neutral-900 dark:text-white">futuro mejor</span> para todos.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div v-for="item in closing" :key="item.label" class="flex flex-col items-center gap-2 text-center">
            <UIcon :name="item.icon" class="size-6 text-brand-600 dark:text-brand-400" />
            <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
