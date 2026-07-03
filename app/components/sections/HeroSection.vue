<script setup lang="ts">
const trust = [
  { icon: 'i-lucide-shield-check', text: 'Ciencia y tecnología\nde vanguardia' },
  { icon: 'i-lucide-lock', text: 'Privacidad y seguridad\nde tus datos' },
  { icon: 'i-lucide-trending-up', text: 'Enfocado en prevención\ny bienestar' },
]
</script>

<template>
  <section id="inicio" class="relative overflow-hidden bg-ink-950 text-white">
    <div class="bg-radial-dots pointer-events-none absolute inset-0 text-white/5" />
    <div
      class="pointer-events-none absolute -right-40 top-1/2 size-[560px] -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px]"
    />

    <UContainer class="relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
      <div>
        <h1 class="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
          Conoce hoy el estado
          de <span class="text-brand-400">tu cerebro</span> y descubre
          cómo podría estar en
          <span class="text-brand-400">5, 10 o 20 años.</span>
        </h1>

        <div class="mt-6 h-1 w-16 rounded-full bg-brand-400" />

        <p class="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
          Neurofit AI utiliza inteligencia artificial para analizar variables cognitivas, emocionales,
          conductuales y de estilo de vida, generando
          <span class="font-semibold text-brand-400">indicadores de salud cerebral</span>,
          <span class="font-semibold text-brand-400">alertas tempranas</span> y
          <span class="font-semibold text-brand-400">recomendaciones personalizadas.</span>
        </p>

        <div class="mt-8 flex flex-wrap gap-4">
          <UButton
            label="Solicitar acceso anticipado"
            icon="i-lucide-brain-circuit"
            color="primary"
            size="xl"
            class="rounded-full px-6"
          />
          <UButton
            label="Ver cómo funciona"
            icon="i-lucide-play-circle"
            color="neutral"
            variant="outline"
            size="xl"
            class="rounded-full border-white/25 px-6 text-white hover:bg-white/10"
          />
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div v-for="item in trust" :key="item.icon" class="flex items-start gap-3">
            <UIcon :name="item.icon" class="mt-0.5 size-6 shrink-0 text-brand-400" />
            <p class="whitespace-pre-line text-sm text-neutral-300">{{ item.text }}</p>
          </div>
        </div>
      </div>

      <div class="relative flex items-center justify-center">
        <div class="absolute size-72 rounded-full bg-brand-500/10 blur-3xl sm:size-96" />
        <NuxtPicture
          format="avif,webp"
          src="/Brain-section-1.webp"
        />
      </div>
    </UContainer>
  </section>
</template>
