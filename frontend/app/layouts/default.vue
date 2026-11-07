<script setup lang="ts">
// Public layout: panels inset 16px on warm paper (DESIGN.md §4).
// The landing page renders its header inside the hero panel, so the pill
// header is skipped there.
const { t, lp } = useL()
const route = useRoute()
const isHome = computed(() => route.path === lp('/') || route.path === `${lp('/')}/`)
</script>

<template>
  <div class="page-wrap min-h-screen">
    <a href="#konten" class="sr-only z-[60] rounded-full bg-signal px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{{ t('nav.skip') }}</a>
    <SiteHeader v-if="!isHome" variant="pill" class="w-full max-w-[1408px]" />
    <main id="konten" class="flex w-full flex-col items-center gap-4">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
