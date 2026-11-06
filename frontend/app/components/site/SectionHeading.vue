<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; as?: 'h2' | 'h3'; link?: { to: string; label: string } }>()
</script>

<template>
  <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p v-if="eyebrow" class="eyebrow mb-2">{{ eyebrow }}</p>
      <component :is="as ?? 'h2'" class="heading-xl">{{ title }}</component>
    </div>
    <NuxtLink v-if="link" :to="link.to" class="font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900">
      {{ link.label }}
    </NuxtLink>
  </div>
</template>
