<script setup lang="ts">
import { awards } from '~/data/awards'

usePageSeo({ title: 'Penghargaan', description: 'Penghargaan dan pencapaian yang diterima Sony Christanto.', path: '/penghargaan' })
const sorted = [...awards].sort((a, b) => b.year - a.year)
</script>

<template>
  <div>
    <PageHero eyebrow="Pencapaian" title="Penghargaan" lead="Penghargaan dan pengakuan atas kiprah Sony Christanto." :crumbs="[{ name: 'Penghargaan', path: '/penghargaan' }]" />
    <section class="container-page py-16">
      <ul v-if="sorted.length" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="a in sorted" :key="a.slug">
          <NuxtLink :to="`/penghargaan/${a.slug}`" class="group block">
            <img v-if="a.image" :src="a.image.src" :alt="a.image.alt" loading="lazy" class="aspect-[4/3] w-full object-cover" />
            <p class="mt-4 text-sm font-semibold text-gold-700">{{ a.year }} · {{ a.issuer }}</p>
            <h2 class="mt-1 font-display text-2xl font-semibold group-hover:underline">{{ a.title }}</h2>
            <p class="mt-2 text-ink-600">{{ a.summary }}</p>
          </NuxtLink>
        </li>
      </ul>
      <EmptyState v-else title="Segera hadir" text="Daftar penghargaan sedang disiapkan." />
    </section>
  </div>
</template>
