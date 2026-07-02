<script setup lang="ts">
const audiences = [
  {
    icon: 'i-lucide-user',
    title: 'Personas',
    tagline: 'Mejora tu salud cerebral y calidad de vida.',
    items: ['Conoce tu estado cerebral', 'Identifica factores de riesgo', 'Recibe recomendaciones personalizadas', 'Mejora tu bienestar y rendimiento diario'],
    cta: 'Para tu bienestar'
  },
  {
    icon: 'i-lucide-building-2',
    title: 'Empresas',
    tagline: 'Equipos más saludables, enfocados y productivos.',
    items: ['Bienestar y salud cerebral de tus colaboradores', 'Reducción del estrés y ausentismo', 'Mejora del enfoque, la productividad y toma de decisiones', 'Programas corporativos personalizados'],
    cta: 'Para equipos de alto desempeño'
  },
  {
    icon: 'i-lucide-plus',
    title: 'Sector Salud',
    tagline: 'Mejores decisiones clínicas con datos objetivos.',
    items: ['Apoyo en diagnóstico y evaluación', 'Monitoreo de pacientes y tratamiento', 'Prevención y manejo de trastornos cognitivos', 'Herramienta complementaria basada en evidencia'],
    cta: 'Para profesionales de la salud'
  },
  {
    icon: 'i-lucide-landmark',
    title: 'Gobiernos',
    tagline: 'Poblaciones más sanas, productivas y resilientes.',
    items: ['Estrategias nacionales de salud cerebral', 'Programas de prevención y detección temprana', 'Datos para políticas públicas basadas en evidencia', 'Mejora de la calidad de vida de la población'],
    cta: 'Para sociedades más saludables'
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: 'Investigación',
    tagline: 'Datos de alta calidad para impulsar el conocimiento.',
    items: ['Acceso a datos anonimizados y agregados', 'Colaboración en estudios científicos', 'Validación de modelos y biomarcadores', 'Impulso a la innovación en neurociencia'],
    cta: 'Para investigadores y científicos'
  }
]

const pillars = [
  { icon: 'i-lucide-shield-check', title: 'Prevención', description: 'Detectamos riesgos antes de que se conviertan en problemas.' },
  { icon: 'i-lucide-target', title: 'Personalización', description: 'Cada cerebro es único. Nuestras recomendaciones también.' },
  { icon: 'i-lucide-trending-up', title: 'Impacto real', description: 'Mejor salud cerebral, más bienestar, mejor calidad de vida.' },
  { icon: 'i-lucide-users', title: 'Basado en ciencia', description: 'Neurociencia, inteligencia artificial y evidencia científica.' }
]
</script>

<template>
  <section class="py-20 lg:py-28">
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow number="06" label="¿A quién ayudamos?" />
          <h2 class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Neurofit AI está diseñado para <span class="text-brand-600 dark:text-brand-400">diferentes personas y organizaciones</span>
          </h2>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          Nuestra plataforma se adapta a las necesidades de cada usuario y organización, entregando información
          accionable para mejorar la salud cerebral, el bienestar y el rendimiento.
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <UCard v-for="item in audiences" :key="item.title" class="flex h-full flex-col" :ui="{ body: 'p-6 flex flex-col h-full' }">
          <div class="flex size-11 items-center justify-center rounded-full bg-brand-500 text-white">
            <UIcon :name="item.icon" class="size-5" />
          </div>
          <h3 class="mt-4 font-bold text-neutral-900 dark:text-white">{{ item.title }}</h3>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ item.tagline }}</p>

          <ul class="mt-4 flex-1 space-y-2.5">
            <li v-for="li in item.items" :key="li" class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-brand-500" />
              {{ li }}
            </li>
          </ul>

          <a href="#contacto" class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all dark:text-brand-400">
            {{ item.cta }}
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </a>
        </UCard>
      </div>

      <div class="mt-10 grid gap-8 rounded-2xl bg-neutral-50 p-8 sm:grid-cols-2 lg:grid-cols-5 dark:bg-neutral-900/40">
        <div class="lg:col-span-1">
          <UIcon name="i-lucide-brain-circuit" class="size-9 text-brand-600 dark:text-brand-400" />
          <p class="mt-3 font-bold text-neutral-900 dark:text-white">Un mismo objetivo, diferentes caminos</p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Trabajamos con personas y organizaciones que quieren tomar mejores decisiones hoy, para un cerebro
            más sano mañana.
          </p>
        </div>
        <div v-for="pillar in pillars" :key="pillar.title">
          <UIcon :name="pillar.icon" class="size-6 text-brand-600 dark:text-brand-400" />
          <p class="mt-3 font-bold text-neutral-900 dark:text-white">{{ pillar.title }}</p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ pillar.description }}</p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
