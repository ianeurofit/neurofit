<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.home.title'),
  ogTitle: () => t('seo.home.title'),
  ogImage: '/neurofit-logo-tealgray-.png',
  description: () => t('seo.home.description'),
  ogDescription: () => t('seo.home.ogDescription'),
  ogType: 'website',
  ogUrl: 'https://neurofitia.com',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.home.title'),
  twitterDescription: () => t('seo.home.ogDescription'),
  twitterImage: '/neurofit-logo-tealgray-.png',
})
</script>

<template>
  <div>
    <LayoutAppHeader />
    <main>
      <SectionsHeroSection />
      <SectionsProblemSection />
      <SectionsSolutionSection />
      <SectionsEvaluationSection />
      <SectionsBrainScoreSection />
      <SectionsAudienceSection />
      <SectionsBenefitsSection />
      <SectionsMissionVisionSection />
      <SectionsTeamSection />
      <SectionsNewsletterSection />
    </main>
    <LazySharedWhatsappFloat />
    <LayoutAppFooter />
  </div>
</template>
