<script setup lang="ts">
// Visible breadcrumb + BreadcrumbList JSON-LD in one component.
const props = defineProps<{ items: { name: string; path: string }[]; dark?: boolean }>()
const { siteUrl } = useRuntimeConfig().public
useJsonLd(breadcrumbSchema(siteUrl, props.items))
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-2 text-sm" :class="dark ? 'text-navy-200' : 'text-ink-600'">
      <li><NuxtLink to="/" class="hover:underline">Beranda</NuxtLink></li>
      <li v-for="(it, i) in items" :key="it.path" class="flex items-center gap-2">
        <span aria-hidden="true">/</span>
        <NuxtLink v-if="i < items.length - 1" :to="it.path" class="hover:underline">{{ it.name }}</NuxtLink>
        <span v-else aria-current="page" class="line-clamp-1">{{ it.name }}</span>
      </li>
    </ol>
  </nav>
</template>
