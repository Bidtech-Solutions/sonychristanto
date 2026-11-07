<script setup lang="ts">
// Visible breadcrumb + BreadcrumbList JSON-LD. `path` values are locale-less.
const props = defineProps<{ items: { name: string; path: string }[] }>()
const { t, lp } = useL()
const { siteUrl } = useRuntimeConfig().public
useJsonLd(breadcrumbSchema(siteUrl, [{ name: t('nav.home'), path: lp('/') }, ...props.items.map((i) => ({ name: i.name, path: lp(i.path) }))]))
</script>

<template>
  <nav :aria-label="t('common.breadcrumb')" class="label-sm text-ink-soft">
    <ol class="flex flex-wrap items-center gap-2">
      <li><NuxtLink :to="lp('/')" class="hover:text-signal-ink">{{ t('nav.home') }}</NuxtLink></li>
      <li v-for="(it, i) in items" :key="it.path" class="flex items-center gap-2">
        <span aria-hidden="true" class="text-signal">/</span>
        <NuxtLink v-if="i < items.length - 1" :to="lp(it.path)" class="hover:text-signal-ink">{{ it.name }}</NuxtLink>
        <span v-else aria-current="page" class="line-clamp-1 text-ink">{{ it.name }}</span>
      </li>
    </ol>
  </nav>
</template>
