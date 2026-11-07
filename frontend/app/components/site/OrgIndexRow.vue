<script setup lang="ts">
// Index row (DESIGN.md §6): name (h3, uppercase), role, period, ↗.
// Hover: signal-tint background, name in signal-ink, and the organisation's
// logo slides in on a small light-grid thumbnail.
import type { Organization } from '~/data/organizations'

defineProps<{ org: Organization; first?: boolean }>()
const { tx, lp, period, t } = useL()
</script>

<template>
  <NuxtLink
    :to="lp(`/organisasi/${org.slug}`)"
    data-reveal
    class="group relative flex flex-wrap items-center gap-x-6 gap-y-2 overflow-hidden border-b border-stone-deep px-2 py-[26px] transition-colors duration-300 hover:bg-signal-tint"
  >
    <span aria-hidden="true" class="relative size-0 overflow-hidden rounded-full bg-white opacity-0 transition-all duration-500 ease-[var(--ease-signal)] group-hover:size-14 group-hover:opacity-100 max-md:hidden">
      <span class="absolute inset-1 grid grid-cols-3 gap-0.5 opacity-30 blur-[3px]"><span v-for="i in 6" :key="i" class="rounded-sm bg-signal" /></span>
      <img v-if="org.logo" :src="org.logo" alt="" class="relative size-full object-contain p-2" loading="lazy" />
    </span>
    <h3 class="font-display-x m-0 flex-[1_1_420px] text-[22px] font-semibold leading-none transition-colors group-hover:text-signal-ink md:text-[28px]">{{ org.name }}</h3>
    <span class="flex-[0_1_260px] text-[16px] text-ink-soft">{{ org.role ? tx(org.role) : t('org.noRole') }}</span>
    <span class="label w-full flex-none md:w-40 md:text-right">{{ period(org) }} <span class="arrow-nudge text-signal">↗</span></span>
  </NuxtLink>
</template>
