<script setup lang="ts">
// "Segera hadir" card (DESIGN.md §6): stone, dashed border, small light-grid mark.
// `reveal: false` when a parent already animates it in (e.g. HomeNews tab panel).
withDefaults(defineProps<{ title?: string; text: string; reveal?: boolean }>(), { reveal: true })
const { t } = useL()
</script>

<template>
  <div :data-reveal="reveal ? '' : undefined" class="flex flex-col items-start gap-4 rounded-[20px] border-2 border-dashed border-stone-deep bg-stone p-8 md:p-10">
    <span aria-hidden="true" class="grid grid-cols-3 gap-1 opacity-80"><span v-for="i in 6" :key="i" class="size-2.5 rounded-[3px] bg-signal" /></span>
    <span class="label-sm text-signal-ink">{{ title || t('common.comingSoon') }}</span>
    <p class="max-w-lg text-ink-soft">{{ text }}</p>
  </div>
</template>
