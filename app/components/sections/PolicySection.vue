<script setup lang="ts">
/**
 * Sección: Política de Privacidad y Tratamiento de Datos Personales
 * Proyecto: Neurofit IA
 *
 * Los datos editables (razón social, contacto, plazos) siguen centralizados
 * en `companyInfo`; los textos viven en i18n/locales/{es,en}.json.
 */
const { t, tm, rt, locale } = useI18n()

useSeoMeta({
  title: () => t('policy.seoTitle'),
  description: () => t('policy.seoDescription'),
})

// -----------------------------
// Datos editables del responsable
// -----------------------------
const companyInfo = {
  razonSocial: 'Neurofit IA', // Añadir razón social legal si aplica
  identificacion: '[Número de identificación]',
  email: 'info@neurofitia.com',
  telefono: '+57 3105423860',
  direccion: 'Calle 10 # 35 -35 Medellín, ANT',
  diasHabilesRespuesta: '15',
}

const lastUpdated = new Date('2026-07-13') // Actualizar cuando cambie la política
const lastUpdatedFormatted = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(lastUpdated),
)

// -----------------------------
// Estructura de contenido
// -----------------------------
const sections = [
  { id: 'responsable', icon: 'i-lucide-building-2', key: 'responsible' },
  { id: 'informacion-recopilada', icon: 'i-lucide-clipboard-list', key: 'collected' },
  { id: 'datos-sensibles', icon: 'i-lucide-shield-alert', key: 'sensitive' },
  { id: 'finalidad', icon: 'i-lucide-target', key: 'purpose' },
  { id: 'derechos', icon: 'i-lucide-scale', key: 'rights' },
  { id: 'seguridad', icon: 'i-lucide-lock', key: 'security' },
  { id: 'consultas-reclamos', icon: 'i-lucide-mail-question', key: 'claims' },
  { id: 'vigencia', icon: 'i-lucide-calendar-clock', key: 'validity' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <!-- Encabezado -->
    <div class="mb-10 space-y-3">
      <UBadge
        color="primary"
        variant="subtle"
        size="lg"
        icon="i-lucide-shield-check"
      >
        {{ t('policy.badge') }}
      </UBadge>
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-highlighted">
        {{ t('policy.title') }}
      </h1>
      <p class="text-lg text-muted">
        {{ t('policy.project') }}
        <span class="font-medium text-highlighted">{{ companyInfo.razonSocial }}</span>
      </p>
      <p class="text-sm text-dimmed">
        {{ t('policy.lastUpdated', { date: lastUpdatedFormatted }) }}
      </p>
      <p class="text-base text-toned leading-relaxed max-w-3xl">
        {{ t('policy.intro') }}
      </p>
    </div>

    <USeparator class="mb-10" />

    <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
      <!-- Tabla de contenido -->
      <aside class="hidden lg:block">
        <nav class="sticky top-24 space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed mb-3">
            {{ t('policy.toc') }}
          </p>
          <UButton
            v-for="section in sections"
            :key="section.id"
            :label="t(`policy.sections.${section.key}`)"
            :icon="section.icon"
            variant="ghost"
            color="neutral"
            size="sm"
            block
            class="justify-start text-left"
            @click="scrollToSection(section.id)"
          />
        </nav>
      </aside>

      <!-- Contenido principal -->
      <div class="space-y-8">
        <!-- 1. Responsable -->
        <UCard :id="sections[0]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[0]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.responsible') }}
              </h2>
            </div>
          </template>
          <dl class="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-dimmed">
                {{ t('policy.responsible.companyLabel') }}
              </dt>
              <dd class="text-toned font-medium">
                {{ companyInfo.razonSocial }}
              </dd>
            </div>
            <div>
              <dt class="text-dimmed">
                {{ t('policy.responsible.idLabel') }}
              </dt>
              <dd class="text-toned font-medium">
                {{ companyInfo.identificacion }}
              </dd>
            </div>
            <div>
              <dt class="text-dimmed">
                {{ t('policy.responsible.emailLabel') }}
              </dt>
              <dd class="text-toned font-medium">
                <ULink
                  :to="`mailto:${companyInfo.email}`"
                  class="text-primary"
                >
                  {{ companyInfo.email }}
                </ULink>
              </dd>
            </div>
            <div>
              <dt class="text-dimmed">
                {{ t('policy.responsible.phoneLabel') }}
              </dt>
              <dd class="text-toned font-medium">
                {{ companyInfo.telefono }}
              </dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-dimmed">
                {{ t('policy.responsible.addressLabel') }}
              </dt>
              <dd class="text-toned font-medium">
                {{ companyInfo.direccion }}
              </dd>
            </div>
          </dl>
        </UCard>

        <!-- 2. Información recopilada -->
        <UCard :id="sections[1]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[1]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.collected') }}
              </h2>
            </div>
          </template>
          <p class="text-toned mb-3">
            {{ t('policy.collected.intro') }}
          </p>
          <ul class="space-y-2 text-toned">
            <li
              v-for="(item, index) in tm('policy.collected.items')"
              :key="index"
              class="flex items-start gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4 mt-1 text-primary shrink-0"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </UCard>

        <!-- 3. Datos sensibles -->
        <UCard :id="sections[2]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[2]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.sensitive') }}
              </h2>
            </div>
          </template>
          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-heart-pulse"
            :title="t('policy.sensitive.alertTitle')"
            :description="t('policy.sensitive.alertText')"
            class="mb-4"
          />
          <ul class="space-y-2 text-toned">
            <li
              v-for="(item, index) in tm('policy.sensitive.items')"
              :key="index"
              class="flex items-start gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4 mt-1 text-primary shrink-0"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </UCard>

        <!-- 4. Finalidad -->
        <UCard :id="sections[3]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[3]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.purpose') }}
              </h2>
            </div>
          </template>
          <p class="text-toned mb-3">
            {{ t('policy.purpose.intro') }}
          </p>
          <ul class="space-y-2 text-toned">
            <li
              v-for="(item, index) in tm('policy.purpose.items')"
              :key="index"
              class="flex items-start gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4 mt-1 text-primary shrink-0"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </UCard>

        <!-- 5. Derechos -->
        <UCard :id="sections[4]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[4]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.rights') }}
              </h2>
            </div>
          </template>
          <p class="text-toned mb-3">
            {{ t('policy.rights.intro') }}
          </p>
          <ul class="space-y-2 text-toned">
            <li
              v-for="(item, index) in tm('policy.rights.items')"
              :key="index"
              class="flex items-start gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4 mt-1 text-primary shrink-0"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </UCard>

        <!-- 6. Seguridad -->
        <UCard :id="sections[5]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[5]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.security') }}
              </h2>
            </div>
          </template>
          <p class="text-toned leading-relaxed">
            {{ t('policy.security.text') }}
          </p>
        </UCard>

        <!-- 7. Consultas y reclamos -->
        <UCard :id="sections[6]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[6]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.claims') }}
              </h2>
            </div>
          </template>
          <i18n-t
            keypath="policy.claims.text"
            tag="p"
            class="text-toned leading-relaxed mb-4"
          >
            <template #email>
              <ULink
                :to="`mailto:${companyInfo.email}`"
                class="text-primary font-medium"
              >
                {{ companyInfo.email }}
              </ULink>
            </template>
            <template #days>
              <span class="font-medium text-highlighted">{{ companyInfo.diasHabilesRespuesta }}</span>
            </template>
          </i18n-t>
          <UAlert
            color="primary"
            variant="subtle"
            icon="i-lucide-mail-x"
            :title="t('policy.claims.alertTitle')"
            :description="t('policy.claims.alertText')"
          />
        </UCard>

        <!-- 8. Vigencia -->
        <UCard :id="sections[7]!.id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="sections[7]!.icon"
                class="size-5 text-primary"
              />
              <h2 class="text-xl font-semibold text-highlighted">
                {{ t('policy.sections.validity') }}
              </h2>
            </div>
          </template>
          <p class="text-toned leading-relaxed">
            {{ t('policy.validity.text') }}
          </p>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
