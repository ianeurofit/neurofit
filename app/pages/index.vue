<script setup lang="ts">
useSeoMeta({
  title: 'Neurofit IA | Conoce hoy el estado de tu cerebro',
  ogTitle: 'Neurofit IA | Brain Intelligence',
  ogImage: '/neurofit-logo-tealgray-.png',
  description:
    'Neurofit AI utiliza inteligencia artificial para analizar variables cognitivas, emocionales, conductuales y de estilo de vida, generando indicadores de salud cerebral, alertas tempranas y recomendaciones personalizadas.',
  ogDescription:
    'Plataforma de inteligencia artificial para evaluar, monitorear y optimizar la salud cerebral.',
  ogType: 'website',
  ogUrl:'https://neurofitia.com',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Neurofit IA | Conoce hoy el estado de tu cerebro',
  twitterDescription: 'Plataforma de inteligencia artificial para evaluar, monitorear y optimizar la salud cerebral.',
  twitterImage:  '/neurofit-logo-tealgray-.png'
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
    <LazySharedWhatsappFloat/>
    <LayoutAppFooter />
  </div>
</template>
