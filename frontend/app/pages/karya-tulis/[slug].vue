<script setup lang="ts">
import { publications, publicationTypeLabel } from '~/data/publications'

const route = useRoute()
const { t, tx, lp } = useL()
const pub = publications.find((p) => p.slug === route.params.slug)
if (!pub) throw createError({ statusCode: 404, statusMessage: t('error.notFound'), fatal: true })

usePageSeo({ title: pub.title, description: tx(pub.abstract).slice(0, 160), path: `/karya-tulis/${pub.slug}`, type: 'article' })
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
  abstract: tx(pub.abstract),
  keywords: pub.keywords?.join(', '),
  author: pub.authors.map((a) => (a === 'Sony Christanto' ? { '@id': personId(siteUrl) } : { '@type': 'Person', name: a })),
  isPartOf: pub.venue ? { '@type': 'Periodical', name: pub.venue } : undefined,
  sameAs: pub.doi ? `https://doi.org/${pub.doi}` : pub.url,
  inLanguage: 'id-ID',
})
</script>

<template>
  <div v-if="pub" class="page-root">
    <PageHero
      size="md"
      :lines="[pub.title]"
      :lead="[pub.authors.join(', '), pub.venue, pub.year].filter(Boolean).join(' · ')"
      :crumbs="[{ name: t('writings.title'), path: '/karya-tulis' }, { name: pub.title, path: `/karya-tulis/${pub.slug}` }]"
    >
      <span data-reveal class="label-sm self-start rounded-full bg-signal-tint px-3 py-1.5 text-signal-ink">{{ tx(publicationTypeLabel[pub.type]) }}</span>
    </PageHero>
    <section class="sec flex max-w-3xl flex-col gap-8">
      <h2 data-reveal class="h2-display text-[34px]">{{ t('writings.abstract') }}</h2>
      <p data-reveal class="prose-article m-0">{{ tx(pub.abstract) }}</p>
      <p v-if="pub.keywords?.length" data-reveal class="m-0 text-ink-soft"><strong class="label-sm text-ink">{{ t('writings.keywords') }}:</strong> {{ pub.keywords.join(', ') }}</p>
      <div class="flex flex-wrap gap-3" data-reveal>
        <a v-if="pub.doi" :href="`https://doi.org/${pub.doi}`" class="btn-ink" target="_blank" rel="noopener">DOI <span class="text-signal">↗</span></a>
        <a v-else-if="pub.url" :href="pub.url" class="btn-ink" target="_blank" rel="noopener">{{ t('writings.fullText') }} <span class="text-signal">↗</span></a>
        <a v-if="pub.pdf" :href="pub.pdf" class="btn-line" download>{{ t('writings.download') }}</a>
      </div>
      <NuxtLink :to="lp('/karya-tulis')" class="btn-line self-start">← {{ t('writings.back') }}</NuxtLink>
    </section>
  </div>
</template>
