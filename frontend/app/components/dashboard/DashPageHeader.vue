<script setup lang="ts">
// Shared header for every dashboard page: eyebrow, display title with a red
// full stop, one-line description, actions on the right (stacked full-width
// under the title on phones). Keeps all pages consistent.
defineProps<{ eyebrow: string; title: string; description?: string }>()
</script>

<template>
  <header class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
    <div class="flex min-w-0 flex-col gap-2">
      <span class="eyebrow">{{ eyebrow }}</span>
      <h1 class="font-display-x m-0 break-words text-[clamp(30px,7vw,52px)] font-bold leading-[0.92] tracking-[-0.03em]">{{ title }}<span class="text-signal">.</span></h1>
      <p v-if="description" class="m-0 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-[16px]">{{ description }}</p>
    </div>
    <!-- Phones: buttons stacked full width (side by side they wrapped their labels).
         md+: one row that never shrinks, so a long title can't squeeze it. -->
    <div v-if="$slots.actions" class="flex flex-col gap-2 md:flex-none md:flex-row md:flex-nowrap max-md:[&>*]:w-full">
      <slot name="actions" />
    </div>
  </header>
</template>
