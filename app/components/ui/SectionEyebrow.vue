<script setup lang="ts">
defineProps<{
  number?: string
  label: string
}>()
</script>

<template>
  <p class="section-eyebrow flex items-center gap-2">
    <span v-if="number">{{ number }}.</span>
    <span>{{ label }}</span>
  </p>
</template>
