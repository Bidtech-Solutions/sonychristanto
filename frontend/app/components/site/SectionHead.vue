<script setup lang="ts">
// Section title row: optional eyebrow (red square), big uppercase h2, right-side slot/link.
defineProps<{ eyebrow?: string; title: string; link?: { to: string; label: string }; as?: string }>()
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-5">
    <div class="flex flex-col gap-3.5">
      <span v-if="eyebrow" data-reveal class="label text-ink-soft"><span class="mr-2.5 inline-block size-2 bg-signal" />{{ eyebrow }}</span>
      <component :is="as ?? 'h2'" data-reveal class="h2-display" v-html="title" />
    </div>
    <slot>
      <NuxtLink v-if="link" :to="link.to" data-reveal class="label group hover:text-signal-ink">{{ link.label }} <span class="arrow-nudge text-signal">↗</span></NuxtLink>
    </slot>
  </div>
</template>
