<script setup lang="ts">
import { publications, publicationTypeLabel } from '~/data/publications'

const route = useRoute()
const pub = publications.find((p) => p.slug === route.params.slug)
if (!pub) throw createError({ statusCode: 404, statusMessage: 'Karya tulis tidak ditemukan', fatal: true })

usePageSeo({ title: pub.title, description: pub.abstract.slice(0, 160), path: `/karya-tulis/${pub.slug}`, type: 'article' })
// Google Scholar reads citation_* meta tags.
useHead({
  meta: [
    { name: 'citation_title', content: pub.title },
    ...pub.authors.map((a) => ({ name: 'citation_author', content: a })),
    { name: 'citation_publication_date', content: String(pub.year) },
    ...(pub.venue ? [{ name: 'citation_journal_title', content: pub.venue }] : []),
    ...(pub.doi ? [{ name: 'citation_doi', content: pub.doi }] : []),
    ...(pub.pdf ? [{ name: 'citation_pdf_url', content: absoluteUrl(pub.pdf) }] : []),
  ],
})
const { siteUrl } = useRuntimeConfig().public
useJsonLd({
  '@type': pub.type === 'buku' ? 'Book' : 'ScholarlyArticle',
  name: pub.title,
  headline: pub.title,
  datePublished: String(pub.year),
  abstract: pub.abstract,
  keywords: pub.keywords?.join(', '),
  author: pub.authors.map((a) => (a === 'Sony Christanto' ? { '@id': personId(siteUrl) } : { '@type': 'Person', name: a })),
  isPartOf: pub.venue ? { '@type': 'Periodical', name: pub.venue } : undefined,
  sameAs: pub.doi ? `https://doi.org/${pub.doi}` : pub.url,
  inLanguage: 'id-ID',
})
</script>

<template>
  <div v-if="pub">
    <PageHero
      :eyebrow="publicationTypeLabel[pub.type]"
      :title="pub.title"
      :lead="[pub.authors.join(', '), pub.venue, pub.year].filter(Boolean).join(' · ')"
      :crumbs="[{ name: 'Karya Tulis', path: '/karya-tulis' }, { name: pub.title, path: `/karya-tulis/${pub.slug}` }]"
    />
    <section class="container-page max-w-3xl py-16">
      <h2 class="font-display text-2xl font-semibold">Abstrak</h2>
      <p class="prose-article mt-4">{{ pub.abstract }}</p>
      <p v-if="pub.keywords?.length" class="mt-6 text-ink-600"><strong>Kata kunci:</strong> {{ pub.keywords.join(', ') }}</p>
      <div class="mt-10 flex flex-wrap gap-4">
        <a v-if="pub.doi" :href="`https://doi.org/${pub.doi}`" class="btn-dark" target="_blank" rel="noopener">Buka via DOI</a>
        <a v-else-if="pub.url" :href="pub.url" class="btn-dark" target="_blank" rel="noopener">Baca selengkapnya</a>
        <a v-if="pub.pdf" :href="pub.pdf" class="btn-outline" download>Unduh PDF</a>
      </div>
      <NuxtLink to="/karya-tulis" class="mt-12 inline-block font-semibold text-navy-700 underline underline-offset-4">← Semua karya tulis</NuxtLink>
    </section>
  </div>
</template>
