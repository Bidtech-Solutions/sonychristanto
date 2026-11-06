<script setup lang="ts">
import { publications, publicationTypeLabel } from '~/data/publications'

usePageSeo({ title: 'Karya Tulis', description: 'Karya tulis Sony Christanto, termasuk artikel ilmiah, buku, dan opini.', path: '/karya-tulis' })
const sorted = [...publications].sort((a, b) => b.year - a.year)
</script>

<template>
  <div>
    <PageHero eyebrow="Publikasi" title="Karya Tulis" lead="Artikel ilmiah dan tulisan Sony Christanto." :crumbs="[{ name: 'Karya Tulis', path: '/karya-tulis' }]" />
    <section class="container-page max-w-4xl py-16">
      <ul v-if="sorted.length" class="border-t-2 border-navy-900">
        <li v-for="p in sorted" :key="p.slug" class="border-b border-cream-300 py-6">
          <p class="text-sm font-semibold text-gold-700">{{ publicationTypeLabel[p.type] }} · {{ p.year }}<template v-if="p.venue"> · {{ p.venue }}</template></p>
          <h2 class="mt-1 font-display text-2xl font-semibold">
            <NuxtLink :to="`/karya-tulis/${p.slug}`" class="hover:underline">{{ p.title }}</NuxtLink>
          </h2>
          <p class="mt-1 text-ink-600">{{ p.authors.join(', ') }}</p>
        </li>
      </ul>
      <EmptyState v-else title="Segera hadir" text="Daftar karya tulis sedang disiapkan." />
    </section>
  </div>
</template>
