<script setup lang="ts">
/**
 * Página: Confirmación de suscripción al newsletter
 * Proyecto: Neurofit IA
 *
 * Se muestra después de enviar el formulario de "Mantente informado".
 * Usa @formkit/auto-animate para revelar los pasos siguientes de forma
 * escalonada y suave, sin depender de librerías de animación pesadas.
 */

import { useAutoAnimate } from '@formkit/auto-animate/vue'

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('subscribed.seoTitle'),
  description: () => t('subscribed.seoDescription'),
})

// Email opcional recibido por query param desde el formulario (?email=...)
const route = useRoute()
const email = computed(() => {
  const raw = route.query.email
  return typeof raw === 'string' && raw.length > 0 ? raw : null
})

// -----------------------------
// Contenedor animado (auto-animate)
// -----------------------------
const [stepsList] = useAutoAnimate({ duration: 350, easing: 'ease-out' })

interface NextStep {
  id: string
  icon: string
}

const allSteps: NextStep[] = [
  { id: 'inbox', icon: 'i-lucide-mail-check' },
  { id: 'brain', icon: 'i-lucide-brain-circuit' },
  { id: 'community', icon: 'i-lucide-users' },
]

// Revelado escalonado: los pasos se van agregando al array observado
// por auto-animate, generando una entrada secuencial y orgánica.
const visibleSteps = ref<NextStep[]>([])

onMounted(() => {
  allSteps.forEach((step, index) => {
    setTimeout(() => {
      visibleSteps.value.push(step)
    }, 250 + index * 220)
  })
})

// -----------------------------
// Redes sociales (opcional, ajustar enlaces reales)
// -----------------------------
const socialLinks = [
  { label: 'Instagram', icon: 'i-simple-icons-instagram', to: '#' },
  { label: 'LinkedIn', icon: 'i-simple-icons-linkedin', to: '#' },
  { label: 'YouTube', icon: 'i-simple-icons-youtube', to: '#' },
]
</script>

<template>
  <UContainer class="py-16 md:py-24">
    <div class="max-w-2xl mx-auto text-center">
      <!-- Ícono de confirmación -->
      <div class="relative inline-flex items-center justify-center mb-8">
        <span
          class="absolute inset-0 rounded-full bg-primary/15 animate-ping-slow"
          aria-hidden="true"
        />
        <div class="relative flex items-center justify-center size-20 rounded-full bg-primary/10 ring-1 ring-primary/30">
          <UIcon
            name="i-lucide-check"
            class="size-10 text-primary"
          />
        </div>
      </div>

      <UBadge
        color="primary"
        variant="subtle"
        size="lg"
        icon="i-lucide-sparkles"
        class="mb-4"
      >
        {{ t('subscribed.badge') }}
      </UBadge>

      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-highlighted mb-3">
        {{ t('subscribed.title') }}
      </h1>

      <p class="text-lg text-toned leading-relaxed">
        <i18n-t
          v-if="email"
          keypath="subscribed.confirmedTo"
          tag="span"
        >
          <template #email>
            <span class="font-medium text-highlighted">{{ email }}</span>
          </template>
        </i18n-t>
        <span v-else>{{ t('subscribed.confirmedGeneric') }}</span>
        {{ ' ' }}{{ t('subscribed.intro') }}
      </p>
    </div>

    <!-- Próximos pasos -->
    <div class="max-w-2xl mx-auto mt-12">
      <p class="text-xs font-semibold uppercase tracking-wide text-dimmed mb-4 text-center">
        {{ t('subscribed.nextTitle') }}
      </p>

      <div
        ref="stepsList"
        class="space-y-4"
      >
        <UCard
          v-for="step in visibleSteps"
          :key="step.id"
          variant="subtle"
        >
          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
              <UIcon
                :name="step.icon"
                class="size-5 text-primary"
              />
            </div>
            <div>
              <p class="font-medium text-highlighted">
                {{ t(`subscribed.steps.${step.id}.title`) }}
              </p>
              <p class="text-sm text-toned mt-1">
                {{ t(`subscribed.steps.${step.id}.description`) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Acciones -->
    <div class="max-w-2xl mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
      <UButton
        :to="localePath('/')"
        icon="i-lucide-home"
        size="lg"
        :label="t('subscribed.backHome')"
      />
      <UButton
        :to="`${localePath('/')}#servicios`"
        icon="i-lucide-stethoscope"
        variant="ghost"
        color="neutral"
        size="lg"
        :label="t('subscribed.services')"
      />
    </div>

    <!-- Redes sociales -->
    <div class="max-w-2xl mx-auto mt-14 pt-8 border-t border-default text-center">
      <p class="text-sm text-dimmed mb-4">
        {{ t('subscribed.followUs') }}
      </p>
      <div class="flex items-center justify-center gap-2">
        <UButton
          v-for="social in socialLinks"
          :key="social.label"
          :to="social.to"
          :icon="social.icon"
          :aria-label="social.label"
          variant="ghost"
          color="neutral"
          size="lg"
          square
          target="_blank"
        />
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  75%, 100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-ping-slow {
    animation: none;
  }
}
</style>
