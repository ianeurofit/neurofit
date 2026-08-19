<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.policies.title'),
  ogTitle: () => t('seo.policies.title'),
  ogImage: '/neurofit-logo-tealgray-.png',
  description: () => t('seo.home.description'),
  ogDescription: () => t('seo.home.ogDescription'),
  ogType: 'website',
  ogUrl: 'https://neurofitia.com',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.policies.title'),
  twitterDescription: () => t('seo.home.ogDescription'),
  twitterImage: '/neurofit-logo-tealgray-.png',
})
</script>

<template>
  <div>
    <LayoutAppHeaderBasic />
    <main>
      <SectionsPolicySection />/
    </main>
    <LazySharedWhatsappFloat />
    <LayoutAppFooter />
  </div>
</template>
