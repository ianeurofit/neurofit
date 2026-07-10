<script setup lang="ts">
const mission = [
  'Hacer accesible la evaluación cerebral basada en ciencia.',
  'Detectar riesgos y oportunidades de mejora de forma temprana.',
  'Guiar decisiones y hábitos que transformen vidas.',
  'Impulsar un futuro más saludable, productivo y consciente.'
]

const vision = [
  'Impactar a mil millones de personas en todo el mundo.',
  'Establecer el estándar global de salud cerebral digital.',
  'Colaborar con gobiernos, empresas, instituciones y comunidades.',
  'Contribuir a un mundo más resiliente, equitativo y lleno de oportunidades.'
]

const impact = [
  { icon: 'i-lucide-users', label: 'Para todas\nlas personas' },
  { icon: 'i-lucide-globe', label: 'En todos\nlos países' },
  { icon: 'i-lucide-heart-handshake', label: 'En todas las\netapas de la vida' },
  { icon: 'i-lucide-trending-up', label: 'Con impacto\ngeneracional' }
]
</script>

<template>
  <section id="vision" class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28">
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow label="Nuestra misión y visión" />
          <h2 class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Un mundo donde cada cerebro pueda alcanzar su <span class="text-brand-600 dark:text-brand-400">máximo potencial</span>
          </h2>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          En Neurofit IA trabajamos para transformar la salud cerebral a escala global, combinando ciencia,
          tecnología e inteligencia artificial para generar un impacto positivo en millones de vidas.
        </p>
      </div>

      <div class="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr_1.1fr]">
        <UCard :ui="{ body: 'p-7' }">
          <div class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <UIcon name="i-lucide-rocket" class="size-6" />
          </div>
          <h3 class="mt-4 font-bold text-neutral-900 dark:text-white">Nuestra Misión</h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Empoderar a las personas y organizaciones con información precisa y recomendaciones personalizadas
            para mejorar la salud cerebral, el bienestar y el rendimiento.
          </p>
          <ul class="mt-4 space-y-2.5">
            <li v-for="item in mission" :key="item" class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-brand-500" />
              {{ item }}
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ body: 'p-7 ' }">
          <div class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <UIcon name="i-lucide-flag" class="size-6" />
          </div>
          <h3 class="mt-4 font-bold text-neutral-900 dark:text-white">Nuestra Visión</h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Ser la plataforma líder mundial en inteligencia cerebral, reconocida por transformar la manera en
            que el mundo entiende, cuida y optimiza el cerebro.
          </p>
          <ul class="mt-4 space-y-2.5">
            <li v-for="item in vision" :key="item" class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-brand-500" />
              {{ item }}
            </li>
          </ul>
        </UCard>

        <div class="relative overflow-hidden rounded-2xl bg-ink-950 p-7 text-white bg-[url('/worldlines.webp')] bg-scroll bg-cover bg-center">
          <div class="bg-radial-dots pointer-events-none absolute inset-0 text-white/5" />
          <p class="relative text-lg font-bold">
            Un impacto global. <span class="text-brand-400">Un futuro mejor.</span>
          </p>
          <div class="relative mt-64 grid grid-cols-4 gap-6">
            <div v-for="item in impact" :key="item.icon" class="flex flex-col items-center gap-2 text-center">
              <UIcon :name="item.icon" class="size-6 text-brand-400" />
              <span class="whitespace-pre-line text-xs text-neutral-300">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center ring-1 ring-neutral-200 sm:flex-row sm:text-left dark:bg-neutral-900 dark:ring-neutral-800">
        <UIcon name="i-lucide-globe-2" class="size-10 shrink-0 text-brand-600 dark:text-brand-400" />
        <div>
          <p class="font-bold text-neutral-900 dark:text-white">
            Juntos, construimos un futuro más <span class="text-brand-600 dark:text-brand-400">inteligente y saludable</span>
          </p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Creemos en el poder de la ciencia, la tecnología y la colaboración para crear un mundo donde cada
            cerebro tenga la oportunidad de florecer.
          </p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
