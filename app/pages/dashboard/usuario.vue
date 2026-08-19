<script setup lang="ts">
definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.user' })

const { t } = useI18n()

useSeoMeta({ title: () => t('seo.user.title'), robots: 'noindex' })

const client = useSupabaseClient()
const toast = useToast()
const { profile, fetchProfile } = useProfile()

const fullName = ref(profile.value?.full_name ?? '')
const saving = ref(false)

watch(profile, (value) => {
  fullName.value = value?.full_name ?? ''
})

async function saveName() {
  if (!profile.value) return
  saving.value = true

  const { error } = await client
    .from('profiles')
    .update({ full_name: fullName.value.trim() })
    .eq('id', profile.value.id)

  saving.value = false

  if (error) {
    toast.add({ title: t('dashboard.user.saveError'), description: error.message, color: 'error' })
    return
  }

  await fetchProfile(true)
  toast.add({ title: t('dashboard.user.saved'), color: 'primary' })
}

const dimensions = [
  { key: 'cognitive', icon: 'i-lucide-brain' },
  { key: 'emotional', icon: 'i-lucide-heart-pulse' },
  { key: 'behavioral', icon: 'i-lucide-activity' },
  { key: 'lifestyle', icon: 'i-lucide-leaf' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-8 text-white ring-1 ring-white/10">
      <p class="section-eyebrow text-brand-400">
        {{ t('dashboard.user.eyebrow') }}
      </p>
      <h2 class="mt-3 text-2xl font-extrabold sm:text-3xl">
        {{ t('dashboard.user.greeting', { name: profile?.full_name || t('dashboard.user.greetingFallback') }) }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('dashboard.user.intro') }}
      </p>
      <UButton
        :label="t('dashboard.user.startEvaluation')"
        color="primary"
        class="mt-6 rounded-full"
        icon="i-lucide-play"
        disabled
      />
      <p class="mt-2 text-xs text-neutral-400">
        {{ t('dashboard.user.comingSoon') }}
      </p>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        v-for="d in dimensions"
        :key="d.key"
        :label="t(`dashboard.user.dimensions.${d.key}`)"
        :value="t('dashboard.user.pending')"
        :icon="d.icon"
      />
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-ink-900">
      <h3 class="font-bold">
        {{ t('dashboard.user.myData') }}
      </h3>
      <p class="mt-1 text-sm text-neutral-500">
        {{ t('dashboard.user.myDataIntro') }}
      </p>

      <div class="mt-6 grid gap-5 sm:max-w-md">
        <UFormField :label="t('dashboard.user.fullName')">
          <UInput
            v-model="fullName"
            size="lg"
            icon="i-lucide-user"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('dashboard.user.email')"
          :help="t('dashboard.user.emailHelp')"
        >
          <UInput
            :model-value="profile?.email"
            size="lg"
            icon="i-lucide-mail"
            disabled
            class="w-full"
          />
        </UFormField>

        <UButton
          :label="t('dashboard.user.save')"
          color="primary"
          class="w-fit rounded-full"
          :loading="saving"
          @click="saveName"
        />
      </div>
    </section>
  </div>
</template>
