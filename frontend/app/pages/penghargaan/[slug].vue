<script setup lang="ts">
import { awards } from '~/data/awards'

const route = useRoute()
const award = awards.find((a) => a.slug === route.params.slug)
if (!award) throw createError({ statusCode: 404, statusMessage: 'Penghargaan tidak ditemukan', fatal: true })

usePageSeo({ title: award.title, description: award.summary, path: `/penghargaan/${award.slug}`, image: award.image?.src, imageAlt: award.image?.alt })
const { siteUrl } = useRuntimeConfig().public
useJsonLd({
  '@type': 'Person',
  '@id': personId(siteUrl),
  award: `${award.title} — ${award.issuer} (${award.year})`,
})
</script>

<template>
  <div v-if="award">
    <PageHero
      eyebrow="Penghargaan"
      :title="award.title"
      :lead="`${award.issuer} · ${award.year}`"
      :crumbs="[{ name: 'Penghargaan', path: '/penghargaan' }, { name: award.title, path: `/penghargaan/${award.slug}` }]"
    />
    <section class="container-page max-w-3xl py-16">
      <img v-if="award.image" :src="award.image.src" :alt="award.image.alt" class="mb-10 w-full" />
      <div class="prose-article">
        <p>{{ award.summary }}</p>
        <p v-for="(p, i) in award.body ?? []" :key="i">{{ p }}</p>
      </div>
      <NuxtLink to="/penghargaan" class="mt-12 inline-block font-semibold text-navy-700 underline underline-offset-4">← Semua penghargaan</NuxtLink>
    </section>
  </div>
</template>
