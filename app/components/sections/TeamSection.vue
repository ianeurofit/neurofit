<script setup lang="ts">
const values = [
  { icon: 'i-lucide-users', title: 'Enfoque humano', description: 'Escuchamos, comprendemos y diseñamos soluciones centradas en las personas y sus historias.' },
  { icon: 'i-lucide-heart', title: 'Ciencia con propósito', description: 'Utilizamos evidencia científica y tecnología para prevenir, intervenir y mejorar la salud cerebral.' },
  { icon: 'i-lucide-globe', title: 'Impacto en comunidad', description: 'Trabajamos junto a comunidades, instituciones y organizaciones para generar bienestar y oportunidades accesibles para todos.' },
  { icon: 'i-lucide-handshake', title: 'Innovación con valores', description: 'Desarrollamos soluciones éticas, inclusivas y sostenibles que construyen un futuro más consciente.' }
]

const experience = [
  { icon: 'i-lucide-graduation-cap', title: 'Equipo científico', description: 'Neurocientíficos, psicólogos e investigadores que generan conocimiento y validan cada solución.' },
  { icon: 'i-lucide-flask-conical', title: 'Equipo tecnológico', description: 'Ingenieros, desarrolladores y analistas de datos que transforman la ciencia en tecnología inteligente.' },
  { icon: 'i-lucide-users', title: 'Equipo clínico', description: 'Profesionales en salud mental que diseñan e implementan programas basados en evidencia y empatía.' },
  { icon: 'i-lucide-globe', title: 'Equipo de innovación', description: 'Creativos, estrategas y especialistas en diseño de experiencias que llevan nuestras soluciones al siguiente nivel.' }
]

const stats = [
  { icon: 'i-lucide-users', value: 50, prefix: '+', label: 'Expertos y científicos colaborando' },
  { icon: 'i-lucide-globe', value: 25, prefix: '+', label: 'Países alcanzados con nuestros estudios' },
  { icon: 'i-lucide-user-check', value: 100, prefix: '+', suffix: 'K', label: 'Personas evaluadas en piloto y validaciones' },
  { icon: 'i-lucide-database', value: 1, prefix: '+', suffix: 'M', label: 'Datos procesados para entender el cerebro' },
  { icon: 'i-lucide-shield-check', value: 100, suffix: '%', label: 'Comprometidos con la ética y la privacidad' },
]
</script>

<template>
  <section class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28">
    <UContainer>
      <UiSectionEyebrow label="Equipo" />
      <div class="mt-12 grid gap-10 lg:grid-cols-[2fr_1.6fr]">
        <div>

          <h2 class="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Ciencia, empatía y propósito al <span class="text-brand-600 dark:text-brand-400">servicio del cerebro</span>
          </h2>
          <p class="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            En Neurofit IA somos un equipo científico, tecnológico y humano comprometido con transformar la salud cerebral a través de la ciencia, la innovación y un enfoque integral centrado en las personas.
          </p>
        </div>
        <div>
<h2 class="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
        Un equipo multidisciplinario al <span class="text-brand-600 dark:text-brand-400">servicio del cerebro</span>
          </h2>
          <p class="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            Científicos, tecnólogos, psicólogos, neurocientíficos, diseñadores, ingenieros y especialistas en datos trabajamos juntos para crear soluciones innovadoras con impacto real.
          </p>

        </div>

      </div>

      <div class="mt-12 grid gap-10 lg:grid-cols-[1fr_2.3fr_1fr]">
        <div class="space-y-6">
          <div v-for="item in values" :key="item.title" class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-brand-400 dark:ring-neutral-800">
              <UIcon :name="item.icon" class="size-4.5" />
            </div>
            <div>
              <p class="font-bold text-neutral-900 dark:text-white">{{ item.title }}</p>
              <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ item.description }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center text-center">
          <NuxtPicture
            format="avif,webp"
            src="/team-ia.webp"
          />
          
        </div>

        <div>
          <div class="space-y-5">
            <div v-for="item in experience" :key="item.title" class="flex items-start gap-3">
              <UIcon :name="item.icon" class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
              <div>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ item.title }}</p>
                <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 rounded-2xl bg-ink-950 p-8 text-white">
        <p class="mb-6 text-sm font-bold tracking-wide text-brand-400">Neurofit IA EN NÚMEROS</p>
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-5">
          <UiStatCounter
            v-for="stat in stats"
            :key="stat.label"
            :icon="stat.icon"
            :value="stat.value"
            :prefix="stat.prefix"
            :suffix="stat.suffix"
            :label="stat.label"
            class="!bg-transparent !p-0 [&_svg]:text-brand-400 [&_p:first-of-type]:text-white [&_p:last-of-type]:text-neutral-400"
          />
        </div>
      </div>
      <UCard :ui="{ root: 'mt-10 bg-white/5 ring-white/10', body: 'p-8' }" class="text-center">
        <UIcon name="i-lucide-quote" class="mx-auto size-8 text-brand-400" />
        <p class="mt-3 text-lg font-medium">"En Neurofit AI trabajamos cada día para impulsar la salud cerebral, prevenir enfermedades y mejorar la calidad de vida de millones de personas en el mundo."</p>
        <h3 class="mt-5 text-xl font-extrabold text-neutral-900 dark:text-white">Marisol Uribe Vergara</h3>
          <p class="text-sm font-medium text-brand-600 dark:text-brand-400">Psicóloga
            
          </p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Fundadora de Neurofit IA
          </p>
      </UCard>
    </UContainer>
  </section>
</template>
