<script setup lang="ts">
const values = [
  { icon: 'i-lucide-users', title: 'Enfoque humano', description: 'Ponemos a las personas en el centro, escuchamos, comprendemos y acompañamos cada historia.' },
  { icon: 'i-lucide-heart', title: 'Ciencia con propósito', description: 'Utilizamos el conocimiento científico y la tecnología para prevenir, intervenir y mejorar la salud cerebral.' },
  { icon: 'i-lucide-globe', title: 'Impacto en comunidad', description: 'Trabajamos de la mano con comunidades para generar bienestar y oportunidades accesibles para todos.' },
  { icon: 'i-lucide-handshake', title: 'Innovación con valores', description: 'Desarrollamos soluciones éticas, inclusivas y sostenibles que construyen un futuro más consciente.' }
]

const experience = [
  { icon: 'i-lucide-graduation-cap', title: 'Psicóloga', description: 'Profesional con formación en psicología, comprometida con la salud mental y el bienestar integral.' },
  { icon: 'i-lucide-flask-conical', title: 'Investigadora', description: 'Apasionada por la investigación científica y su aplicación para mejorar la calidad de vida de las personas.' },
  { icon: 'i-lucide-users', title: 'Emprendedora', description: 'Crea y lidera proyectos con impacto social y tecnológico, orientados a transformar el futuro de la salud cerebral.' },
  { icon: 'i-lucide-globe', title: 'Visión global', description: 'Trabajamos para que la innovación y el conocimiento lleguen a más personas, en cualquier lugar del mundo.' }
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
      <h2 class="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
        Ciencia, empatía y propósito al <span class="text-brand-600 dark:text-brand-400">servicio del cerebro</span>
      </h2>
      <p class="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
        Neurofit AI nace de la visión y pasión de su fundadora por transformar la salud cerebral a través de la
        ciencia, la innovación tecnológica y un enfoque humano e integral.
      </p>

      <div class="mt-12 grid gap-10 lg:grid-cols-[1fr_1.3fr_1fr]">
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
          src="/marisol-ia.webp"
        />
          <h3 class="mt-5 text-xl font-extrabold text-neutral-900 dark:text-white">Marisol Uribe Vergara</h3>
          <p class="text-sm font-medium text-brand-600 dark:text-brand-400">Psicóloga</p>
          <p class="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <UIcon name="i-lucide-badge-check" class="size-4" />
            Fundadora & CEO de Neurofit AI
          </p>
        </div>

        <div>
          <p class="mb-4 text-sm font-bold tracking-wide text-neutral-500 dark:text-neutral-400">MI EXPERIENCIA</p>
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
        <p class="mb-6 text-sm font-bold tracking-wide text-brand-400">NEUROFIT AI EN NÚMEROS</p>
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
    </UContainer>
  </section>
</template>
