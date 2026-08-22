<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const trust = [
  { icon: 'i-lucide-shield-check', key: 'science' },
  { icon: 'i-lucide-lock', key: 'privacy' },
  { icon: 'i-lucide-globe', key: 'global' },
  { icon: 'i-lucide-heart', key: 'wellbeing' },
]

const social = [
  { icon: 'i-simple-icons-linkedin', label: 'LinkedIn', to: 'https://www.linkedin.com/in/neurofit-ia-ab4362421/' },
  { icon: 'i-simple-icons-facebook', label: 'Facebook', to: 'https://www.facebook.com/profile.php?id=61591624239632' },
  { icon: 'i-simple-icons-instagram', label: 'Instagram', to: 'https://www.instagram.com/neurofitia/' },
  { icon: 'i-simple-icons-youtube', label: 'YouTube', to: 'https://www.youtube.com/@Neurofit-IA' },
  { icon: 'i-simple-icons-tiktok', label: 'TikTok', to: 'https://www.tiktok.com/@neurofit.ia' },
]

const regions = ['america', 'europe', 'latam', 'apac', 'middleEast']
</script>

<template>
  <footer
    id="contacto"
    class="bg-ink-950 text-neutral-300"
  >
    <UContainer class="grid gap-12 py-16 lg:grid-cols-3">
      <div>
        <NuxtPicture
          format="avif,webp"
          src="/logo-teal-gray.svg"
          :img-attrs="{ class: 'sm:w-[40vw] md:w-[30vw] lg:w-[30vw]  h-auto' }"
        />

        <p class="mt-5 font-semibold text-white">
          {{ t('footer.tagline') }}
        </p>
        <p class="mt-3 text-sm leading-relaxed text-neutral-400">
          {{ t('footer.description') }}
        </p>

        <div class="mt-6 grid grid-cols-4 gap-3">
          <div
            v-for="item in trust"
            :key="item.key"
            class="flex flex-col items-center gap-2 text-center"
          >
            <div class="flex size-11 items-center justify-center rounded-full border border-white/15">
              <UIcon
                :name="item.icon"
                class="size-5 text-brand-400"
              />
            </div>
            <span class="text-[11px] leading-tight text-neutral-400">{{ t(`footer.trust.${item.key}`) }}</span>
          </div>
        </div>
      </div>

      <div>
        <p class="section-eyebrow text-brand-400">
          {{ t('footer.contactTitle') }}
        </p>
        <div class="mt-5 space-y-5">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-full border border-white/15">
              <UIcon
                name="i-lucide-mail"
                class="size-4"
              />
            </div>
            <div>
              <p class="text-xs text-neutral-500">
                {{ t('footer.emailLabel') }}
              </p>
              <p class="font-medium text-white">
                info@neurofitia.com
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-full border border-white/15">
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-4"
              />
            </div>
            <div>
              <p class="text-xs text-neutral-500">
                {{ t('footer.whatsappLabel') }}
              </p>
              <p class="font-medium text-white">
                +57 3105423860
              </p>
            </div>
          </div>
        </div>

        <p class="mt-6 text-xs font-semibold tracking-wide text-neutral-500">
          {{ t('footer.followUs') }}
        </p>
        <div class="mt-3 flex gap-2">
          <UButton
            v-for="item in social"
            :key="item.label"
            :icon="item.icon"
            color="neutral"
            variant="outline"
            :aria-label="item.label"
            :to="item.to"
            class="rounded-full border-white/15 hover:bg-white/10"
          />
        </div>
      </div>

      <div>
        <p class="section-eyebrow text-brand-400">
          {{ t('footer.newsletterEyebrow') }}
        </p>
        <i18n-t
          keypath="footer.newsletterTitle"
          tag="h3"
          class="mt-3 text-xl font-extrabold text-white"
        >
          <template #brand>
            <span class="text-brand-400">Neurofit IA</span>
          </template>
        </i18n-t>
        <p class="mt-3 text-sm text-neutral-400">
          {{ t('footer.newsletterText') }}
        </p>

        <form
          class="mt-5 space-y-3"
          @submit.prevent
        >
          <!--
            <UInput
            v-model="email"
            type="email"
            placeholder="Tu correo electrónico"
            icon="i-lucide-mail"
            size="lg"
            class="w-full"
            />
           -->
          <UButton
            :label="t('footer.newsletterCta')"
            color="primary"
            block
            size="lg"
            class="rounded-full"
            :to="localePath('/demo/carlos-gomez')"
          />
        </form>
        <p class="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
          <UIcon
            name="i-lucide-lock"
            class="size-3.5"
          />
          {{ t('footer.privacyNote') }}
        </p>
      </div>
    </UContainer>

    <UContainer class="border-t border-white/10 py-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-globe"
            class="size-6 text-brand-400"
          />
          <span class="font-semibold text-white">
            {{ t('footer.presence') }} <span class="text-brand-400">{{ t('footer.presenceHighlight') }}</span>
          </span>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
          <span
            v-for="r in regions"
            :key="r"
            class="flex items-center gap-1.5"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-3.5 text-brand-400"
            />
            {{ t(`footer.regions.${r}`) }} · {{ t(`footer.places.${r}`) }}
          </span>
        </div>
      </div>
    </UContainer>

    <UContainer class="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-neutral-500 sm:flex-row">
      <p>{{ t('footer.rights', { year: new Date().getFullYear() }) }}</p>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span>{{ t('footer.trademark') }}</span>
        <NuxtLink
          :to="localePath('/politicas')"
          class="hover:text-white"
        >
          {{ t('footer.dataPolicy') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/politicas')"
          class="hover:text-white"
        >
          {{ t('footer.privacyPolicy') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/politicas')"
          class="hover:text-white"
        >
          {{ t('footer.cookiePolicy') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/manual-de-marca')"
          class="hover:text-white"
        >
          {{ t('footer.brandManual') }}
        </NuxtLink>
      </div>
    </UContainer>
  </footer>
</template>
