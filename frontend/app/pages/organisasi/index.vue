<script setup lang="ts">
import { isOngoing, organizations, periodLabel } from '~/data/organizations'

usePageSeo({
  title: 'Organisasi',
  description: 'Organisasi dan lembaga tempat Sony Christanto berkiprah, beserta peran dan periodenya.',
  path: '/organisasi',
})

const sections = [
  { title: 'Organisasi — periode berjalan', items: organizations.filter((o) => o.kind === 'organisasi' && isOngoing(o)) },
  { title: 'Organisasi — periode sebelumnya', items: organizations.filter((o) => o.kind === 'organisasi' && !isOngoing(o)) },
  { title: 'Kepartaian', items: organizations.filter((o) => o.kind === 'partai') },
].filter((s) => s.items.length)
</script>

<template>
  <div>
    <PageHero eyebrow="Kiprah" title="Organisasi" lead="Peran Sony Christanto di organisasi pendidikan, olahraga, dunia usaha, keagamaan, dan kepartaian." :crumbs="[{ name: 'Organisasi', path: '/organisasi' }]" />
    <div class="container-page space-y-16 py-16">
      <section v-for="s in sections" :key="s.title">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink-600">{{ s.title }}</h2>
        <ul class="border-t-2 border-navy-900">
          <li v-for="o in s.items" :key="o.slug" class="border-b border-cream-300">
            <NuxtLink :to="`/organisasi/${o.slug}`" class="grid gap-1 py-5 hover:bg-cream-100 sm:grid-cols-[140px_1fr_240px] sm:items-baseline sm:px-2">
              <span class="font-semibold text-gold-700">{{ periodLabel(o) }}</span>
              <span class="font-display text-xl font-semibold">{{ o.name }}</span>
              <span class="text-ink-600">{{ o.role }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
