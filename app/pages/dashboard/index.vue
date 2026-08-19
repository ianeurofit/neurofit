<script setup lang="ts">
// El middleware global redirige a la ruta que corresponde al rol.
definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.dashboard' })

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-3 text-sm text-neutral-500">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-5 animate-spin"
    />
    {{ t('dashboard.redirecting') }}
  </div>
</template>
