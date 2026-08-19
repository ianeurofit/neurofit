<script setup lang="ts">
const { t } = useI18n()

const perks = [
  { icon: 'i-lucide-bell', key: 'early' },
  { icon: 'i-lucide-gift', key: 'content' },
  { icon: 'i-lucide-users', key: 'community' },
  { icon: 'i-lucide-globe', key: 'global' },
]

const badges = [
  { icon: 'i-lucide-flask-conical', key: 'science' },
  { icon: 'i-lucide-shield-check', key: 'trust' },
  { icon: 'i-lucide-globe', key: 'global' },
  { icon: 'i-lucide-heart', key: 'purpose' },
]
</script>

<template>
  <section
    id="formulario"
    class="relative overflow-hidden bg-ink-950 py-20 text-white lg:py-28"
  >
    <div class="bg-radial-dots pointer-events-none absolute inset-0 text-white/5" />

    <UContainer class="relative">
      <UiSectionEyebrow :label="t('newsletter.eyebrow')" />
      <div class="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr_0.6fr] lg:items-start">
        <div>
          <i18n-t
            keypath="newsletter.title"
            tag="h2"
            class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
          >
            <template #brand>
              <span class="text-brand-400">Neurofit IA</span>
            </template>
          </i18n-t>
          <p class="mt-4 text-neutral-300">
            {{ t('newsletter.intro') }}
          </p>

          <div class="mt-8 space-y-5">
            <div
              v-for="perk in perks"
              :key="perk.key"
              class="flex items-start gap-3"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <UIcon
                  :name="perk.icon"
                  class="size-4.5 text-brand-400"
                />
              </div>
              <div>
                <p class="font-semibold">
                  {{ t(`newsletter.perks.${perk.key}.title`) }}
                </p>
                <p class="text-sm text-neutral-400">
                  {{ t(`newsletter.perks.${perk.key}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <UCard :ui="{ root: 'bg-white text-neutral-900 dark:bg-white dark:text-neutral-900', body: 'p-7' }">
          <div class="flex flex-col items-center text-center">
            <div class="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <UIcon
                name="i-lucide-mail"
                class="size-6"
              />
            </div>
            <i18n-t
              keypath="newsletter.cardTitle"
              tag="h3"
              class="mt-4 text-xl font-extrabold"
            >
              <template #highlight>
                <span class="text-brand-600">{{ t('newsletter.cardHighlight') }}</span>
              </template>
            </i18n-t>
            <p class="mt-2 whitespace-pre-line text-sm text-neutral-500">
              {{ t('newsletter.cardText') }}
            </p>
          </div>

          <iframe
            width="540"
            height="305"
            src="https://b663cbbf.sibforms.com/v2/serve/MUIFAAu_MBfB3EvZOjLodOdbwBGrt7C6NkvVbSFDFxXDYg6hXLLFLUC3soTYXZFhOFIMiouWpSkMbVns_Pi3XNeqwxkpKgs-ZcIa-oOQxIxmgXg8TCL1FKzjLLOkoVoe6Mo4MA9fvaQsiBDa1Wrj-p306x3LzPaO9gKayAVNCQFNDpie0zuVVSzI6HJB29QwGlJYr2O5VsHlpXWPQA=="
            frameborder="0"
            scrolling="auto"
            allowfullscreen
            style="display: block;margin-left: auto;margin-right: auto;max-width: 100%;"
          />

          <!--
          <form class="mt-6 space-y-4" @submit.prevent>
              <div class="grid gap-4 sm:grid-cols-2">
                <UInput v-model="form.name" icon="i-lucide-user" placeholder="Nombre" size="lg" />
                <UInput v-model="form.email" type="email" icon="i-lucide-mail" placeholder="Correo electrónico" size="lg" />
              </div>
              <USelect
              v-model="form.country"
              :items="countries"
              icon="i-lucide-globe"
              placeholder="País"
              size="lg"
              class="w-full"
              />
              <UCheckbox
              v-model="form.accepted"
              label="Acepto recibir comunicaciones de Neurofit IA sobre novedades, lanzamientos y contenido relacionado con salud cerebral."
              />
              <UButton label="Quiero ser de los primeros" color="primary" block size="lg" class="rounded-full" href="https://docs.google.com/forms/d/e/1FAIpQLSfEehtSB5qn6izKZrFTB-06HkK_2_SM8rqWLwZBI-gw3va9lw/viewform?usp=publish-editor" />
              <p class="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                <UIcon name="i-lucide-lock" class="size-3.5" />
                Tu información está segura y nunca será compartida.
              </p>
            </form>
            -->
        </UCard>
        <NuxtPicture
          format="avif,webp"
          src="/Celular-app.webp"
        />
        <!--
          <div class="flex flex-col items-center gap-4 lg:items-start">
            <div class="relative flex w-full max-w-[220px] flex-col items-center rounded-[2rem] border border-white/15 bg-white/5 p-6 text-center">
              <UIcon name="i-lucide-brain-circuit" class="size-16 text-brand-400" />
              <p class="mt-4 text-sm font-bold">Tu cerebro.<br>Tu mejor versión.</p>
              <p class="mt-2 text-xs text-neutral-400">
                Muy pronto podrás conocer tu Brain Score™ y transformar tu salud cerebral.
              </p>
              <UBadge color="primary" variant="soft" class="mt-4 rounded-full">Próximamente</UBadge>
            </div>
          </div>
          -->
      </div>

      <div class="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
        <div
          v-for="badge in badges"
          :key="badge.key"
          class="flex items-start gap-3"
        >
          <UIcon
            :name="badge.icon"
            class="mt-0.5 size-5 shrink-0 text-brand-400"
          />
          <div>
            <p class="text-sm font-bold">
              {{ t(`newsletter.badges.${badge.key}.title`) }}
            </p>
            <p class="text-xs text-neutral-400">
              {{ t(`newsletter.badges.${badge.key}.description`) }}
            </p>
          </div>
        </div>
      </div>

      <UCard
        :ui="{ root: 'mt-10 bg-white/5 ring-white/10', body: 'p-8' }"
        class="text-center"
      >
        <UIcon
          name="i-lucide-quote"
          class="mx-auto size-8 text-brand-400"
        />
        <p class="mt-3 text-lg font-medium">
          {{ t('newsletter.quote') }}
        </p>
        <p class="text-lg font-bold text-brand-400">
          {{ t('newsletter.quoteHighlight') }}
        </p>
      </UCard>
    </UContainer>
  </section>
</template>
