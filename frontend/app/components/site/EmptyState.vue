<script setup lang="ts">
defineProps<{ title: string; text?: string }>()
</script>

<template>
  <div class="border border-dashed border-navy-200 px-6 py-14 text-center">
    <p class="font-display text-2xl font-semibold">{{ title }}</p>
    <p v-if="text" class="mx-auto mt-2 max-w-md text-ink-600">{{ text }}</p>
    <slot />
  </div>
</template>
