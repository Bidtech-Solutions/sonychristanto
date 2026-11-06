<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; lead?: string; crumbs?: { name: string; path: string }[] }>()
</script>

<template>
  <section class="bg-navy-900 text-white">
    <div class="container-page py-14 sm:py-20">
      <Breadcrumbs v-if="crumbs?.length" :items="crumbs" class="mb-6" dark />
      <p v-if="eyebrow" class="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-500">{{ eyebrow }}</p>
      <h1 class="max-w-4xl font-display text-4xl leading-tight font-semibold sm:text-6xl">{{ title }}</h1>
      <p v-if="lead" class="mt-6 max-w-2xl text-lg text-navy-100">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>
